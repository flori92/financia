import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { JournalEntry } from './journal-entry.entity';
import { Account } from './account.entity';

/**
 * Entité représentant une ligne d'écriture comptable
 * Chaque écriture a au minimum 2 lignes (débit et crédit)
 */
@Entity('journal_entry_lines')
export class JournalEntryLine {
  @ApiProperty({ description: 'ID unique de la ligne' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Écriture comptable parente', type: () => JournalEntry })
  @ManyToOne(() => JournalEntry, (entry) => entry.lines, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'journal_entry_id' })
  journalEntry: JournalEntry;

  @ApiProperty({ description: 'Compte débité/crédité', type: () => Account })
  @ManyToOne(() => Account)
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @ApiProperty({ description: 'Numéro de ligne' })
  @Column({ type: 'int', nullable: true })
  lineNumber: number;

  @ApiProperty({ description: 'Libellé de la ligne' })
  @Column({ length: 255 })
  label: string;

  @ApiProperty({ description: 'Montant au débit' })
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  debit: number;

  @ApiProperty({ description: 'Montant au crédit' })
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  credit: number;

  @ApiProperty({ description: 'Devise (XOF par défaut)' })
  @Column({ length: 3, default: 'XOF' })
  currency: string;

  @ApiProperty({ description: 'Référence analytique (projet, département, etc.)', required: false })
  @Column({ length: 100, nullable: true })
  analyticReference: string;

  @ApiProperty({ description: 'Référence document (facture, paiement, etc.)', required: false })
  @Column({ length: 100, nullable: true })
  reference: string;

  @ApiProperty({ description: 'Clé de lettrage (rapprochement comptable)', required: false })
  @Column({ length: 50, nullable: true })
  reconciliationKey: string;

  @ApiProperty({ description: 'Date de rapprochement', required: false })
  @Column({ type: 'timestamp', nullable: true })
  reconciledAt: Date;

  @ApiProperty({ description: 'Date de création' })
  @CreateDateColumn()
  createdAt: Date;
}
