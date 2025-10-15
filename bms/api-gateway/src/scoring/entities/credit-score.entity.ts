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
import { User } from '../../auth/entities/user.entity';

@Entity('credit_scores')
export class CreditScore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id' })
  companyId: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  score: number; // 0-100

  // Facteurs de calcul
  @Column({ type: 'jsonb' })
  factors: {
    transactionVolume: number;      // Volume transactions 6 mois
    transactionRegularity: number;  // Régularité revenus
    growthTrend: number;            // Tendance croissance
    cashFlowStability: number;      // Stabilité trésorerie
    debtRatio: number;              // Ratio endettement
    certificationRate: number;      // % transactions certifiées
    taxCompliance: number;          // Conformité fiscale
    paymentPunctuality: number;     // Ponctualité paiements
  };

  // Détails calcul
  @Column({ name: 'calculation_period_start', type: 'date' })
  calculationPeriodStart: Date;

  @Column({ name: 'calculation_period_end', type: 'date' })
  calculationPeriodEnd: Date;

  @Column({ name: 'transactions_analyzed', default: 0 })
  transactionsAnalyzed: number;

  @Column({ name: 'total_revenue', type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalRevenue: number;

  @Column({ name: 'average_monthly_revenue', type: 'decimal', precision: 15, scale: 2, default: 0 })
  averageMonthlyRevenue: number;

  // Certification
  @Column({ name: 'certified_by', nullable: true })
  certifiedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'certified_by' })
  accountant: User;

  @Column({ name: 'certified_at', nullable: true })
  certifiedAt: Date;

  @Column({ name: 'digital_signature', type: 'text', nullable: true })
  digitalSignature: string;

  // Validité
  @Column({ name: 'valid_until', type: 'date' })
  validUntil: Date;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  // Recommandation crédit
  @Column({ name: 'max_loan_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  maxLoanAmount: number; // Montant max recommandé

  @Column({ name: 'recommended_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  recommendedRate: number; // Taux intérêt recommandé

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
