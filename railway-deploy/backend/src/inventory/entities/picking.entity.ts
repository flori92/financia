import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Product } from './product.entity';

export enum PickingStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum PickingPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

@Entity('pickings')
@Index(['companyId'])
@Index(['pickingNumber'])
@Index(['status'])
export class Picking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, unique: true })
  pickingNumber: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  quantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  pickedQuantity: number;

  @Column({ type: 'enum', enum: PickingStatus, default: PickingStatus.PENDING })
  status: PickingStatus;

  @Column({ type: 'enum', enum: PickingPriority, default: PickingPriority.NORMAL })
  priority: PickingPriority;

  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @Column({ nullable: true })
  orderId: string;

  @Column({ nullable: true })
  customerId: string;

  @Column()
  productId: string;

  @ManyToOne(() => Product, product => product.pickings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ nullable: true })
  batchId: string;

  @ManyToOne('InventoryBatch', 'pickings', { nullable: true })
  @JoinColumn({ name: 'batchId' })
  batch: any;

  @Column({ nullable: true })
  assignedTo: string;

  @Column({ type: 'json', nullable: true })
  optimizedPath: string[];

  @Column()
  companyId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
