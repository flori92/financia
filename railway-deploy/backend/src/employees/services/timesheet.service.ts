import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Timesheet, TimesheetStatus, TimesheetPeriod } from '../entities/timesheet.entity';
import { TimesheetLine, ActivityType, WorkLocation } from '../entities/timesheet-line.entity';
import { Employee, EmployeeStatus } from '../entities/employee.entity';
import { User } from '../../auth/entities/user.entity';

interface CreateTimesheetDto {
  employeeId: string;
  startDate: Date;
  endDate: Date;
  period: TimesheetPeriod;
  lines?: Array<{
    workDate: Date;
    startTime?: string;
    endTime?: string;
    breakHours: number;
    workedHours: number;
    activityType: ActivityType;
    workLocation: WorkLocation;
    projectCode?: string;
    projectName?: string;
    description?: string;
    clientName?: string;
    taskType?: string;
  }>;
}

@Injectable()
export class TimesheetService {
  constructor(
    @InjectRepository(Timesheet)
    private timesheetsRepository: Repository<Timesheet>,
    @InjectRepository(TimesheetLine)
    private timesheetLinesRepository: Repository<TimesheetLine>,
    @InjectRepository(Employee)
    private employeesRepository: Repository<Employee>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Créer un nouveau CRA
   */
  async create(createTimesheetDto: CreateTimesheetDto, companyId: string): Promise<Timesheet> {
    // Vérifier que l'employé existe et appartient à l'entreprise
    const employee = await this.employeesRepository.findOne({
      where: { id: createTimesheetDto.employeeId, companyId },
    });
    if (!employee) {
      throw new NotFoundException('Employé non trouvé');
    }

    // Vérifier qu'il n'y a pas de doublon pour la même période
    const existingTimesheet = await this.timesheetsRepository.findOne({
      where: {
        employeeId: createTimesheetDto.employeeId,
        startDate: createTimesheetDto.startDate,
        endDate: createTimesheetDto.endDate,
      },
    });
    if (existingTimesheet) {
      throw new BadRequestException('Un CRA existe déjà pour cette période');
    }

    // Calculer les totaux
    const totals = this.calculateTotals(createTimesheetDto.lines || []);

    const timesheet = this.timesheetsRepository.create({
      ...createTimesheetDto,
      ...totals,
      status: TimesheetStatus.DRAFT,
    });

    const savedTimesheet = await this.timesheetsRepository.save(timesheet);

    // Créer les lignes si fournies
    if (createTimesheetDto.lines && createTimesheetDto.lines.length > 0) {
      const lines = createTimesheetDto.lines.map(line => 
        this.timesheetLinesRepository.create({
          ...line,
          timesheetId: savedTimesheet.id,
          createdAt: new Date(),
        })
      );
      await this.timesheetLinesRepository.save(lines);
    }

    return this.findOne(savedTimesheet.id, companyId);
  }

  /**
   * Lister les CRA d'un employé ou de l'entreprise
   */
  async findAll(
    companyId: string,
    options: {
      employeeId?: string;
      status?: TimesheetStatus;
      startDate?: Date;
      endDate?: Date;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{ timesheets: Timesheet[]; total: number }> {
    const {
      employeeId,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = options;

    const queryBuilder = this.timesheetsRepository
      .createQueryBuilder('timesheet')
      .leftJoinAndSelect('timesheet.employee', 'employee')
      .leftJoinAndSelect('timesheet.submittedBy', 'submittedBy')
      .leftJoinAndSelect('timesheet.approvedBy', 'approvedBy')
      .leftJoinAndSelect('timesheet.lines', 'lines')
      .innerJoin('timesheet.employee', 'emp')
      .where('emp.companyId = :companyId', { companyId });

    if (employeeId) {
      queryBuilder.andWhere('timesheet.employeeId = :employeeId', { employeeId });
    }

    if (status) {
      queryBuilder.andWhere('timesheet.status = :status', { status });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('timesheet.startDate >= :startDate AND timesheet.endDate <= :endDate', {
        startDate,
        endDate,
      });
    }

    const [timesheets, total] = await queryBuilder
      .orderBy('timesheet.startDate', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { timesheets, total };
  }

  /**
   * Trouver un CRA par son ID
   */
  async findOne(id: string, companyId: string): Promise<Timesheet> {
    const timesheet = await this.timesheetsRepository.findOne({
      where: { id },
      relations: [
        'employee',
        'submittedBy',
        'approvedBy',
        'lines',
      ],
    });

    if (!timesheet) {
      throw new NotFoundException('CRA non trouvé');
    }

    // Vérifier que l'employé appartient à l'entreprise
    const employee = await this.employeesRepository.findOne({
      where: { id: timesheet.employeeId, companyId },
    });
    if (!employee) {
      throw new NotFoundException('Employé non trouvé dans cette entreprise');
    }

    return timesheet;
  }

  /**
   * Mettre à jour un CRA
   */
  async update(
    id: string,
    updateTimesheetDto: Partial<CreateTimesheetDto>,
    companyId: string
  ): Promise<Timesheet> {
    const timesheet = await this.findOne(id, companyId);

    if (!timesheet.canBeEdited) {
      throw new BadRequestException('Ce CRA ne peut plus être modifié');
    }

    // Mettre à jour les lignes si fournies
    if (updateTimesheetDto.lines) {
      // Supprimer les anciennes lignes
      await this.timesheetLinesRepository.delete({ timesheetId: id });

      // Créer les nouvelles lignes
      const lines = updateTimesheetDto.lines.map(line => 
        this.timesheetLinesRepository.create({
          ...line,
          timesheetId: id,
          createdAt: new Date(),
        })
      );
      await this.timesheetLinesRepository.save(lines);

      // Recalculer les totaux
      const totals = this.calculateTotals(updateTimesheetDto.lines);
      Object.assign(timesheet, totals);
    }

    Object.assign(timesheet, updateTimesheetDto);
    return await this.timesheetsRepository.save(timesheet);
  }

  /**
   * Soumettre un CRA pour validation
   */
  async submit(id: string, userId: string, companyId: string, comment?: string): Promise<Timesheet> {
    const timesheet = await this.findOne(id, companyId);

    if (!timesheet.canBeEdited) {
      throw new BadRequestException('Ce CRA ne peut plus être soumis');
    }

    // Vérifier qu'il y a des heures déclarées
    if (timesheet.totalHours <= 0) {
      throw new BadRequestException('Le CRA doit contenir des heures travaillées');
    }

    timesheet.status = TimesheetStatus.SUBMITTED;
    timesheet.submittedAt = new Date();
    timesheet.submittedById = userId;
    timesheet.employeeComment = comment || '';

    return await this.timesheetsRepository.save(timesheet);
  }

  /**
   * Approuver un CRA
   */
  async approve(
    id: string,
    userId: string,
    companyId: string,
    managerComment?: string
  ): Promise<Timesheet> {
    const timesheet = await this.findOne(id, companyId);

    if (timesheet.status !== TimesheetStatus.SUBMITTED) {
      throw new BadRequestException('Seul un CRA soumis peut être approuvé');
    }

    timesheet.status = TimesheetStatus.APPROVED;
    timesheet.approvedAt = new Date();
    timesheet.approvedById = userId;
    timesheet.managerComment = managerComment || '';

    return await this.timesheetsRepository.save(timesheet);
  }

  /**
   * Rejeter un CRA
   */
  async reject(
    id: string,
    userId: string,
    companyId: string,
    managerComment: string
  ): Promise<Timesheet> {
    const timesheet = await this.findOne(id, companyId);

    if (timesheet.status !== TimesheetStatus.SUBMITTED) {
      throw new BadRequestException('Seul un CRA soumis peut être rejeté');
    }

    timesheet.status = TimesheetStatus.REJECTED;
    timesheet.approvedById = userId;
    timesheet.managerComment = managerComment;

    return await this.timesheetsRepository.save(timesheet);
  }

  /**
   * Marquer un CRA comme traité (intégré en paie)
   */
  async process(id: string, userId: string, companyId: string): Promise<Timesheet> {
    const timesheet = await this.findOne(id, companyId);

    if (!timesheet.isApproved) {
      throw new BadRequestException('Seul un CRA approuvé peut être traité');
    }

    timesheet.status = TimesheetStatus.PROCESSED;
    timesheet.processedAt = new Date();

    return await this.timesheetsRepository.save(timesheet);
  }

  /**
   * Calculer les totaux d'un CRA
   */
  private calculateTotals(lines: Array<any>) {
    const totals = {
      totalHours: 0,
      regularHours: 0,
      overtimeHours: 0,
      weekendHours: 0,
      holidayHours: 0,
    };

    lines.forEach(line => {
      totals.totalHours += Number(line.workedHours) || 0;

      switch (line.activityType) {
        case ActivityType.REGULAR:
          totals.regularHours += Number(line.workedHours) || 0;
          break;
        case ActivityType.OVERTIME:
          totals.overtimeHours += Number(line.workedHours) || 0;
          break;
        case ActivityType.WEEKEND:
          totals.weekendHours += Number(line.workedHours) || 0;
          break;
        case ActivityType.HOLIDAY:
          totals.holidayHours += Number(line.workedHours) || 0;
          break;
      }
    });

    return totals;
  }

  /**
   * Obtenir les statistiques CRA
   */
  async getStats(companyId: string, period?: { startDate: Date; endDate: Date }): Promise<{
    total: number;
    draft: number;
    submitted: number;
    approved: number;
    rejected: number;
    processed: number;
    totalHours: number;
    overtimeHours: number;
  }> {
    const queryBuilder = this.timesheetsRepository
      .createQueryBuilder('timesheet')
      .innerJoin('timesheet.employee', 'emp')
      .where('emp.companyId = :companyId', { companyId });

    if (period) {
      queryBuilder.andWhere('timesheet.startDate >= :startDate AND timesheet.endDate <= :endDate', {
        startDate: period.startDate,
        endDate: period.endDate,
      });
    }

    const timesheets = await queryBuilder.getMany();

    const stats = {
      total: timesheets.length,
      draft: timesheets.filter(t => t.status === TimesheetStatus.DRAFT).length,
      submitted: timesheets.filter(t => t.status === TimesheetStatus.SUBMITTED).length,
      approved: timesheets.filter(t => t.status === TimesheetStatus.APPROVED).length,
      rejected: timesheets.filter(t => t.status === TimesheetStatus.REJECTED).length,
      processed: timesheets.filter(t => t.status === TimesheetStatus.PROCESSED).length,
      totalHours: timesheets.reduce((sum, t) => sum + Number(t.totalHours), 0),
      overtimeHours: timesheets.reduce((sum, t) => sum + Number(t.overtimeHours), 0),
    };

    return stats;
  }

  /**
   * Obtenir les CRA en attente de validation
   */
  async findPendingApproval(companyId: string): Promise<Timesheet[]> {
    return await this.timesheetsRepository
      .createQueryBuilder('timesheet')
      .leftJoinAndSelect('timesheet.employee', 'employee')
      .innerJoin('timesheet.employee', 'emp')
      .where('emp.companyId = :companyId', { companyId })
      .andWhere('timesheet.status = :status', { status: TimesheetStatus.SUBMITTED })
      .orderBy('timesheet.submittedAt', 'ASC')
      .getMany();
  }

  /**
   * Supprimer un CRA
   */
  async remove(id: string, companyId: string): Promise<void> {
    const timesheet = await this.findOne(id, companyId);

    if (!timesheet.canBeEdited) {
      throw new BadRequestException('Ce CRA ne peut plus être supprimé');
    }

    await this.timesheetsRepository.delete(id);
  }
}
