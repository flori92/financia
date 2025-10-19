import { Module } from '@nestjs/common';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsService } from './integrations.service';
import {
  BankingIntegrationService,
  EcommerceIntegrationService,
  WebhookService,
} from './services';

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