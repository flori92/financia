import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { Product } from './product.entity';
import { WarehouseLocation } from '../../modules/inventory/entities/warehouse-location.entity';

export enum BatchStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  QUARANTINE = 'quarantine',
  CLOSED = 'closed'
}

@Entity('inventory_batches')
@Index(['companyId'])
@Index(['batchNumber'])
@Index(['productId'])
export class InventoryBatch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, unique: true })
  batchNumber: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  initialQuantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  currentQuantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  unitCost: number;

  @Column({ type: 'date', nullable: true })
  manufactureDate: Date;

  @Column({ type: 'date', nullable: true })
  expiryDate: Date;

  @Column({ type: 'enum', enum: BatchStatus, default: BatchStatus.ACTIVE })
  status: BatchStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @Column()
  productId: string;

  @ManyToOne(() => Product, product => product.batches, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ nullable: true })
  locationId: string;

  @ManyToOne(() => WarehouseLocation, location => location.batches, { nullable: true })
  @JoinColumn({ name: 'locationId' })
  location: WarehouseLocation;

  @Column()
  companyId: string;

  @OneToMany('Picking', 'batch')
  pickings: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
