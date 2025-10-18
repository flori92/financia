import { Injectable } from '@nestjs/common';
import { DashboardService } from './services/dashboard.service';
import { FinancialReportService } from './services/financial-report.service';
import { AnalyticsService } from './services/analytics.service';

@Injectable()
export class ReportingService {
  constructor(
    private readonly dashboard: DashboardService,
    private readonly financialReport: FinancialReportService,
    private readonly analytics: AnalyticsService,
  ) {}

  async getDashboard(companyId: string) {
    return this.dashboard.getDashboard(companyId);
  }

  async getFinancialReports(companyId: string, startDate: string, endDate: string) {
    return this.financialReport.getReports(companyId, startDate, endDate);
  }

  async getCustomAnalysis(params: any) {
    return this.analytics.analyze(params);
  }

  async getKPIs(companyId: string) {
    return this.dashboard.getKPIs(companyId);
  }
}