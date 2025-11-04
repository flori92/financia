import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { BankTransfer, TransferStatus, TransferType, PaymentProvider } from '../entities/bank-transfer.entity';
import { PayrollRecord, PayrollStatus } from '../entities/payroll-record.entity';
import { Employee, EmployeeStatus } from '../entities/employee.entity';
import { User } from '../../auth/entities/user.entity';

interface CreateBankTransferDto {
  employeeId: string;
  amount: number;
  currency?: string;
  provider: PaymentProvider;
  transferType?: TransferType;
  scheduledDate?: Date;
  notes?: string;
  isUrgent?: boolean;
  payrollRecordId?: string;
}

interface OrangeMoneyRequest {
  msisdn: string;
  amount: number;
  transref: string;
  clientid: string;
  pin: string;
}

interface WaveRequest {
  account_id: string;
  amount: number;
  currency: string;
  reference: string;
  reason?: string;
}

@Injectable()
export class BankTransferService {
  constructor(
    @InjectRepository(BankTransfer)
    private bankTransfersRepository: Repository<BankTransfer>,
    @InjectRepository(PayrollRecord)
    private payrollRecordsRepository: Repository<PayrollRecord>,
    @InjectRepository(Employee)
    private employeesRepository: Repository<Employee>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Créer un nouveau virement
   */
  async create(createBankTransferDto: CreateBankTransferDto, companyId: string): Promise<BankTransfer> {
    // Vérifier que l'employé existe et appartient à l'entreprise
    const employee = await this.employeesRepository.findOne({
      where: { id: createBankTransferDto.employeeId, companyId },
    });
    if (!employee) {
      throw new NotFoundException('Employé non trouvé');
    }

    // Vérifier la fiche de paie si spécifiée
    if (createBankTransferDto.payrollRecordId) {
      const payrollRecord = await this.payrollRecordsRepository.findOne({
        where: { id: createBankTransferDto.payrollRecordId, employeeId: employee.id },
      });
      if (!payrollRecord) {
        throw new NotFoundException('Fiche de paie non trouvée');
      }
    }

    // Valider les informations de paiement selon le provider
    this.validatePaymentInfo(createBankTransferDto.provider, employee);

    // Générer une référence unique
    const transferReference = this.generateTransferReference();

    // Calculer les frais
    const fees = this.calculateFees(createBankTransferDto.provider, createBankTransferDto.amount);

    const bankTransfer = this.bankTransfersRepository.create({
      ...createBankTransferDto,
      transferReference,
      ...fees,
      beneficiaryName: `${employee.firstName} ${employee.lastName}`,
      beneficiaryPhone: this.getBeneficiaryPhone(createBankTransferDto.provider, employee),
      beneficiaryAccount: this.getBeneficiaryAccount(createBankTransferDto.provider, employee),
      beneficiaryBank: employee.bankName,
      beneficiaryIban: employee.bankIban,
      currency: createBankTransferDto.currency || employee.currency,
      status: TransferStatus.PENDING,
    });

    return await this.bankTransfersRepository.save(bankTransfer);
  }

  /**
   * Exécuter un virement
   */
  async executeTransfer(id: string, userId: string, companyId: string): Promise<BankTransfer> {
    const bankTransfer = await this.findOne(id, companyId);

    if (!bankTransfer.isPending) {
      throw new BadRequestException('Ce virement ne peut plus être exécuté');
    }

    // Marquer comme en cours
    bankTransfer.status = TransferStatus.PROCESSING;
    bankTransfer.processedDate = new Date();
    bankTransfer.processedById = userId;
    bankTransfer.executionTime = new Date();
    await this.bankTransfersRepository.save(bankTransfer);

    try {
      // Exécuter selon le provider
      const result = await this.processProviderTransfer(bankTransfer);

      // Mettre à jour avec la réponse
      bankTransfer.externalTransactionId = result.transactionId;
      bankTransfer.apiResponse = result.response;
      bankTransfer.status = result.success ? TransferStatus.COMPLETED : TransferStatus.FAILED;
      bankTransfer.completedDate = result.success ? new Date() : null;
      bankTransfer.errorMessage = result.success ? null : result.error;

      if (result.success) {
        // Envoyer les notifications
        await this.sendNotifications(bankTransfer);
      }

    } catch (error) {
      bankTransfer.status = TransferStatus.FAILED;
      bankTransfer.errorMessage = error.message;
      bankTransfer.errorCode = 'PROCESSING_ERROR';
      bankTransfer.retryCount += 1;
      
      // Programmer une retry si possible
      if (bankTransfer.canBeRetried) {
        bankTransfer.nextRetryAt = new Date(Date.now() + (5 * 60 * 1000)); // 5 minutes
      }
    }

    return await this.bankTransfersRepository.save(bankTransfer);
  }

  /**
   * Traiter le virement selon le provider
   */
  private async processProviderTransfer(bankTransfer: BankTransfer): Promise<{
    success: boolean;
    transactionId?: string;
    response?: any;
    error?: string;
  }> {
    switch (bankTransfer.provider) {
      case PaymentProvider.ORANGE_MONEY:
        return await this.processOrangeMoneyTransfer(bankTransfer);
      
      case PaymentProvider.WAVE:
        return await this.processWaveTransfer(bankTransfer);
      
      case PaymentProvider.MTN_MONEY:
        return await this.processMTNMoneyTransfer(bankTransfer);
      
      case PaymentProvider.MOOV_MONEY:
        return await this.processMoovMoneyTransfer(bankTransfer);
      
      case PaymentProvider.BANK_TRANSFER:
        return await this.processBankTransfer(bankTransfer);
      
      default:
        return {
          success: false,
          error: `Provider ${bankTransfer.provider} non supporté`,
        };
    }
  }

  /**
   * Traitement Orange Money
   */
  private async processOrangeMoneyTransfer(bankTransfer: BankTransfer): Promise<any> {
    const request: OrangeMoneyRequest = {
      msisdn: bankTransfer.beneficiaryPhone,
      amount: bankTransfer.amount,
      transref: bankTransfer.transferReference,
      clientid: process.env.ORANGE_MONEY_CLIENT_ID,
      pin: process.env.ORANGE_MONEY_PIN,
    };

    try {
      // TODO: Implémenter l'appel API Orange Money
      // const response = await this.orangeMoneyClient.transfer(request);
      
      // Simulation pour le développement
      const response = {
        status: 'success',
        transactionId: `OM_${Date.now()}`,
        message: 'Transfert effectué avec succès',
      };

      return {
        success: response.status === 'success',
        transactionId: response.transactionId,
        response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Traitement Wave
   */
  private async processWaveTransfer(bankTransfer: BankTransfer): Promise<any> {
    const request: WaveRequest = {
      account_id: bankTransfer.beneficiaryPhone, // Wave utilise le téléphone comme account_id
      amount: bankTransfer.amount,
      currency: bankTransfer.currency,
      reference: bankTransfer.transferReference,
      reason: 'Virement salaire',
    };

    try {
      // TODO: Implémenter l'appel API Wave
      // const response = await this.waveClient.transfer(request);
      
      // Simulation pour le développement
      const response = {
        success: true,
        transaction_id: `WV_${Date.now()}`,
        status: 'completed',
      };

      return {
        success: response.success,
        transactionId: response.transaction_id,
        response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Traitement MTN Mobile Money
   */
  private async processMTNMoneyTransfer(bankTransfer: BankTransfer): Promise<any> {
    // TODO: Implémenter l'appel API MTN Mobile Money
    return {
      success: true,
      transactionId: `MTN_${Date.now()}`,
      response: { status: 'success' },
    };
  }

  /**
   * Traitement Moov Money
   */
  private async processMoovMoneyTransfer(bankTransfer: BankTransfer): Promise<any> {
    // TODO: Implémenter l'appel API Moov Money
    return {
      success: true,
      transactionId: `MOOV_${Date.now()}`,
      response: { status: 'success' },
    };
  }

  /**
   * Traitement Virement Bancaire
   */
  private async processBankTransfer(bankTransfer: BankTransfer): Promise<any> {
    // TODO: Implémenter l'appel API bancaire (SWIFT, SEPA, etc.)
    return {
      success: true,
      transactionId: `BANK_${Date.now()}`,
      response: { status: 'processed' },
    };
  }

  /**
   * Lister les virements
   */
  async findAll(
    companyId: string,
    options: {
      employeeId?: string;
      status?: TransferStatus;
      provider?: PaymentProvider;
      startDate?: Date;
      endDate?: Date;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{ bankTransfers: BankTransfer[]; total: number }> {
    const {
      employeeId,
      status,
      provider,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = options;

    const queryBuilder = this.bankTransfersRepository
      .createQueryBuilder('bankTransfer')
      .leftJoinAndSelect('bankTransfer.employee', 'employee')
      .leftJoinAndSelect('bankTransfer.payrollRecord', 'payrollRecord')
      .leftJoinAndSelect('bankTransfer.createdBy', 'createdBy')
      .leftJoinAndSelect('bankTransfer.processedBy', 'processedBy')
      .innerJoin('bankTransfer.employee', 'emp')
      .where('emp.companyId = :companyId', { companyId });

    if (employeeId) {
      queryBuilder.andWhere('bankTransfer.employeeId = :employeeId', { employeeId });
    }

    if (status) {
      queryBuilder.andWhere('bankTransfer.status = :status', { status });
    }

    if (provider) {
      queryBuilder.andWhere('bankTransfer.provider = :provider', { provider });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('bankTransfer.createdAt >= :startDate AND bankTransfer.createdAt <= :endDate', {
        startDate,
        endDate,
      });
    }

    const [bankTransfers, total] = await queryBuilder
      .orderBy('bankTransfer.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { bankTransfers, total };
  }

  /**
   * Trouver un virement par son ID
   */
  async findOne(id: string, companyId: string): Promise<BankTransfer> {
    const bankTransfer = await this.bankTransfersRepository.findOne({
      where: { id },
      relations: [
        'employee',
        'payrollRecord',
        'createdBy',
        'processedBy',
      ],
    });

    if (!bankTransfer) {
      throw new NotFoundException('Virement non trouvé');
    }

    // Vérifier que l'employé appartient à l'entreprise
    const employee = await this.employeesRepository.findOne({
      where: { id: bankTransfer.employeeId, companyId },
    });
    if (!employee) {
      throw new NotFoundException('Employé non trouvé dans cette entreprise');
    }

    return bankTransfer;
  }

  /**
   * Annuler un virement
   */
  async cancel(id: string, userId: string, companyId: string, reason?: string): Promise<BankTransfer> {
    const bankTransfer = await this.findOne(id, companyId);

    if (!bankTransfer.canBeCancelled) {
      throw new BadRequestException('Ce virement ne peut plus être annulé');
    }

    bankTransfer.status = TransferStatus.CANCELLED;
    bankTransfer.internalNotes = reason || 'Annulé par l\'utilisateur';

    return await this.bankTransfersRepository.save(bankTransfer);
  }

  /**
   * Réessayer un virement échoué
   */
  async retry(id: string, userId: string, companyId: string): Promise<BankTransfer> {
    const bankTransfer = await this.findOne(id, companyId);

    if (!bankTransfer.canBeRetried) {
      throw new BadRequestException('Ce virement ne peut pas être réessayé');
    }

    // Remettre en pending
    bankTransfer.status = TransferStatus.PENDING;
    bankTransfer.errorMessage = null;
    bankTransfer.errorCode = null;
    bankTransfer.nextRetryAt = null;

    await this.bankTransfersRepository.save(bankTransfer);

    // Exécuter le transfert
    return await this.executeTransfer(id, userId, companyId);
  }

  /**
   * Programmer des virements de paie automatiques
   */
  async schedulePayrollTransfers(payrollRecordIds: string[], userId: string, companyId: string): Promise<BankTransfer[]> {
    const results: BankTransfer[] = [];

    for (const payrollRecordId of payrollRecordIds) {
      try {
        const payrollRecord = await this.payrollRecordsRepository.findOne({
          where: { id: payrollRecordId },
          relations: ['employee'],
        });

        if (!payrollRecord || payrollRecord.status !== PayrollStatus.APPROVED) {
          continue;
        }

        const employee = await this.employeesRepository.findOne({
          where: { id: payrollRecord.employeeId, companyId },
        });

        if (!employee || employee.status !== EmployeeStatus.ACTIVE) {
          continue;
        }

        // Déterminer le provider préféré de l'employé
        const provider = this.getEmployeePreferredProvider(employee);

        const bankTransfer = await this.create({
          employeeId: employee.id,
          amount: payrollRecord.netSalary,
          currency: payrollRecord.currency || employee.currency,
          provider,
          transferType: TransferType.PAYROLL,
          scheduledDate: payrollRecord.payDate,
          payrollRecordId: payrollRecord.id,
          notes: `Virement salaire ${payrollRecord.payPeriodLabel}`,
        }, companyId);

        results.push(bankTransfer);
      } catch (error) {
        console.error(`Erreur programmation virement paie ${payrollRecordId}:`, error);
      }
    }

    return results;
  }

  /**
   * Obtenir les statistiques des virements
   */
  async getStats(companyId: string, period?: { startDate: Date; endDate: Date }): Promise<{
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    cancelled: number;
    totalAmount: number;
    totalFees: number;
    byProvider: Record<string, number>;
    byStatus: Record<string, number>;
  }> {
    const queryBuilder = this.bankTransfersRepository
      .createQueryBuilder('bankTransfer')
      .innerJoin('bankTransfer.employee', 'emp')
      .where('emp.companyId = :companyId', { companyId });

    if (period) {
      queryBuilder.andWhere('bankTransfer.createdAt >= :startDate AND bankTransfer.createdAt <= :endDate', {
        startDate: period.startDate,
        endDate: period.endDate,
      });
    }

    const bankTransfers = await queryBuilder.getMany();

    const stats = {
      total: bankTransfers.length,
      pending: bankTransfers.filter(t => t.status === TransferStatus.PENDING).length,
      processing: bankTransfers.filter(t => t.status === TransferStatus.PROCESSING).length,
      completed: bankTransfers.filter(t => t.status === TransferStatus.COMPLETED).length,
      failed: bankTransfers.filter(t => t.status === TransferStatus.FAILED).length,
      cancelled: bankTransfers.filter(t => t.status === TransferStatus.CANCELLED).length,
      totalAmount: bankTransfers.reduce((sum, t) => sum + Number(t.amount), 0),
      totalFees: bankTransfers.reduce((sum, t) => sum + Number(t.totalFee), 0),
      byProvider: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
    };

    // Statistiques par provider
    bankTransfers.forEach(transfer => {
      stats.byProvider[transfer.provider] = (stats.byProvider[transfer.provider] || 0) + 1;
      stats.byStatus[transfer.status] = (stats.byStatus[transfer.status] || 0) + 1;
    });

    return stats;
  }

  /**
   * Valider les informations de paiement
   */
  private validatePaymentInfo(provider: PaymentProvider, employee: Employee): void {
    switch (provider) {
      case PaymentProvider.ORANGE_MONEY:
      case PaymentProvider.WAVE:
      case PaymentProvider.MTN_MONEY:
      case PaymentProvider.MOOV_MONEY:
        if (!employee.mobileMoneyPhone) {
          throw new BadRequestException(`Numéro Mobile Money requis pour ${provider}`);
        }
        break;
      
      case PaymentProvider.BANK_TRANSFER:
        if (!employee.bankAccount) {
          throw new BadRequestException('Coordonnées bancaires requises pour virement bancaire');
        }
        break;
    }
  }

  /**
   * Obtenir le téléphone du bénéficiaire selon le provider
   */
  private getBeneficiaryPhone(provider: PaymentProvider, employee: Employee): string | null {
    if ([
      PaymentProvider.ORANGE_MONEY,
      PaymentProvider.WAVE,
      PaymentProvider.MTN_MONEY,
      PaymentProvider.MOOV_MONEY,
    ].includes(provider)) {
      return employee.mobileMoneyPhone;
    }
    return null;
  }

  /**
   * Obtenir le compte bancaire du bénéficiaire
   */
  private getBeneficiaryAccount(provider: PaymentProvider, employee: Employee): string | null {
    if (provider === PaymentProvider.BANK_TRANSFER) {
      return employee.bankAccount;
    }
    return null;
  }

  /**
   * Obtenir le provider préféré de l'employé
   */
  private getEmployeePreferredProvider(employee: Employee): PaymentProvider {
    // Priorité au Mobile Money si disponible
    if (employee.mobileMoneyPhone) {
      if (employee.mobileMoneyProvider) {
        return employee.mobileMoneyProvider as PaymentProvider;
      }
      return PaymentProvider.ORANGE_MONEY; // Par défaut
    }
    
    // Sinon virement bancaire
    if (employee.bankAccount) {
      return PaymentProvider.BANK_TRANSFER;
    }
    
    throw new BadRequestException('Aucune méthode de paiement disponible pour cet employé');
  }

  /**
   * Calculer les frais selon le provider
   */
  private calculateFees(provider: PaymentProvider, amount: number): {
    providerFee: number;
    processingFee: number;
    totalFee: number;
    netAmount: number;
  } {
    let providerFee = 0;
    let processingFee = 0;

    switch (provider) {
      case PaymentProvider.ORANGE_MONEY:
        providerFee = Math.max(amount * 0.008, 50); // 0.8% min 50 XOF
        break;
      
      case PaymentProvider.WAVE:
        providerFee = Math.max(amount * 0.01, 100); // 1% min 100 XOF
        break;
      
      case PaymentProvider.MTN_MONEY:
        providerFee = Math.max(amount * 0.009, 75); // 0.9% min 75 XOF
        break;
      
      case PaymentProvider.MOOV_MONEY:
        providerFee = Math.max(amount * 0.0085, 60); // 0.85% min 60 XOF
        break;
      
      case PaymentProvider.BANK_TRANSFER:
        providerFee = 500; // Fixe 500 XOF
        break;
    }

    processingFee = 25; // Fixe processing fee
    const totalFee = providerFee + processingFee;
    const netAmount = amount - totalFee;

    return {
      providerFee,
      processingFee,
      totalFee,
      netAmount,
    };
  }

  /**
   * Générer une référence unique
   */
  private generateTransferReference(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `TRF_${timestamp}_${random}`;
  }

  /**
   * Envoyer les notifications
   */
  private async sendNotifications(bankTransfer: BankTransfer): Promise<void> {
    // TODO: Implémenter l'envoi de SMS et email
    console.log(`Notification envoyée pour le virement ${bankTransfer.transferReference}`);
  }

  /**
   * Supprimer un virement
   */
  async remove(id: string, companyId: string): Promise<void> {
    const bankTransfer = await this.findOne(id, companyId);

    if (!bankTransfer.isPending) {
      throw new BadRequestException('Seul un virement en attente peut être supprimé');
    }

    await this.bankTransfersRepository.delete(id);
  }
}
