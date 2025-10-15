import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentAllocation } from './payment-allocation.entity';

/**
 * Entité représentant un paiement
 * Peut être lié à une ou plusieurs factures (PaymentAllocation)
 */
@Entity('payments')
export class Payment {
  @ApiProperty({ description: 'ID unique du paiement' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Numéro du paiement (auto-généré)' })
  @Column({ unique: true, length: 50 })
  paymentNumber: string;

  @ApiProperty({ description: 'Date du paiement' })
  @Column({ type: 'date' })
  paymentDate: Date;

  @ApiProperty({ description: 'Montant total du paiement' })
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @ApiProperty({ description: 'Montant alloué aux factures' })
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  allocatedAmount: number;

  @ApiProperty({ description: 'Montant non alloué (disponible)' })
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  unallocatedAmount: number;

  @ApiProperty({ description: 'Devise (XOF par défaut)' })
  @Column({ length: 3, default: 'XOF' })
  currency: string;

  @ApiProperty({ description: 'Mode de paiement', enum: ['cash', 'bank_transfer', 'mobile_money', 'check', 'card'] })
  @Column({
    type: 'enum',
    enum: ['cash', 'bank_transfer', 'mobile_money', 'check', 'card'],
  })
  paymentMethod: string;

  @ApiProperty({ description: 'Référence du paiement (numéro de transaction, chèque, etc.)', required: false })
  @Column({ length: 100, nullable: true })
  reference: string;

  @ApiProperty({ description: 'Type de transaction', enum: ['customer', 'supplier'] })
  @Column({
    type: 'enum',
    enum: ['customer', 'supplier'],
    default: 'customer',
  })
  partyType: string;

  @ApiProperty({ description: 'ID du client ou fournisseur' })
  @Column({ type: 'uuid' })
  partyId: string;

  @ApiProperty({ description: 'ID de la société' })
  @Column({ type: 'uuid' })
  companyId: string;

  @ApiProperty({ description: 'Statut du paiement', enum: ['draft', 'submitted', 'cancelled'] })
  @Column({
    type: 'enum',
    enum: ['draft', 'submitted', 'cancelled'],
    default: 'draft',
  })
  status: string;

  @ApiProperty({ description: 'Allocations du paiement aux factures', type: () => [PaymentAllocation] })
  @OneToMany(() => PaymentAllocation, (allocation) => allocation.payment, {
    cascade: true,
    eager: true,
  })
  allocations: PaymentAllocation[];

  @ApiProperty({ description: 'Remarques sur le paiement', required: false })
  @Column({ type: 'text', nullable: true })
  remarks: string;

  @ApiProperty({ description: 'ID de l\'utilisateur créateur' })
  @Column({ type: 'uuid' })
  createdBy: string;

  @ApiProperty({ description: 'Date de soumission', required: false })
  @Column({ type: 'timestamp', nullable: true })
  submittedAt: Date;

  @ApiProperty({ description: 'ID de l\'utilisateur validateur', required: false })
  @Column({ type: 'uuid', nullable: true })
  submittedBy: string;

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
