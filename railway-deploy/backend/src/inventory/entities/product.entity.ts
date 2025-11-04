import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column()
  name: string;

  @Column()
  sku: string;

  @Column()
  category: string;

  @Column()
  quantity: number;

  @Column()
  minQuantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  unitPrice: number;

  @Column()
  location: string;

  @Column()
  status: 'in_stock' | 'low_stock' | 'out_of_stock';

  @UpdateDateColumn()
  lastUpdated: Date;

  @Column({ nullable: true })
  supplier: string;
}
