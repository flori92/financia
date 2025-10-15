import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Payment } from './payment.entity';

/**
 * Entité représentant l'allocation d'un paiement à une facture
 * Permet le rapprochement paiement-facture
 */
@Entity('payment_allocations')
export class PaymentAllocation {
  @ApiProperty({ description: 'ID unique de l\'allocation' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Paiement parent', type: () => Payment })
  @ManyToOne(() => Payment, (payment) => payment.allocations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'payment_id' })
  payment: Payment;

  @ApiProperty({ description: 'ID de la facture' })
  @Column({ type: 'uuid' })
  invoiceId: string;

  @ApiProperty({ description: 'Montant alloué à cette facture' })
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  allocatedAmount: number;

  @ApiProperty({ description: 'Remarques sur l\'allocation', required: false })
  @Column({ type: 'text', nullable: true })
  remarks: string;

  @ApiProperty({ description: 'Date de création' })
  @CreateDateColumn()
  createdAt: Date;
}
