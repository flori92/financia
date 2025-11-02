import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { User } from '../../auth/entities/user.entity';
import { Tag } from './tag.entity';
import { Activity } from './activity.entity';
import { Opportunity } from './opportunity.entity';

export enum ContactType {
  CLIENT = 'client',
  PROSPECT = 'prospect',
  SUPPLIER = 'supplier',
  PARTNER = 'partner',
}

export enum ContactStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

@Entity('crm_contacts')
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ContactType })
  type: ContactType;

  @Column({ type: 'enum', enum: ContactStatus, default: ContactStatus.ACTIVE })
  status: ContactStatus;

  @Column({ nullable: true })
  companyName: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  position: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  mobile: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  addressLine1: string;

  @Column({ nullable: true })
  addressLine2: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  postalCode: string;

  @Column({ default: 'BJ' })
  country: string;

  @Column({ nullable: true })
  taxId: string;

  @Column({ nullable: true })
  vatNumber: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  lifetimeValue: number;

  @Column({ type: 'int', default: 0 })
  opportunityCount: number;

  @Column({ type: 'int', default: 0 })
  invoiceCount: number;

  @Column({ type: 'date', nullable: true })
  lastContactDate: Date;

  @Column({ type: 'date', nullable: true })
  nextFollowUpDate: Date;

  @Column({ type: 'int', default: 0 })
  leadScore: number;

  @Column({ type: 'jsonb', nullable: true })
  customFields: Record<string, any> | null;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column()
  companyId: string;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  company: Company;

  @Column({ nullable: true })
  assignedToId: string;

  @ManyToOne(() => User, { nullable: true })
  assignedTo: User;

  @Column({ nullable: true })
  source: string;

  @Column({ default: false })
  isArchived: boolean;

  @ManyToMany(() => Tag, (tag) => tag.contacts, { cascade: false })
  @JoinTable({
    name: 'crm_contact_tags',
    joinColumn: { name: 'contact_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags: Tag[];

  @OneToMany(() => Activity, (activity) => activity.contact)
  activities: Activity[];

  @OneToMany(() => Opportunity, (opportunity) => opportunity.contact)
  opportunities: Opportunity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;
}
