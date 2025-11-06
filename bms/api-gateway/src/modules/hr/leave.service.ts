import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HrLeave, HrLeaveStatus, HrLeaveType } from './entities/hr-leave.entity';
import { HrLeaveBalance } from './entities/hr-leave-balance.entity';
import { HrLeaveApproval, HrLeaveApprovalStatus } from './entities/hr-leave-approval.entity';
import { Employee } from './entities/employee.entity';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { UpdateLeaveRequestDto } from './dto/update-leave-request.dto';
import { SubmitLeaveDto } from './dto/submit-leave.dto';
import { ApproveLeaveDto } from './dto/approve-leave.dto';
import { RejectLeaveDto } from './dto/reject-leave.dto';
import { CancelLeaveDto } from './dto/cancel-leave.dto';

interface LeaveFilters {
  status?: HrLeaveStatus;
  employeeId?: string;
  type?: HrLeaveType;
  startDate?: string;
  endDate?: string;
}

const DEFAULT_ANNUAL_ALLOWANCE = 30;
const DEFAULT_SICK_ALLOWANCE = 15;
const MONTHLY_ANNUAL_ACCRUAL = 2.5;

@Injectable()
export class LeaveService {
  constructor(
    @InjectRepository(HrLeave)
    private readonly leaveRepo: Repository<HrLeave>,
    @InjectRepository(HrLeaveBalance)
    private readonly leaveBalanceRepo: Repository<HrLeaveBalance>,
    @InjectRepository(HrLeaveApproval)
    private readonly leaveApprovalRepo: Repository<HrLeaveApproval>,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
  ) {}

  async createLeave(payload: CreateLeaveRequestDto): Promise<HrLeave> {
    const employee = await this.ensureEmployee(payload.companyId, payload.employeeId);
    const { startDate, endDate } = this.parseAndValidateDates(payload.startDate, payload.endDate);
    const daysCount = this.calculateDaysCount(startDate, endDate);

    await this.ensureLeaveBalance(payload.companyId, payload.employeeId, startDate.getUTCFullYear());

    const leave = this.leaveRepo.create({
      companyId: payload.companyId,
      employeeId: payload.employeeId,
      employee,
      type: payload.type,
      startDate,
      endDate,
      daysCount,
      reason: payload.reason,
      status: HrLeaveStatus.DRAFT,
      currentStep: 0,
      notes: undefined,
    });

    return this.leaveRepo.save(leave);
  }

  async updateLeave(id: string, companyId: string, dto: UpdateLeaveRequestDto): Promise<HrLeave> {
    const leave = await this.getLeaveOrFail(id, companyId, true);

    if (![HrLeaveStatus.DRAFT, HrLeaveStatus.PENDING].includes(leave.status)) {
      throw new BadRequestException("Impossible de modifier une demande déjà décidée");
    }

    if (dto.type) {
      leave.type = dto.type;
    }
    if (dto.reason !== undefined) {
      leave.reason = dto.reason;
    }
    if (dto.notes !== undefined) {
      leave.notes = dto.notes;
    }

    const startDate = dto.startDate ? this.toDate(dto.startDate) : leave.startDate;
    const endDate = dto.endDate ? this.toDate(dto.endDate) : leave.endDate;
    this.validateDateRange(startDate, endDate);

    leave.startDate = startDate;
    leave.endDate = endDate;
    leave.daysCount = this.calculateDaysCount(startDate, endDate);

    await this.ensureLeaveBalance(leave.companyId, leave.employeeId, leave.startDate.getUTCFullYear());

    return this.leaveRepo.save(leave);
  }

  async submitLeave(id: string, companyId: string, dto: SubmitLeaveDto): Promise<HrLeave> {
    const leave = await this.getLeaveOrFail(id, companyId, true);

    if (![HrLeaveStatus.DRAFT, HrLeaveStatus.PENDING].includes(leave.status)) {
      throw new BadRequestException("Seules les demandes en brouillon ou en attente peuvent être soumises");
    }

    if (dto.notes !== undefined) {
      leave.notes = dto.notes;
    }

    await this.ensureEnoughBalanceForLeave(leave);

    leave.status = HrLeaveStatus.PENDING;
    leave.submittedAt = new Date();

    if (!leave.approvals || leave.approvals.length === 0) {
      leave.approvals = await this.leaveApprovalRepo.save(this.buildDefaultApprovals(leave));
    }

    const nextApproval = this.findNextPendingApproval(leave);
    leave.currentStep = nextApproval ? nextApproval.stepOrder : leave.approvals.length;
    leave.currentApproverId = nextApproval?.approverId ?? null;

    await this.leaveRepo.save(leave);

    return this.getLeaveOrFail(id, companyId, true);
  }

  async approveLeave(id: string, companyId: string, dto: ApproveLeaveDto): Promise<HrLeave> {
    const leave = await this.getLeaveOrFail(id, companyId, true);

    if (leave.status !== HrLeaveStatus.PENDING) {
      throw new BadRequestException("Seules les demandes en attente peuvent être approuvées");
    }

    const currentApproval = this.getCurrentApproval(leave);
    if (!currentApproval) {
      throw new BadRequestException("Aucune étape d'approbation en attente");
    }

    currentApproval.status = HrLeaveApprovalStatus.APPROVED;
    currentApproval.approverId = dto.approverId;
    currentApproval.comment = dto.comment;
    currentApproval.decidedAt = new Date();
    await this.leaveApprovalRepo.save(currentApproval);

    const nextApproval = this.findNextPendingApproval(leave);

    if (nextApproval) {
      leave.currentStep = nextApproval.stepOrder;
      leave.currentApproverId = nextApproval.approverId ?? null;
      await this.leaveRepo.save(leave);
      return this.getLeaveOrFail(id, companyId, true);
    }

    leave.status = HrLeaveStatus.APPROVED;
    leave.approvedAt = new Date();
    leave.decidedAt = new Date();
    leave.approverId = dto.approverId;
    leave.currentApproverId = null;
    leave.currentStep = leave.approvals?.length ?? 0;

    if (this.isBalanceTracked(leave.type)) {
      const balance = await this.ensureLeaveBalance(leave.companyId, leave.employeeId, leave.startDate.getUTCFullYear());
      this.applyBalanceDeduction(balance, leave.type, leave.daysCount);
      await this.leaveBalanceRepo.save(balance);
    }

    await this.leaveRepo.save(leave);

    return this.getLeaveOrFail(id, companyId, true);
  }

  async rejectLeave(id: string, companyId: string, dto: RejectLeaveDto): Promise<HrLeave> {
    const leave = await this.getLeaveOrFail(id, companyId, true);

    if (leave.status !== HrLeaveStatus.PENDING) {
      throw new BadRequestException("Seules les demandes en attente peuvent être rejetées");
    }

    const currentApproval = this.getCurrentApproval(leave);
    if (!currentApproval) {
      throw new BadRequestException("Aucune étape d'approbation en attente");
    }

    currentApproval.status = HrLeaveApprovalStatus.REJECTED;
    currentApproval.approverId = dto.approverId;
    currentApproval.comment = dto.comment;
    currentApproval.decidedAt = new Date();
    await this.leaveApprovalRepo.save(currentApproval);

    leave.status = HrLeaveStatus.REJECTED;
    leave.rejectedAt = new Date();
    leave.rejectionReason = dto.reason ?? dto.comment;
    leave.decidedAt = new Date();
    leave.approverId = dto.approverId;
    leave.currentApproverId = null;

    await this.leaveRepo.save(leave);

    return this.getLeaveOrFail(id, companyId, true);
  }

  async cancelLeave(id: string, companyId: string, dto: CancelLeaveDto): Promise<HrLeave> {
    const leave = await this.getLeaveOrFail(id, companyId, true);

    if (![HrLeaveStatus.DRAFT, HrLeaveStatus.PENDING].includes(leave.status)) {
      throw new BadRequestException("Impossible d'annuler une demande déjà décidée");
    }

    leave.status = HrLeaveStatus.CANCELLED;
    leave.cancelledAt = new Date();
    leave.cancelledBy = dto.cancelledBy;
    if (dto.reason) {
      leave.notes = dto.reason;
    }

    if (leave.approvals?.length) {
      for (const approval of leave.approvals) {
        if (approval.status === HrLeaveApprovalStatus.PENDING) {
          approval.status = HrLeaveApprovalStatus.SKIPPED;
          approval.decidedAt = new Date();
          await this.leaveApprovalRepo.save(approval);
        }
      }
    }

    await this.leaveRepo.save(leave);

    return this.getLeaveOrFail(id, companyId, true);
  }

  async listLeaves(companyId: string, filters: LeaveFilters = {}): Promise<HrLeave[]> {
    const query = this.leaveRepo
      .createQueryBuilder('leave')
      .leftJoinAndSelect('leave.employee', 'employee')
      .leftJoinAndSelect('leave.approvals', 'approvals')
      .where('leave.companyId = :companyId', { companyId })
      .orderBy('leave.createdAt', 'DESC');

    if (filters.status) {
      query.andWhere('leave.status = :status', { status: filters.status });
    }
    if (filters.employeeId) {
      query.andWhere('leave.employeeId = :employeeId', { employeeId: filters.employeeId });
    }
    if (filters.type) {
      query.andWhere('leave.type = :type', { type: filters.type });
    }
    if (filters.startDate) {
      query.andWhere('leave.startDate >= :startDate', { startDate: filters.startDate });
    }
    if (filters.endDate) {
      query.andWhere('leave.endDate <= :endDate', { endDate: filters.endDate });
    }

    return query.getMany();
  }

  async getLeaveById(id: string, companyId: string): Promise<HrLeave> {
    return this.getLeaveOrFail(id, companyId, true);
  }

  async getBalance(companyId: string, employeeId: string): Promise<LeaveBalanceSummary> {
    const year = new Date().getUTCFullYear();
    const balance = await this.ensureLeaveBalance(companyId, employeeId, year);

    return {
      annual: this.buildBalanceSnapshot(balance, HrLeaveType.ANNUAL),
      sick: this.buildBalanceSnapshot(balance, HrLeaveType.SICK),
    };
  }

  async accrueLeaves(companyId: string, employeeId: string, months = 1): Promise<HrLeaveBalance> {
    if (months <= 0) {
      throw new BadRequestException('Le nombre de mois doit être positif');
    }

    const year = new Date().getUTCFullYear();
    const balance = await this.ensureLeaveBalance(companyId, employeeId, year);

    const increment = MONTHLY_ANNUAL_ACCRUAL * months;
    balance.annualLeaveTotal = this.asNumber(balance.annualLeaveTotal) + increment;
    balance.annualLeaveRemaining = this.asNumber(balance.annualLeaveRemaining) + increment;
    balance.lastAccrualAt = new Date();

    return this.leaveBalanceRepo.save(balance);
  }

  private buildDefaultApprovals(leave: HrLeave): HrLeaveApproval[] {
    const steps = [
      { stepOrder: 1, role: 'manager' },
      { stepOrder: 2, role: 'hr' },
    ];

    return steps.map((step) =>
      this.leaveApprovalRepo.create({
        leave,
        leaveId: leave.id,
        stepOrder: step.stepOrder,
        role: step.role,
        status: HrLeaveApprovalStatus.PENDING,
      }),
    );
  }

  private async ensureEmployee(companyId: string, employeeId: string): Promise<Employee> {
    const employee = await this.employeeRepo.findOne({ where: { id: employeeId, companyId } });
    if (!employee) {
      throw new NotFoundException("Employé introuvable pour cette société");
    }
    return employee;
  }

  private async ensureLeaveBalance(companyId: string, employeeId: string, year: number): Promise<HrLeaveBalance> {
    let balance = await this.leaveBalanceRepo.findOne({ where: { companyId, employeeId, year } });

    if (!balance) {
      const employee = await this.ensureEmployee(companyId, employeeId);
      balance = this.leaveBalanceRepo.create({
        companyId,
        employeeId,
        employee,
        year,
        annualLeaveTotal: DEFAULT_ANNUAL_ALLOWANCE,
        annualLeaveTaken: 0,
        annualLeaveRemaining: DEFAULT_ANNUAL_ALLOWANCE,
        sickLeaveTotal: DEFAULT_SICK_ALLOWANCE,
        sickLeaveTaken: 0,
        sickLeaveRemaining: DEFAULT_SICK_ALLOWANCE,
      });
      balance = await this.leaveBalanceRepo.save(balance);
    }

    return balance;
  }

  private async ensureEnoughBalanceForLeave(leave: HrLeave): Promise<void> {
    if (!this.isBalanceTracked(leave.type)) {
      return;
    }

    const balance = await this.ensureLeaveBalance(leave.companyId, leave.employeeId, leave.startDate.getUTCFullYear());
    const remaining = this.getRemainingForType(balance, leave.type);

    if (remaining < leave.daysCount) {
      throw new BadRequestException('Solde de congés insuffisant');
    }
  }

  private applyBalanceDeduction(balance: HrLeaveBalance, type: HrLeaveType, days: number): void {
    if (type === HrLeaveType.ANNUAL) {
      const remaining = this.asNumber(balance.annualLeaveRemaining);
      if (remaining < days) {
        throw new BadRequestException('Solde de congés annuels insuffisant');
      }
      balance.annualLeaveTaken = this.asNumber(balance.annualLeaveTaken) + days;
      balance.annualLeaveRemaining = remaining - days;
      return;
    }

    if (type === HrLeaveType.SICK) {
      const remaining = this.asNumber(balance.sickLeaveRemaining);
      if (remaining < days) {
        throw new BadRequestException('Solde de congés maladie insuffisant');
      }
      balance.sickLeaveTaken = this.asNumber(balance.sickLeaveTaken) + days;
      balance.sickLeaveRemaining = remaining - days;
    }
  }

  private buildBalanceSnapshot(balance: HrLeaveBalance, type: HrLeaveType): BalanceSnapshot {
    if (type === HrLeaveType.ANNUAL) {
      return {
        total: this.asNumber(balance.annualLeaveTotal),
        taken: this.asNumber(balance.annualLeaveTaken),
        remaining: this.asNumber(balance.annualLeaveRemaining),
      };
    }

    return {
      total: this.asNumber(balance.sickLeaveTotal),
      taken: this.asNumber(balance.sickLeaveTaken),
      remaining: this.asNumber(balance.sickLeaveRemaining),
    };
  }

  private getRemainingForType(balance: HrLeaveBalance, type: HrLeaveType): number {
    return type === HrLeaveType.ANNUAL
      ? this.asNumber(balance.annualLeaveRemaining)
      : this.asNumber(balance.sickLeaveRemaining);
  }

  private async getLeaveOrFail(id: string, companyId: string, withRelations = false): Promise<HrLeave> {
    const leave = await this.leaveRepo.findOne({
      where: { id, companyId },
      relations: withRelations ? ['employee', 'approvals'] : undefined,
      order: withRelations ? { approvals: { stepOrder: 'ASC' } } : undefined,
    });

    if (!leave) {
      throw new NotFoundException('Demande de congé introuvable');
    }

    if (withRelations && leave.approvals) {
      leave.approvals.sort((a, b) => a.stepOrder - b.stepOrder);
    }

    return leave;
  }

  private getCurrentApproval(leave: HrLeave): HrLeaveApproval | undefined {
    return leave.approvals?.find((approval) => approval.status === HrLeaveApprovalStatus.PENDING);
  }

  private findNextPendingApproval(leave: HrLeave): HrLeaveApproval | undefined {
    const sorted = [...(leave.approvals ?? [])].sort((a, b) => a.stepOrder - b.stepOrder);
    return sorted.find((approval) => approval.status === HrLeaveApprovalStatus.PENDING);
  }

  private parseAndValidateDates(start: string, end: string): { startDate: Date; endDate: Date } {
    const startDate = this.toDate(start);
    const endDate = this.toDate(end);
    this.validateDateRange(startDate, endDate);
    return { startDate, endDate };
  }

  private validateDateRange(startDate: Date, endDate: Date): void {
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Dates de congé invalides');
    }
    if (endDate < startDate) {
      throw new BadRequestException('La date de fin doit être postérieure à la date de début');
    }
  }

  private calculateDaysCount(startDate: Date, endDate: Date): number {
    const msPerDay = 1000 * 60 * 60 * 24;
    const diff = Math.floor((endDate.getTime() - startDate.getTime()) / msPerDay) + 1;
    if (diff <= 0) {
      throw new BadRequestException('Une demande de congé doit couvrir au moins une journée');
    }
    return diff;
  }

  private isBalanceTracked(type: HrLeaveType): boolean {
    return type === HrLeaveType.ANNUAL || type === HrLeaveType.SICK;
  }

  private toDate(value: string | Date): Date {
    return value instanceof Date ? value : new Date(value);
  }

  private asNumber(value: any): number {
    if (value === null || value === undefined) {
      return 0;
    }
    return Number(value);
  }
}

export interface BalanceSnapshot {
  total: number;
  taken: number;
  remaining: number;
}

export interface LeaveBalanceSummary {
  annual: BalanceSnapshot;
  sick: BalanceSnapshot;
}
