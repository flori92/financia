import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { WarehouseLocation } from './warehouse-location.entity';

export enum WarehouseType {
  MAIN = 'main',
  SECONDARY = 'secondary',
  TEMPORARY = 'temporary'
}

export enum WarehouseStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance'
}

@Entity('warehouses')
@Index(['companyId'])
export class Warehouse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 500, nullable: true })
  address: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ length: 100, nullable: true })
  country: string;

  @Column({ length: 20, nullable: true })
  postalCode: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ type: 'enum', enum: WarehouseType, default: WarehouseType.MAIN })
  type: WarehouseType;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  totalCapacity: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  usedCapacity: number;

  @Column({ length: 100, nullable: true })
  manager: string;

  @Column({ type: 'enum', enum: WarehouseStatus, default: WarehouseStatus.ACTIVE })
  status: WarehouseStatus;

  @Column({ length: 255, nullable: true })
  description: string;

  @Column({ length: 50, nullable: true })
  code: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @Column()
  companyId: string;

  @OneToMany(() => WarehouseLocation, location => location.warehouse)
  locations: WarehouseLocation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
