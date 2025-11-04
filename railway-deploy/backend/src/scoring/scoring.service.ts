import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { CreditScore } from './entities/credit-score.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { Company } from '../companies/entities/company.entity';

@Injectable()
export class ScoringService {
  constructor(
    @InjectRepository(CreditScore)
    private creditScoreRepository: Repository<CreditScore>,
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
  ) {}

  async calculateScore(companyId: string) {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Entreprise non trouvée');
    }

    // Période d'analyse: 6 derniers mois
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);

    // Récupérer les transactions de la période
    const invoices = await this.invoiceRepository.find({
      where: {
        companyId,
        invoiceDate: Between(startDate, endDate),
        status: 'paid',
      },
      order: { invoiceDate: 'ASC' },
    });

    if (invoices.length === 0) {
      throw new NotFoundException('Pas assez de données pour calculer le score');
    }

    // Calculer les facteurs
    const factors = await this.calculateFactors(invoices, company);

    // Score final (moyenne pondérée)
    const score = this.calculateFinalScore(factors);

    // Recommandations crédit
    const recommendations = this.getRecommendations(score, factors);

    // Créer le score
    const creditScore = this.creditScoreRepository.create({
      companyId,
      score,
      factors,
      calculationPeriodStart: startDate,
      calculationPeriodEnd: endDate,
      transactionsAnalyzed: invoices.length,
      totalRevenue: factors.transactionVolume,
      averageMonthlyRevenue: factors.transactionVolume / 6,
      validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 jours
      maxLoanAmount: recommendations.maxLoanAmount,
      recommendedRate: recommendations.recommendedRate,
    });

    const saved = await this.creditScoreRepository.save(creditScore);

    // Note: Le score est stocké dans l'entité CreditScore
    // Pas besoin de mettre à jour Company directement

    return saved;
  }

  async getCompanyScore(companyId: string) {
    const score = await this.creditScoreRepository.findOne({
      where: { companyId, isActive: true },
      order: { createdAt: 'DESC' },
    });

    if (!score) {
      throw new NotFoundException('Aucun score disponible');
    }

    // Vérifier validité
    if (new Date() > score.validUntil) {
      return {
        ...score,
        expired: true,
        message: 'Score expiré, recalcul nécessaire',
      };
    }

    return score;
  }

  async certifyScore(scoreId: string, accountantId: string, signature: string) {
    const score = await this.creditScoreRepository.findOne({
      where: { id: scoreId },
    });

    if (!score) {
      throw new NotFoundException('Score non trouvé');
    }

    score.certifiedBy = accountantId;
    score.certifiedAt = new Date();
    score.digitalSignature = signature;

    return this.creditScoreRepository.save(score);
  }

  private async calculateFactors(invoices: Invoice[], company: Company) {
    const totalRevenue = invoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);

    // 1. Volume de transactions (0-100)
    const transactionVolume = totalRevenue;

    // 2. Régularité (0-100)
    const regularity = this.calculateRegularity(invoices);

    // 3. Tendance croissance (0-100)
    const growth = this.calculateGrowthTrend(invoices);

    // 4. Stabilité trésorerie (0-100)
    const stability = this.calculateCashFlowStability(invoices);

    // 5. Ratio endettement (0-100) - pour l'instant 100 (pas de dette)
    const debtRatio = 100;

    // 6. Taux certification (0-100) - basé sur factures payées
    const certifiedCount = invoices.filter((inv) => inv.status === 'paid').length;
    const certificationRate = (certifiedCount / invoices.length) * 100;

    // 7. Conformité fiscale (0-100)
    const taxCompliance = company.nifNumber ? 100 : 50;

    // 8. Ponctualité paiements (0-100) - simulé
    const paymentPunctuality = 85;

    return {
      transactionVolume,
      transactionRegularity: regularity,
      growthTrend: growth,
      cashFlowStability: stability,
      debtRatio,
      certificationRate,
      taxCompliance,
      paymentPunctuality,
    };
  }

  private calculateRegularity(invoices: Invoice[]): number {
    // Mesure la régularité des revenus mois par mois
    const monthlyRevenues = this.groupByMonth(invoices);
    if (monthlyRevenues.length < 2) return 50;

    const mean = monthlyRevenues.reduce((a, b) => a + b, 0) / monthlyRevenues.length;
    const variance =
      monthlyRevenues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      monthlyRevenues.length;
    const stdDev = Math.sqrt(variance);
    const cv = stdDev / mean; // Coefficient de variation

    // Plus le CV est faible, plus c'est régulier
    return Math.max(0, Math.min(100, 100 - cv * 100));
  }

  private calculateGrowthTrend(invoices: Invoice[]): number {
    const monthlyRevenues = this.groupByMonth(invoices);
    if (monthlyRevenues.length < 3) return 50;

    // Croissance moyenne entre mois
    let totalGrowth = 0;
    for (let i = 1; i < monthlyRevenues.length; i++) {
      const growth = ((monthlyRevenues[i] - monthlyRevenues[i - 1]) / monthlyRevenues[i - 1]) * 100;
      totalGrowth += growth;
    }

    const avgGrowth = totalGrowth / (monthlyRevenues.length - 1);

    // Convertir en score 0-100
    return Math.max(0, Math.min(100, 50 + avgGrowth * 2));
  }

  private calculateCashFlowStability(invoices: Invoice[]): number {
    // Mesure la stabilité entre factures émises et payées
    const paidInvoices = invoices.filter((inv) => inv.status === 'paid');
    const paymentRate = (paidInvoices.length / invoices.length) * 100;

    return paymentRate;
  }

  private groupByMonth(invoices: Invoice[]): number[] {
    const months = new Map<string, number>();

    invoices.forEach((invoice) => {
      const key = `${invoice.invoiceDate.getFullYear()}-${invoice.invoiceDate.getMonth()}`;
      months.set(key, (months.get(key) || 0) + Number(invoice.totalAmount));
    });

    return Array.from(months.values());
  }

  private calculateFinalScore(factors: any): number {
    // Pondération des facteurs
    const weights = {
      transactionRegularity: 0.2,
      growthTrend: 0.15,
      cashFlowStability: 0.2,
      debtRatio: 0.15,
      certificationRate: 0.15,
      taxCompliance: 0.1,
      paymentPunctuality: 0.05,
    };

    let score = 0;
    for (const [key, weight] of Object.entries(weights)) {
      score += factors[key] * weight;
    }

    return Math.round(score * 100) / 100;
  }

  private getRecommendations(score: number, factors: any) {
    // Montant max = revenus mensuels moyens * multiplicateur basé sur score
    const avgMonthly = factors.transactionVolume / 6;
    let multiplier = 0.5;

    if (score >= 80) multiplier = 3;
    else if (score >= 70) multiplier = 2;
    else if (score >= 60) multiplier = 1.5;
    else if (score >= 50) multiplier = 1;

    const maxLoanAmount = avgMonthly * multiplier;

    // Taux intérêt basé sur score
    let rate = 24; // 24% par défaut
    if (score >= 80) rate = 12;
    else if (score >= 70) rate = 15;
    else if (score >= 60) rate = 18;
    else if (score >= 50) rate = 21;

    return {
      maxLoanAmount: Math.round(maxLoanAmount),
      recommendedRate: rate,
    };
  }
}
