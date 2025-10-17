import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

/**
 * Entité représentant une clôture de période comptable
 */
@Entity('period_closures')
export class PeriodClosure {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate: Date;

  @Column({
    type: 'enum',
    enum: ['draft', 'closed', 'cancelled'],
    default: 'draft',
  })
  status: 'draft' | 'closed' | 'cancelled';

  @Column({ name: 'closing_journal_entry_id', type: 'uuid', nullable: true })
  closingJournalEntryId: string;

  @Column({ name: 'result_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  resultAmount: number;

  @Column({ name: 'closed_by', type: 'uuid', nullable: true })
  closedBy: string;

  @Column({ name: 'closed_at', type: 'timestamp', nullable: true })
  closedAt: Date;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
