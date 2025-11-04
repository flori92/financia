import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Employee } from './employee.entity';
import { User } from '../../auth/entities/user.entity';

export enum PayrollStatus {
  DRAFT = 'draft',
  CALCULATED = 'calculated',
  APPROVED = 'approved',
  PROCESSED = 'processed',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

export enum PayrollFrequency {
  MONTHLY = 'monthly',
  BI_WEEKLY = 'bi_weekly',
  WEEKLY = 'weekly',
  CUSTOM = 'custom',
}

@Entity('hr_payroll_records')
class PayrollRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Période de paie
  @Column({ type: 'date' })
  payPeriodStart: Date;

  @Column({ type: 'date' })
  payPeriodEnd: Date;

  @Column({ type: 'date' })
  payDate: Date;

  @Column({
    type: 'enum',
    enum: PayrollFrequency,
    default: PayrollFrequency.MONTHLY,
  })
  frequency: PayrollFrequency;

  // Statut
  @Column({
    type: 'enum',
    enum: PayrollStatus,
    default: PayrollStatus.DRAFT,
  })
  status: PayrollStatus;

  // Salaire brut
  @Column({ name: 'base_salary', type: 'decimal', precision: 15, scale: 2, default: 0 })
  baseSalary: number;

  @Column({ name: 'overtime_hours', type: 'decimal', precision: 8, scale: 2, default: 0 })
  overtimeHours: number;

  @Column({ name: 'currency', default: 'XOF', length: 3 })
  currency: string;

  @Column({ name: 'overtime_pay', type: 'decimal', precision: 15, scale: 2, default: 0 })
  overtimePay: number;

  @Column({ name: 'bonus_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  bonusAmount: number;

  @Column({ name: 'allowance_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  allowanceAmount: number;

  @Column({ name: 'gross_salary', type: 'decimal', precision: 15, scale: 2, default: 0 })
  grossSalary: number;

  // Déductions
  @Column({ name: 'social_security', type: 'decimal', precision: 15, scale: 2, default: 0 })
  socialSecurity: number;

  @Column({ name: 'tax_withholding', type: 'decimal', precision: 15, scale: 2, default: 0 })
  taxWithholding: number;

  @Column({ name: 'pension_contribution', type: 'decimal', precision: 15, scale: 2, default: 0 })
  pensionContribution: number;

  @Column({ name: 'insurance_deduction', type: 'decimal', precision: 15, scale: 2, default: 0 })
  insuranceDeduction: number;

  @Column({ name: 'loan_deduction', type: 'decimal', precision: 15, scale: 2, default: 0 })
  loanDeduction: number;

  @Column({ name: 'other_deductions', type: 'decimal', precision: 15, scale: 2, default: 0 })
  otherDeductions: number;

  @Column({ name: 'total_deductions', type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalDeductions: number;

  // Salaire net
  @Column({ name: 'net_salary', type: 'decimal', precision: 15, scale: 2, default: 0 })
  netSalary: number;

  // Informations de paiement
  @Column({ name: 'payment_method', nullable: true, length: 50 })
  paymentMethod: string;

  @Column({ name: 'bank_reference', nullable: true, length: 100 })
  bankReference: string;

  @Column({ name: 'transaction_id', nullable: true, length: 100 })
  transactionId: string;

  @Column({ name: 'paid_at', type: 'date', nullable: true })
  paidAt: Date;

  // Documents
  @Column({ name: 'payslip_url', nullable: true, length: 500 })
  payslipUrl: string;

  @Column({ name: 'payslip_generated_at', type: 'date', nullable: true })
  payslipGeneratedAt: Date;

  // Jours travaillés et absences
  @Column({ name: 'worked_days', type: 'int', default: 0 })
  workedDays: number;

  @Column({ name: 'leave_days', type: 'int', default: 0 })
  leaveDays: number;

  @Column({ name: 'sick_days', type: 'int', default: 0 })
  sickDays: number;

  // Notes et validation
  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  calculationNotes: string;

  @Column({ type: 'date', nullable: true })
  approvedAt: Date;

  @Column({ type: 'date', nullable: true })
  processedAt: Date;

  // Relations
  @Column()
  employeeId: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ nullable: true })
  approvedById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approved_by_id' })
  approvedBy: User;

  @Column({ nullable: true })
  processedById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'processed_by_id' })
  processedBy: User;

  // Métadonnées
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;

  // Champs calculés
  get isPaid(): boolean {
    return this.status === PayrollStatus.PAID;
  }

  get isProcessed(): boolean {
    return [
      PayrollStatus.PROCESSED,
      PayrollStatus.PAID,
    ].includes(this.status);
  }

  get canBeEdited(): boolean {
    return [
      PayrollStatus.DRAFT,
      PayrollStatus.CALCULATED,
    ].includes(this.status);
  }

  get canBeApproved(): boolean {
    return this.status === PayrollStatus.CALCULATED;
  }

  get canBeProcessed(): boolean {
    return this.status === PayrollStatus.APPROVED;
  }

  get payPeriodLabel(): string {
    const start = this.payPeriodStart.toLocaleDateString('fr-FR');
    const end = this.payPeriodEnd.toLocaleDateString('fr-FR');
    return `Période du ${start} au ${end}`;
  }

  get statusLabel(): string {
    const labels = {
      [PayrollStatus.DRAFT]: 'Brouillon',
      [PayrollStatus.CALCULATED]: 'Calculé',
      [PayrollStatus.APPROVED]: 'Approuvé',
      [PayrollStatus.PROCESSED]: 'Traité',
      [PayrollStatus.PAID]: 'Payé',
      [PayrollStatus.CANCELLED]: 'Annulé',
    };
    return labels[this.status];
  }

  get totalEarnings(): number {
    return (
      Number(this.baseSalary) +
      Number(this.overtimePay) +
      Number(this.bonusAmount) +
      Number(this.allowanceAmount)
    );
  }
}

export { PayrollRecord };
