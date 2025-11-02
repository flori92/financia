import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentAllocation } from './entities/payment-allocation.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { AllocatePaymentDto } from './dto/allocate-payment.dto';
import { AuditService } from '../audit/audit.service';
import { AccountingAutomationService } from '../accounting/accounting-automation.service';
import { MobileMoneyTransaction } from '../mobile-money/entities/mobile-money-transaction.entity';
import { BankTransaction } from '../banking/entities/bank-transaction.entity';

/**
 * Service de gestion des paiements
 */
@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    @InjectRepository(PaymentAllocation)
    private allocationsRepository: Repository<PaymentAllocation>,
    @InjectRepository(MobileMoneyTransaction)
    private mobileMoneyRepository: Repository<MobileMoneyTransaction>,
    @InjectRepository(BankTransaction)
    private bankTransactionRepository: Repository<BankTransaction>,
    private readonly auditService: AuditService,
    private readonly automation: AccountingAutomationService,
  ) {}

  /**
   * Créer un nouveau paiement
   */
  async createPayment(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    // Générer le numéro de paiement
    const paymentNumber = await this.generatePaymentNumber(
      createPaymentDto.companyId,
      createPaymentDto.partyType,
    );

    // Calculer les montants alloués
    let allocatedAmount = 0;
    if (createPaymentDto.allocations) {
      allocatedAmount = createPaymentDto.allocations.reduce(
        (sum, alloc) => sum + alloc.allocatedAmount,
        0,
      );

      // Vérifier que le montant alloué ne dépasse pas le montant du paiement
      if (allocatedAmount > createPaymentDto.amount) {
        throw new BadRequestException(
          `Le montant alloué (${allocatedAmount}) dépasse le montant du paiement (${createPaymentDto.amount})`,
        );
      }
    }

    const unallocatedAmount = createPaymentDto.amount - allocatedAmount;

    // Créer le paiement
    const payment = this.paymentsRepository.create({
      paymentNumber,
      paymentDate: new Date(createPaymentDto.paymentDate),
      amount: createPaymentDto.amount,
      allocatedAmount,
      unallocatedAmount,
      currency: createPaymentDto.currency || 'XOF',
      paymentMethod: createPaymentDto.paymentMethod,
      reference: createPaymentDto.reference,
      partyType: createPaymentDto.partyType,
      partyId: createPaymentDto.partyId,
      companyId: createPaymentDto.companyId,
      remarks: createPaymentDto.remarks,
      createdBy: createPaymentDto.createdBy,
      status: 'draft',
    });

    const savedPayment = await this.paymentsRepository.save(payment);

    // Créer les allocations si présentes
    if (createPaymentDto.allocations && createPaymentDto.allocations.length > 0) {
      const allocations = createPaymentDto.allocations.map((alloc) =>
        this.allocationsRepository.create({
          payment: savedPayment,
          invoiceId: alloc.invoiceId,
          allocatedAmount: alloc.allocatedAmount,
          remarks: alloc.remarks,
        }),
      );

      await this.allocationsRepository.save(allocations);
    }

    // Auto-posting journal si demandé
    try {
      if ((createPaymentDto as any).autoPostJournal) {
        // Mapper le mode de paiement vers notre automation
        const pm = createPaymentDto.paymentMethod;
        const method: 'bank' | 'cash' | 'mobile_money' =
          pm === 'cash' ? 'cash' : pm === 'mobile_money' ? 'mobile_money' : 'bank';

        if (createPaymentDto.partyType === 'customer') {
          await this.automation.generateCustomerPaymentEntry({
            companyId: createPaymentDto.companyId,
            paymentNumber: savedPayment.paymentNumber,
            paymentDate: createPaymentDto.paymentDate,
            customerName: (createPaymentDto as any).partyName || 'Client',
            amount: createPaymentDto.amount,
            paymentMethod: method,
            userId: createPaymentDto.createdBy,
          });
        } else if (createPaymentDto.partyType === 'supplier') {
          await this.automation.generateSupplierPaymentEntry({
            companyId: createPaymentDto.companyId,
            paymentNumber: savedPayment.paymentNumber,
            paymentDate: createPaymentDto.paymentDate,
            supplierName: (createPaymentDto as any).partyName || 'Fournisseur',
            amount: createPaymentDto.amount,
            paymentMethod: method,
            userId: createPaymentDto.createdBy,
          });
        }
      }
    } catch (e) {
      // ne pas bloquer la création si l'automatisation échoue
    }

    return this.findPaymentById(savedPayment.id);
  }

  /**
   * Récupérer tous les paiements d'une société
   */
  async findAllPayments(
    companyId: string,
    startDate?: string,
    endDate?: string,
    partyType?: string,
  ): Promise<Payment[]> {
    const where: any = { companyId };

    if (startDate && endDate) {
      where.paymentDate = Between(new Date(startDate), new Date(endDate));
    }

    if (partyType) {
      where.partyType = partyType;
    }

    return this.paymentsRepository.find({
      where,
      order: { paymentDate: 'DESC', paymentNumber: 'DESC' },
      relations: ['allocations'],
    });
  }

  /**
   * Récupérer un paiement par ID
   */
  async findPaymentById(id: string): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({
      where: { id },
      relations: ['allocations'],
    });

    if (!payment) {
      throw new NotFoundException(`Paiement ${id} non trouvé`);
    }

    return payment;
  }

  /**
   * Récupérer les paiements d'une facture
   */
  async findPaymentsByInvoice(invoiceId: string): Promise<Payment[]> {
    const allocations = await this.allocationsRepository.find({
      where: { invoiceId },
      relations: ['payment'],
    });

    return allocations.map((alloc) => alloc.payment);
  }

  /**
   * Récupérer les paiements d'un client/fournisseur
   */
  async findPaymentsByParty(
    partyId: string,
    partyType: string,
  ): Promise<Payment[]> {
    return this.paymentsRepository.find({
      where: { partyId, partyType },
      order: { paymentDate: 'DESC' },
      relations: ['allocations'],
    });
  }

  /**
   * Mettre à jour un paiement
   */
  async updatePayment(
    id: string,
    updatePaymentDto: UpdatePaymentDto,
  ): Promise<Payment> {
    const payment = await this.findPaymentById(id);

    if (payment.status !== 'draft') {
      throw new BadRequestException(
        'Seuls les paiements en brouillon peuvent être modifiés',
      );
    }

    Object.assign(payment, updatePaymentDto);

    // Recalculer les montants si le montant total change
    if (updatePaymentDto.amount) {
      payment.unallocatedAmount = updatePaymentDto.amount - payment.allocatedAmount;

      if (payment.unallocatedAmount < 0) {
        throw new BadRequestException(
          'Le montant alloué dépasse le nouveau montant du paiement',
        );
      }
    }

    payment.version++;

    return this.paymentsRepository.save(payment);
  }

  async validatePayment(id: string, userId: string): Promise<Payment> {
    const payment = await this.findPaymentById(id);
    if (payment.status !== 'submitted') {
      throw new BadRequestException('Seuls les paiements soumis peuvent être validés');
    }
    payment.status = 'validated' as any;
    payment.version++;
    const saved = await this.paymentsRepository.save(payment);
    await this.auditService.log('payment', id, 'validate', userId);
    return saved;
  }

  /**
   * Allouer un paiement à une facture
   */
  async allocatePayment(
    paymentId: string,
    allocatePaymentDto: AllocatePaymentDto,
  ): Promise<Payment> {
    const payment = await this.findPaymentById(paymentId);

    // Vérifier que le montant à allouer ne dépasse pas le montant non alloué
    if (allocatePaymentDto.amount > payment.unallocatedAmount) {
      throw new BadRequestException(
        `Montant insuffisant. Disponible: ${payment.unallocatedAmount}, Demandé: ${allocatePaymentDto.amount}`,
      );
    }

    // Vérifier qu'il n'y a pas déjà une allocation pour cette facture
    const existingAllocation = payment.allocations.find(
      (alloc) => alloc.invoiceId === allocatePaymentDto.invoiceId,
    );

    if (existingAllocation) {
      // Mettre à jour l'allocation existante
      existingAllocation.allocatedAmount += allocatePaymentDto.amount;
      await this.allocationsRepository.save(existingAllocation);
    } else {
      // Créer une nouvelle allocation
      const allocation = this.allocationsRepository.create({
        payment,
        invoiceId: allocatePaymentDto.invoiceId,
        allocatedAmount: allocatePaymentDto.amount,
        remarks: allocatePaymentDto.remarks,
      });
      await this.allocationsRepository.save(allocation);
    }

    // Mettre à jour les montants du paiement
    payment.allocatedAmount += allocatePaymentDto.amount;
    payment.unallocatedAmount -= allocatePaymentDto.amount;
    payment.version++;

    await this.paymentsRepository.save(payment);

    return this.findPaymentById(paymentId);
  }

  /**
   * Annuler une allocation
   */
  async deallocatePayment(
    paymentId: string,
    allocationId: string,
  ): Promise<Payment> {
    const payment = await this.findPaymentById(paymentId);

    const allocation = payment.allocations.find(
      (alloc) => alloc.id === allocationId,
    );

    if (!allocation) {
      throw new NotFoundException('Allocation non trouvée');
    }

    // Mettre à jour les montants du paiement
    payment.allocatedAmount -= allocation.allocatedAmount;
    payment.unallocatedAmount += allocation.allocatedAmount;
    payment.version++;

    await this.paymentsRepository.save(payment);
    await this.allocationsRepository.remove(allocation);

    return this.findPaymentById(paymentId);
  }

  /**
   * Soumettre (valider) un paiement
   */
  async submitPayment(id: string, userId: string): Promise<Payment> {
    const payment = await this.findPaymentById(id);

    if (payment.status !== 'draft') {
      throw new BadRequestException('Ce paiement est déjà validé');
    }

    payment.status = 'submitted';
    payment.submittedAt = new Date();
    payment.submittedBy = userId;
    payment.version++;

    return this.paymentsRepository.save(payment);
  }

  /**
   * Annuler un paiement
   */
  async cancelPayment(id: string): Promise<Payment> {
    const payment = await this.findPaymentById(id);

    if (payment.status === 'cancelled') {
      throw new BadRequestException('Ce paiement est déjà annulé');
    }

    payment.status = 'cancelled';
    payment.version++;

    return this.paymentsRepository.save(payment);
  }

  /**
   * Supprimer un paiement
   */
  async deletePayment(id: string): Promise<void> {
    const payment = await this.findPaymentById(id);

    if (payment.status !== 'draft') {
      throw new BadRequestException(
        'Seuls les paiements en brouillon peuvent être supprimés',
      );
    }

    await this.paymentsRepository.remove(payment);
  }

  /**
   * Obtenir le récapitulatif des paiements
   */
  async getPaymentsSummary(
    companyId: string,
    startDate: string,
    endDate: string,
  ): Promise<any> {
    const payments = await this.findAllPayments(companyId, startDate, endDate);

    const summary = {
      totalPayments: payments.length,
      totalAmount: 0,
      totalAllocated: 0,
      totalUnallocated: 0,
      byPaymentMethod: {} as any,
      byPartyType: {
        customer: { count: 0, amount: 0 },
        supplier: { count: 0, amount: 0 },
      },
      byStatus: {
        draft: { count: 0, amount: 0 },
        submitted: { count: 0, amount: 0 },
        cancelled: { count: 0, amount: 0 },
      },
    };

    for (const payment of payments) {
      summary.totalAmount += Number(payment.amount);
      summary.totalAllocated += Number(payment.allocatedAmount);
      summary.totalUnallocated += Number(payment.unallocatedAmount);

      // Par mode de paiement
      if (!summary.byPaymentMethod[payment.paymentMethod]) {
        summary.byPaymentMethod[payment.paymentMethod] = {
          count: 0,
          amount: 0,
        };
      }
      summary.byPaymentMethod[payment.paymentMethod].count++;
      summary.byPaymentMethod[payment.paymentMethod].amount += Number(
        payment.amount,
      );

      // Par type de partie
      summary.byPartyType[payment.partyType].count++;
      summary.byPartyType[payment.partyType].amount += Number(payment.amount);

      // Par statut
      summary.byStatus[payment.status].count++;
      summary.byStatus[payment.status].amount += Number(payment.amount);
    }

    return summary;
  }

  /**
   * Générer un numéro de paiement unique
   */
  private async generatePaymentNumber(
    companyId: string,
    partyType: string,
  ): Promise<string> {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');

    const prefix = partyType === 'customer' ? 'REC' : 'PAY'; // REC = Received, PAY = Payment

    const count = await this.paymentsRepository.count({
      where: { companyId, partyType },
    });

    return `${prefix}-${year}${month}-${String(count + 1).padStart(4, '0')}`;
  }

  /**
   * Récupérer toutes les transactions (banque, mobile money, espèces)
   */
  async getAllTransactions(options: {
    companyId: string;
    page: number;
    limit: number;
    type: string;
    startDate?: string;
    endDate?: string;
  }) {
    const { companyId, page, limit, type, startDate, endDate } = options;
    const skip = (page - 1) * limit;
    
    const transactions: any[] = [];
    let total = 0;

    // Transactions bancaires
    if (type === 'all' || type === 'bank') {
      const bankQuery = this.bankTransactionRepository
        .createQueryBuilder('transaction')
        .where('transaction.companyId = :companyId', { companyId });

      if (startDate) {
        bankQuery.andWhere('transaction.date >= :startDate', { startDate });
      }
      if (endDate) {
        bankQuery.andWhere('transaction.date <= :endDate', { endDate });
      }

      const [bankTransactions, bankCount] = await bankQuery
        .orderBy('transaction.date', 'DESC')
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      bankTransactions.forEach(transaction => {
        transactions.push({
          id: transaction.id,
          type: 'bank',
          reference: transaction.reference || transaction.label,
          amount: transaction.amount,
          currency: 'XOF', // Valeur par défaut car pas dans l'entité
          status: transaction.status,
          date: transaction.date,
          description: transaction.description || transaction.label,
          partyName: 'Inconnu', // Pas dans l'entité BankTransaction
          method: `Banque (${transaction.type})`,
          category: this.getTransactionCategory('bank', transaction.type),
          metadata: {
            accountId: transaction.accountId,
            transactionType: transaction.type,
            label: transaction.label,
          }
        });
      });

      total += bankCount;
    }

    // Transactions Mobile Money
    if (type === 'all' || type === 'mobile') {
      const mobileQuery = this.mobileMoneyRepository
        .createQueryBuilder('transaction')
        .leftJoinAndSelect('transaction.invoice', 'invoice')
        .where('invoice.companyId = :companyId', { companyId });

      if (startDate) {
        mobileQuery.andWhere('transaction.createdAt >= :startDate', { startDate });
      }
      if (endDate) {
        mobileQuery.andWhere('transaction.createdAt <= :endDate', { endDate });
      }

      const [mobileTransactions, mobileCount] = await mobileQuery
        .orderBy('transaction.createdAt', 'DESC')
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      mobileTransactions.forEach(transaction => {
        transactions.push({
          id: transaction.id,
          type: 'mobile',
          reference: transaction.txRef,
          amount: transaction.amount,
          currency: transaction.currency,
          status: transaction.status,
          date: transaction.createdAt,
          description: `Paiement ${transaction.provider}`,
          partyName: transaction.customerName || transaction.phoneNumber,
          method: `Mobile Money ${transaction.provider.toUpperCase()}`,
          category: this.getTransactionCategory('mobile', transaction.provider),
          metadata: {
            provider: transaction.provider,
            phoneNumber: transaction.phoneNumber,
            customerName: transaction.customerName,
            invoiceId: transaction.invoiceId,
          }
        });
      });

      total += mobileCount;
    }

    // Paiements en espèces et autres
    if (type === 'all' || type === 'cash') {
      const cashQuery = this.paymentsRepository
        .createQueryBuilder('payment')
        .where('payment.companyId = :companyId', { companyId })
        .andWhere('payment.paymentMethod IN (:...methods)', { methods: ['cash', 'check', 'bank_transfer'] });

      if (startDate) {
        cashQuery.andWhere('payment.paymentDate >= :startDate', { startDate });
      }
      if (endDate) {
        cashQuery.andWhere('payment.paymentDate <= :endDate', { endDate });
      }

      const [cashPayments, cashCount] = await cashQuery
        .orderBy('payment.paymentDate', 'DESC')
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      cashPayments.forEach(payment => {
        transactions.push({
          id: payment.id,
          type: 'cash',
          reference: payment.paymentNumber,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          date: payment.paymentDate,
          description: payment.remarks || `Paiement ${payment.paymentMethod}`,
          partyName: `Tiers ${payment.partyType}`, // Pas de partyName dans Payment
          method: this.getPaymentMethodLabel(payment.paymentMethod),
          category: this.getTransactionCategory('cash', payment.paymentMethod),
          metadata: {
            paymentMethod: payment.paymentMethod,
            partyType: payment.partyType,
            partyId: payment.partyId,
            reference: payment.reference,
          }
        });
      });

      total += cashCount;
    }

    // Trier par date (plus récent d'abord)
    transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Pagination finale
    const paginatedTransactions = transactions.slice(skip, skip + limit);

    return {
      transactions: paginatedTransactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private getTransactionCategory(type: string, subType: string): string {
    const categories = {
      bank: {
        credit: 'Encaissement',
        debit: 'Décaissement',
        transfer: 'Virement',
      },
      mobile: {
        mtn: 'Mobile Money',
        moov: 'Mobile Money',
        orange: 'Mobile Money',
        wave: 'Mobile Money',
      },
      cash: {
        cash: 'Espèces',
        check: 'Chèque',
        bank_transfer: 'Virement',
      },
    };
    
    return categories[type]?.[subType] || 'Autre';
  }

  private getPaymentMethodLabel(method: string): string {
    const labels = {
      cash: 'Espèces',
      check: 'Chèque',
      bank_transfer: 'Virement bancaire',
      mobile_money: 'Mobile Money',
      card: 'Carte bancaire',
    };
    
    return labels[method] || method;
  }
}
