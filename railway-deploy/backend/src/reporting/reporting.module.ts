import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportingController } from './reporting.controller';
import { ReportingService } from './reporting.service';
import { DashboardService } from './services/dashboard.service';
import { FinancialReportService } from './services/financial-report.service';
import { AnalyticsService } from './services/analytics.service';
import { SigService } from './services/sig.service';
import { CafService } from './services/caf.service';
import { RatiosService } from './services/ratios.service';
import { Account } from '../accounting/entities/account.entity';
import { JournalEntry } from '../accounting/entities/journal-entry.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { Product } from '../inventory/entities/product.entity';
import { PurchaseOrder } from '../purchases/entities/purchase-order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Account, 
      JournalEntry,
      Invoice,
      Product,
      PurchaseOrder
    ])
  ],
  controllers: [ReportingController],
  providers: [
    ReportingService,
    DashboardService,
    FinancialReportService,
    AnalyticsService,
    SigService,
    CafService,
    RatiosService,
  ],
  exports: [ReportingService],
})
export class ReportingModule {}