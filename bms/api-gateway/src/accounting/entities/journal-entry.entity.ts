import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { JournalEntryLine } from './journal-entry-line.entity';

/**
 * Entité représentant une écriture comptable
 * Respecte le principe de la partie double (Débit = Crédit)
 */
@Entity('journal_entries')
export class JournalEntry {
  @ApiProperty({ description: 'ID unique de l\'écriture' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Numéro de l\'écriture (auto-généré)' })
  @Column({ unique: true, length: 50 })
  entryNumber: string;

  @ApiProperty({ description: 'Date de l\'écriture comptable' })
  @Column({ type: 'date' })
  entryDate: Date;

  @ApiProperty({ description: 'Référence externe (facture, paiement, etc.)', required: false })
  @Column({ length: 100, nullable: true })
  reference: string;

  @ApiProperty({ description: 'Description de l\'écriture' })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ description: 'Type de journal (vente, achat, banque, OD)', enum: ['sales', 'purchase', 'bank', 'general'] })
  @Column({
    type: 'enum',
    enum: ['sales', 'purchase', 'bank', 'general'],
    default: 'general',
  })
  journalType: string;

  @ApiProperty({ description: 'Statut de l\'écriture', enum: ['draft', 'posted', 'cancelled'] })
  @Column({
    type: 'enum',
    enum: ['draft', 'posted', 'cancelled'],
    default: 'draft',
  })
  status: string;

  @ApiProperty({ description: 'Lignes de l\'écriture', type: () => [JournalEntryLine] })
  @OneToMany(() => JournalEntryLine, (line) => line.journalEntry, {
    cascade: true,
    eager: true,
  })
  lines: JournalEntryLine[];

  @ApiProperty({ description: 'Total débit (doit être égal au total crédit)' })
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalDebit: number;

  @ApiProperty({ description: 'Total crédit (doit être égal au total débit)' })
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalCredit: number;

  @ApiProperty({ description: 'ID de la société' })
  @Column({ type: 'uuid' })
  companyId: string;

  @ApiProperty({ description: 'ID de l\'utilisateur créateur' })
  @Column({ type: 'uuid' })
  createdBy: string;

  @ApiProperty({ description: 'Date de validation (posting)', required: false })
  @Column({ type: 'timestamp', nullable: true })
  postedAt: Date;

  @ApiProperty({ description: 'ID de l\'utilisateur validateur', required: false })
  @Column({ type: 'uuid', nullable: true })
  postedBy: string;

  @ApiProperty({ description: 'Date de création' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Date de dernière mise à jour' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ description: 'ID Frappe pour synchronisation', required: false })
  @Column({ type: 'varchar', length: 255, nullable: true })
  frappeId?: string;

  @ApiProperty({ description: 'Date de dernière synchronisation avec Frappe', required: false })
  @Column({ type: 'timestamp', nullable: true })
  lastSyncAt?: Date;

  @ApiProperty({ description: 'Version pour optimistic locking' })
  @Column({ type: 'int', default: 1 })
  version: number;
}
