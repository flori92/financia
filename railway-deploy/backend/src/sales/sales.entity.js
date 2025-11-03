const { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } = require('typeorm');

@Entity('sales_quotes')
export class SalesQuote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  quoteNumber: string;

  @Column()
  clientId: string;

  @Column()
  clientName: string;

  @Column('decimal')
  totalAmount: number;

  @Column({
    type: 'enum',
    enum: ['draft', 'sent', 'accepted', 'rejected', 'expired'],
    default: 'draft'
  })
  status: string;

  @Column()
  validUntil: string;

  @Column('json')
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;

  @Column()
  companyId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('sales_orders')
export class SalesOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  orderNumber: string;

  @Column()
  clientId: string;

  @Column()
  clientName: string;

  @Column('decimal')
  totalAmount: number;

  @Column({
    type: 'enum',
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  })
  status: string;

  @Column()
  orderDate: string;

  @Column({ nullable: true })
  expectedDeliveryDate: string;

  @Column({ nullable: true })
  trackingNumber: string;

  @Column('json')
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;

  @Column()
  companyId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('sales_clients')
export class SalesClient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @Column({
    type: 'enum',
    enum: ['individual', 'company'],
    default: 'individual'
  })
  type: string;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'prospect'],
    default: 'prospect'
  })
  status: string;

  @Column({ default: 0 })
  totalOrders: number;

  @Column('decimal', { default: 0 })
  totalRevenue: number;

  @Column({ nullable: true })
  lastOrderDate: string;

  @Column({ default: 0 })
  rating: number;

  @Column()
  companyId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
