import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportingController } from './reporting.controller';
import { ReportingService } from './reporting.service';
import { DashboardService } from './services/dashboard.service';
import { FinancialReportService } from './services/financial-report.service';
import { AnalyticsService } from './services/analytics.service';
import { SigService } from './services/sig.service';
import { CafService } from './services/caf.service';
import { Account } from '../accounting/entities/account.entity';
import { JournalEntry } from '../accounting/entities/journal-entry.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account, JournalEntry])
  ],
  controllers: [ReportingController],
  providers: [
    ReportingService,
    DashboardService,
    FinancialReportService,
    AnalyticsService,
    SigService,
    CafService,
  ],
  exports: [ReportingService],
})
export class ReportingModule {}