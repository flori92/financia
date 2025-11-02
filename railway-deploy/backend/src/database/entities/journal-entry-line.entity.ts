import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { JournalEntry } from './journal-entry.entity';
import { Account } from './account.entity';

@Entity('journal_entry_lines')
export class JournalEntryLine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  entryId: string;

  @ManyToOne(() => JournalEntry, entry => entry.lines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'entryId' })
  entry: JournalEntry;

  @Column({ type: 'uuid', nullable: true })
  accountId: string;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'accountId' })
  account: Account;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  debit: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  credit: number;

  @Column({ type: 'text', nullable: true })
  label: string;

  @Column({ type: 'uuid', nullable: true })
  analyticalSectionId: string;

  @Column({ length: 50, nullable: true })
  reconciliationKey: string;

  @Column({ type: 'timestamp', nullable: true })
  reconciledAt: Date;
}
