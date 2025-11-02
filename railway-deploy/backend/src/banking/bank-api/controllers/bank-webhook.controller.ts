import { Controller, Post, Body, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { BankWebhookService } from '../services/bank-webhook.service';
import { BankWebhookEvent } from '../entities/bank-webhook-event.entity';

@ApiTags('Bank Webhooks')
@Controller('webhooks/bank')
export class BankWebhookController {
  constructor(private readonly webhookService: BankWebhookService) {}

  @Post('stripe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook Stripe pour les événements bancaires' })
  @ApiHeader({ name: 'stripe-signature', required: true })
  @ApiResponse({ status: 200, description: 'Webhook traité avec succès' })
  async handleStripeWebhook(
    @Body() event: any,
    @Headers('stripe-signature') signature: string
  ) {
    return this.webhookService.handleStripeWebhook(event, signature);
  }

  @Post('plaid')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook Plaid pour les synchronisations bancaires' })
  @ApiHeader({ name: 'plaid-verification', required: true })
  @ApiResponse({ status: 200, description: 'Webhook Plaid traité' })
  async handlePlaidWebhook(
    @Body() webhook: any,
    @Headers('plaid-verification') verification: string
  ) {
    return this.webhookService.handlePlaidWebhook(webhook, verification);
  }

  @Post('bridge')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook Bridge API pour les mises à jour' })
  @ApiResponse({ status: 200, description: 'Webhook Bridge traité' })
  async handleBridgeWebhook(@Body() event: any) {
    return this.webhookService.handleBridgeWebhook(event);
  }

  @Post('generic')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook générique pour les banques' })
  @ApiResponse({ status: 200, description: 'Webhook générique traité' })
  async handleGenericWebhook(
    @Body() event: BankWebhookEvent,
    @Headers() headers: Record<string, string>
  ) {
    return this.webhookService.handleGenericWebhook(event, headers);
  }
}
