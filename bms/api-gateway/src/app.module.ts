import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import { TerminusModule } from '@nestjs/terminus';

// Modules
import { AuthModule } from './auth/auth.module';
import { CompaniesModule } from './companies/companies.module';
import { InvoicesModule } from './invoices/invoices.module';
import { PaymentsModule } from './payments/payments.module';
import { MobileMoneyModule } from './mobile-money/mobile-money.module';
import { AccountingModule } from './accounting/accounting.module';
import { SyncModule } from './sync/sync.module';
import { NifModule } from './nif/nif.module';
import { ScoringModule } from './scoring/scoring.module';
import { LoansModule } from './loans/loans.module';
import { FrappeBridgeModule } from './frappe-bridge/frappe-bridge.module';
import { HealthController } from './health/health.controller';
import { AppController } from './app.controller';
import { NotificationsModule } from './notifications/notifications.module';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get('DB_PORT', 5432),
        username: config.get('DB_USER', 'bms'),
        password: config.get('DB_PASSWORD', 'bms_dev_password'),
        database: config.get('DB_NAME', 'bms'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: config.get('NODE_ENV') === 'development', // ATTENTION: false en production
        logging: config.get('NODE_ENV') === 'development',
      }),
    }),

    // Redis Cache
    CacheModule.register({
      isGlobal: true,
      ttl: 300, // 5 minutes par défaut
    }),

    // Bull Queue (pour sync async)
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get('REDIS_HOST', 'localhost'),
          port: config.get('REDIS_PORT', 6379),
        },
      }),
    }),

    // Health Check
    TerminusModule,

    // Business Modules
    AuthModule,
    CompaniesModule,
    InvoicesModule,
    PaymentsModule,
    MobileMoneyModule,
    AccountingModule,
    SyncModule,
    
    // BMS Specific Modules
    NifModule,
    ScoringModule,
    LoansModule,

    // Frappe Integration
    FrappeBridgeModule,

    // Notifications
    NotificationsModule,
    AuditModule,
  ],
  controllers: [AppController, HealthController],
})
export class AppModule {}
