import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PayrollRecord } from './payroll-record.entity';
import { Employee } from './employee.entity';
import { User } from '../../auth/entities/user.entity';

export enum TransferStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum TransferType {
  PAYROLL = 'payroll',
  BONUS = 'bonus',
  REFUND = 'refund',
  REIMBURSEMENT = 'reimbursement',
}

export enum PaymentProvider {
  ORANGE_MONEY = 'orange_money',
  WAVE = 'wave',
  MTN_MONEY = 'mtn_money',
  MOOV_MONEY = 'moov_money',
  BANK_TRANSFER = 'bank_transfer',
  CASH = 'cash',
  CHECK = 'check',
}

@Entity('hr_bank_transfers')
export class BankTransfer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Informations de base
  @Column({ name: 'transfer_reference', unique: true, length: 50 })
  transferReference: string;

  @Column({ name: 'external_transaction_id', nullable: true, length: 100 })
  externalTransactionId: string;

  @Column({
    type: 'enum',
    enum: TransferType,
    default: TransferType.PAYROLL,
  })
  transferType: TransferType;

  @Column({
    type: 'enum',
    enum: TransferStatus,
    default: TransferStatus.PENDING,
  })
  status: TransferStatus;

  // Montants
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  amount: number;

  @Column({ name: 'currency', default: 'XOF', length: 3 })
  currency: string;

  @Column({ name: 'exchange_rate', type: 'decimal', precision: 10, scale: 4, nullable: true })
  exchangeRate: number;

  @Column({ name: 'original_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  originalAmount: number;

  @Column({ name: 'original_currency', nullable: true, length: 3 })
  originalCurrency: string;

  // Fournisseur de paiement
  @Column({
    type: 'enum',
    enum: PaymentProvider,
    default: PaymentProvider.BANK_TRANSFER,
  })
  provider: PaymentProvider;

  // Bénéficiaire
  @Column({ name: 'beneficiary_name', length: 100 })
  beneficiaryName: string;

  @Column({ name: 'beneficiary_phone', nullable: true, length: 20 })
  beneficiaryPhone: string;

  @Column({ name: 'beneficiary_email', nullable: true, length: 100 })
  beneficiaryEmail: string;

  @Column({ name: 'beneficiary_account', nullable: true, length: 50 })
  beneficiaryAccount: string;

  @Column({ name: 'beneficiary_bank', nullable: true, length: 100 })
  beneficiaryBank: string;

  @Column({ name: 'beneficiary_iban', nullable: true, length: 50 })
  beneficiaryIban: string;

  // Dates et traitement
  @Column({ name: 'scheduled_date', type: 'date', nullable: true })
  scheduledDate: Date;

  @Column({ name: 'processed_date', type: 'date', nullable: true })
  processedDate: Date;

  @Column({ name: 'completed_date', type: 'date', nullable: true })
  completedDate: Date;

  @Column({ name: 'execution_time', nullable: true })
  executionTime: Date;

  // Frais et commissions
  @Column({ name: 'provider_fee', type: 'decimal', precision: 10, scale: 2, default: 0 })
  providerFee: number;

  @Column({ name: 'processing_fee', type: 'decimal', precision: 10, scale: 2, default: 0 })
  processingFee: number;

  @Column({ name: 'total_fee', type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalFee: number;

  @Column({ name: 'net_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  netAmount: number;

  // Réponses API et logs
  @Column({ name: 'api_request', type: 'jsonb', nullable: true })
  apiRequest: Record<string, any> | null;

  @Column({ name: 'api_response', type: 'jsonb', nullable: true })
  apiResponse: Record<string, any> | null;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string | null;

  @Column({ name: 'error_code', nullable: true, length: 50 })
  errorCode: string | null;

  @Column({ name: 'retry_count', type: 'int', default: 0 })
  retryCount: number;

  @Column({ name: 'max_retries', type: 'int', default: 3 })
  maxRetries: number;

  @Column({ name: 'next_retry_at', nullable: true })
  nextRetryAt: Date;

  // Notifications
  @Column({ name: 'sms_sent', default: false })
  smsSent: boolean;

  @Column({ name: 'email_sent', default: false })
  emailSent: boolean;

  @Column({ name: 'notification_sent_at', nullable: true })
  notificationSentAt: Date;

  // Notes et validation
  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'internal_notes', type: 'text', nullable: true })
  internalNotes: string;

  @Column({ default: false })
  isUrgent: boolean;

  @Column({ default: false })
  isRecurring: boolean;

  @Column({ name: 'recurring_pattern', nullable: true, length: 50 })
  recurringPattern: string;

  // Relations
  @Column({ nullable: true })
  payrollRecordId: string;

  @ManyToOne(() => PayrollRecord, { nullable: true })
  @JoinColumn({ name: 'payroll_record_id' })
  payrollRecord: PayrollRecord;

  @Column()
  employeeId: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ nullable: true })
  createdById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column({ nullable: true })
  processedById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'processed_by_id' })
  processedBy: User;

  // Métadonnées
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ nullable: true })
  updatedBy: string;

  // Champs calculés
  get isPending(): boolean {
    return this.status === TransferStatus.PENDING;
  }

  get isProcessing(): boolean {
    return this.status === TransferStatus.PROCESSING;
  }

  get isCompleted(): boolean {
    return this.status === TransferStatus.COMPLETED;
  }

  get isFailed(): boolean {
    return this.status === TransferStatus.FAILED;
  }

  get canBeCancelled(): boolean {
    return [TransferStatus.PENDING, TransferStatus.PROCESSING].includes(this.status);
  }

  get canBeRetried(): boolean {
    return this.isFailed && this.retryCount < this.maxRetries;
  }

  get totalAmount(): number {
    return Number(this.amount) + Number(this.totalFee);
  }

  get statusLabel(): string {
    const labels = {
      [TransferStatus.PENDING]: 'En attente',
      [TransferStatus.PROCESSING]: 'En cours',
      [TransferStatus.COMPLETED]: 'Complété',
      [TransferStatus.FAILED]: 'Échoué',
      [TransferStatus.CANCELLED]: 'Annulé',
      [TransferStatus.REFUNDED]: 'Remboursé',
    };
    return labels[this.status];
  }

  get providerLabel(): string {
    const labels = {
      [PaymentProvider.ORANGE_MONEY]: 'Orange Money',
      [PaymentProvider.WAVE]: 'Wave',
      [PaymentProvider.MTN_MONEY]: 'MTN Mobile Money',
      [PaymentProvider.MOOV_MONEY]: 'Moov Money',
      [PaymentProvider.BANK_TRANSFER]: 'Virement Bancaire',
      [PaymentProvider.CASH]: 'Espèces',
      [PaymentProvider.CHECK]: 'Chèque',
    };
    return labels[this.provider];
  }

  get isMobileMoney(): boolean {
    return [
      PaymentProvider.ORANGE_MONEY,
      PaymentProvider.WAVE,
      PaymentProvider.MTN_MONEY,
      PaymentProvider.MOOV_MONEY,
    ].includes(this.provider);
  }

  get isBankTransfer(): boolean {
    return this.provider === PaymentProvider.BANK_TRANSFER;
  }

  get requiresBankDetails(): boolean {
    return this.isBankTransfer;
  }

  get requiresPhone(): boolean {
    return this.isMobileMoney;
  }
}

export { BankTransfer };
