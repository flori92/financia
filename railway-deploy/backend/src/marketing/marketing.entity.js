const { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } = require('typeorm');

@Entity('marketing_campaigns')
export class MarketingCampaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  type: string;

  @Column({
    type: 'enum',
    enum: ['draft', 'active', 'paused', 'completed', 'cancelled'],
    default: 'draft'
  })
  status: string;

  @Column()
  startDate: string;

  @Column()
  endDate: string;

  @Column('decimal')
  budget: number;

  @Column('decimal', { default: 0 })
  spent: number;

  @Column({ default: 0 })
  leads: number;

  @Column({ default: 0 })
  conversions: number;

  @Column({ default: 0 })
  roi: number;

  @Column('json')
  channels: string[];

  @Column()
  description: string;

  @Column()
  companyId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('marketing_leads')
export class MarketingLead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  company: string;

  @Column()
  source: string;

  @Column({
    type: 'enum',
    enum: ['new', 'contacted', 'qualified', 'converted', 'lost'],
    default: 'new'
  })
  status: string;

  @Column({ default: 50 })
  score: number;

  @Column({ nullable: true })
  assignedTo: string;

  @Column()
  createdAt: string;

  @Column({ nullable: true })
  lastContact: string;

  @Column()
  companyId: string;

  @UpdateDateColumn()
  updatedAt: Date;
}
