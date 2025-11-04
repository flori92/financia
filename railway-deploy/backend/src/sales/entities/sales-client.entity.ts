import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('sales_clients')
export class SalesClient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  company: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column()
  address: string;

  @Column()
  type: 'individual' | 'company';

  @Column()
  status: 'active' | 'inactive' | 'prospect';

  @Column({ default: 0 })
  totalOrders: number;

  @Column({ default: 0, type: 'decimal', precision: 15, scale: 2 })
  totalRevenue: number;

  @Column({ nullable: true })
  lastOrderDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: 5 })
  rating: number;
}
