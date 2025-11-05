import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('sms_messages')
@Index(['companyId', 'createdAt'])
export class SMS {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id' })
  @Index()
  companyId: string;

  @Column()
  to: string;

  @Column({ nullable: true })
  from?: string;

  @Column('text')
  message: string;

  @Column({ default: 'pending' })
  status: string; // pending, sent, delivered, failed

  @Column({ nullable: true, name: 'provider_id' })
  providerId?: string;

  @Column({ nullable: true, name: 'provider_name' })
  providerName?: string; // twilio, vonage, etc.

  @Column({ nullable: true, name: 'sent_at' })
  sentAt?: Date;

  @Column({ nullable: true, name: 'delivered_at' })
  deliveredAt?: Date;

  @Column({ nullable: true, name: 'error_message' })
  errorMessage?: string;

  @Column({ nullable: true, name: 'created_by' })
  createdBy?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
