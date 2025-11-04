import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { InventoryBatch } from './inventory-batch.entity';
import { Picking } from './picking.entity';

export enum ProductStatus {
  IN_STOCK = 'in_stock',
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  DISCONTINUED = 'discontinued'
}

@Entity('products')
@Index(['companyId'])
@Index(['sku'])
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 100, unique: true })
  sku: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 100 })
  category: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  quantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  minQuantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  maxQuantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  costPrice: number;

  @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.IN_STOCK })
  status: ProductStatus;

  @Column({ length: 50, nullable: true })
  unit: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  weight: number;

  @Column({ length: 255, nullable: true })
  location: string;

  @Column({ length: 255, nullable: true })
  barcode: string;

  @Column({ length: 255, nullable: true })
  image: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @Column({ nullable: true })
  supplier: string;

  @Column()
  companyId: string;

  @OneToMany(() => InventoryBatch, batch => batch.product)
  batches: InventoryBatch[];

  @OneToMany(() => Picking, picking => picking.product)
  pickings: Picking[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  lastUpdated: Date;
}
