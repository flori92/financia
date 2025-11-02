import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { Contact } from './contact.entity';
import { Tag } from './tag.entity';
import { PipelineStage } from './pipeline-stage.entity';

export enum OpportunityStatus {
  OPEN = 'open',
  WON = 'won',
  LOST = 'lost',
  ABANDONED = 'abandoned',
}

@Entity('crm_opportunities')
export class Opportunity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  amount: number;

  @Column({ type: 'int', default: 0 })
  probability: number;

  @Column({ type: 'enum', enum: OpportunityStatus, default: OpportunityStatus.OPEN })
  status: OpportunityStatus;

  @Column({ type: 'date', nullable: true })
  closeDate: Date;

  @Column()
  companyId: string;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  company: Company;

  @Column({ nullable: true })
  contactId: string;

  @ManyToOne(() => Contact, (contact) => contact.opportunities, { onDelete: 'SET NULL' })
  contact: Contact;

  @Column({ nullable: true })
  pipelineStageId: string;

  @ManyToOne(() => PipelineStage, (stage) => stage.opportunities, { onDelete: 'SET NULL' })
  stage: PipelineStage;

  @ManyToMany(() => Tag, (tag) => tag.opportunities)
  @JoinTable({
    name: 'crm_opportunity_tags',
    joinColumn: { name: 'opportunity_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags: Tag[];

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  ownerId: string;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
