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
    return this.dashboard.getDashboardData(companyId);
  }

  async getFinancialReports(companyId: string, startDate: Date, endDate: Date) {
    const balanceSheet = await this.financialReport.generateBalanceSheet(companyId, endDate);
    const incomeStatement = await this.financialReport.generateIncomeStatement(companyId, startDate, endDate);
    const cashFlow = await this.financialReport.generateCashFlowStatement(companyId, startDate, endDate);
    
    return {
      balanceSheet,
      incomeStatement,
      cashFlow,
    };
  }

  async getCustomAnalysis(params: any) {
    // TODO: Implement custom analysis
    return { status: 'not_implemented' };
  }

  async getKPIs(companyId: string) {
    return this.dashboard.getKPIs(companyId);
  }
}
