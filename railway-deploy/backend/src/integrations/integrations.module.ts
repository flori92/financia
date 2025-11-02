import { Module } from '@nestjs/common';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsService } from './integrations.service';
import {
  BankingIntegrationService,
  EcommerceIntegrationService,
  WebhookService,
} from './services';

// Banking
import { OpenBankingService } from './banking/open-banking.service';
import { BridgeApiService } from './banking/bridge-api.service';
import { BudgetInsightService } from './banking/budget-insight.service';

// E-commerce
import { WooCommerceService } from './ecommerce/woocommerce.service';
import { ShopifyService } from './ecommerce/shopify.service';
import { PrestaShopService } from './ecommerce/prestashop.service';

@Module({
  imports: [],
  controllers: [IntegrationsController],
  providers: [
    IntegrationsService,
    BankingIntegrationService,
    EcommerceIntegrationService,
    WebhookService,
    // Banking
    OpenBankingService,
    BridgeApiService,
    BudgetInsightService,
    // E-commerce
    WooCommerceService,
    ShopifyService,
    PrestaShopService,
  ],
  exports: [
    IntegrationsService,
    OpenBankingService,
    BridgeApiService,
    BudgetInsightService,
    WooCommerceService,
    ShopifyService,
    PrestaShopService,
  ],
})
export class IntegrationsModule {}