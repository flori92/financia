import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('whatsapp_messages')
@Index(['companyId', 'conversationId'])
@Index(['companyId', 'createdAt'])
export class WhatsAppMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id' })
  @Index()
  companyId: string;

  @Column({ name: 'conversation_id' })
  conversationId: string;

  @Column()
  to: string;

  @Column({ nullable: true })
  from?: string;

  @Column('text')
  message: string;

  @Column({ default: 'text' })
  type: string; // text, image, document, audio, video

  @Column({ default: 'outbound' })
  direction: string; // inbound, outbound

  @Column({ default: 'pending' })
  status: string; // pending, sent, delivered, read, failed

  @Column({ nullable: true, name: 'media_url' })
  mediaUrl?: string;

  @Column({ nullable: true, name: 'provider_id' })
  providerId?: string;

  @Column({ nullable: true, name: 'sent_at' })
  sentAt?: Date;

  @Column({ nullable: true, name: 'delivered_at' })
  deliveredAt?: Date;

  @Column({ nullable: true, name: 'read_at' })
  readAt?: Date;

  @Column({ nullable: true, name: 'error_message' })
  errorMessage?: string;

  @Column({ nullable: true, name: 'created_by' })
  createdBy?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
