import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as entities from './entities';
import { SimpleTestSeedService } from './seeds/simple-test.seed';
import { SeedController } from './seed.controller';

// ========================================
// ANALYSE COMPLÈTE DE TOUTES LES ENTITÉS
// ========================================

// 1. AUTH & RBAC Entities (Core)
import { User } from '../auth/entities/user.entity';
import { Role } from '../rbac/entities/role.entity';
import { Permission } from '../rbac/entities/permission.entity';

// 2. Company Entities
import { Company } from '../companies/entities/company.entity';

// 3. Accounting Entities (Core Financial)
import { Account } from '../accounting/entities/account.entity';
import { JournalEntry } from '../accounting/entities/journal-entry.entity';
import { JournalEntryLine } from '../accounting/entities/journal-entry-line.entity';
import { Asset } from '../accounting/entities/asset.entity';
import { PeriodClosure } from '../accounting/entities/period-closure.entity';
import { AccountingEntry } from '../accounting/entities/accounting-entry.entity';

// 4. Invoice & Billing Entities
import { Invoice } from '../invoices/entities/invoice.entity';
import { InvoiceItem } from '../invoices/entities/invoice-item.entity';

// 5. Payment & Transaction Entities
import { Payment } from '../payments/entities/payment.entity';
import { PaymentAllocation } from '../payments/entities/payment-allocation.entity';

// 6. Mobile Money Entities
import { MobileMoneyTransaction } from '../mobile-money/entities/mobile-money-transaction.entity';

// 7. Banking Entities (Legacy + API)
// Legacy Banking
import { BankReconciliation } from '../banking/entities/bank-reconciliation.entity';
// Bank API (prioritaire - plus complet)
import { BankConnection } from '../banking/bank-api/entities/bank-connection.entity';
import { BankAccount } from '../banking/bank-api/entities/bank-account.entity';
import { BankTransaction } from '../banking/bank-api/entities/bank-transaction.entity';
import { BankAnomaly } from '../banking/bank-api/entities/bank-anomaly.entity';

// 8. CRM & Sales Entities
import { Contact } from '../crm/entities/contact.entity';
import { Tag } from '../crm/entities/tag.entity';
import { Activity } from '../crm/entities/activity.entity';
import { Opportunity } from '../crm/entities/opportunity.entity';
import { PipelineStage } from '../crm/entities/pipeline-stage.entity';
import { ContactImport } from '../crm/entities/contact-import.entity';
import { Campaign } from '../crm/campaigns/campaign.entity';

// 9. Budget & Planning Entities
import { Budget } from '../budget/entities/budget.entity';
import { BudgetLine } from '../budget/entities/budget-line.entity';

// 10. Treasury & Cash Management
import { DirectDebit } from '../treasury/entities/direct-debit.entity';

// 11. NIF & Compliance Entities
import { NifRequest } from '../nif/entities/nif-request.entity';

// 12. Loans & Credit Entities
import { LoanApplication } from '../loans/entities/loan-application.entity';

// 13. Scoring & Risk Entities
import { CreditScore } from '../scoring/entities/credit-score.entity';

// 14. AI & Analytics Entities
import { TransactionAnomaly } from '../ai/entities/transaction-anomaly.entity';

// 15. Audit & Logging Entities
import { AuditLog } from '../audit/entities/audit-log.entity';

// 16. File & Upload Management
import { Upload } from '../uploads/entities/upload.entity';

// 17. Purchase Management
import { PurchaseOrder } from '../purchases/entities/purchase-order.entity';
import { PurchaseReceipt } from '../purchases/entities/purchase-receipt.entity';

// 18. Quote Management
import { Quote } from '../quotes/entities/quote.entity';

// 19. Notification System
import { Notification } from '../notifications/entities/notification.entity';

// 20. Reconciliation Entities
import { ReconciliationMatch } from '../banking/reconciliation/entities/reconciliation-match.entity';

// ========================================
// CONFIGURATION TYPEORM COMPLÈTE
// ========================================

const ALL_ENTITIES = [
  // Database core entities
  ...Object.values(entities),
  
  // Auth & RBAC
  User,
  Role,
  Permission,
  
  // Company
  Company,
  
  // Accounting
  Account,
  JournalEntry,
  JournalEntryLine,
  Asset,
  PeriodClosure,
  AccountingEntry,
  
  // Invoices & Billing
  Invoice,
  InvoiceItem,
  
  // Payments & Transactions
  Payment,
  PaymentAllocation,
  
  // Mobile Money
  MobileMoneyTransaction,
  
  // Banking (priorité Bank API)
  BankConnection,
  BankAccount,
  BankTransaction,
  BankAnomaly,
  BankReconciliation,
  
  // CRM & Sales
  Contact,
  Tag,
  Activity,
  Opportunity,
  PipelineStage,
  ContactImport,
  Campaign,
  
  // Budget & Planning
  Budget,
  BudgetLine,
  
  // Treasury
  DirectDebit,
  
  // Compliance
  NifRequest,
  
  // Loans & Credit
  LoanApplication,
  
  // Scoring & Risk
  CreditScore,
  
  // AI & Analytics
  TransactionAnomaly,
  
  // Audit & Logging
  AuditLog,
  
  // File Management
  Upload,
  
  // Purchase Management
  PurchaseOrder,
  PurchaseReceipt,
  
  // Quote Management
  Quote,
  
  // Notifications
  Notification,
  
  // Reconciliation
  ReconciliationMatch,
];

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        const dbHost = configService.get<string>('DB_HOST') || 'postgres.railway.internal';
        const dbPort = configService.get<number>('DB_PORT') || 5432;
        const dbUser = configService.get<string>('DB_USER') || 'postgres';
        const dbPassword = configService.get<string>('DB_PASSWORD');
        const dbName = configService.get<string>('DB_NAME') || 'railway';
        
        console.log('🔧 TypeORM config:', { dbHost, dbPort, dbUser, dbName });
        console.log('🔗 Database connection: postgres://****:****@', dbHost, ':', dbPort, '/', dbName);
        
        // Utiliser les paramètres individuels au lieu de l'URL pour éviter les problèmes de parsing
        const config: any = {
          type: 'postgres',
          host: dbHost,
          port: dbPort,
          username: dbUser,
          password: dbPassword,
          database: dbName,
          entities: ALL_ENTITIES,
          synchronize: configService.get('NODE_ENV') === 'development',
          logging: configService.get('NODE_ENV') === 'development',
          // Force IPv4 pour éviter les problèmes avec ::1
          extra: {
            host: dbHost,
          },
        };
        
        // Fallback sur DATABASE_URL si les variables individuelles ne sont pas définies
        if (!dbPassword && databaseUrl) {
          config.url = databaseUrl;
          delete config.host;
          delete config.port;
          delete config.username;
          delete config.password;
          delete config.database;
        }
        
        return config;
      },
    }),
    TypeOrmModule.forFeature(ALL_ENTITIES),
  ],
  controllers: [SeedController],
  providers: [SimpleTestSeedService],
  exports: [SimpleTestSeedService],
})
export class DatabaseModule {}
