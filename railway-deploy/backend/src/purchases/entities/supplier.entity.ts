import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { PurchaseOrder } from './purchase-order.entity';

export enum SupplierStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  BLACKLISTED = 'blacklisted'
}

@Entity('suppliers')
@Index(['companyId'])
@Index(['code'])
export class Supplier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 100, unique: true, nullable: true })
  code: string;

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

  @Column({ length: 20, nullable: true })
  taxId: string;

  @Column({ length: 20, nullable: true })
  registrationNumber: string;

  @Column({ type: 'enum', enum: SupplierStatus, default: SupplierStatus.ACTIVE })
  status: SupplierStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ length: 100, nullable: true })
  contactPerson: string;

  @Column({ length: 20, nullable: true })
  contactPhone: string;

  @Column({ length: 255, nullable: true })
  contactEmail: string;

  @Column({ length: 255, nullable: true })
  website: string;

  @Column({ type: 'int', nullable: true })
  paymentTerms: number; // en jours

  @Column({ length: 50, nullable: true })
  currency: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  creditLimit: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  defaultTaxRate: number;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @Column()
  companyId: string;

  @OneToMany(() => PurchaseOrder, order => order.supplier)
  purchaseOrders: PurchaseOrder[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
