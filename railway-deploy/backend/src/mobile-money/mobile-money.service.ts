import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { MobileMoneyTransaction } from './entities/mobile-money-transaction.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { Payment } from '../payments/entities/payment.entity';
import { FedaPayProvider } from './providers/fedapay.provider';
import { KkiapayProvider } from './providers/kkiapay.provider';
import { NotificationsService } from '../notifications/notifications.service';
import axios from 'axios';

interface FlutterwavePaymentRequest {
  amount: number;
  currency: string;
  phoneNumber: string;
  provider: 'mtn' | 'moov' | 'orange' | 'wave';
  txRef: string;
  invoiceId?: string;
}

@Injectable()
export class MobileMoneyService {
  private readonly logger = new Logger(MobileMoneyService.name);

  constructor(
    @InjectRepository(MobileMoneyTransaction)
    private transactionRepository: Repository<MobileMoneyTransaction>,
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    private fedaPayProvider: FedaPayProvider,
    private kkiapayProvider: KkiapayProvider,
    private notificationsService: NotificationsService,
    private configService: ConfigService,
  ) {}

  /**
   * Obtenir le provider configuré
   */
  private getProvider() {
    const provider = this.configService.get<string>('MOBILE_MONEY_PROVIDER', 'kkiapay');
    return provider === 'kkiapay' ? this.kkiapayProvider : this.fedaPayProvider;
  }

  /**
   * Initier un paiement Mobile Money (KkiaPay ou FedaPay)
   */
  async initiatePayment(paymentRequest: FlutterwavePaymentRequest) {
    try {
      this.logger.log(`Initiating payment: ${paymentRequest.txRef}`);

      // Récupérer la facture si ID fourni
      let invoice = null;
      let customerInfo = {
        firstname: 'Client',
        lastname: 'BMS',
        email: 'client@example.com',
        phoneNumber: paymentRequest.phoneNumber,
      };

      if (paymentRequest.invoiceId) {
        invoice = await this.invoiceRepository.findOne({
          where: { id: paymentRequest.invoiceId },
          relations: ['company'],
        });

        if (invoice) {
          customerInfo = {
            firstname: invoice.partyName?.split(' ')[0] || 'Client',
            lastname: invoice.partyName?.split(' ')[1] || 'BMS',
            email: invoice.partyEmail || 'client@example.com',
            phoneNumber: invoice.partyPhone || paymentRequest.phoneNumber,
          };
        }
      }

      const provider = this.configService.get<string>('MOBILE_MONEY_PROVIDER', 'kkiapay');

      if (provider === 'kkiapay') {
        // KkiaPay: Générer les données pour le widget côté client
        const widgetConfig = this.kkiapayProvider.generateWidgetConfig({
          amount: paymentRequest.amount,
          phone: paymentRequest.phoneNumber,
          name: `${customerInfo.firstname} ${customerInfo.lastname}`,
          reason: invoice 
            ? `Paiement facture ${invoice.invoiceNumber}`
            : `Paiement ${paymentRequest.txRef}`,
          sandbox: this.configService.get<boolean>('MOBILE_MONEY_SANDBOX', true),
        });

        // Enregistrer la transaction locale
        const transaction = this.transactionRepository.create({
          txRef: paymentRequest.txRef,
          amount: paymentRequest.amount,
          currency: paymentRequest.currency,
          phoneNumber: paymentRequest.phoneNumber,
          customerEmail: customerInfo.email,
          customerName: `${customerInfo.firstname} ${customerInfo.lastname}`,
          provider: paymentRequest.provider,
          status: 'pending',
          invoiceId: paymentRequest.invoiceId,
          metadata: {
            widgetConfig,
            reason: widgetConfig.data,
          },
        });

        await this.transactionRepository.save(transaction);

        return {
          transaction_id: transaction.id,
          provider: 'kkiapay',
          status: 'pending',
          widget_config: widgetConfig,
          payment_link: this.kkiapayProvider.generatePaymentLink({
            amount: paymentRequest.amount,
            phone: paymentRequest.phoneNumber,
            name: `${customerInfo.firstname} ${customerInfo.lastname}`,
            reason: invoice 
              ? `Paiement facture ${invoice.invoiceNumber}`
              : `Paiement ${paymentRequest.txRef}`,
          }),
          qr_code_data: this.kkiapayProvider.generateQRCodeData({
            amount: paymentRequest.amount,
            phone: paymentRequest.phoneNumber,
            reason: invoice ? `Facture ${invoice.invoiceNumber}` : 'Paiement BMS',
            reference: paymentRequest.txRef,
          }),
        };
      } else {
        // FedaPay implementation (conservée pour compatibilité)
        const fedaPayTransaction = await this.fedaPayProvider.createTransaction({
          amount: paymentRequest.amount,
          currency: paymentRequest.currency,
          description: invoice 
            ? `Paiement facture ${invoice.invoiceNumber}`
            : `Paiement ${paymentRequest.txRef}`,
          customer: customerInfo,
          reference: paymentRequest.txRef,
          callbackUrl: `${this.configService.get('WEB_APP_URL')}/api/v1/mobile-money/webhook`,
        });

        const tokenData = await this.fedaPayProvider.generateToken(fedaPayTransaction.id);

        const transaction = this.transactionRepository.create({
          txRef: paymentRequest.txRef,
          externalTransactionId: fedaPayTransaction.id.toString(),
          amount: paymentRequest.amount,
          currency: paymentRequest.currency,
          phoneNumber: paymentRequest.phoneNumber,
          customerEmail: customerInfo.email,
          customerName: `${customerInfo.firstname} ${customerInfo.lastname}`,
          provider: paymentRequest.provider,
          status: 'pending',
          invoiceId: paymentRequest.invoiceId,
          providerResponse: fedaPayTransaction,
          metadata: {
            token: tokenData.token,
            paymentUrl: tokenData.url,
          },
        });

        await this.transactionRepository.save(transaction);

        return {
          transaction_id: transaction.id,
          provider: 'fedapay',
          provider_transaction_id: fedaPayTransaction.id,
          status: 'pending',
          payment_url: tokenData.url,
          token: tokenData.token,
          qr_code_data: this.fedaPayProvider.generateQRCodeData({
            transactionId: fedaPayTransaction.id,
            amount: paymentRequest.amount,
            reference: paymentRequest.txRef,
            token: tokenData.token,
          }),
        };
      }
    } catch (error) {
      this.logger.error('Payment initiation error:', error.message);
      throw new BadRequestException(`Erreur paiement: ${error.message}`);
    }
  }

  /**
   * Vérifier le statut d'une transaction
   */
  async verifyTransaction(transactionId: string) {
    try {
      // Récupérer la transaction locale
      const localTransaction = await this.transactionRepository.findOne({
        where: { id: transactionId },
      });

      if (!localTransaction) {
        throw new BadRequestException('Transaction non trouvée');
      }

      // Vérifier via FedaPay
      const fedaPayTransaction = await this.fedaPayProvider.getTransaction(
        parseInt(localTransaction.externalTransactionId),
      );

      // Mettre à jour le statut local
      localTransaction.status = this.mapFedaPayStatus(fedaPayTransaction.status);
      localTransaction.providerResponse = fedaPayTransaction;
      await this.transactionRepository.save(localTransaction);

      return {
        transaction_id: localTransaction.id,
        external_id: localTransaction.externalTransactionId,
        status: localTransaction.status,
        amount: localTransaction.amount,
        currency: localTransaction.currency,
        provider: localTransaction.provider,
        created_at: localTransaction.createdAt,
        updated_at: localTransaction.updatedAt,
      };
    } catch (error) {
      this.logger.error('Erreur vérification:', error.message);
      throw new BadRequestException('Erreur lors de la vérification');
    }
  }

  /**
   * Mapper les statuts FedaPay vers nos statuts
   */
  private mapFedaPayStatus(fedaPayStatus: string): string {
    const statusMap = {
      pending: 'pending',
      approved: 'success',
      declined: 'failed',
      canceled: 'canceled',
    };
    return statusMap[fedaPayStatus] || 'pending';
  }

  /**
   * Gérer les webhooks FedaPay
   */
  async handleWebhook(webhookData: any, signature?: string) {
    try {
      this.logger.log('Webhook reçu:', webhookData);

      // Vérifier la signature (sécurité)
      if (signature) {
        const isValid = this.fedaPayProvider.verifyWebhookSignature(
          JSON.stringify(webhookData),
          signature,
        );
        if (!isValid) {
          this.logger.warn('Signature webhook invalide');
          throw new BadRequestException('Signature invalide');
        }
      }

      const event = webhookData.entity || webhookData.event;
      const data = webhookData.data || webhookData;

      // Traiter selon le type d'événement
      switch (event) {
        case 'transaction.approved':
        case 'transaction.completed':
          return await this.handleSuccessfulPayment(data);

        case 'transaction.declined':
        case 'transaction.failed':
          return await this.handleFailedPayment(data);

        case 'transaction.canceled':
          return await this.handleCanceledPayment(data);

        default:
          this.logger.warn(`Événement webhook non géré: ${event}`);
          return { status: 'received', message: 'Event not handled' };
      }
    } catch (error) {
      this.logger.error('Erreur traitement webhook:', error.message);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Gérer un paiement réussi
   */
  private async handleSuccessfulPayment(data: any) {
    this.logger.log(' Paiement réussi:', data.id);

    try {
      // Récupérer la transaction locale via l'ID FedaPay
      const transaction = await this.transactionRepository.findOne({
        where: { externalTransactionId: data.id.toString() },
        relations: ['invoice'],
      });

      if (!transaction) {
        this.logger.warn(`Transaction non trouvée: ${data.id}`);
        return { status: 'error', message: 'Transaction not found' };
      }

      // Mettre à jour la transaction
      transaction.status = 'success';
      transaction.completedAt = new Date();
      transaction.providerResponse = data;
      await this.transactionRepository.save(transaction);

      // Créer un paiement
      const payment = this.paymentRepository.create({
        companyId: transaction.invoice?.companyId,
        paymentNumber: `PAY-${Date.now()}`,
        paymentDate: new Date(),
        amount: transaction.amount,
        currency: transaction.currency,
        paymentMethod: 'mobile_money',
        reference: transaction.txRef,
        partyType: 'customer',
        partyId: transaction.invoice?.partyId || transaction.invoiceId,
        status: 'submitted',
        createdBy: transaction.invoice?.company?.id || 'system',
        allocatedAmount: transaction.amount,
        unallocatedAmount: 0,
        remarks: `Paiement Mobile Money via ${transaction.provider}`,
      });

      await this.paymentRepository.save(payment);

      // Mettre à jour le paiementId dans la transaction
      transaction.paymentId = payment.id;
      await this.transactionRepository.save(transaction);

      // Mettre à jour la facture
      if (transaction.invoice) {
        const invoice = await this.invoiceRepository.findOne({
          where: { id: transaction.invoiceId },
          relations: ['company', 'customer'],
        });

        if (invoice) {
          // Marquer comme payée
          invoice.status = 'paid';
          invoice.paidAt = new Date();
          invoice.paidAmount = transaction.amount;
          await this.invoiceRepository.save(invoice);

          // Envoyer les notifications
          await this.sendPaymentNotifications(transaction, invoice, payment);
        }
      }

      return { status: 'processed', transaction_id: transaction.id };
    } catch (error) {
      this.logger.error('Erreur traitement paiement réussi:', error.message);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Gérer un paiement échoué
   */
  private async handleFailedPayment(data: any) {
    this.logger.warn(' Paiement échoué:', data.id);

    try {
      const transaction = await this.transactionRepository.findOne({
        where: { externalTransactionId: data.id.toString() },
        relations: ['invoice'],
      });

      if (!transaction) {
        return { status: 'error', message: 'Transaction not found' };
      }

      transaction.status = 'failed';
      transaction.statusMessage = data.reason || 'Payment failed';
      transaction.providerResponse = data;
      await this.transactionRepository.save(transaction);

      // Notifier l'échec
      if (transaction.customerEmail) {
        await this.notificationsService.notifyPaymentFailure({
          customerEmail: transaction.customerEmail,
          customerPhone: transaction.phoneNumber,
          amount: transaction.amount,
          invoiceNumber: transaction.invoice?.invoiceNumber || transaction.txRef,
          reason: data.reason || 'Unknown',
        });
      }

      return { status: 'processed', transaction_id: transaction.id };
    } catch (error) {
      this.logger.error('Erreur traitement paiement échoué:', error.message);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Gérer un paiement annulé
   */
  private async handleCanceledPayment(data: any) {
    this.logger.log(' Paiement annulé:', data.id);

    try {
      const transaction = await this.transactionRepository.findOne({
        where: { externalTransactionId: data.id.toString() },
      });

      if (!transaction) {
        return { status: 'error', message: 'Transaction not found' };
      }

      transaction.status = 'canceled';
      transaction.providerResponse = data;
      await this.transactionRepository.save(transaction);

      return { status: 'processed', transaction_id: transaction.id };
    } catch (error) {
      this.logger.error('Erreur traitement paiement annulé:', error.message);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Envoyer les notifications de paiement
   */
  private async sendPaymentNotifications(
    transaction: MobileMoneyTransaction,
    invoice: Invoice,
    payment: Payment,
  ) {
    try {
      // Notification au client
      if (transaction.customerEmail || transaction.phoneNumber) {
        await this.notificationsService.notifyPaymentSuccess({
          customerEmail: transaction.customerEmail,
          customerPhone: transaction.phoneNumber,
          amount: transaction.amount,
          invoiceNumber: invoice.invoiceNumber,
          transactionId: transaction.txRef,
        });
      }

      // Notification à l'entrepreneur
      if (invoice.company) {
        const company = await this.invoiceRepository.query(
          'SELECT u.email, u.phone FROM users u JOIN companies c ON u.id = c."createdBy" WHERE c.id = $1',
          [invoice.companyId],
        );

        if (company.length > 0) {
          await this.notificationsService.notifyEntrepreneurPaymentReceived({
            entrepreneurEmail: company[0].email,
            entrepreneurPhone: company[0].phone,
            customerName: transaction.customerName,
            amount: transaction.amount,
            invoiceNumber: invoice.invoiceNumber,
            paymentMethod: `Mobile Money ${transaction.provider}`,
          });
        }
      }
    } catch (error) {
      this.logger.error('Erreur envoi notifications:', error.message);
      // On ne fait pas crasher le process si les notifications échouent
    }
  }

  generateQRCodeData(
    provider: string,
    amount: number,
    reference: string,
    phone?: string,
  ): string {
    // Format simple pour QR Code Mobile Money
    // En production, utiliser le format officiel de chaque opérateur

    const qrData = {
      provider,
      amount,
      currency: 'XOF',
      reference,
      phone,
      merchant: 'BMS',
      timestamp: new Date().toISOString(),
    };

    return JSON.stringify(qrData);
  }

  /**
   * Lister les transactions avec filtres
   */
  async getTransactions(options: {
    companyId: string;
    page: number;
    limit: number;
    status?: string;
    provider?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const { companyId, page, limit, status, provider, startDate, endDate } = options;
    
    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoin('transaction.invoice', 'invoice')
      .leftJoin('transaction.payment', 'payment')
      .where('invoice.companyId = :companyId OR invoice.companyId IS NULL', { companyId });

    // Filtres
    if (status) {
      queryBuilder.andWhere('transaction.status = :status', { status });
    }
    
    if (provider) {
      queryBuilder.andWhere('transaction.provider = :provider', { provider });
    }
    
    if (startDate) {
      queryBuilder.andWhere('transaction.createdAt >= :startDate', { 
        startDate: new Date(startDate) 
      });
    }
    
    if (endDate) {
      queryBuilder.andWhere('transaction.createdAt <= :endDate', { 
        endDate: new Date(endDate) 
      });
    }

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder
      .orderBy('transaction.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [transactions, total] = await queryBuilder.getManyAndCount();

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Détails d'une transaction
   */
  async getTransactionById(id: string) {
    const transaction = await this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.invoice', 'invoice')
      .leftJoinAndSelect('transaction.payment', 'payment')
      .where('transaction.id = :id', { id })
      .getOne();

    if (!transaction) {
      throw new BadRequestException('Transaction non trouvée');
    }

    return transaction;
  }

  /**
   * Statistiques des transactions
   */
  async getTransactionStats(companyId: string) {
    const stats = await this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoin('transaction.invoice', 'invoice')
      .where('invoice.companyId = :companyId', { companyId })
      .select('COUNT(transaction.id)', 'total')
      .addSelect('SUM(CASE WHEN transaction.status = :success THEN 1 ELSE 0 END)', 'successful')
      .addSelect('SUM(CASE WHEN transaction.status = :failed THEN 1 ELSE 0 END)', 'failed')
      .addSelect('SUM(CASE WHEN transaction.status = :pending THEN 1 ELSE 0 END)', 'pending')
      .addSelect('SUM(transaction.amount)', 'totalAmount')
      .addSelect('SUM(CASE WHEN transaction.status = :success THEN transaction.amount ELSE 0 END)', 'successfulAmount')
      .setParameter('success', 'success')
      .setParameter('failed', 'failed')
      .setParameter('pending', 'pending')
      .getRawOne();

    // Stats par provider
    const providerStats = await this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoin('transaction.invoice', 'invoice')
      .where('invoice.companyId = :companyId', { companyId })
      .select('transaction.provider', 'provider')
      .addSelect('COUNT(transaction.id)', 'count')
      .addSelect('SUM(transaction.amount)', 'total')
      .groupBy('transaction.provider')
      .getRawMany();

    return {
      ...stats,
      byProvider: providerStats,
    };
  }
}
