import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { Warehouse } from './warehouse.entity';

export enum LocationType {
  STORAGE = 'storage',
  PICKING = 'picking',
  RECEIVING = 'receiving',
  SHIPPING = 'shipping',
  QUARANTINE = 'quarantine'
}

export enum LocationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  LOCKED = 'locked',
  MAINTENANCE = 'maintenance'
}

@Entity('warehouse_locations')
@Index(['warehouseId'])
@Index(['code'])
export class WarehouseLocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  code: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'enum', enum: LocationType, default: LocationType.STORAGE })
  type: LocationType;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  capacity: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  usedCapacity: number;

  @Column({ type: 'enum', enum: LocationStatus, default: LocationStatus.ACTIVE })
  status: LocationStatus;

  @Column({ length: 255, nullable: true })
  description: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @Column()
  warehouseId: string;

  @ManyToOne(() => Warehouse, warehouse => warehouse.locations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'warehouseId' })
  warehouse: Warehouse;

  @OneToMany('InventoryBatch', 'location')
  batches: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
