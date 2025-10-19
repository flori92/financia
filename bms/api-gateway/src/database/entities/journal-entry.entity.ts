import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from 'typeorm';
import { Company } from './company.entity';
import { JournalEntryLine } from './journal-entry-line.entity';

@Entity('journal_entries')
export class JournalEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column({ type: 'date' })
  entryDate: Date;

  @Column({ length: 50, nullable: true })
  reference: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 10, nullable: true })
  journalCode: string;

  @Column({ length: 20, default: 'draft' })
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  postedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  postedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @OneToMany(() => JournalEntryLine, line => line.entry)
  lines: JournalEntryLine[];
}
