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
// Legacy Banking (transactions CSV importées)
import { BankTransaction } from '../banking/entities/bank-transaction.entity';
import { BankAccount } from '../banking/entities/bank-account.entity';
import { BankReconciliation } from '../banking/entities/bank-reconciliation.entity';
// Bank API (connexions externes)
import { BankConnection } from '../banking/bank-api/entities/bank-connection.entity';
// BankAnomaly exclus du module principal (utilisé uniquement dans bank-api)

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
  
  // Banking (priorité aux entités locales pour CSV import)
  BankTransaction,
  BankAccount,
  BankReconciliation,
  // Bank API (connexions externes)
  BankConnection,
  // BankAnomaly exclus du module principal (utilisé uniquement dans bank-api)
  
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
        const dbPassword = configService.get<string>('DB_PASSWORD');
        const nodeEnv = configService.get<string>('NODE_ENV') || 'production';
        const isRailway = !!configService.get<string>('RAILWAY_ENVIRONMENT');
        const isProduction = nodeEnv === 'production' || isRailway;
        
        // TEMPORAIRE: Activer synchronize pour création tables en production
        const synchronize = !isProduction && nodeEnv === 'development';
        const logging = !isProduction && nodeEnv === 'development';
        
        // DEBUG: Afficher toutes les variables DB disponibles
        console.log(' All DB Environment Variables:', {
          DATABASE_URL: !!databaseUrl,
          DB_PASSWORD: !!dbPassword,
          DATABASE_PASSWORD: !!configService.get<string>('DATABASE_PASSWORD'),
          DB_HOST: !!configService.get<string>('DB_HOST'),
          DATABASE_HOST: !!configService.get<string>('DATABASE_HOST'),
          DB_PORT: !!configService.get<string>('DB_PORT'),
          DATABASE_PORT: !!configService.get<string>('DATABASE_PORT'),
          DB_USER: !!configService.get<string>('DB_USER'),
          DATABASE_USER: !!configService.get<string>('DATABASE_USER'),
          DB_NAME: !!configService.get<string>('DB_NAME'),
          DATABASE_NAME: !!configService.get<string>('DATABASE_NAME'),
          PGUSER: !!configService.get<string>('PGUSER'),
          PGPASSWORD: !!configService.get<string>('PGPASSWORD'),
          PGDATABASE: !!configService.get<string>('PGDATABASE'),
          PGHOST: !!configService.get<string>('PGHOST'),
          PGPORT: !!configService.get<string>('PGPORT'),
          RAILWAY_ENVIRONMENT: !!configService.get<string>('RAILWAY_ENVIRONMENT'),
          RAILWAY_PUBLIC_DOMAIN: !!configService.get<string>('RAILWAY_PUBLIC_DOMAIN'),
          RAILWAY_SERVICE_NAME: !!configService.get<string>('RAILWAY_SERVICE_NAME')
        });
        
        console.log(' Database config:', { 
          nodeEnv,
          isRailway,
          isProduction,
          synchronize,
          logging,
          hasDatabaseUrl: !!databaseUrl, 
          hasDbPassword: !!dbPassword 
        });
        
        // Si DATABASE_URL est définie, l'utiliser directement
        if (databaseUrl) {
          console.log(' Using DATABASE_URL for connection');
          return {
            type: 'postgres',
            url: databaseUrl,
            entities: ALL_ENTITIES,
            synchronize, // false en production
            logging,
            ssl: isProduction ? { rejectUnauthorized: false } : false,
          };
        }
        
        // Sinon utiliser les paramètres individuels (Railway ou dev local)
        // Railway utilise des variables avec préfixe DATABASE_
        const dbHost = isRailway 
          ? configService.get<string>('DATABASE_HOST') || configService.get<string>('DB_HOST') || configService.get<string>('PGHOST') || 'postgres.railway.internal'
          : configService.get<string>('DB_HOST') || 'localhost';
        const dbPort = configService.get<number>('DATABASE_PORT') || configService.get<number>('DB_PORT') || parseInt(configService.get<string>('PGPORT') || '5432');
        const dbUser = isRailway
          ? configService.get<string>('DATABASE_USER') || configService.get<string>('DB_USER') || configService.get<string>('PGUSER') || 'postgres'
          : configService.get<string>('DB_USER') || 'postgres';
        const dbName = isRailway
          ? configService.get<string>('DATABASE_NAME') || configService.get<string>('DB_NAME') || configService.get<string>('PGDATABASE') || 'railway'
          : configService.get<string>('DB_NAME') || 'bms_dev';
        
        // Essayer plusieurs sources pour le mot de passe
        const finalPassword = dbPassword || 
                              configService.get<string>('DATABASE_PASSWORD') ||
                              configService.get<string>('PGPASSWORD') || 
                              configService.get<string>('RAILWAY_POSTGRES_PASSWORD') ||
                              configService.get<string>('POSTGRES_PASSWORD');
        
        console.log(` Using individual params (${isRailway ? 'Railway' : 'Dev'} mode):`, { 
          dbHost, 
          dbPort, 
          dbUser, 
          dbName, 
          hasPassword: !!finalPassword,
          passwordSource: dbPassword ? 'DB_PASSWORD' : 
                          configService.get<string>('DATABASE_PASSWORD') ? 'DATABASE_PASSWORD' :
                          configService.get<string>('PGPASSWORD') ? 'PGPASSWORD' :
                          configService.get<string>('RAILWAY_POSTGRES_PASSWORD') ? 'RAILWAY_POSTGRES_PASSWORD' :
                          configService.get<string>('POSTGRES_PASSWORD') ? 'POSTGRES_PASSWORD' : 'NONE'
        });
        
        // ERREUR: Si aucun mot de passe n'est disponible sur Railway
        if (isRailway && !finalPassword) {
          console.error(' ERREUR CRITIQUE: Aucun mot de passe PostgreSQL trouvé sur Railway !');
          console.error(' Variables requises: DATABASE_PASSWORD ou DB_PASSWORD ou PGPASSWORD ou RAILWAY_POSTGRES_PASSWORD');
          throw new Error('Configuration PostgreSQL incomplète sur Railway: mot de passe manquant');
        }
        
        return {
          type: 'postgres',
          host: dbHost,
          port: dbPort,
          username: dbUser,
          password: finalPassword, // Utiliser le mot de passe final trouvé
          database: dbName,
          entities: ALL_ENTITIES,
          synchronize, // false en production
          logging,
          ssl: isProduction ? { rejectUnauthorized: false } : false,
        };
      },
    }),
    TypeOrmModule.forFeature(ALL_ENTITIES),
  ],
  controllers: [SeedController],
  providers: [SimpleTestSeedService],
  exports: [SimpleTestSeedService],
})
export class DatabaseModule {}
