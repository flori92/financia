import { Module } from '@nestjs/common';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsService } from './integrations.service';
import { BankingIntegrationService } from './services/banking-integration.service';
import { EcommerceIntegrationService } from './services/ecommerce-integration.service';
import { WebhookService } from './services/webhook.service';

@Module({
  imports: [],
  controllers: [IntegrationsController],
  providers: [
    IntegrationsService,
    BankingIntegrationService,
    EcommerceIntegrationService,
    WebhookService,
  ],
  exports: [IntegrationsService],
})
export class IntegrationsModule {}