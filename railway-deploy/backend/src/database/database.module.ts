import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as entities from './entities';
import { SimpleTestSeedService } from './seeds/simple-test.seed';
import { SeedController } from './seed.controller';

// Auth entities
import { User } from '../auth/entities/user.entity';

// RBAC entities
import { Role } from '../rbac/entities/role.entity';
import { Permission } from '../rbac/entities/permission.entity';

// Company entities
import { Company } from '../companies/entities/company.entity';

// Accounting entities
import { Account } from '../accounting/entities/account.entity';
import { JournalEntry } from '../accounting/entities/journal-entry.entity';
import { JournalEntryLine } from '../accounting/entities/journal-entry-line.entity';
import { Asset } from '../accounting/entities/asset.entity';
import { PeriodClosure } from '../accounting/entities/period-closure.entity';

// Invoice entities
import { Invoice } from '../invoices/entities/invoice.entity';
import { InvoiceItem } from '../invoices/entities/invoice-item.entity';

// Payment entities
import { Payment } from '../payments/entities/payment.entity';
import { PaymentAllocation } from '../payments/entities/payment-allocation.entity';

// Mobile Money entities
import { MobileMoneyTransaction } from '../mobile-money/entities/mobile-money-transaction.entity';

// Banking entities
import { BankAccount } from '../banking/entities/bank-account.entity';
import { BankTransaction } from '../banking/entities/bank-transaction.entity';
import { BankReconciliation } from '../banking/entities/bank-reconciliation.entity';

// CRM entities
import { Contact } from '../crm/entities/contact.entity';
import { Tag } from '../crm/entities/tag.entity';
import { Activity } from '../crm/entities/activity.entity';
import { Opportunity } from '../crm/entities/opportunity.entity';
import { PipelineStage } from '../crm/entities/pipeline-stage.entity';
import { ContactImport } from '../crm/entities/contact-import.entity';

// Budget entities
import { Budget } from '../budget/entities/budget.entity';
import { BudgetLine } from '../budget/entities/budget-line.entity';

// Treasury entities
import { DirectDebit } from '../modules/treasury/entities/direct-debit.entity';

// NIF entities
import { NifRequest } from '../nif/entities/nif-request.entity';

// Loans entities
import { LoanApplication } from '../loans/entities/loan-application.entity';

// Scoring entities
import { CreditScore } from '../scoring/entities/credit-score.entity';

// AI entities
import { TransactionAnomaly } from '../ai/entities/transaction-anomaly.entity';

// Audit entities
import { AuditLog } from '../audit/entities/audit-log.entity';

// Upload entities
import { Upload } from '../uploads/entities/upload.entity';

// Purchases entities
import { PurchaseOrder } from '../purchases/entities/purchase-order.entity';
import { PurchaseReceipt } from '../purchases/entities/purchase-receipt.entity';

// Quotes entities
import { Quote } from '../quotes/entities/quote.entity';

// Notification entities
import { Notification } from '../notifications/entities/notification.entity';

// Campaign entities
import { Campaign } from '../crm/campaigns/campaign.entity';

// Bank API entities
import { BankConnection } from '../banking/bank-api/entities/bank-connection.entity';
import { BankAnomaly } from '../banking/bank-api/entities/bank-anomaly.entity';

// Reconciliation entities
import { ReconciliationMatch } from '../banking/reconciliation/entities/reconciliation-match.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbHost = configService.get('DATABASE_HOST', 'localhost');
        const dbPort = parseInt(configService.get('DATABASE_PORT', '5432'), 10);
        const dbUser = configService.get('DATABASE_USER', 'postgres');
        const dbPassword = configService.get('DATABASE_PASSWORD', 'postgres');
        const dbName = configService.get('DATABASE_NAME', 'bms_erp');
        
        // Forcer DSN complet pour éviter les problèmes de configuration
        const databaseUrl = `postgres://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;
        
        console.log('🔧 TypeORM config:', { dbHost, dbPort, dbUser, dbName });
        console.log('🔗 Database connection: postgres://****:****@', dbHost, ':', dbPort, '/', dbName);
        
        return {
          type: 'postgres',
          url: databaseUrl,
          entities: [
            ...Object.values(entities),
            // Auth entities
            User,
            // RBAC entities
            Role,
            Permission,
            // Company entities
            Company,
            // Accounting entities
            Account,
            JournalEntry,
            JournalEntryLine,
            Asset,
            PeriodClosure,
            // Invoice entities
            Invoice,
            InvoiceItem,
            // Payment entities
            Payment,
            PaymentAllocation,
            // Mobile Money entities
            MobileMoneyTransaction,
            // Banking entities
            BankAccount,
            BankTransaction,
            BankReconciliation,
            // CRM entities
            Contact,
            Tag,
            Activity,
            Opportunity,
            PipelineStage,
            ContactImport,
            // Budget entities
            Budget,
            BudgetLine,
            // Treasury entities
            DirectDebit,
            // NIF entities
            NifRequest,
            // Loans entities
            LoanApplication,
            // Scoring entities
            CreditScore,
            // AI entities
            TransactionAnomaly,
            // Audit entities
            AuditLog,
            // Upload entities
            Upload,
            // Purchases entities
            PurchaseOrder,
            PurchaseReceipt,
            // Quotes entities
            Quote,
            // Notification entities
            Notification,
            // Campaign entities
            Campaign,
            // Bank API entities
            BankConnection,
            BankAnomaly,
            // Reconciliation entities
            ReconciliationMatch,
          ],
          synchronize: configService.get('NODE_ENV') === 'development',
          logging: configService.get('NODE_ENV') === 'development',
        };
      },
    }),
    TypeOrmModule.forFeature([
      ...Object.values(entities),
      // Auth entities
      User,
      // RBAC entities
      Role,
      Permission,
      // Company entities
      Company,
      // Accounting entities
      Account,
      JournalEntry,
      JournalEntryLine,
      Asset,
      PeriodClosure,
      // Invoice entities
      Invoice,
      InvoiceItem,
      // Payment entities
      Payment,
      PaymentAllocation,
      // Mobile Money entities
      MobileMoneyTransaction,
      // Banking entities
      BankAccount,
      BankTransaction,
      BankReconciliation,
      // CRM entities
      Contact,
      Tag,
      Activity,
      Opportunity,
      PipelineStage,
      ContactImport,
      // Budget entities
      Budget,
      BudgetLine,
      // Treasury entities
      DirectDebit,
      // NIF entities
      NifRequest,
      // Loans entities
      LoanApplication,
      // Scoring entities
      CreditScore,
      // AI entities
      TransactionAnomaly,
      // Audit entities
      AuditLog,
      // Upload entities
      Upload,
      // Purchases entities
      PurchaseOrder,
      PurchaseReceipt,
      // Quotes entities
      Quote,
      // Notification entities
      Notification,
      // Campaign entities
      Campaign,
      // Bank API entities
      BankConnection,
      BankAnomaly,
      // Reconciliation entities
      ReconciliationMatch,
    ]),
  ],
  controllers: [SeedController],
  providers: [SimpleTestSeedService],
  exports: [SimpleTestSeedService],
})
export class DatabaseModule {}
