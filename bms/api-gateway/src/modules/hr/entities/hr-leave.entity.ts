import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Employee } from './employee.entity';
import { HrLeaveApproval } from './hr-leave-approval.entity';

export enum HrLeaveStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export enum HrLeaveType {
  ANNUAL = 'annual',
  SICK = 'sick',
  UNPAID = 'unpaid',
  MATERNITY = 'maternity',
  PATERNITY = 'paternity',
  OTHER = 'other',
}

@Entity('leaves')
export class HrLeave {
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

  @Column({ type: 'enum', enum: HrLeaveType })
  type!: HrLeaveType;

  @Column({ type: 'date' })
  startDate!: Date;

  @Column({ type: 'date' })
  endDate!: Date;

  @Column({ type: 'int' })
  daysCount!: number;

  @Column({ type: 'text', nullable: true })
  reason?: string;

  @Column({ type: 'enum', enum: HrLeaveStatus, default: HrLeaveStatus.DRAFT })
  status!: HrLeaveStatus;

  @Column({ type: 'int', default: 0 })
  currentStep!: number;

  @Column({ type: 'uuid', nullable: true })
  approverId?: string;

  @Column({ type: 'uuid', nullable: true })
  currentApproverId?: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  submittedAt?: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  approvedAt?: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  rejectedAt?: Date;

  @Column({ type: 'text', nullable: true })
  rejectionReason?: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  decidedAt?: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  cancelledAt?: Date;

  @Column({ type: 'uuid', nullable: true })
  cancelledBy?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;

  @OneToMany(() => HrLeaveApproval, (approval) => approval.leave, {
    cascade: true,
    eager: false,
  })
  approvals!: HrLeaveApproval[];
}
