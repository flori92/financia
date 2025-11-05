import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('payrolls')
export class Payroll {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column()
  employeeId: string;

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
