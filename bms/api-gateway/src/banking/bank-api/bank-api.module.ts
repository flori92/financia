import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { BankApiService } from './services/bank-api.service';
import { BankConnectionService } from '../bank-connection/services/bank-connection.service';
import { BankApiController } from './controllers/bank-api.controller';
import { BankConnection } from '../bank-connection/entities/bank-connection.entity';
import { BankAccount } from './entities/bank-account.entity';
import { BankTransaction } from './entities/bank-transaction.entity';
import { BankAnomaly } from './entities/bank-anomaly.entity';
import { BullModule } from '@nestjs/bull';
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
    BullModule.registerQueue({
      name: 'bank-sync',
    }),
    ConfigModule,
    NotificationsModule,
    AIModule
  ],
  controllers: [
    BankApiController
  ],
  providers: [
    BankApiService,
    BankConnectionService,
    // Providers spécifiques aux banques
    {
      provide: 'BANK_API_PROVIDERS',
      useValue: {
        // Banques Afrique de l'Ouest
        ECOBANK: () => import('./providers/ecobank.provider'),
        BOA: () => import('./providers/boa.provider'),
        ORABANK: () => import('./providers/orabank.provider'),
        BCEAO: () => import('./providers/bceao.provider'),
        UBA_BENIN: () => import('./providers/uba-benin.provider'),
        SG_BENIN: () => import('./providers/societe-generale-benin.provider'),
        // Banques France
        BNP_PARIBAS_FR: () => import('./providers/bnp-paribas.provider'),
      }
    }
  ],
  exports: [
    BankApiService,
    BankConnectionService
  ]
})
export class BankApiModule {}