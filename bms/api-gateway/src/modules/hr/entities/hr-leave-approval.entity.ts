import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { HrLeave } from './hr-leave.entity';

export enum HrLeaveApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SKIPPED = 'skipped',
}

@Entity('hr_leave_approvals')
export class HrLeaveApproval {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  @Index()
  leaveId!: string;

  @ManyToOne(() => HrLeave, (leave) => leave.approvals, {
    eager: false,
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'leave_id' })
  leave!: HrLeave;

  @Column({ type: 'int' })
  stepOrder!: number;

  @Column({ type: 'varchar', length: 100 })
  role!: string;

  @Column({ type: 'uuid', nullable: true })
  approverId?: string;

  @Column({ type: 'enum', enum: HrLeaveApprovalStatus, default: HrLeaveApprovalStatus.PENDING })
  status!: HrLeaveApprovalStatus;

  @Column({ type: 'timestamp with time zone', nullable: true })
  decidedAt?: Date;

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;
}
