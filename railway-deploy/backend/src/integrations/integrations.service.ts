import { Injectable } from '@nestjs/common';
import { BankingIntegrationService } from './services/banking-integration.service';
import { EcommerceIntegrationService } from './services/ecommerce-integration.service';
import { WebhookService } from './services/webhook.service';

@Injectable()
export class IntegrationsService {
  constructor(
    private readonly bankingIntegration: BankingIntegrationService,
    private readonly ecommerceIntegration: EcommerceIntegrationService,
    private readonly webhook: WebhookService,
  ) {}

  async connectBankAccount(connectionDetails: any) {
    return this.bankingIntegration.connect(connectionDetails);
  }

  async syncEcommerce(syncParams: any) {
    return this.ecommerceIntegration.sync(syncParams);
  }

  async registerWebhook(webhookConfig: any) {
    return this.webhook.register(webhookConfig);
  }

  async getBankTransactions(accountId: string) {
    return this.bankingIntegration.getTransactions(accountId);
  }

  async getEcommerceOrders() {
    return this.ecommerceIntegration.getOrders();
  }
}