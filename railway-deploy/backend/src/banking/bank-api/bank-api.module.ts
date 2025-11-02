import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { BankApiService } from './services/bank-api.service';
import { BankConnection } from './entities/bank-connection.entity';
import { BankAccount } from './entities/bank-account.entity';
import { BankTransaction } from './entities/bank-transaction.entity';
import { BankAnomaly } from './entities/bank-anomaly.entity';
// import { BullModule } from '@nestjs/bull'; // Désactivé pour éviter erreurs Redis
import { NotificationsModule } from '../../notifications/notifications.module';
import { AIModule } from '../../ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BankConnection,
      BankAccount,
      BankTransaction,
      BankAnomaly
    ]),
    // BullModule.registerQueue({ // Désactivé pour éviter erreurs Redis
    //   name: 'bank-sync',
    // }),
    ConfigModule,
    NotificationsModule,
    AIModule
  ],
  controllers: [
    // BankApiController, // Désactivé - fichier manquant
  ],
  providers: [
    BankApiService,
    // BankConnectionService, // Désactivé - fichier manquant
    // BankSyncService, // Désactivé - fichier manquant
    // BankAnalyticsService, // Désactivé - fichier manquant
    // Providers spécifiques aux banques
    // {
    //   provide: 'BANK_API_PROVIDERS',
    //   useValue: {
    //     // Afrique de l'Ouest
    //     'ECOBANK': () => import('./providers/ecobank.provider'),
    //     'BOA': () => import('./providers/boa.provider'),
    //     'ORABANK': () => import('./providers/orabank.provider'),
    //     'BCEAO': () => import('./providers/bceao.provider'),
    //     // Mobile Money
    //     'MTN': () => import('./providers/mtn.provider'),
    //     'ORANGE': () => import('./providers/orange.provider'),
    //     'MOOV': () => import('./providers/moov.provider'),
    //   }
    // }
  ],
  exports: [
    BankApiService
  ]
})
export class BankApiModule {}