import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import { TerminusModule } from '@nestjs/terminus';

// Core Modules
import { AuthModule } from './auth/auth.module';
import { CompaniesModule } from './companies/companies.module';
import { AccountingModule } from './accounting/accounting.module';
import { InvoicesModule } from './invoices/invoices.module';
import { PaymentsModule } from './payments/payments.module';
import { TaxModule } from './tax/tax.module';
import { CrmModule } from './crm/crm.module';

// AI & Analytics
import { AIModule } from './ai/ai.module';
import { ReportingModule } from './reporting/reporting.module';

// Financial Services
import { BankingModule } from './banking/banking.module';
import { MobileMoneyModule } from './mobile-money/mobile-money.module';
import { TreasuryModule } from './treasury/treasury.module';
import { ScoringModule } from './scoring/scoring.module';
import { LoansModule } from './loans/loans.module';

// Integration & Support
import { IntegrationsModule } from './integrations/integrations.module';
import { FrappeBridgeModule } from './frappe-bridge/frappe-bridge.module';
import { SyncModule } from './sync/sync.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuditModule } from './audit/audit.module';
import { UploadsModule } from './uploads/uploads.module';
import { NifModule } from './nif/nif.module';

// Controllers
import { HealthController } from './health/health.controller';
import { AppController } from './app.controller';

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

    // Scheduler (cron jobs)
    ScheduleModule.forRoot(),

    // Business Modules
    AuthModule,
    CompaniesModule,
    InvoicesModule,
    PaymentsModule,
    TreasuryModule,
    BankingModule,
    TaxModule,
    CrmModule,
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

    // Uploads
    UploadsModule,
  ],
  controllers: [AppController, HealthController],
})
export class AppModule {}
