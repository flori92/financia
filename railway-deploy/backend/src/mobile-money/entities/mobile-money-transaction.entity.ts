import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Invoice } from '../../invoices/entities/invoice.entity';
import { Payment } from '../../payments/entities/payment.entity';

@Entity('mobile_money_transactions')
export class MobileMoneyTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  invoiceId: string;

  @Column({ nullable: true })
  paymentId: string;

  @Column()
  provider: string; // mtn, moov, wave, etc.

  @Column('decimal', { precision: 15, scale: 2 })
  amount: number;

  @Column({ default: 'XOF' })
  currency: string;

  @Column({ unique: true })
  txRef: string; // Transaction reference

  @Column({ nullable: true })
  externalTransactionId: string; // ID from provider (FedaPay, etc.)

  @Column()
  phoneNumber: string;

  @Column({ nullable: true })
  customerEmail: string;

  @Column({ nullable: true })
  customerName: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'processing', 'success', 'failed', 'canceled'],
    default: 'pending',
  })
  status: string;

  @Column({ type: 'text', nullable: true })
  statusMessage: string;

  @Column({ type: 'jsonb', nullable: true })
  providerResponse: any; // Response complete du provider

  @Column({ type: 'jsonb', nullable: true })
  metadata: any; // Données supplémentaires

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  // Relations
  @ManyToOne(() => Invoice, { nullable: true })
  @JoinColumn({ name: 'invoiceId' })
  invoice: Invoice;

  @ManyToOne(() => Payment, { nullable: true })
  @JoinColumn({ name: 'paymentId' })
  payment: Payment;
}
