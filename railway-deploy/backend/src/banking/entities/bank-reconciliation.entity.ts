import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BankTransaction } from './bank-transaction.entity';
import { JournalEntry } from '../../accounting/entities/journal-entry.entity';

/**
 * Entité de rapprochement bancaire compatible OHADA
 * 
 * Lie une transaction bancaire (relevé) à une écriture comptable (JournalEntry)
 * Compatible avec la structure OHADA partie double
 */
@Entity('bank_reconciliations')
export class BankReconciliation {
  @ApiProperty({ description: 'ID unique du rapprochement' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID de l\'entreprise' })
  @Column()
  companyId: string;

  @ApiProperty({ description: 'ID de la transaction bancaire' })
  @Column()
  bankTransactionId: string;

  @ApiProperty({ description: 'ID de l\'écriture comptable OHADA' })
  @Column()
  journalEntryId: string;

  @ApiProperty({ description: 'Montant rapproché' })
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  reconciledAmount: number;

  @ApiProperty({ description: 'Niveau de confiance du matching (0-1)' })
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  confidence: number;

  @ApiProperty({ description: 'Type de rapprochement', enum: ['automatic', 'manual', 'ai'] })
  @Column({ type: 'varchar', length: 20, default: 'manual' })
  matchType: 'automatic' | 'manual' | 'ai';

  @ApiProperty({ description: 'Statut du rapprochement', enum: ['pending', 'validated', 'rejected'] })
  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: 'pending' | 'validated' | 'rejected';

  @ApiProperty({ description: 'Notes sur le rapprochement', required: false })
  @Column({ type: 'text', nullable: true })
  notes: string;

  @ApiProperty({ description: 'ID de l\'utilisateur qui a effectué le rapprochement' })
  @Column({ nullable: true })
  reconciledBy: string;

  @ApiProperty({ description: 'Date du rapprochement' })
  @Column({ type: 'timestamp', nullable: true })
  reconciledAt: Date;

  @ApiProperty({ description: 'Date de création' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Date de dernière modification' })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => BankTransaction)
  @JoinColumn({ name: 'bankTransactionId' })
  bankTransaction: BankTransaction;

  @ManyToOne(() => JournalEntry)
  @JoinColumn({ name: 'journalEntryId' })
  journalEntry: JournalEntry;
}
