import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Employee } from './employee.entity';

@Entity('leave_balances')
@Unique(['companyId', 'employeeId', 'year'])
export class HrLeaveBalance {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  @Index()
  companyId!: string;

  @Column({ type: 'uuid' })
  employeeId!: string;

  @ManyToOne(() => Employee, { eager: false, nullable: false })
  @JoinColumn({ name: 'employee_id' })
  employee!: Employee;

  @Column({ type: 'int' })
  year!: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 30 })
  annualLeaveTotal!: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  annualLeaveTaken!: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 30 })
  annualLeaveRemaining!: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 15 })
  sickLeaveTotal!: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  sickLeaveTaken!: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 15 })
  sickLeaveRemaining!: number;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastAccrualAt?: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;
}
