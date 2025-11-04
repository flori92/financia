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
import { Employee } from './employee.entity';
import { TimesheetLine } from './timesheet-line.entity';
import { User } from '../../auth/entities/user.entity';

export enum TimesheetStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PROCESSED = 'processed',
}

export enum TimesheetPeriod {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  CUSTOM = 'custom',
}

@Entity('hr_timesheets')
class Timesheet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Période
  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({
    type: 'enum',
    enum: TimesheetPeriod,
    default: TimesheetPeriod.WEEKLY,
  })
  period: TimesheetPeriod;

  // Statut et validation
  @Column({
    type: 'enum',
    enum: TimesheetStatus,
    default: TimesheetStatus.DRAFT,
  })
  status: TimesheetStatus;

  @Column({ type: 'text', nullable: true })
  employeeComment: string;

  @Column({ type: 'text', nullable: true })
  managerComment: string;

  @Column({ type: 'date', nullable: true })
  submittedAt: Date;

  @Column({ type: 'date', nullable: true })
  approvedAt: Date;

  @Column({ type: 'date', nullable: true })
  processedAt: Date;

  // Heures totales
  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  totalHours: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  regularHours: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  overtimeHours: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  weekendHours: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  holidayHours: number;

  // Relations
  @Column()
  employeeId: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ nullable: true })
  submittedById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'submitted_by_id' })
  submittedBy: User;

  @Column({ nullable: true })
  approvedById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approved_by_id' })
  approvedBy: User;

  @OneToMany(() => TimesheetLine, (line: any) => line.timesheet, { cascade: true })
  lines: TimesheetLine[];

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
  get isSubmitted(): boolean {
    return this.status !== TimesheetStatus.DRAFT;
  }

  get isApproved(): boolean {
    return this.status === TimesheetStatus.APPROVED || this.status === TimesheetStatus.PROCESSED;
  }

  get canBeEdited(): boolean {
    return this.status === TimesheetStatus.DRAFT || this.status === TimesheetStatus.REJECTED;
  }

  get periodLabel(): string {
    switch (this.period) {
      case TimesheetPeriod.WEEKLY:
        return `Semaine du ${this.startDate.toLocaleDateString()}`;
      case TimesheetPeriod.MONTHLY:
        return `${this.startDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`;
      default:
        return `Période du ${this.startDate.toLocaleDateString()} au ${this.endDate.toLocaleDateString()}`;
    }
  }
}

export { Timesheet };
