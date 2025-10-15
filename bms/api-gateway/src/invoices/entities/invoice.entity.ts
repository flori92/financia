import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { InvoiceItem } from './invoice-item.entity';

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id' })
  companyId: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ name: 'invoice_number', unique: true })
  invoiceNumber: string;

  @Column({ name: 'invoice_type' })
  invoiceType: 'sales' | 'purchase';

  @Column({ name: 'invoice_date', type: 'date' })
  invoiceDate: Date;

  @Column({ name: 'due_date', type: 'date', nullable: true })
  dueDate: Date;

  @Column({ name: 'party_id', nullable: true })
  partyId: string;

  @Column({ name: 'party_name' })
  partyName: string;

  @Column({ name: 'party_phone', nullable: true })
  partyPhone: string;

  @Column({ name: 'party_email', nullable: true })
  partyEmail: string;

  @Column({ default: 'XOF' })
  currency: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  subtotal: number;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 15, scale: 2 })
  totalAmount: number;

  @Column({ name: 'paid_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  paidAmount: number;

  @Column({ name: 'outstanding_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  outstandingAmount: number;

  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  paidAt: Date;

  @Column({ default: 'draft' })
  status: 'draft' | 'submitted' | 'paid' | 'cancelled' | 'overdue';

  @Column({ name: 'payment_status', default: 'unpaid' })
  paymentStatus: 'unpaid' | 'partially_paid' | 'paid';

  @Column({ name: 'payment_method', nullable: true })
  paymentMethod: string;

  @Column({ name: 'mobile_money_provider', nullable: true })
  mobileMoneyProvider: 'mtn' | 'moov' | 'orange' | 'wave';

  @Column({ name: 'qr_code_data', type: 'text', nullable: true })
  qrCodeData: string;

  @Column({ name: 'delivery_method', nullable: true })
  deliveryMethod: 'whatsapp' | 'sms' | 'email' | 'print';

  @Column({ name: 'sent_at', nullable: true })
  sentAt: Date;

  @Column({ default: true })
  synced: boolean;

  @Column({ name: 'synced_at', nullable: true })
  syncedAt: Date;

  @OneToMany(() => InvoiceItem, (item) => item.invoice, { cascade: true })
  items: InvoiceItem[];

  @Column({ name: 'created_by', nullable: true })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'frappe_id', type: 'varchar', length: 255, nullable: true })
  frappeId?: string;

  @Column({ name: 'last_sync_at', type: 'timestamp', nullable: true })
  lastSyncAt?: Date;
}
