import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankWebhookEvent } from '../entities/bank-webhook-event.entity';
import { NotificationsService } from '../../../notifications/notifications.service';

@Injectable()
export class BankWebhookService {
  private readonly logger = new Logger(BankWebhookService.name);

  constructor(
    @InjectRepository(BankWebhookEvent)
    private readonly webhookEventRepo: Repository<BankWebhookEvent>,
    private readonly notificationsService: NotificationsService
  ) {}

  async handleStripeWebhook(event: any, signature: string): Promise<{ received: boolean }> {
    this.logger.log(`Webhook Stripe reçu: ${event.type}`);

    try {
      // Enregistrer l'événement
      const webhookEvent = this.webhookEventRepo.create({
        provider: 'stripe',
        eventType: event.type,
        payload: event,
        signature,
        processed: false
      });

      await this.webhookEventRepo.save(webhookEvent);

      // Traiter l'événement selon son type
      await this.processStripeEvent(event);

      // Marquer comme traité
      webhookEvent.processed = true;
      webhookEvent.processedAt = new Date();
      await this.webhookEventRepo.save(webhookEvent);

      return { received: true };
    } catch (error) {
      this.logger.error(`Erreur traitement webhook Stripe: ${(error as Error).message}`);
      throw error;
    }
  }

  async handlePlaidWebhook(webhook: any, verification: string): Promise<{ received: boolean }> {
    this.logger.log(`Webhook Plaid reçu: ${webhook.webhook_type}`);

    try {
      const webhookEvent = this.webhookEventRepo.create({
        provider: 'plaid',
        eventType: webhook.webhook_type,
        payload: webhook,
        signature: verification,
        processed: false
      });

      await this.webhookEventRepo.save(webhookEvent);

      await this.processPlaidWebhook(webhook);

      webhookEvent.processed = true;
      webhookEvent.processedAt = new Date();
      await this.webhookEventRepo.save(webhookEvent);

      return { received: true };
    } catch (error) {
      this.logger.error(`Erreur traitement webhook Plaid: ${(error as Error).message}`);
      throw error;
    }
  }

  async handleBridgeWebhook(event: any): Promise<{ received: boolean }> {
    this.logger.log(`Webhook Bridge reçu`);

    try {
      const webhookEvent = this.webhookEventRepo.create({
        provider: 'bridge',
        eventType: event.type || 'unknown',
        payload: event,
        processed: false
      });

      await this.webhookEventRepo.save(webhookEvent);

      await this.processBridgeEvent(event);

      webhookEvent.processed = true;
      webhookEvent.processedAt = new Date();
      await this.webhookEventRepo.save(webhookEvent);

      return { received: true };
    } catch (error) {
      this.logger.error(`Erreur traitement webhook Bridge: ${(error as Error).message}`);
      throw error;
    }
  }

  async handleGenericWebhook(event: BankWebhookEvent, headers: Record<string, string>): Promise<{ received: boolean }> {
    this.logger.log(`Webhook générique reçu: ${event.eventType}`);

    try {
      const webhookEvent = this.webhookEventRepo.create({
        ...event,
        headers,
        processed: false
      });

      await this.webhookEventRepo.save(webhookEvent);

      // Traitement générique
      await this.processGenericEvent(event);

      webhookEvent.processed = true;
      webhookEvent.processedAt = new Date();
      await this.webhookEventRepo.save(webhookEvent);

      return { received: true };
    } catch (error) {
      this.logger.error(`Erreur traitement événement générique: ${(error as Error).message}`);
      throw error;
    }
  }

  async getWebhookHistory(provider?: string, limit: number = 50): Promise<BankWebhookEvent[]> {
    const where = provider ? { provider } : {};
    return this.webhookEventRepo.find({
      where,
      order: { createdAt: 'DESC' },
      take: limit
    });
  }

  async retryFailedWebhooks(): Promise<{ retried: number; successful: number }> {
    const failedWebhooks = await this.webhookEventRepo.find({
      where: { processed: false },
      order: { createdAt: 'ASC' },
      take: 10
    });

    let successful = 0;

    for (const webhook of failedWebhooks) {
      try {
        await this.retryWebhook(webhook);
        webhook.processed = true;
        webhook.processedAt = new Date();
        await this.webhookEventRepo.save(webhook);
        successful++;
      } catch (error) {
        this.logger.error(`Échec retry webhook ${webhook.id}: ${error.message}`);
      }
    }

    return { retried: failedWebhooks.length, successful };
  }

  private async processStripeEvent(event: any): Promise<void> {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailure(event.data.object);
        break;
      case 'account.updated':
        await this.handleAccountUpdate(event.data.object);
        break;
      default:
        this.logger.log(`Type d'événement Stripe non traité: ${event.type}`);
    }
  }

  private async processPlaidWebhook(webhook: any): Promise<void> {
    switch (webhook.webhook_type) {
      case 'TRANSACTIONS':
        await this.handlePlaidTransactions(webhook);
        break;
      case 'SYNC_UPDATES_AVAILABLE':
        await this.handlePlaidSyncUpdate(webhook);
        break;
      default:
        this.logger.log(`Type d'événement Plaid non traité: ${webhook.webhook_type}`);
    }
  }

  private async processBridgeEvent(event: any): Promise<void> {
    // Traitement des événements Bridge API
    this.logger.log(`Traitement événement Bridge: ${JSON.stringify(event)}`);
  }

  private async processGenericEvent(event: BankWebhookEvent): Promise<void> {
    // Traitement générique
    this.logger.log(`Traitement événement générique: ${event.eventType}`);
  }

  private async handlePaymentSuccess(payment: any): Promise<void> {
    // TODO: Implémenter sendPaymentNotification dans NotificationsService
    this.logger.log(`Paiement réussi: ${payment.amount}`);
    // await this.notificationsService.sendPaymentNotification({
    //   userId: payment.metadata?.userId,
    //   type: 'payment_success',
    //   data: { amount: payment.amount, currency: payment.currency }
    // });
  }

  private async handlePaymentFailure(payment: any): Promise<void> {
    // TODO: Implémenter sendPaymentNotification dans NotificationsService
    this.logger.error(`Paiement échoué: ${payment.amount}`);
    // await this.notificationsService.sendPaymentNotification({
    //   userId: payment.metadata?.userId,
    //   type: 'payment_failure',
    //   data: { amount: payment.amount, error: payment.last_payment_error?.message }
    // });
  }

  private async handleAccountUpdate(account: any): Promise<void> {
    this.logger.log(`Mise à jour compte Stripe: ${account.id}`);
  }

  private async handlePlaidTransactions(webhook: any): Promise<void> {
    this.logger.log(`Nouvelles transactions Plaid disponibles pour compte: ${webhook.account_id}`);
  }

  private async handlePlaidSyncUpdate(webhook: any): Promise<void> {
    this.logger.log(`Mise à jour sync Plaid pour compte: ${webhook.account_id}`);
  }

  private async retryWebhook(webhook: BankWebhookEvent): Promise<void> {
    // Retenter le traitement du webhook
    switch (webhook.provider) {
      case 'stripe':
        await this.processStripeEvent(webhook.payload);
        break;
      case 'plaid':
        await this.processPlaidWebhook(webhook.payload);
        break;
      case 'bridge':
        await this.processBridgeEvent(webhook.payload);
        break;
      default:
        await this.processGenericEvent(webhook);
    }
  }
}
