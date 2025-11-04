import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Timesheet } from './timesheet.entity';

export enum ActivityType {
  REGULAR = 'regular',
  OVERTIME = 'overtime',
  WEEKEND = 'weekend',
  HOLIDAY = 'holiday',
  SICK_LEAVE = 'sick_leave',
  ANNUAL_LEAVE = 'annual_leave',
}

export enum WorkLocation {
  OFFICE = 'office',
  REMOTE = 'remote',
  CLIENT_SITE = 'client_site',
  FIELD = 'field',
}

@Entity('hr_timesheet_lines')
class TimesheetLine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Date et heures
  @Column({ type: 'date' })
  workDate: Date;

  @Column({ type: 'time', nullable: true })
  startTime: string;

  @Column({ type: 'time', nullable: true })
  endTime: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  breakHours: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  workedHours: number;

  // Type d'activité
  @Column({
    type: 'enum',
    enum: ActivityType,
    default: ActivityType.REGULAR,
  })
  activityType: ActivityType;

  @Column({
    type: 'enum',
    enum: WorkLocation,
    default: WorkLocation.OFFICE,
  })
  workLocation: WorkLocation;

  // Description et projet
  @Column({ nullable: true, length: 200 })
  projectCode: string;

  @Column({ nullable: true, length: 200 })
  projectName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true, length: 100 })
  clientName: string;

  @Column({ nullable: true, length: 100 })
  taskType: string;

  // Validation
  @Column({ type: 'text', nullable: true })
  managerNotes: string;

  @Column({ default: false })
  isValidated: boolean;

  @Column({ type: 'date', nullable: true })
  validatedAt: Date;

  @Column({ nullable: true })
  validatedById: string;

  // Relations
  @Column()
  timesheetId: string;

  @ManyToOne(() => Timesheet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'timesheet_id' })
  timesheet: Timesheet;

  // Métadonnées
  @Column({ type: 'date', nullable: true })
  createdAt: Date;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;

  // Champs calculés
  get isOvertime(): boolean {
    return this.activityType === ActivityType.OVERTIME;
  }

  get isWeekendWork(): boolean {
    return this.activityType === ActivityType.WEEKEND;
  }

  get isLeave(): boolean {
    return [
      ActivityType.SICK_LEAVE,
      ActivityType.ANNUAL_LEAVE,
    ].includes(this.activityType);
  }

  get workDateFormatted(): string {
    return this.workDate.toLocaleDateString('fr-FR');
  }

  get durationLabel(): string {
    return `${this.workedHours}h`;
  }
}

export { TimesheetLine };
