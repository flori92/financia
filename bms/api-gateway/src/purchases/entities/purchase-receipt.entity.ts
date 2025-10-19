import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('purchase_receipts')
export class PurchaseReceipt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column()
  receiptNumber: string;

  @Column()
  purchaseOrderId: string;

  @Column({ type: 'date' })
  receiptDate: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  receivedAmount: number;

  @Column({ default: 'pending' })
  qualityStatus: 'pending' | 'approved' | 'rejected';

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}
