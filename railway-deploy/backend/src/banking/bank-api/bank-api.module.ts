import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';

// Services
import { BankApiService } from './services/bank-api.service';
import { BankConnectionService } from './services/bank-connection.service';
import { BankSyncService } from './services/bank-sync.service';
import { BankAnalyticsService } from './services/bank-analytics.service';
import { BankWebhookService } from './services/bank-webhook.service';

// Controllers
import { BankApiController } from './controllers/bank-api.controller';
import { BankWebhookController } from './controllers/bank-webhook.controller';

// Entities
import { BankConnection } from './entities/bank-connection.entity';
import { BankAccount } from './entities/bank-account.entity';
import { BankTransaction } from './entities/bank-transaction.entity';
import { BankAnomaly } from './entities/bank-anomaly.entity';
import { BankWebhookEvent } from './entities/bank-webhook-event.entity';

// Providers
import { EcobankProvider } from './providers/ecobank.provider';
import { BOAProvider } from './providers/boa.provider';
import { OrabankProvider } from './providers/orabank.provider';
import { BceaoProvider } from './providers/bceao.provider';
import { MtnProvider } from './providers/mtn.provider';
import { OrangeProvider } from './providers/orange.provider';
import { MoovProvider } from './providers/moov.provider';

// Modules
import { NotificationsModule } from '../../notifications/notifications.module';
import { AIModule } from '../../ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BankConnection,
      BankAccount,
      BankTransaction,
      BankAnomaly,
      BankWebhookEvent
    ]),
    BullModule.registerQueue({
      name: 'bank-sync',
    }),
    BullModule.registerQueue({
      name: 'bank-webhooks',
    }),
    ConfigModule,
    NotificationsModule,
    AIModule
  ],
  controllers: [
    BankApiController,
    BankWebhookController
  ],
  providers: [
    BankApiService,
    BankConnectionService,
    BankSyncService,
    BankAnalyticsService,
    BankWebhookService,
    // Providers spécifiques aux banques
    {
      provide: 'BANK_API_PROVIDERS',
      useValue: {
        // Afrique de l'Ouest
        'ECOBANK': new EcobankProvider(),
        'BOA': new BOAProvider(),
        'ORABANK': new OrabankProvider(),
        'BCEAO': new BceaoProvider(),
        // Mobile Money
        'MTN': new MtnProvider(),
        'ORANGE': new OrangeProvider(),
        'MOOV': new MoovProvider(),
      }
    }
  ],
  exports: [
    BankApiService,
    BankConnectionService,
    BankSyncService,
    BankAnalyticsService
  ]
})
export class BankApiModule {}