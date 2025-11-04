import { Injectable } from '@nestjs/common';
import { DashboardService } from './services/dashboard.service';
import { FinancialReportService } from './services/financial-report.service';
import { AnalyticsService } from './services/analytics.service';
import { SigService } from './services/sig.service';
import { CafService } from './services/caf.service';
import { RatiosService } from './services/ratios.service';

@Injectable()
export class ReportingService {
  constructor(
    private readonly dashboard: DashboardService,
    private readonly financialReport: FinancialReportService,
    private readonly analytics: AnalyticsService,
    private readonly sig: SigService,
    private readonly caf: CafService,
    private readonly ratios: RatiosService,
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

  async getSIG(companyId: string, startDate: string, endDate: string) {
    return this.sig.calculateSIG(companyId, startDate, endDate);
  }

  async getCAF(companyId: string, startDate: string, endDate: string) {
    return this.caf.calculateCAF(companyId, startDate, endDate);
  }

  async getRatios(companyId: string, date: string) {
    return this.ratios.calculateRatios(companyId, date);
  }
}
