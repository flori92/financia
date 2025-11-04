import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { User } from '../../auth/entities/user.entity';
import { Timesheet } from './timesheet.entity';
import { LeaveRequest } from './leave-request.entity';
import { PayrollRecord } from './payroll-record.entity';

export enum EmployeeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ON_LEAVE = 'on_leave',
  TERMINATED = 'terminated',
}

export enum ContractType {
  PERMANENT = 'permanent',
  FIXED_TERM = 'fixed_term',
  INTERN = 'intern',
  CONSULTANT = 'consultant',
}

export enum PaymentMethod {
  BANK_TRANSFER = 'bank_transfer',
  MOBILE_MONEY = 'mobile_money',
  CASH = 'cash',
  CHECK = 'check',
}

@Entity('hr_employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Informations personnelles
  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ unique: true, length: 50 })
  employeeNumber: string;

  @Column({ nullable: true, length: 100 })
  email: string;

  @Column({ nullable: true, length: 20 })
  phone: string;

  @Column({ nullable: true, type: 'date' })
  dateOfBirth: Date;

  @Column({ nullable: true, length: 20 })
  nationalId: string;

  @Column({ nullable: true, length: 100 })
  address: string;

  @Column({ default: 'BJ' })
  country: string;

  // Statut et contrat
  @Column({
    type: 'enum',
    enum: EmployeeStatus,
    default: EmployeeStatus.ACTIVE,
  })
  status: EmployeeStatus;

  @Column({
    type: 'enum',
    enum: ContractType,
    default: ContractType.PERMANENT,
  })
  contractType: ContractType;

  @Column({ type: 'date', nullable: true })
  hireDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ nullable: true, length: 100 })
  position: string;

  @Column({ nullable: true, length: 100 })
  department: string;

  @Column({ nullable: true })
  managerId: string;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'manager_id' })
  manager: Employee;

  // Rémunération
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  baseSalary: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  grossSalary: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  netSalary: number;

  @Column({ default: 'XOF' })
  currency: string;

  @Column({ type: 'enum', enum: PaymentMethod, default: PaymentMethod.BANK_TRANSFER })
  paymentMethod: PaymentMethod;

  // Informations bancaires
  @Column({ name: 'bank_name', nullable: true, length: 100 })
  bankName: string;

  @Column({ name: 'bank_account', nullable: true, length: 50 })
  bankAccount: string;

  @Column({ name: 'bank_iban', nullable: true, length: 50 })
  bankIban: string;

  // Mobile Money
  @Column({ name: 'mobile_money_provider', nullable: true, length: 50 })
  mobileMoneyProvider: string;

  @Column({ name: 'mobile_money_phone', nullable: true, length: 20 })
  mobileMoneyPhone: string;

  // Congés et absences
  @Column({ type: 'int', default: 0 })
  annualLeaveDays: number;

  @Column({ type: 'int', default: 0 })
  usedLeaveDays: number;

  @Column({ type: 'int', default: 0 })
  remainingLeaveDays: number;

  @Column({ type: 'date', nullable: true })
  lastLeaveUpdate: Date;

  // Sécurité sociale
  @Column({ name: 'social_security_number', nullable: true, length: 50 })
  socialSecurityNumber: string;

  @Column({ name: 'tax_id', nullable: true, length: 50 })
  taxId: string;

  @Column({ name: 'pension_fund_id', nullable: true, length: 50 })
  pensionFundId: string;

  // Relations
  @Column()
  companyId: string;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  company: Company;

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true })
  user: User;

  @OneToMany(() => Timesheet, (timesheet) => timesheet.employee)
  timesheets: Timesheet[];

  @OneToMany(() => LeaveRequest, (leaveRequest) => leaveRequest.employee)
  leaveRequests: LeaveRequest[];

  @OneToMany(() => PayrollRecord, (payrollRecord) => payrollRecord.employee)
  payrollRecords: PayrollRecord[];

  // Métadonnées
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;

  // Champs calculés (non stockés)
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get isActive(): boolean {
    return this.status === EmployeeStatus.ACTIVE;
  }

  get canAccessPortal(): boolean {
    return this.userId !== null && this.isActive;
  }
}
