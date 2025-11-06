import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Employee } from './employee.entity';

@Entity('payrolls')
export class Payroll {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column()
  employeeId: string;

  @ManyToOne(() => Employee, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'employee_id' })
  employee?: Employee | null;

  @Column()
  employeeName: string;

  @Column()
  period: string; // Format: "2025-01" for January 2025

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  baseSalary: number;

  @Column({ type: 'int' })
  workedDays: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  grossSalary: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  bonuses: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  deductions: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  socialCharges: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  tax: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  netSalary: number;

  @Column({ default: 'calculated' })
  status: 'calculated' | 'approved' | 'paid' | 'cancelled';

  @Column({ name: 'payslip_file_name', length: 255, nullable: true })
  payslipFileName?: string;

  @Column({ name: 'payslip_mime_type', length: 50, nullable: true })
  payslipMimeType?: string;

  @Column({ name: 'payslip_file_size', type: 'int', nullable: true })
  payslipFileSize?: number;

  @Column({ name: 'payslip_file', type: 'bytea', nullable: true, select: false })
  payslipFile?: Buffer;

  @Column({ name: 'payslip_generated_at', type: 'timestamp', nullable: true })
  payslipGeneratedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
