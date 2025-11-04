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

export enum LeaveType {
  ANNUAL_LEAVE = 'annual_leave',
  SICK_LEAVE = 'sick_leave',
  MATERNITY_LEAVE = 'maternity_leave',
  PATERNITY_LEAVE = 'paternity_leave',
  PERSONAL_LEAVE = 'personal_leave',
  UNPAID_LEAVE = 'unpaid_leave',
  COMPASSIONATE_LEAVE = 'compassionate_leave',
  MARRIAGE_LEAVE = 'marriage_leave',
}

export enum LeaveStatus {
  DRAFT = 'draft',
  PENDING_MANAGER = 'pending_manager',
  PENDING_HR = 'pending_hr',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  PROCESSED = 'processed',
}

@Entity('hr_leave_requests')
export class LeaveRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Période de congé
  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'int', default: 1 })
  requestedDays: number;

  @Column({ type: 'int', default: 1 })
  approvedDays: number;

  // Type et statut
  @Column({
    type: 'enum',
    enum: LeaveType,
    default: LeaveType.ANNUAL_LEAVE,
  })
  leaveType: LeaveType;

  @Column({
    type: 'enum',
    enum: LeaveStatus,
    default: LeaveStatus.DRAFT,
  })
  status: LeaveStatus;

  // Description et justification
  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'text', nullable: true })
  employeeComment: string;

  @Column({ type: 'text', nullable: true })
  managerComment: string;

  @Column({ type: 'text', nullable: true })
  hrComment: string;

  // Dates de workflow
  @Column({ type: 'date', nullable: true })
  submittedAt: Date;

  @Column({ type: 'date', nullable: true })
  managerApprovedAt: Date;

  @Column({ type: 'date', nullable: true })
  hrApprovedAt: Date;

  @Column({ type: 'date', nullable: true })
  processedAt: Date;

  // Documents attachés
  @Column({ type: 'jsonb', nullable: true })
  attachments: Array<{
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    uploadedAt: Date;
  }> | null;

  // Solde de congés au moment de la demande
  @Column({ type: 'int', default: 0 })
  balanceBeforeRequest: number;

  @Column({ type: 'int', default: 0 })
  balanceAfterApproval: number;

  // Relations
  @Column()
  employeeId: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ nullable: true })
  managerId: string;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'manager_id' })
  manager: Employee;

  @Column({ nullable: true })
  submittedById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'submitted_by_id' })
  submittedBy: User;

  @Column({ nullable: true })
  managerApprovedById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'manager_approved_by_id' })
  managerApprovedBy: User;

  @Column({ nullable: true })
  hrApprovedById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'hr_approved_by_id' })
  hrApprovedBy: User;

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
  get isPending(): boolean {
    return [
      LeaveStatus.PENDING_MANAGER,
      LeaveStatus.PENDING_HR,
    ].includes(this.status);
  }

  get isApproved(): boolean {
    return [
      LeaveStatus.APPROVED,
      LeaveStatus.PROCESSED,
    ].includes(this.status);
  }

  get isRejected(): boolean {
    return this.status === LeaveStatus.REJECTED;
  }

  get canBeCancelled(): boolean {
    return [
      LeaveStatus.DRAFT,
      LeaveStatus.PENDING_MANAGER,
      LeaveStatus.PENDING_HR,
    ].includes(this.status);
  }

  get canBeEdited(): boolean {
    return this.status === LeaveStatus.DRAFT;
  }

  get periodLabel(): string {
    const start = this.startDate.toLocaleDateString('fr-FR');
    const end = this.endDate.toLocaleDateString('fr-FR');
    
    if (start === end) {
      return `Le ${start}`;
    }
    return `Du ${start} au ${end}`;
  }

  get leaveTypeLabel(): string {
    const labels = {
      [LeaveType.ANNUAL_LEAVE]: 'Congé annuel',
      [LeaveType.SICK_LEAVE]: 'Congé maladie',
      [LeaveType.MATERNITY_LEAVE]: 'Congé maternité',
      [LeaveType.PATERNITY_LEAVE]: 'Congé paternité',
      [LeaveType.PERSONAL_LEAVE]: 'Congé personnel',
      [LeaveType.UNPAID_LEAVE]: 'Congé sans solde',
      [LeaveType.COMPASSIONATE_LEAVE]: 'Congé compassionnel',
      [LeaveType.MARRIAGE_LEAVE]: 'Congé mariage',
    };
    return labels[this.leaveType];
  }

  get statusLabel(): string {
    const labels = {
      [LeaveStatus.DRAFT]: 'Brouillon',
      [LeaveStatus.PENDING_MANAGER]: 'En attente manager',
      [LeaveStatus.PENDING_HR]: 'En attente RH',
      [LeaveStatus.APPROVED]: 'Approuvé',
      [LeaveStatus.REJECTED]: 'Rejeté',
      [LeaveStatus.CANCELLED]: 'Annulé',
      [LeaveStatus.PROCESSED]: 'Traité',
    };
    return labels[this.status];
  }
}
