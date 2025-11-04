import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { LeaveRequest, LeaveType, LeaveStatus } from '../entities/leave-request.entity';
import { Employee, EmployeeStatus } from '../entities/employee.entity';
import { User } from '../../auth/entities/user.entity';

interface CreateLeaveRequestDto {
  employeeId: string;
  startDate: Date;
  endDate: Date;
  leaveType: LeaveType;
  reason?: string;
  attachments?: Array<{
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
  }>;
}

@Injectable()
export class LeaveRequestService {
  constructor(
    @InjectRepository(LeaveRequest)
    private leaveRequestsRepository: Repository<LeaveRequest>,
    @InjectRepository(Employee)
    private employeesRepository: Repository<Employee>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Créer une nouvelle demande de congé
   */
  async create(createLeaveRequestDto: CreateLeaveRequestDto, companyId: string): Promise<LeaveRequest> {
    // Vérifier que l'employé existe et appartient à l'entreprise
    const employee = await this.employeesRepository.findOne({
      where: { id: createLeaveRequestDto.employeeId, companyId },
    });
    if (!employee) {
      throw new NotFoundException('Employé non trouvé');
    }

    // Vérifier que l'employé est actif
    if (employee.status !== EmployeeStatus.ACTIVE) {
      throw new BadRequestException('Seul un employé actif peut demander des congés');
    }

    // Calculer le nombre de jours
    const requestedDays = this.calculateLeaveDays(createLeaveRequestDto.startDate, createLeaveRequestDto.endDate);

    // Vérifier le solde de congés disponible
    if (createLeaveRequestDto.leaveType === LeaveType.ANNUAL_LEAVE) {
      if (employee.remainingLeaveDays < requestedDays) {
        throw new BadRequestException(`Solde de congés insuffisant: ${employee.remainingLeaveDays} jours disponibles, ${requestedDays} jours demandés`);
      }
    }

    // Vérifier les chevauchements de dates
    const overlappingLeave = await this.findOverlappingLeave(
      createLeaveRequestDto.employeeId,
      createLeaveRequestDto.startDate,
      createLeaveRequestDto.endDate
    );

    if (overlappingLeave.length > 0) {
      throw new BadRequestException('Une demande de congé existe déjà pour cette période');
    }

    // Créer la demande de congé
    const leaveRequest = this.leaveRequestsRepository.create({
      ...createLeaveRequestDto,
      requestedDays,
      approvedDays: requestedDays,
      balanceBeforeRequest: employee.remainingLeaveDays,
      balanceAfterApproval: employee.remainingLeaveDays - requestedDays,
      status: LeaveStatus.DRAFT,
    });

    return await this.leaveRequestsRepository.save(leaveRequest);
  }

  /**
   * Lister les demandes de congé
   */
  async findAll(
    companyId: string,
    options: {
      employeeId?: string;
      status?: LeaveStatus;
      leaveType?: LeaveType;
      startDate?: Date;
      endDate?: Date;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{ leaveRequests: LeaveRequest[]; total: number }> {
    const {
      employeeId,
      status,
      leaveType,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = options;

    const queryBuilder = this.leaveRequestsRepository
      .createQueryBuilder('leaveRequest')
      .leftJoinAndSelect('leaveRequest.employee', 'employee')
      .leftJoinAndSelect('leaveRequest.manager', 'manager')
      .leftJoinAndSelect('leaveRequest.submittedBy', 'submittedBy')
      .leftJoinAndSelect('leaveRequest.managerApprovedBy', 'managerApprovedBy')
      .leftJoinAndSelect('leaveRequest.hrApprovedBy', 'hrApprovedBy')
      .innerJoin('leaveRequest.employee', 'emp')
      .where('emp.companyId = :companyId', { companyId });

    if (employeeId) {
      queryBuilder.andWhere('leaveRequest.employeeId = :employeeId', { employeeId });
    }

    if (status) {
      queryBuilder.andWhere('leaveRequest.status = :status', { status });
    }

    if (leaveType) {
      queryBuilder.andWhere('leaveRequest.leaveType = :leaveType', { leaveType });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('leaveRequest.startDate >= :startDate AND leaveRequest.endDate <= :endDate', {
        startDate,
        endDate,
      });
    }

    const [leaveRequests, total] = await queryBuilder
      .orderBy('leaveRequest.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { leaveRequests, total };
  }

  /**
   * Trouver une demande de congé par son ID
   */
  async findOne(id: string, companyId: string): Promise<LeaveRequest> {
    const leaveRequest = await this.leaveRequestsRepository.findOne({
      where: { id },
      relations: [
        'employee',
        'manager',
        'submittedBy',
        'managerApprovedBy',
        'hrApprovedBy',
      ],
    });

    if (!leaveRequest) {
      throw new NotFoundException('Demande de congé non trouvée');
    }

    // Vérifier que l'employé appartient à l'entreprise
    const employee = await this.employeesRepository.findOne({
      where: { id: leaveRequest.employeeId, companyId },
    });
    if (!employee) {
      throw new NotFoundException('Employé non trouvé dans cette entreprise');
    }

    return leaveRequest;
  }

  /**
   * Mettre à jour une demande de congé
   */
  async update(
    id: string,
    updateLeaveRequestDto: Partial<CreateLeaveRequestDto>,
    companyId: string
  ): Promise<LeaveRequest> {
    const leaveRequest = await this.findOne(id, companyId);

    if (!leaveRequest.canBeEdited) {
      throw new BadRequestException('Cette demande de congé ne peut plus être modifiée');
    }

    // Recalculer les jours si les dates changent
    if (updateLeaveRequestDto.startDate || updateLeaveRequestDto.endDate) {
      const startDate = updateLeaveRequestDto.startDate || leaveRequest.startDate;
      const endDate = updateLeaveRequestDto.endDate || leaveRequest.endDate;
      const requestedDays = this.calculateLeaveDays(startDate, endDate);

      updateLeaveRequestDto.requestedDays = requestedDays;
      updateLeaveRequestDto.approvedDays = requestedDays;
    }

    Object.assign(leaveRequest, updateLeaveRequestDto);
    return await this.leaveRequestsRepository.save(leaveRequest);
  }

  /**
   * Soumettre une demande de congé pour validation
   */
  async submit(id: string, userId: string, companyId: string, comment?: string): Promise<LeaveRequest> {
    const leaveRequest = await this.findOne(id, companyId);

    if (!leaveRequest.canBeEdited) {
      throw new BadRequestException('Cette demande de congé ne peut plus être soumise');
    }

    leaveRequest.status = LeaveStatus.PENDING_MANAGER;
    leaveRequest.submittedAt = new Date();
    leaveRequest.submittedById = userId;
    leaveRequest.employeeComment = comment || '';

    return await this.leaveRequestsRepository.save(leaveRequest);
  }

  /**
   * Approuver une demande de congé (Manager)
   */
  async approveByManager(
    id: string,
    userId: string,
    companyId: string,
    managerComment?: string
  ): Promise<LeaveRequest> {
    const leaveRequest = await this.findOne(id, companyId);

    if (leaveRequest.status !== LeaveStatus.PENDING_MANAGER) {
      throw new BadRequestException('Cette demande de congé ne peut pas être approuvée par le manager');
    }

    leaveRequest.status = LeaveStatus.PENDING_HR;
    leaveRequest.managerApprovedAt = new Date();
    leaveRequest.managerApprovedById = userId;
    leaveRequest.managerComment = managerComment || '';

    return await this.leaveRequestsRepository.save(leaveRequest);
  }

  /**
   * Approuver une demande de congé (RH)
   */
  async approveByHR(
    id: string,
    userId: string,
    companyId: string,
    hrComment?: string
  ): Promise<LeaveRequest> {
    const leaveRequest = await this.findOne(id, companyId);

    if (leaveRequest.status !== LeaveStatus.PENDING_HR) {
      throw new BadRequestException('Cette demande de congé ne peut pas être approuvée par les RH');
    }

    // Mettre à jour le solde de congés de l'employé
    if (leaveRequest.leaveType === LeaveType.ANNUAL_LEAVE) {
      await this.updateEmployeeLeaveBalance(
        leaveRequest.employeeId,
        leaveRequest.approvedDays
      );
    }

    leaveRequest.status = LeaveStatus.APPROVED;
    leaveRequest.hrApprovedAt = new Date();
    leaveRequest.hrApprovedById = userId;
    leaveRequest.hrComment = hrComment || '';

    return await this.leaveRequestsRepository.save(leaveRequest);
  }

  /**
   * Approuver directement une demande de congé (Admin/Directeur)
   */
  async approve(
    id: string,
    userId: string,
    companyId: string,
    comment?: string
  ): Promise<LeaveRequest> {
    const leaveRequest = await this.findOne(id, companyId);

    if (!leaveRequest.isPending) {
      throw new BadRequestException('Cette demande de congé ne peut pas être approuvée');
    }

    // Mettre à jour le solde de congés de l'employé
    if (leaveRequest.leaveType === LeaveType.ANNUAL_LEAVE) {
      await this.updateEmployeeLeaveBalance(
        leaveRequest.employeeId,
        leaveRequest.approvedDays
      );
    }

    leaveRequest.status = LeaveStatus.APPROVED;
    leaveRequest.hrApprovedAt = new Date();
    leaveRequest.hrApprovedById = userId;
    leaveRequest.managerApprovedAt = new Date();
    leaveRequest.managerApprovedById = userId;
    leaveRequest.hrComment = comment || '';
    leaveRequest.managerComment = comment || '';

    return await this.leaveRequestsRepository.save(leaveRequest);
  }

  /**
   * Rejeter une demande de congé
   */
  async reject(
    id: string,
    userId: string,
    companyId: string,
    rejectReason: string,
    rejectBy: 'manager' | 'hr' = 'hr'
  ): Promise<LeaveRequest> {
    const leaveRequest = await this.findOne(id, companyId);

    if (!leaveRequest.isPending) {
      throw new BadRequestException('Cette demande de congé ne peut pas être rejetée');
    }

    leaveRequest.status = LeaveStatus.REJECTED;

    if (rejectBy === 'manager') {
      leaveRequest.managerApprovedById = userId;
      leaveRequest.managerApprovedAt = new Date();
      leaveRequest.managerComment = rejectReason;
    } else {
      leaveRequest.hrApprovedById = userId;
      leaveRequest.hrApprovedAt = new Date();
      leaveRequest.hrComment = rejectReason;
    }

    return await this.leaveRequestsRepository.save(leaveRequest);
  }

  /**
   * Annuler une demande de congé
   */
  async cancel(id: string, userId: string, companyId: string): Promise<LeaveRequest> {
    const leaveRequest = await this.findOne(id, companyId);

    if (!leaveRequest.canBeCancelled) {
      throw new BadRequestException('Cette demande de congé ne peut plus être annulée');
    }

    // Si la demande était approuvée, restituer les jours de congé
    if (leaveRequest.isApproved && leaveRequest.leaveType === LeaveType.ANNUAL_LEAVE) {
      await this.updateEmployeeLeaveBalance(
        leaveRequest.employeeId,
        -leaveRequest.approvedDays
      );
    }

    leaveRequest.status = LeaveStatus.CANCELLED;

    return await this.leaveRequestsRepository.save(leaveRequest);
  }

  /**
   * Marquer une demande de congé comme traitée
   */
  async process(id: string, userId: string, companyId: string): Promise<LeaveRequest> {
    const leaveRequest = await this.findOne(id, companyId);

    if (!leaveRequest.isApproved) {
      throw new BadRequestException('Seule une demande approuvée peut être traitée');
    }

    leaveRequest.status = LeaveStatus.PROCESSED;
    leaveRequest.processedAt = new Date();

    return await this.leaveRequestsRepository.save(leaveRequest);
  }

  /**
   * Calculer le nombre de jours de congé
   */
  private calculateLeaveDays(startDate: Date, endDate: Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Inclure le jour de début et de fin
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    return diffDays;
  }

  /**
   * Vérifier les chevauchements de congés
   */
  private async findOverlappingLeave(
    employeeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<LeaveRequest[]> {
    return await this.leaveRequestsRepository
      .createQueryBuilder('leaveRequest')
      .where('leaveRequest.employeeId = :employeeId', { employeeId })
      .andWhere('leaveRequest.status IN (:...statuses)', {
        statuses: [LeaveStatus.PENDING_MANAGER, LeaveStatus.PENDING_HR, LeaveStatus.APPROVED, LeaveStatus.PROCESSED],
      })
      .andWhere(
        '(leaveRequest.startDate <= :endDate AND leaveRequest.endDate >= :startDate)',
        { startDate, endDate }
      )
      .getMany();
  }

  /**
   * Mettre à jour le solde de congés d'un employé
   */
  private async updateEmployeeLeaveBalance(employeeId: string, daysUsed: number): Promise<void> {
    const employee = await this.employeesRepository.findOne({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException('Employé non trouvé');
    }

    employee.usedLeaveDays += daysUsed;
    employee.remainingLeaveDays = employee.annualLeaveDays - employee.usedLeaveDays;
    employee.lastLeaveUpdate = new Date();

    await this.employeesRepository.save(employee);
  }

  /**
   * Obtenir les statistiques des congés
   */
  async getStats(companyId: string, year?: number): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    processed: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
  }> {
    const queryBuilder = this.leaveRequestsRepository
      .createQueryBuilder('leaveRequest')
      .innerJoin('leaveRequest.employee', 'emp')
      .where('emp.companyId = :companyId', { companyId });

    if (year) {
      queryBuilder.andWhere('EXTRACT(YEAR FROM leaveRequest.startDate) = :year', { year });
    }

    const leaveRequests = await queryBuilder.getMany();

    const stats = {
      total: leaveRequests.length,
      pending: leaveRequests.filter(l => l.isPending).length,
      approved: leaveRequests.filter(l => l.isApproved).length,
      rejected: leaveRequests.filter(l => l.isRejected).length,
      processed: leaveRequests.filter(l => l.status === LeaveStatus.PROCESSED).length,
      byType: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
    };

    // Statistiques par type
    leaveRequests.forEach(leave => {
      stats.byType[leave.leaveType] = (stats.byType[leave.leaveType] || 0) + 1;
      stats.byStatus[leave.status] = (stats.byStatus[leave.status] || 0) + 1;
    });

    return stats;
  }

  /**
   * Obtenir les demandes en attente de validation
   */
  async findPendingApproval(companyId: string, role?: 'manager' | 'hr'): Promise<LeaveRequest[]> {
    const queryBuilder = this.leaveRequestsRepository
      .createQueryBuilder('leaveRequest')
      .leftJoinAndSelect('leaveRequest.employee', 'employee')
      .innerJoin('leaveRequest.employee', 'emp')
      .where('emp.companyId = :companyId', { companyId });

    if (role === 'manager') {
      queryBuilder.andWhere('leaveRequest.status = :status', { status: LeaveStatus.PENDING_MANAGER });
    } else if (role === 'hr') {
      queryBuilder.andWhere('leaveRequest.status = :status', { status: LeaveStatus.PENDING_HR });
    } else {
      queryBuilder.andWhere('leaveRequest.status IN (:...statuses)', {
        statuses: [LeaveStatus.PENDING_MANAGER, LeaveStatus.PENDING_HR],
      });
    }

    return await queryBuilder
      .orderBy('leaveRequest.submittedAt', 'ASC')
      .getMany();
  }

  /**
   * Supprimer une demande de congé
   */
  async remove(id: string, companyId: string): Promise<void> {
    const leaveRequest = await this.findOne(id, companyId);

    if (!leaveRequest.canBeEdited) {
      throw new BadRequestException('Cette demande de congé ne peut plus être supprimée');
    }

    await this.leaveRequestsRepository.delete(id);
  }
}
