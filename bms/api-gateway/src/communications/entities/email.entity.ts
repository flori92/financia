import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('emails')
@Index(['companyId', 'folder'])
@Index(['companyId', 'createdAt'])
export class Email {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id' })
  @Index()
  companyId: string;

  @Column()
  from: string;

  @Column()
  to: string;

  @Column({ nullable: true })
  cc?: string;

  @Column({ nullable: true })
  bcc?: string;

  @Column()
  subject: string;

  @Column('text')
  body: string;

  @Column({ default: 'inbox' })
  folder: string; // inbox, sent, draft, trash, archive

  @Column({ default: 'draft' })
  status: string; // draft, sent, delivered, failed

  @Column({ default: false })
  read: boolean;

  @Column({ default: false })
  starred: boolean;

  @Column({ default: false, name: 'has_attachment' })
  hasAttachment: boolean;

  @Column({ nullable: true, name: 'sent_at' })
  sentAt?: Date;

  @Column({ nullable: true, name: 'delivered_at' })
  deliveredAt?: Date;

  @Column({ nullable: true, name: 'read_at' })
  readAt?: Date;

  @Column({ nullable: true, name: 'created_by' })
  createdBy?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}