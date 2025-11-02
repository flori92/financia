import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('purchase_orders')
export class PurchaseOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column()
  orderNumber: string;

  @Column()
  supplierId: string;

  @Column()
  supplierName: string;

  @Column({ type: 'date' })
  orderDate: Date;

  @Column({ type: 'date', nullable: true })
  expectedDeliveryDate: Date;

  @Column({ default: 'draft' })
  status: 'draft' | 'submitted' | 'approved' | 'received' | 'cancelled';

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  receivedAmount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
