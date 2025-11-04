import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { IntegrationsService } from './integrations.service';

@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Post('banking/connect')
  async connectBankAccount(@Body() connectionDetails: any) {
    return this.integrationsService.connectBankAccount(connectionDetails);
  }

  @Post('ecommerce/sync')
  async syncEcommerce(@Body() syncParams: any) {
    return this.integrationsService.syncEcommerce(syncParams);
  }

  @Post('webhooks/register')
  async registerWebhook(@Body() webhookConfig: any) {
    return this.integrationsService.registerWebhook(webhookConfig);
  }

  @Get('banking/:accountId/transactions')
  async getBankTransactions(@Param('accountId') accountId: string) {
    return this.integrationsService.getBankTransactions(accountId);
  }

  @Get('ecommerce/orders')
  async getEcommerceOrders() {
    return this.integrationsService.getEcommerceOrders();
  }
}