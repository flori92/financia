import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('bank_webhook_events')
export class BankWebhookEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  provider: string; // stripe, plaid, bridge, etc.

  @Column()
  eventType: string; // payment_intent.succeeded, TRANSACTIONS, etc.

  @Column({ type: 'json' })
  payload: Record<string, any>;

  @Column({ nullable: true })
  signature: string; // Pour vérifier l'authenticité

  @Column({ type: 'json', nullable: true })
  headers: Record<string, string>;

  @Column({ default: false })
  processed: boolean;

  @Column({ nullable: true })
  processedAt: Date;

  @Column({ nullable: true })
  error: string;

  @Column({ type: 'integer', default: 0 })
  retryCount: number;

  @CreateDateColumn()
  createdAt: Date;
}
