import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Supplier } from './supplier.entity';

@Entity('purchase_orders')
@Index(['companyId'])
@Index(['orderNumber'])
export class PurchaseOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, unique: true })
  orderNumber: string;

  @Column()
  supplierId: string;

  @ManyToOne(() => Supplier, supplier => supplier.purchaseOrders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier;

  @Column({ length: 255, nullable: true })
  reference: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'date' })
  orderDate: Date;

  @Column({ type: 'date', nullable: true })
  expectedDeliveryDate: Date;

  @Column({ length: 255, nullable: true })
  shippingAddress: string;

  @Column({ length: 255, nullable: true })
  billingAddress: string;

  @Column({ length: 20, nullable: true })
  currency: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  shippingCost: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  receivedAmount: number;

  @Column({ default: 'draft' })
  status: 'draft' | 'submitted' | 'approved' | 'received' | 'cancelled';

  @Column({ type: 'json', nullable: true })
  items: any[];

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @Column()
  companyId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
