import { Module } from '@nestjs/common';
import { ReportingController } from './reporting.controller';
import { ReportingService } from './reporting.service';
import { DashboardService } from './services/dashboard.service';
import { FinancialReportService } from './services/financial-report.service';
import { AnalyticsService } from './services/analytics.service';

@Module({
  imports: [],
  controllers: [ReportingController],
  providers: [
    ReportingService,
    DashboardService,
    FinancialReportService,
    AnalyticsService,
  ],
  exports: [ReportingService],
})
export class ReportingModule {}