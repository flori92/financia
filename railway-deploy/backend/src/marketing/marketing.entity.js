const { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } = require('typeorm');

@Entity('marketing_campaigns')
class MarketingCampaign {
  constructor() {
    this.id = '';
    this.name = '';
    this.type = '';
    this.status = 'draft';
    this.startDate = '';
    this.endDate = '';
    this.budget = 0;
    this.spent = 0;
    this.leads = 0;
    this.conversions = 0;
    this.roi = 0;
    this.channels = [];
    this.description = '';
    this.companyId = '';
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  @PrimaryGeneratedColumn('uuid')
  id;

  @Column()
  name;

  @Column()
  type;

  @Column({
    type: 'enum',
    enum: ['draft', 'active', 'paused', 'completed', 'cancelled'],
    default: 'draft'
  })
  status;

  @Column()
  startDate;

  @Column()
  endDate;

  @Column('decimal')
  budget;

  @Column('decimal', { default: 0 })
  spent;

  @Column({ default: 0 })
  leads;

  @Column({ default: 0 })
  conversions;

  @Column({ default: 0 })
  roi;

  @Column('json')
  channels;

  @Column()
  description;

  @Column()
  companyId;

  @CreateDateColumn()
  createdAt;

  @UpdateDateColumn()
  updatedAt;
}

@Entity('marketing_leads')
class MarketingLead {
  constructor() {
    this.id = '';
    this.firstName = '';
    this.lastName = '';
    this.email = '';
    this.phone = '';
    this.company = '';
    this.source = '';
    this.status = 'new';
    this.score = 50;
    this.assignedTo = '';
    this.createdAt = '';
    this.lastContact = '';
    this.companyId = '';
    this.updatedAt = new Date();
  }

  @PrimaryGeneratedColumn('uuid')
  id;

  @Column()
  firstName;

  @Column()
  lastName;

  @Column()
  email;

  @Column()
  phone;

  @Column({ nullable: true })
  company;

  @Column()
  source;

  @Column({
    type: 'enum',
    enum: ['new', 'contacted', 'qualified', 'converted', 'lost'],
    default: 'new'
  })
  status;

  @Column({ default: 50 })
  score;

  @Column({ nullable: true })
  assignedTo;

  @Column()
  createdAt;

  @Column({ nullable: true })
  lastContact;

  @Column()
  companyId;

  @UpdateDateColumn()
  updatedAt;
}

module.exports = { MarketingCampaign, MarketingLead };
