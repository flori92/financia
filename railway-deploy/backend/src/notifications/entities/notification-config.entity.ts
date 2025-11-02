import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('notification_configs')
export class NotificationConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  // Email Configuration
  @Column({ nullable: true })
  emailProvider: 'console' | 'smtp' | 'sendgrid';

  @Column({ nullable: true })
  smtpHost: string;

  @Column({ nullable: true })
  smtpPort: number;

  @Column({ nullable: true, default: false })
  smtpSecure: boolean;

  @Column({ nullable: true })
  smtpUser: string;

  @Column({ nullable: true })
  smtpPass: string;

  @Column({ nullable: true })
  smtpFrom: string;

  @Column({ nullable: true })
  sendgridApiKey: string;

  @Column({ nullable: true })
  sendgridFrom: string;

  // SMS Configuration
  @Column({ nullable: true })
  smsProvider: 'console' | 'twilio';

  @Column({ nullable: true })
  twilioAccountSid: string;

  @Column({ nullable: true })
  twilioAuthToken: string;

  @Column({ nullable: true })
  twilioPhoneNumber: string;

  // WhatsApp Configuration
  @Column({ nullable: true })
  whatsappProvider: 'console' | 'twilio' | 'meta';

  @Column({ nullable: true })
  twilioWhatsAppNumber: string;

  @Column({ nullable: true })
  metaAccessToken: string;

  @Column({ nullable: true })
  metaPhoneNumberId: string;

  // General Settings
  @Column({ nullable: true })
  frontendUrl: string;

  @Column({ default: true })
  enabled: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
