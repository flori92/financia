import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoanApplication } from './entities/loan-application.entity';
import { CreditScore } from '../scoring/entities/credit-score.entity';
import { Company } from '../companies/entities/company.entity';

@Injectable()
export class LoansService {
  constructor(
    @InjectRepository(LoanApplication)
    private loanRepository: Repository<LoanApplication>,
    @InjectRepository(CreditScore)
    private creditScoreRepository: Repository<CreditScore>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
  ) {}

  async applyForLoan(companyId: string, bankId: string, data: any) {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Entreprise non trouvée');
    }

    // Vérifier que l'entreprise est formalisée
    if (!company.nifNumber) {
      throw new BadRequestException('NIF requis pour demander un crédit');
    }

    // Récupérer le score de crédit
    const creditScore = await this.creditScoreRepository.findOne({
      where: { companyId, isActive: true },
      order: { createdAt: 'DESC' },
    });

    if (!creditScore) {
      throw new BadRequestException('Score de crédit requis. Calculez votre score d\'abord.');
    }

    // Vérifier validité du score
    if (new Date() > creditScore.validUntil) {
      throw new BadRequestException('Score de crédit expiré. Recalculez votre score.');
    }

    // Vérifier que le montant ne dépasse pas le max recommandé
    if (data.requestedAmount > creditScore.maxLoanAmount) {
      throw new BadRequestException(
        `Montant demandé dépasse le maximum recommandé (${creditScore.maxLoanAmount} FCFA)`,
      );
    }

    // Calculer le paiement mensuel
    const monthlyPayment = this.calculateMonthlyPayment(
      data.requestedAmount,
      creditScore.recommendedRate,
      data.durationMonths,
    );

    const totalRepayment = monthlyPayment * data.durationMonths;

    // Créer la demande
    const application = this.loanRepository.create({
      companyId,
      bankId,
      requestedAmount: data.requestedAmount,
      durationMonths: data.durationMonths,
      creditScoreId: creditScore.id,
      status: 'pending',
      collateral: data.collateral,
      monthlyPayment,
      totalRepayment,
      interestRate: creditScore.recommendedRate,
    });

    return this.loanRepository.save(application);
  }

  async getCompanyLoans(companyId: string) {
    return this.loanRepository.find({
      where: { companyId },
      relations: ['creditScore'],
      order: { createdAt: 'DESC' },
    });
  }

  async getLoan(id: string) {
    const loan = await this.loanRepository.findOne({
      where: { id },
      relations: ['company', 'creditScore'],
    });

    if (!loan) {
      throw new NotFoundException('Demande de prêt non trouvée');
    }

    return loan;
  }

  // Banque: Approuver un prêt
  async approveLoan(id: string, bankUserId: string, approvedAmount: number, rate: number) {
    const loan = await this.getLoan(id);

    if (loan.status !== 'pending' && loan.status !== 'under_review') {
      throw new BadRequestException('Cette demande a déjà été traitée');
    }

    // Recalculer paiement mensuel avec montant/taux approuvés
    const monthlyPayment = this.calculateMonthlyPayment(
      approvedAmount,
      rate,
      loan.durationMonths,
    );

    loan.status = 'approved';
    loan.approvedAmount = approvedAmount;
    loan.interestRate = rate;
    loan.monthlyPayment = monthlyPayment;
    loan.totalRepayment = monthlyPayment * loan.durationMonths;
    loan.reviewedBy = bankUserId;

    return this.loanRepository.save(loan);
  }

  async rejectLoan(id: string, bankUserId: string, reason: string) {
    const loan = await this.getLoan(id);

    loan.status = 'rejected';
    loan.rejectionReason = reason;
    loan.reviewedBy = bankUserId;

    return this.loanRepository.save(loan);
  }

  async disburseLoan(id: string, data: any) {
    const loan = await this.getLoan(id);

    if (loan.status !== 'approved') {
      throw new BadRequestException('Seuls les prêts approuvés peuvent être décaissés');
    }

    loan.status = 'disbursed';
    loan.disbursementDate = new Date();
    loan.disbursementMethod = data.method;
    loan.disbursementReference = data.reference;
    loan.firstPaymentDate = this.calculateFirstPaymentDate(data.durationMonths);
    loan.lastPaymentDate = this.calculateLastPaymentDate(
      loan.firstPaymentDate,
      loan.durationMonths,
    );
    loan.remainingBalance = loan.approvedAmount;

    return this.loanRepository.save(loan);
  }

  async recordPayment(id: string, amount: number, reference: string) {
    const loan = await this.getLoan(id);

    if (loan.status !== 'disbursed') {
      throw new BadRequestException('Le prêt n\'est pas actif');
    }

    loan.paidInstallments += 1;
    loan.remainingBalance -= amount;

    if (loan.remainingBalance <= 0) {
      loan.status = 'completed';
      loan.remainingBalance = 0;
    }

    return this.loanRepository.save(loan);
  }

  // Banque: Lister toutes les demandes
  async getAllLoans(bankId: string, filters?: any) {
    const query = this.loanRepository
      .createQueryBuilder('loan')
      .leftJoinAndSelect('loan.company', 'company')
      .leftJoinAndSelect('loan.creditScore', 'creditScore')
      .where('loan.bank_id = :bankId', { bankId });

    if (filters?.status) {
      query.andWhere('loan.status = :status', { status: filters.status });
    }

    return query.orderBy('loan.created_at', 'DESC').getMany();
  }

  async simulateLoan(amount: number, rate: number, durationMonths: number) {
    const monthlyPayment = this.calculateMonthlyPayment(amount, rate, durationMonths);
    const totalRepayment = monthlyPayment * durationMonths;
    const totalInterest = totalRepayment - amount;

    return {
      requestedAmount: amount,
      durationMonths,
      interestRate: rate,
      monthlyPayment: Math.round(monthlyPayment),
      totalRepayment: Math.round(totalRepayment),
      totalInterest: Math.round(totalInterest),
    };
  }

  private calculateMonthlyPayment(
    principal: number,
    annualRate: number,
    durationMonths: number,
  ): number {
    const monthlyRate = annualRate / 100 / 12;
    const payment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, durationMonths)) /
      (Math.pow(1 + monthlyRate, durationMonths) - 1);

    return payment;
  }

  private calculateFirstPaymentDate(durationMonths: number): Date {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date;
  }

  private calculateLastPaymentDate(firstPaymentDate: Date, durationMonths: number): Date {
    const date = new Date(firstPaymentDate);
    date.setMonth(date.getMonth() + durationMonths - 1);
    return date;
  }
}
