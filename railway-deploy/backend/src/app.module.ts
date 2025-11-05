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

// Core Modules
import { AuthModule } from './auth/auth.module';
import { CompaniesModule } from './companies/companies.module';
import { AccountingModule } from './accounting/accounting.module';
import { InvoicesModule } from './invoices/invoices.module';
import { PaymentsModule } from './payments/payments.module';
import { TaxModule } from './tax/tax.module';
import { CrmModule } from './crm/crm.module';
import { DatabaseModule } from './database/database.module';

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

// New Modules
import { CommonModule } from './common/common.module';
import { GdprModule } from './gdpr/gdpr.module';
import { AutomationModule } from './automation/automation.module';
import { RbacModule } from './rbac/rbac.module';
import { BudgetModule } from './budget/budget.module';
import { PurchasesModule } from './purchases/purchases.module';
import { QuotesModule } from './quotes/quotes.module';
import { RevenueModule } from './revenue/revenue.module';
import { ControllingModule } from './controlling/controlling.module';
import { InventoryModule } from './modules/inventory/inventory.module';

// HR & Payroll Modules
import { EmployeeModule } from './employees/employee.module';

// Profile-Specific Dashboards
import { ExpertComptableModule } from './expert-comptable/expert-comptable.module';
import { EntrepreneurModule } from './entrepreneur/entrepreneur.module';
import { HrManagerModule } from './hr-manager/hr-manager.module';
import { ManagerModule } from './manager/manager.module';
import { EmployeeDashboardModule } from './employee/employee.module';

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
      useFactory: (config: ConfigService) => {
        // Priorité à DATABASE_URL (Railway), sinon variables individuelles
        const databaseUrl = config.get('DATABASE_URL');
        
        if (databaseUrl) {
          // Parse DATABASE_URL pour TypeORM
          const url = new URL(databaseUrl);
          return {
            type: 'postgres',
            host: url.hostname,
            port: parseInt(url.port) || 5432,
            username: url.username,
            password: url.password,
            database: url.pathname.substring(1), // Enlever le /
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: false, // ⚠️ DÉSACTIVÉ - utiliser migrations manuelles
            logging: config.get('NODE_ENV') === 'development',
          };
        }
        
        // Fallback variables individuelles
        return {
          type: 'postgres',
          host: config.get('DATABASE_HOST') || config.get('DB_HOST') || 'localhost',
          port: parseInt(config.get('DATABASE_PORT')) || parseInt(config.get('DB_PORT')) || 5432,
          username: config.get('DATABASE_USER') || config.get('DB_USER') || 'postgres',
          password: config.get('DATABASE_PASSWORD') || config.get('DB_PASSWORD') || 'postgres',
          database: config.get('DATABASE_NAME') || config.get('DB_NAME') || 'bms',
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: false, // ⚠️ DÉSACTIVÉ - utiliser migrations manuelles
          logging: config.get('NODE_ENV') === 'development',
        };
      },
    }),

    // Redis Cache (désactivé temporairement)

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

    // Uploads
    UploadsModule,

    // New Modules
    CommonModule,
    GdprModule,
    AutomationModule,
    RbacModule,
    AIModule,
    BudgetModule,
    InventoryModule,
    PurchasesModule,
    // ✅ Modules ACTIVÉS
    ReportingModule,
    IntegrationsModule,
    QuotesModule,
    RevenueModule,
    ControllingModule,
    
    // HR & Payroll
    EmployeeModule,
    
    // Profile-Specific Dashboards
    ExpertComptableModule,
    EntrepreneurModule,
    HrManagerModule,
    ManagerModule,
    EmployeeDashboardModule,
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
