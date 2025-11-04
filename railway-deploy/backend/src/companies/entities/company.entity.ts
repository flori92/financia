import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ name: 'legal_name', nullable: true })
  legalName: string;

  @Column({ name: 'registration_number', nullable: true })
  registrationNumber: string;

  @Column({ name: 'tax_id', nullable: true })
  taxId: string;

  @Column({ nullable: true })
  industry: string;

  @Column({ default: 'micro' })
  size: 'micro' | 'small' | 'medium' | 'large';

  // Address
  @Column({ name: 'address_line1', nullable: true })
  addressLine1: string;

  @Column({ name: 'address_line2', nullable: true })
  addressLine2: string;

  @Column({ nullable: true })
  city: string;

  @Column({ name: 'postal_code', nullable: true })
  postalCode: string;

  @Column({ default: 'BJ' })
  country: string;

  // Contact
  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  website: string;

  // Accounting Settings
  @Column({ name: 'chart_of_accounts', default: 'SYSCOHADA' })
  chartOfAccounts: string;

  @Column({ name: 'fiscal_year_start', type: 'date', nullable: true })
  fiscalYearStart: Date;

  @Column({ name: 'default_currency', default: 'XOF' })
  defaultCurrency: string;

  @Column({ name: 'vat_rate', type: 'decimal', precision: 5, scale: 2, default: 18.00 })
  vatRate: number;

  // Treasury Settings
  @Column({ name: 'treasury_critical_threshold', type: 'int', default: 7 })
  treasuryCriticalThreshold: number;

  @Column({ name: 'treasury_warning_threshold', type: 'int', default: 15 })
  treasuryWarningThreshold: number;

  // Subscription
  @Column({ default: 'micro' })
  plan: 'micro' | 'starter' | 'business' | 'cabinet' | 'enterprise';

  @Column({ name: 'subscription_status', default: 'trial' })
  subscriptionStatus: 'trial' | 'active' | 'suspended' | 'cancelled';

  @Column({ name: 'trial_ends_at', nullable: true })
  trialEndsAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Champs de synchronisation Frappe
  @Column({ name: 'frappe_id', type: 'varchar', length: 255, nullable: true })
  frappeId?: string;

  @Column({ name: 'last_sync_at', type: 'timestamp', nullable: true })
  lastSyncAt?: Date;

  // NIF pour BMS
  @Column({ name: 'nif_number', length: 20, nullable: true, unique: true })
  nifNumber?: string;
}
