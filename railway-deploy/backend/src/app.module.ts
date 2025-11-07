import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { TerminusModule } from '@nestjs/terminus';
import { CacheModule } from '@nestjs/cache-manager';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TenantMiddleware } from './common/middleware/tenant.middleware';
import { PermissionsGuard } from './rbac/guards/permissions.guard';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { CacheInvalidationInterceptor } from './common/interceptors/cache-invalidation.interceptor';

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
import { ContactModule } from './contact/contact.module';

// HR & Payroll Modules
import { EmployeeModule } from './employees/employee.module';

// Profile-Specific Dashboards
import { ExpertComptableModule } from './expert-comptable/expert-comptable.module';
import { EntrepreneurModule } from './entrepreneur/entrepreneur.module';
import { HrManagerModule } from './hr-manager/hr-manager.module';
import { ManagerModule } from './manager/manager.module';
import { EmployeeDashboardModule } from './employee/employee.module';
import { FiscalAdminModule } from './fiscal-admin/fiscal-admin.module';
import { AdminSystemModule } from './admin-system/admin-system.module';
import { BankPartnerModule } from './bank-partner/bank-partner.module';

// Dashboard Module
import { DashboardModule } from './dashboard/dashboard.module';

// Controllers
import { HealthController } from './health/health.controller';
import { AppController } from './app.controller';

// Health Module
import { HealthModule } from './health/health.module';

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

    // Redis Cache - Activé avec support Railway
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        // Railway fournit REDIS_URL ou REDIS_HOST/REDIS_PORT
        const redisUrl = config.get('REDIS_URL');
        
        if (redisUrl) {
          // Parse REDIS_URL (format: redis://user:pass@host:port)
          try {
            const url = new URL(redisUrl);
            const configResult = {
              host: url.hostname,
              port: parseInt(url.port) || 6379,
              password: url.password || undefined,
              ttl: parseInt(config.get('CACHE_TTL_DEFAULT', '300')),
              max: parseInt(config.get('CACHE_MAX_ITEMS', '1000')),
            };
            if (config.get('NODE_ENV') !== 'production') {
              console.log(`✅ Redis configured from REDIS_URL: ${url.hostname}:${configResult.port}`);
            }
            return configResult;
          } catch (error) {
            if (config.get('NODE_ENV') !== 'production') {
              console.warn('⚠️ Invalid REDIS_URL, falling back to individual variables:', error);
            }
          }
        }
        
        // Fallback pour variables individuelles
        const fallbackConfig = {
          host: config.get('REDIS_HOST', 'localhost'),
          port: parseInt(config.get('REDIS_PORT', '6379')),
          password: config.get('REDIS_PASSWORD') || config.get('REDISPASSWORD'),
          ttl: parseInt(config.get('CACHE_TTL_DEFAULT', '300')),
          max: parseInt(config.get('CACHE_MAX_ITEMS', '1000')),
        };
        if (config.get('NODE_ENV') !== 'production') {
          console.log(`✅ Redis configured from individual variables: ${fallbackConfig.host}:${fallbackConfig.port}`);
        }
        return fallbackConfig;
      },
    }),

    // Event Emitter pour invalidation de cache
    EventEmitterModule.forRoot(),

    // Bull Queue (pour sync async) - Utilise Redis
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        // Utiliser REDIS_URL si disponible, sinon variables individuelles
        const redisUrl = config.get('REDIS_URL');
        
        if (redisUrl) {
          try {
            const url = new URL(redisUrl);
            return {
              redis: {
                host: url.hostname,
                port: parseInt(url.port) || 6379,
                password: url.password || undefined,
              },
            };
            } catch (error) {
            if (config.get('NODE_ENV') !== 'production') {
              console.warn('⚠️ Invalid REDIS_URL for Bull, using fallback');
            }
          }
        }
        
        return {
        redis: {
          host: config.get('REDIS_HOST', 'localhost'),
            port: parseInt(config.get('REDIS_PORT', '6379')),
            password: config.get('REDIS_PASSWORD') || config.get('REDISPASSWORD'),
          },
        };
        },
    }),

    // Health Check
    TerminusModule,
    HealthModule,

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
    ContactModule,
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
    FiscalAdminModule,
    AdminSystemModule,
    BankPartnerModule,
    
    // Dashboard Module (avec cache et temps réel)
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInvalidationInterceptor,
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
