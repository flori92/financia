import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('communication_templates')
@Index(['companyId', 'type'])
export class CommunicationTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id' })
  @Index()
  companyId: string;

  @Column()
  name: string;

  @Column()
  type: string; // email, sms, whatsapp

  @Column({ nullable: true })
  category?: string; // invoice, reminder, welcome, etc.

  @Column({ nullable: true })
  subject?: string; // For emails

  @Column('text')
  body: string;

  @Column('simple-json', { nullable: true })
  variables?: string[]; // Available variables like {{customer_name}}, {{amount}}

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ nullable: true, name: 'created_by' })
  createdBy?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
