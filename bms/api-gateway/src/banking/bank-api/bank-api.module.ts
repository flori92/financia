import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { BankApiService } from './services/bank-api.service';
import { BankConnectionService } from './services/bank-connection.service';
import { BankSyncService } from './services/bank-sync.service';
import { BankAnalyticsService } from './services/bank-analytics.service';
import { BankApiController } from './controllers/bank-api.controller';
import { BankWebhookController } from './controllers/bank-webhook.controller';
import { BankConnection } from './entities/bank-connection.entity';
import { BankAccount } from './entities/bank-account.entity';
import { BankTransaction } from './entities/bank-transaction.entity';
import { BankAnomaly } from './entities/bank-anomaly.entity';
import { BankWebhookEvent } from './entities/bank-webhook-event.entity';
import { BullModule } from '@nestjs/bull';
import { NotificationsModule } from '../notifications/notifications.module';
import { AIModule } from '../ai/ai.module';

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
    // Providers spécifiques aux banques
    {
      provide: 'BANK_API_PROVIDERS',
      useValue: {
        // Afrique de l'Ouest
        'ECOBANK': () => import('./providers/ecobank.provider'),
        'BOA': () => import('./providers/boa.provider'),
        'ORABANK': () => import('./providers/orabank.provider'),
        'BCEAO': () => import('./providers/bceao.provider'),
        // Mobile Money
        'MTN': () => import('./providers/mtn.provider'),
        'ORANGE': () => import('./providers/orange.provider'),
        'MOOV': () => import('./providers/moov.provider'),
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