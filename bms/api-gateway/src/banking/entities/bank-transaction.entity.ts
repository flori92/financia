import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

/**
 * Transaction bancaire importée depuis un relevé
 */
@Entity('bank_transactions')
export class BankTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column({ name: 'transaction_date', type: 'date' })
  transactionDate: Date;

  @Column({ name: 'date', type: 'timestamp' })
  date: Date;

  @Column({ name: 'description', type: 'varchar', length: 500 })
  description: string;

  @Column({ name: 'transaction_type', type: 'varchar', length: 10 })
  type: 'credit' | 'debit';

  @Column({ name: 'anomaly_checked', type: 'boolean', default: false })
  anomalyChecked: boolean;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 500 })
  label: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  reference: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'reconciled', 'ignored'],
    default: 'pending',
  })
  status: 'pending' | 'reconciled' | 'ignored';

  @Column({ name: 'account_id', type: 'uuid', nullable: true })
  accountId: string;

  @Column({ name: 'payment_id', type: 'uuid', nullable: true })
  paymentId: string;

  @Column({ name: 'reconciled_at', type: 'timestamp', nullable: true })
  reconciledAt: Date;

  @Column({ name: 'reconciled_by', type: 'uuid', nullable: true })
  reconciledBy: string;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
