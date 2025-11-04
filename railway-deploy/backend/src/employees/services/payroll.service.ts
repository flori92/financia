import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { PayrollRecord, PayrollStatus, PayrollFrequency } from '../entities/payroll-record.entity';
import { Employee, EmployeeStatus } from '../entities/employee.entity';
import { Timesheet, TimesheetStatus } from '../entities/timesheet.entity';
import { User } from '../../auth/entities/user.entity';

interface CreatePayrollDto {
  employeeId: string;
  payPeriodStart: Date;
  payPeriodEnd: Date;
  payDate: Date;
  frequency: PayrollFrequency;
  baseSalary?: number;
  bonusAmount?: number;
  allowanceAmount?: number;
  notes?: string;
}

interface PayrollCalculation {
  grossSalary: number;
  socialSecurity: number;
  taxWithholding: number;
  pensionContribution: number;
  insuranceDeduction: number;
  loanDeduction: number;
  otherDeductions: number;
  totalDeductions: number;
  netSalary: number;
  calculationNotes: string;
}

@Injectable()
export class PayrollService {
  constructor(
    @InjectRepository(PayrollRecord)
    private payrollRecordsRepository: Repository<PayrollRecord>,
    @InjectRepository(Employee)
    private employeesRepository: Repository<Employee>,
    @InjectRepository(Timesheet)
    private timesheetsRepository: Repository<Timesheet>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Créer une nouvelle fiche de paie
   */
  async create(createPayrollDto: CreatePayrollDto, companyId: string): Promise<PayrollRecord> {
    // Vérifier que l'employé existe et appartient à l'entreprise
    const employee = await this.employeesRepository.findOne({
      where: { id: createPayrollDto.employeeId, companyId },
    });
    if (!employee) {
      throw new NotFoundException('Employé non trouvé');
    }

    // Vérifier qu'il n'y a pas de doublon pour la même période
    const existingPayroll = await this.payrollRecordsRepository.findOne({
      where: {
        employeeId: createPayrollDto.employeeId,
        payPeriodStart: createPayrollDto.payPeriodStart,
        payPeriodEnd: createPayrollDto.payPeriodEnd,
      },
    });
    if (existingPayroll) {
      throw new BadRequestException('Une fiche de paie existe déjà pour cette période');
    }

    // Calculer la paie
    const calculation = await this.calculatePayroll(
      createPayrollDto.employeeId,
      createPayrollDto.payPeriodStart,
      createPayrollDto.payPeriodEnd,
      createPayrollDto
    );

    // Créer la fiche de paie
    const payrollRecord = this.payrollRecordsRepository.create({
      ...createPayrollDto,
      ...calculation,
      status: PayrollStatus.DRAFT,
      baseSalary: calculation.grossSalary, // Sera ajusté dans le calcul
    });

    return await this.payrollRecordsRepository.save(payrollRecord);
  }

  /**
   * Calculer la paie pour un employé
   */
  async calculatePayroll(
    employeeId: string,
    periodStart: Date,
    periodEnd: Date,
    options: Partial<CreatePayrollDto> = {}
  ): Promise<PayrollCalculation> {
    const employee = await this.employeesRepository.findOne({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException('Employé non trouvé');
    }

    // Récupérer les CRA approuvés pour la période
    const approvedTimesheets = await this.timesheetsRepository.find({
      where: {
        employeeId,
        status: TimesheetStatus.APPROVED,
        startDate: Between(periodStart, periodEnd),
        endDate: Between(periodStart, periodEnd),
      },
    });

    // Calculer les heures travaillées
    const totalHours = approvedTimesheets.reduce((sum, ts) => sum + Number(ts.totalHours), 0);
    const overtimeHours = approvedTimesheets.reduce((sum, ts) => sum + Number(ts.overtimeHours), 0);

    // Calculer le salaire de base
    const baseSalary = options.baseSalary || employee.baseSalary;
    const hourlyRate = baseSalary / 173.33; // 40h/semaine * 4.33 semaines/mois

    // Calculer les majorations heures supplémentaires (25% pour les 8 premières, 50% au-delà)
    let overtimePay = 0;
    if (overtimeHours > 0) {
      const regularOvertimeHours = Math.min(overtimeHours, 8);
      const majorOvertimeHours = Math.max(0, overtimeHours - 8);
      overtimePay = (regularOvertimeHours * hourlyRate * 1.25) + (majorOvertimeHours * hourlyRate * 1.5);
    }

    // Calculer le salaire brut
    const grossSalary = baseSalary + overtimePay + (options.bonusAmount || 0) + (options.allowanceAmount || 0);

    // Calculer les déductions (taux OHADA)
    const socialSecurity = grossSalary * 0.0585; // 5.85% CNSS
    const pensionContribution = grossSalary * 0.0525; // 5.25% retraite
    const taxWithholding = this.calculateTaxWithholding(grossSalary); // Barème progressif IRPP
    const insuranceDeduction = 0; // À configurer selon entreprise
    const loanDeduction = 0; // À configurer selon employé
    const otherDeductions = 0; // À configurer

    const totalDeductions = socialSecurity + taxWithholding + pensionContribution + 
                          insuranceDeduction + loanDeduction + otherDeductions;

    const netSalary = grossSalary - totalDeductions;

    // Notes de calcul
    const calculationNotes = `
Base: ${baseSalary.toFixed(2)} ${employee.currency}
Heures supplémentaires: ${overtimeHours}h = ${overtimePay.toFixed(2)} ${employee.currency}
Primes: ${(options.bonusAmount || 0).toFixed(2)} ${employee.currency}
Indemnités: ${(options.allowanceAmount || 0).toFixed(2)} ${employee.currency}
Brut: ${grossSalary.toFixed(2)} ${employee.currency}
CNSS (5.85%): ${socialSecurity.toFixed(2)} ${employee.currency}
Retraite (5.25%): ${pensionContribution.toFixed(2)} ${employee.currency}
IRPP: ${taxWithholding.toFixed(2)} ${employee.currency}
Net: ${netSalary.toFixed(2)} ${employee.currency}
    `.trim();

    return {
      grossSalary,
      socialSecurity,
      taxWithholding,
      pensionContribution,
      insuranceDeduction,
      loanDeduction,
      otherDeductions,
      totalDeductions,
      netSalary,
      calculationNotes,
    };
  }

  /**
   * Calculer l'impôt sur le revenu (IRPP OHADA Bénin)
   */
  private calculateTaxWithholding(grossSalary: number): number {
    // Barème IRPP Bénin 2024 (simplifié)
    const brackets = [
      { min: 0, max: 30000, rate: 0 },
      { min: 30001, max: 80000, rate: 0.10 },
      { min: 80001, max: 200000, rate: 0.15 },
      { min: 200001, max: 500000, rate: 0.20 },
      { min: 500001, max: Infinity, rate: 0.25 },
    ];

    let tax = 0;
    let remainingSalary = grossSalary;

    for (const bracket of brackets) {
      if (remainingSalary <= 0) break;

      const taxableInBracket = Math.min(
        remainingSalary,
        bracket.max - bracket.min + 1
      );

      if (taxableInBracket > 0) {
        tax += taxableInBracket * bracket.rate;
        remainingSalary -= taxableInBracket;
      }
    }

    // Abattement de 10% sur l'impôt calculé
    tax = tax * 0.9;

    return Math.max(0, tax);
  }

  /**
   * Lister les fiches de paie
   */
  async findAll(
    companyId: string,
    options: {
      employeeId?: string;
      status?: PayrollStatus;
      startDate?: Date;
      endDate?: Date;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{ payrollRecords: PayrollRecord[]; total: number }> {
    const {
      employeeId,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = options;

    const queryBuilder = this.payrollRecordsRepository
      .createQueryBuilder('payrollRecord')
      .leftJoinAndSelect('payrollRecord.employee', 'employee')
      .leftJoinAndSelect('payrollRecord.approvedBy', 'approvedBy')
      .leftJoinAndSelect('payrollRecord.processedBy', 'processedBy')
      .innerJoin('payrollRecord.employee', 'emp')
      .where('emp.companyId = :companyId', { companyId });

    if (employeeId) {
      queryBuilder.andWhere('payrollRecord.employeeId = :employeeId', { employeeId });
    }

    if (status) {
      queryBuilder.andWhere('payrollRecord.status = :status', { status });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('payrollRecord.payPeriodStart >= :startDate AND payrollRecord.payPeriodEnd <= :endDate', {
        startDate,
        endDate,
      });
    }

    const [payrollRecords, total] = await queryBuilder
      .orderBy('payrollRecord.payPeriodStart', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { payrollRecords, total };
  }

  /**
   * Trouver une fiche de paie par son ID
   */
  async findOne(id: string, companyId: string): Promise<PayrollRecord> {
    const payrollRecord = await this.payrollRecordsRepository.findOne({
      where: { id },
      relations: [
        'employee',
        'approvedBy',
        'processedBy',
      ],
    });

    if (!payrollRecord) {
      throw new NotFoundException('Fiche de paie non trouvée');
    }

    // Vérifier que l'employé appartient à l'entreprise
    const employee = await this.employeesRepository.findOne({
      where: { id: payrollRecord.employeeId, companyId },
    });
    if (!employee) {
      throw new NotFoundException('Employé non trouvé dans cette entreprise');
    }

    return payrollRecord;
  }

  /**
   * Mettre à jour une fiche de paie
   */
  async update(
    id: string,
    updatePayrollDto: Partial<CreatePayrollDto>,
    companyId: string
  ): Promise<PayrollRecord> {
    const payrollRecord = await this.findOne(id, companyId);

    if (!payrollRecord.canBeEdited) {
      throw new BadRequestException('Cette fiche de paie ne peut plus être modifiée');
    }

    // Recalculer la paie si les montants changent
    if (updatePayrollDto.baseSalary || updatePayrollDto.bonusAmount || updatePayrollDto.allowanceAmount) {
      const calculation = await this.calculatePayroll(
        payrollRecord.employeeId,
        payrollRecord.payPeriodStart,
        payrollRecord.payPeriodEnd,
        { ...payrollRecord, ...updatePayrollDto }
      );
      Object.assign(payrollRecord, calculation);
    }

    Object.assign(payrollRecord, updatePayrollDto);
    return await this.payrollRecordsRepository.save(payrollRecord);
  }

  /**
   * Calculer la paie pour plusieurs employés
   */
  async calculateBatchPayroll(
    employeeIds: string[],
    periodStart: Date,
    periodEnd: Date,
    companyId: string
  ): Promise<PayrollRecord[]> {
    const results: PayrollRecord[] = [];

    for (const employeeId of employeeIds) {
      try {
        const employee = await this.employeesRepository.findOne({
          where: { id: employeeId, companyId },
        });

        if (!employee || employee.status !== EmployeeStatus.ACTIVE) {
          continue;
        }

        // Vérifier qu'il n'y a pas déjà une fiche de paie
        const existingPayroll = await this.payrollRecordsRepository.findOne({
          where: {
            employeeId,
            payPeriodStart: periodStart,
            payPeriodEnd: periodEnd,
          },
        });

        if (existingPayroll) {
          continue;
        }

        const calculation = await this.calculatePayroll(employeeId, periodStart, periodEnd);

        const payrollRecord = this.payrollRecordsRepository.create({
          employeeId,
          payPeriodStart: periodStart,
          payPeriodEnd: periodEnd,
          payDate: new Date(),
          frequency: PayrollFrequency.MONTHLY,
          ...calculation,
          status: PayrollStatus.CALCULATED,
        });

        results.push(await this.payrollRecordsRepository.save(payrollRecord));
      } catch (error) {
        console.error(`Erreur calcul paie employé ${employeeId}:`, error);
      }
    }

    return results;
  }

  /**
   * Approuver une fiche de paie
   */
  async approve(id: string, userId: string, companyId: string): Promise<PayrollRecord> {
    const payrollRecord = await this.findOne(id, companyId);

    if (!payrollRecord.canBeApproved) {
      throw new BadRequestException('Cette fiche de paie ne peut pas être approuvée');
    }

    payrollRecord.status = PayrollStatus.APPROVED;
    payrollRecord.approvedAt = new Date();
    payrollRecord.approvedById = userId;

    return await this.payrollRecordsRepository.save(payrollRecord);
  }

  /**
   * Traiter une fiche de paie (générer bulletin)
   */
  async process(id: string, userId: string, companyId: string): Promise<PayrollRecord> {
    const payrollRecord = await this.findOne(id, companyId);

    if (!payrollRecord.canBeProcessed) {
      throw new BadRequestException('Cette fiche de paie ne peut pas être traitée');
    }

    // Générer le bulletin PDF
    const payslipUrl = await this.generatePayslipPdf(payrollRecord);

    payrollRecord.status = PayrollStatus.PROCESSED;
    payrollRecord.processedAt = new Date();
    payrollRecord.processedById = userId;
    payrollRecord.payslipUrl = payslipUrl;
    payrollRecord.payslipGeneratedAt = new Date();

    return await this.payrollRecordsRepository.save(payrollRecord);
  }

  /**
   * Marquer une fiche de paie comme payée
   */
  async markAsPaid(
    id: string,
    companyId: string,
    paymentMethod?: string,
    bankReference?: string,
    transactionId?: string
  ): Promise<PayrollRecord> {
    const payrollRecord = await this.findOne(id, companyId);

    if (!payrollRecord.isProcessed) {
      throw new BadRequestException('Seule une fiche de paie traitée peut être marquée comme payée');
    }

    payrollRecord.status = PayrollStatus.PAID;
    payrollRecord.paidAt = new Date();
    payrollRecord.paymentMethod = paymentMethod;
    payrollRecord.bankReference = bankReference;
    payrollRecord.transactionId = transactionId;

    return await this.payrollRecordsRepository.save(payrollRecord);
  }

  /**
   * Générer le bulletin de paie PDF
   */
  private async generatePayslipPdf(payrollRecord: PayrollRecord): Promise<string> {
    // TODO: Implémenter la génération PDF avec Puppeteer ou jsPDF
    // Pour l'instant, retourner une URL factice
    const filename = `payslip_${payrollRecord.employeeId}_${payrollRecord.payPeriodStart.toISOString().split('T')[0]}.pdf`;
    return `/uploads/payslips/${filename}`;
  }

  /**
   * Obtenir les statistiques de paie
   */
  async getStats(companyId: string, period?: { startDate: Date; endDate: Date }): Promise<{
    total: number;
    draft: number;
    calculated: number;
    approved: number;
    processed: number;
    paid: number;
    totalGrossSalary: number;
    totalNetSalary: number;
    totalDeductions: number;
  }> {
    const queryBuilder = this.payrollRecordsRepository
      .createQueryBuilder('payrollRecord')
      .innerJoin('payrollRecord.employee', 'emp')
      .where('emp.companyId = :companyId', { companyId });

    if (period) {
      queryBuilder.andWhere('payrollRecord.payPeriodStart >= :startDate AND payrollRecord.payPeriodEnd <= :endDate', {
        startDate: period.startDate,
        endDate: period.endDate,
      });
    }

    const payrollRecords = await queryBuilder.getMany();

    const stats = {
      total: payrollRecords.length,
      draft: payrollRecords.filter(p => p.status === PayrollStatus.DRAFT).length,
      calculated: payrollRecords.filter(p => p.status === PayrollStatus.CALCULATED).length,
      approved: payrollRecords.filter(p => p.status === PayrollStatus.APPROVED).length,
      processed: payrollRecords.filter(p => p.status === PayrollStatus.PROCESSED).length,
      paid: payrollRecords.filter(p => p.status === PayrollStatus.PAID).length,
      totalGrossSalary: payrollRecords.reduce((sum, p) => sum + Number(p.grossSalary), 0),
      totalNetSalary: payrollRecords.reduce((sum, p) => sum + Number(p.netSalary), 0),
      totalDeductions: payrollRecords.reduce((sum, p) => sum + Number(p.totalDeductions), 0),
    };

    return stats;
  }

  /**
   * Supprimer une fiche de paie
   */
  async remove(id: string, companyId: string): Promise<void> {
    const payrollRecord = await this.findOne(id, companyId);

    if (!payrollRecord.canBeEdited) {
      throw new BadRequestException('Cette fiche de paie ne peut plus être supprimée');
    }

    await this.payrollRecordsRepository.delete(id);
  }
}
