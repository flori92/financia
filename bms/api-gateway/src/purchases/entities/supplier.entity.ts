import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('suppliers')
@Index(['companyId'])
export class Supplier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id' })
  companyId: string;

  @Column()
  name: string;

  @Column({ nullable: true, name: 'legal_name' })
  legalName?: string;

  @Column({ nullable: true })
  nif?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ nullable: true, name: 'contact_person' })
  contactPerson?: string;

  @Column({ default: 30, name: 'payment_terms' })
  paymentTerms: number; // Délai de paiement en jours

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, name: 'credit_limit' })
  creditLimit: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, name: 'current_balance' })
  currentBalance: number;

  @Column({ nullable: true })
  category?: string; // Catégorie de fournisseur

  @Column({ nullable: true })
  currency?: string;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>; // Données additionnelles

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
