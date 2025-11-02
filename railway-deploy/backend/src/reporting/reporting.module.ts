import { Module } from '@nestjs/common';
import { ReportingController } from './reporting.controller';
import { ReportingService } from './reporting.service';
import { DashboardService } from './services/dashboard.service';
import { FinancialReportService } from './services/financial-report.service';
import { AnalyticsService } from './services/analytics.service';
import { SigService } from './services/sig.service';
import { CafService } from './services/caf.service';
import { RatiosService } from './services/ratios.service';

@Module({
  imports: [],
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