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
  @Column({ name: 'payment_number', unique: true, length: 50 })
  paymentNumber: string;

  @ApiProperty({ description: 'Date du paiement' })
  @Column({ name: 'payment_date', type: 'date' })
  paymentDate: Date;

  @ApiProperty({ description: 'Montant total du paiement' })
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @ApiProperty({ description: 'Montant alloué aux factures' })
  @Column({ name: 'allocated_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  allocatedAmount: number;

  @ApiProperty({ description: 'Montant non alloué (disponible)' })
  @Column({ name: 'unallocated_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  unallocatedAmount: number;

  @ApiProperty({ description: 'Devise (XOF par défaut)' })
  @Column({ name: 'currency', length: 3, default: 'XOF' })
  currency: string;

  @ApiProperty({ description: 'Mode de paiement', enum: ['cash', 'bank_transfer', 'mobile_money', 'check', 'card'] })
  @Column({ name: 'payment_method',
    type: 'enum',
    enum: ['cash', 'bank_transfer', 'mobile_money', 'check', 'card'],
  })
  paymentMethod: string;

  @ApiProperty({ description: 'Référence du paiement (numéro de transaction, chèque, etc.)', required: false })
  @Column({ name: 'reference', length: 100, nullable: true })
  reference: string;

  @ApiProperty({ description: 'Type de transaction', enum: ['customer', 'supplier'] })
  @Column({ name: 'party_type',
    type: 'enum',
    enum: ['customer', 'supplier'],
    default: 'customer',
  })
  partyType: string;

  @ApiProperty({ description: 'ID du client ou fournisseur' })
  @Column({ name: 'party_id', type: 'uuid' })
  partyId: string;

  @ApiProperty({ description: 'ID de la société' })
  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @ApiProperty({ description: 'Statut du paiement', enum: ['draft', 'submitted', 'validated', 'cancelled'] })
  @Column({ name: 'status',
    type: 'enum',
    enum: ['draft', 'submitted', 'validated', 'cancelled'],
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
  @Column({ name: 'remarks', type: 'text', nullable: true })
  remarks: string;

  @ApiProperty({ description: 'ID de l\'utilisateur créateur' })
  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @ApiProperty({ description: 'Date de soumission', required: false })
  @Column({ name: 'submitted_at', type: 'timestamp', nullable: true })
  submittedAt: Date;

  @ApiProperty({ description: 'ID de l\'utilisateur validateur', required: false })
  @Column({ name: 'submitted_by', type: 'uuid', nullable: true })
  submittedBy: string;

  @ApiProperty({ description: 'Date de création' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Date de dernière mise à jour' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ApiProperty({ description: 'ID Frappe pour synchronisation', required: false })
  @Column({ name: 'frappe_id', type: 'varchar', length: 255, nullable: true })
  frappeId?: string;

  @ApiProperty({ description: 'Date de dernière synchronisation avec Frappe', required: false })
  @Column({ name: 'last_sync_at', type: 'timestamp', nullable: true })
  lastSyncAt?: Date;

  @ApiProperty({ description: 'Version pour optimistic locking' })
  @Column({ type: 'int', default: 1 })
  version: number;
}
