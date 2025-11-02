import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { CreditScore } from '../../scoring/entities/credit-score.entity';

@Entity('loan_applications')
export class LoanApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id' })
  companyId: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ name: 'bank_id' })
  bankId: string; // ID de la banque/fintech

  @Column({ name: 'requested_amount', type: 'decimal', precision: 15, scale: 2 })
  requestedAmount: number;

  @Column({ name: 'duration_months' })
  durationMonths: number;

  @Column({ default: 'pending' })
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'disbursed' | 'completed';

  // Scoring
  @Column({ name: 'credit_score_id', nullable: true })
  creditScoreId: string;

  @ManyToOne(() => CreditScore)
  @JoinColumn({ name: 'credit_score_id' })
  creditScore: CreditScore;

  // Décision banque
  @Column({ name: 'approved_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  approvedAmount: number;

  @Column({ name: 'interest_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  interestRate: number; // Taux annuel

  @Column({ name: 'monthly_payment', type: 'decimal', precision: 15, scale: 2, nullable: true })
  monthlyPayment: number;

  @Column({ name: 'total_repayment', type: 'decimal', precision: 15, scale: 2, nullable: true })
  totalRepayment: number;

  // Garanties
  @Column({ type: 'jsonb', nullable: true })
  collateral: {
    type?: string;
    description?: string;
    value?: number;
  };

  // Décaissement
  @Column({ name: 'disbursement_date', nullable: true })
  disbursementDate: Date;

  @Column({ name: 'disbursement_method', nullable: true })
  disbursementMethod: string; // mobile_money, bank_transfer

  @Column({ name: 'disbursement_reference', nullable: true })
  disbursementReference: string;

  // Remboursements
  @Column({ name: 'first_payment_date', nullable: true })
  firstPaymentDate: Date;

  @Column({ name: 'last_payment_date', nullable: true })
  lastPaymentDate: Date;

  @Column({ name: 'paid_installments', default: 0 })
  paidInstallments: number;

  @Column({ name: 'remaining_balance', type: 'decimal', precision: 15, scale: 2, nullable: true })
  remainingBalance: number;

  // Rejet
  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ name: 'reviewed_by', nullable: true })
  reviewedBy: string; // ID agent banque

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
