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

/**
 * Entité représentant un prélèvement automatique (Direct Debit)
 * Utilisé pour les paiements récurrents automatiques
 */
@Entity('direct_debits')
export class DirectDebit {
  @ApiProperty({ description: 'ID unique du prélèvement' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID de l\'entreprise' })
  @Column()
  companyId: string;

  @ApiProperty({ description: 'Référence du mandat de prélèvement' })
  @Column({ length: 100, unique: true })
  mandateReference: string;

  @ApiProperty({ description: 'Libellé du prélèvement' })
  @Column({ length: 255 })
  label: string;

  @ApiProperty({ description: 'Bénéficiaire du prélèvement' })
  @Column({ length: 255 })
  creditor: string;

  @ApiProperty({ description: 'IBAN du compte à débiter' })
  @Column({ length: 34, nullable: true })
  debtorIban: string;

  @ApiProperty({ description: 'IBAN du compte bénéficiaire' })
  @Column({ length: 34, nullable: true })
  creditorIban: string;

  @ApiProperty({ description: 'Montant du prélèvement' })
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @ApiProperty({ description: 'Devise (XOF par défaut)' })
  @Column({ length: 3, default: 'XOF' })
  currency: string;

  @ApiProperty({ description: 'Fréquence du prélèvement', enum: ['monthly', 'quarterly', 'yearly', 'one-time'] })
  @Column({ type: 'varchar', length: 20 })
  frequency: 'monthly' | 'quarterly' | 'yearly' | 'one-time';

  @ApiProperty({ description: 'Jour du mois pour le prélèvement (1-31)' })
  @Column({ type: 'int', nullable: true })
  dayOfMonth: number;

  @ApiProperty({ description: 'Date de début du prélèvement' })
  @Column({ type: 'date' })
  startDate: Date;

  @ApiProperty({ description: 'Date de fin du prélèvement', required: false })
  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @ApiProperty({ description: 'Date du dernier prélèvement', required: false })
  @Column({ type: 'date', nullable: true })
  lastExecutionDate: Date;

  @ApiProperty({ description: 'Date du prochain prélèvement', required: false })
  @Column({ type: 'date', nullable: true })
  nextExecutionDate: Date;

  @ApiProperty({ description: 'Statut du prélèvement', enum: ['active', 'suspended', 'cancelled', 'completed'] })
  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: 'active' | 'suspended' | 'cancelled' | 'completed';

  @ApiProperty({ description: 'Catégorie du prélèvement (loyer, utilities, etc.)' })
  @Column({ length: 100, nullable: true })
  category: string;

  @ApiProperty({ description: 'Notes supplémentaires', required: false })
  @Column({ type: 'text', nullable: true })
  notes: string;

  @ApiProperty({ description: 'Notification avant prélèvement (en jours)' })
  @Column({ type: 'int', default: 3 })
  notificationDaysBefore: number;

  @ApiProperty({ description: 'Email de notification', required: false })
  @Column({ length: 255, nullable: true })
  notificationEmail: string;

  @ApiProperty({ description: 'Date de création' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Date de dernière modification' })
  @UpdateDateColumn()
  updatedAt: Date;
}
