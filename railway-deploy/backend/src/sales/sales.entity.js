const { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } = require('typeorm');

@Entity('sales_quotes')
class SalesQuote {
  constructor() {
    this.id = '';
    this.quoteNumber = '';
    this.clientId = '';
    this.clientName = '';
    this.totalAmount = 0;
    this.status = 'draft';
    this.validUntil = '';
    this.items = [];
    this.companyId = '';
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  @PrimaryGeneratedColumn('uuid')
  id;

  @Column()
  quoteNumber;

  @Column()
  clientId;

  @Column()
  clientName;

  @Column('decimal')
  totalAmount;

  @Column({
    type: 'enum',
    enum: ['draft', 'sent', 'accepted', 'rejected', 'expired'],
    default: 'draft'
  })
  status;

  @Column()
  validUntil;

  @Column('json')
  items;

  @Column()
  companyId;

  @CreateDateColumn()
  createdAt;

  @UpdateDateColumn()
  updatedAt;
}

@Entity('sales_orders')
class SalesOrder {
  constructor() {
    this.id = '';
    this.orderNumber = '';
    this.clientId = '';
    this.clientName = '';
    this.totalAmount = 0;
    this.status = 'pending';
    this.orderDate = '';
    this.expectedDeliveryDate = '';
    this.trackingNumber = '';
    this.items = [];
    this.companyId = '';
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  @PrimaryGeneratedColumn('uuid')
  id;

  @Column()
  orderNumber;

  @Column()
  clientId;

  @Column()
  clientName;

  @Column('decimal')
  totalAmount;

  @Column({
    type: 'enum',
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  })
  status;

  @Column()
  orderDate;

  @Column({ nullable: true })
  expectedDeliveryDate;

  @Column({ nullable: true })
  trackingNumber;

  @Column('json')
  items;

  @Column()
  companyId;

  @CreateDateColumn()
  createdAt;

  @UpdateDateColumn()
  updatedAt;
}

@Entity('sales_clients')
class SalesClient {
  constructor() {
    this.id = '';
    this.name = '';
    this.company = '';
    this.email = '';
    this.phone = '';
    this.address = '';
    this.type = 'individual';
    this.status = 'prospect';
    this.totalOrders = 0;
    this.totalRevenue = 0;
    this.lastOrderDate = '';
    this.rating = 0;
    this.companyId = '';
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  @PrimaryGeneratedColumn('uuid')
  id;

  @Column()
  name;

  @Column({ nullable: true })
  company;

  @Column()
  email;

  @Column()
  phone;

  @Column()
  address;

  @Column({
    type: 'enum',
    enum: ['individual', 'company'],
    default: 'individual'
  })
  type;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'prospect'],
    default: 'prospect'
  })
  status;

  @Column({ default: 0 })
  totalOrders;

  @Column('decimal', { default: 0 })
  totalRevenue;

  @Column({ nullable: true })
  lastOrderDate;

  @Column({ default: 0 })
  rating;

  @Column()
  companyId;

  @CreateDateColumn()
  createdAt;

  @UpdateDateColumn()
  updatedAt;
}

module.exports = { SalesQuote, SalesOrder, SalesClient };
