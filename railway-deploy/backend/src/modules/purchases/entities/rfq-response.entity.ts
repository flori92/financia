import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { RFQ } from './rfq.entity';
import { Contact } from '../../../crm/entities/contact.entity';

export enum RFQResponseStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected'
}

@Entity('rfq_responses')
export class RFQResponse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => RFQ)
  rfq: RFQ;

  @Column()
  rfqId: string;

  @ManyToOne(() => Contact)
  contact: Contact;

  @Column()
  contactId: string;

  @Column('text')
  proposal: string;

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  totalAmount: number;

  @Column({ nullable: true })
  currency: string;

  @Column('text', { nullable: true })
  terms: string;

  @Column('text', { nullable: true })
  attachments: string; // JSON string of file paths

  @Column({
    type: 'enum',
    enum: RFQResponseStatus,
    default: RFQResponseStatus.DRAFT
  })
  status: RFQResponseStatus;

  @Column({ nullable: true })
  validUntil: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
