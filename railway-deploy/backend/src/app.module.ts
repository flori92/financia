import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { TerminusModule } from '@nestjs/terminus';
import { TenantMiddleware } from './common/middleware/tenant.middleware';
import { PermissionsGuard } from './rbac/guards/permissions.guard';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';

// Entities
import { Company } from './companies/entities/company.entity';
import { User } from './auth/entities/user.entity';
import { AuditLog } from './audit/entities/audit-log.entity';
import { JournalEntry } from './accounting/entities/journal-entry.entity';
import { JournalEntryLine } from './accounting/entities/journal-entry-line.entity';
import { BankAccount } from './banking/entities/bank-account.entity';
import { BankTransaction } from './banking/entities/bank-transaction.entity';
import { Invoice } from './invoices/entities/invoice.entity';
import { InvoiceItem } from './invoices/entities/invoice-item.entity';
import { NotificationConfig } from './notifications/entities/notification-config.entity';

// Core Modules
import { AuthModule } from './auth/auth.module';
import { CompaniesModule } from './companies/companies.module';
import { AccountingModule } from './accounting/accounting.module';
import { InvoicesModule } from './invoices/invoices.module';
import { PaymentsModule } from './payments/payments.module';
import { TaxModule } from './tax/tax.module';
import { CrmModule } from './crm/crm.module';
import { DatabaseModule } from './database/database.module';
import { AuditModule } from './audit/audit.module';
import { NotificationsModule } from './notifications/notifications.module';

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
import { UploadsModule } from './uploads/uploads.module';
import { NifModule } from './nif/nif.module';

// New Modules
import { CommonModule } from './common/common.module';
import { GdprModule } from './gdpr/gdpr.module';
import { AutomationModule } from './automation/automation.module';
import { RbacModule } from './rbac/rbac.module';
import { BudgetModule } from './budget/budget.module';
import { HRModule } from './hr/hr.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { QuotesModule } from './quotes/quotes.module';
import { RevenueModule } from './revenue/revenue.module';
import { ControllingModule } from './controlling/controlling.module';
import { PurchasesModule } from './purchases/purchases.module';

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
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST', 'localhost'),
        port: configService.get<number>('DATABASE_PORT', 5432),
        username: configService.get<string>('DATABASE_USER', 'postgres'),
        password: configService.get<string>('DATABASE_PASSWORD', 'postgres'),
        database: configService.get<string>('DATABASE_NAME', 'bms_erp'),
        entities: [
          Company,
          User,
          AuditLog,
          JournalEntry,
          JournalEntryLine,
          BankAccount,
          BankTransaction,
          Invoice,
          InvoiceItem,
          NotificationConfig,
        ],
        synchronize: process.env.NODE_ENV === 'development',
        logging: process.env.NODE_ENV === 'development',
        migrationsRun: true,
        migrations: ['src/migrations/*.ts'],
      }),
      inject: [ConfigService],
    }),

    // Redis Cache (désactivé temporairement)

    // Bull Queue (configuré pour Railway Redis)
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get('REDIS_HOST', 'localhost'),
          port: parseInt(config.get('REDIS_PORT', '6379')),
          password: config.get('REDIS_PASSWORD'),
          db: parseInt(config.get('REDIS_DB', '0')),
          connectTimeout: 10000,
          lazyConnect: true,
          maxRetriesPerRequest: 3,
          retryDelayOnFailover: 100,
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
    CrmModule,
    TaxModule,
    MobileMoneyModule,
    AccountingModule,
    SyncModule,
    DatabaseModule,
    
    // BMS Specific Modules
    NifModule,
    ScoringModule,
    LoansModule,

    // Frappe Integration
    FrappeBridgeModule,

    // Notifications
    NotificationsModule,
    AuditModule,
    SyncModule,

    // Uploads
    UploadsModule,

    // New Modules
    CommonModule,
    GdprModule,
    AutomationModule,
    RbacModule,
    AIModule,
    BudgetModule,
    HRModule,
    InventoryModule,
    PurchasesModule,
    QuotesModule,
    RevenueModule,
    ControllingModule,
    ReportingModule,
    IntegrationsModule,
  ],
  controllers: [AppController, HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .exclude(
        'api/v1/auth/login',
        'api/v1/auth/register',
        'api/v1/auth/refresh',
        'api/v1/health/(.*)',
        'api/docs/(.*)',
      )
      .forRoutes('*');
  }
}
