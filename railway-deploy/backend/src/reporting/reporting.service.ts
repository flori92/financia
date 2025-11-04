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
    // Implémentation basique pour l'analyse personnalisée
    const { companyId, reportType, filters } = params;
    
    switch (reportType) {
      case 'sales_analysis':
        return this.analytics.getSalesAnalysis(companyId, filters);
      case 'expense_analysis':
        return this.analytics.getExpenseAnalysis(companyId, filters);
      case 'customer_analysis':
        return this.analytics.getCustomerAnalysis(companyId, filters);
      case 'product_analysis':
        return this.analytics.getProductAnalysis(companyId, filters);
      default:
        return { 
          error: "Type d'analyse non supporté",
          supportedTypes: ['sales_analysis', 'expense_analysis', 'customer_analysis', 'product_analysis']
        };
    }
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

  // Nouvelles méthodes pour les endpoints ajoutés
  async getBalanceSheet(companyId: string, date: Date) {
    return this.financialReport.generateBalanceSheet(companyId, date);
  }

  async getIncomeStatement(companyId: string, startDate: Date, endDate: Date) {
    return this.financialReport.generateIncomeStatement(companyId, startDate, endDate);
  }

  async getCashFlow(companyId: string, startDate: Date, endDate: Date) {
    return this.financialReport.generateCashFlowStatement(companyId, startDate, endDate);
  }

  async exportReport(data: any) {
    const { companyId, reportType, format = 'pdf', filters } = data;
    
    // Implémentation basique pour l'export
    const reportData = await this.getReportData(companyId, reportType, filters);
    
    return {
      exportId: `EXP-${Date.now()}`,
      companyId,
      reportType,
      format,
      status: 'generated',
      downloadUrl: `/api/v1/reporting/download/EXP-${Date.now()}`,
      generatedAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 heures
      data: reportData
    };
  }

  private async getReportData(companyId: string, reportType: string, filters: any) {
    switch (reportType) {
      case 'balance_sheet':
        return this.getBalanceSheet(companyId, new Date(filters.date || new Date()));
      case 'income_statement':
        return this.getIncomeStatement(
          companyId, 
          new Date(filters.startDate), 
          new Date(filters.endDate)
        );
      case 'cash_flow':
        return this.getCashFlow(
          companyId, 
          new Date(filters.startDate), 
          new Date(filters.endDate)
        );
      case 'kpis':
        return this.getKPIs(companyId);
      case 'sig':
        return this.getSIG(companyId, filters.startDate, filters.endDate);
      case 'caf':
        return this.getCAF(companyId, filters.startDate, filters.endDate);
      case 'ratios':
        return this.getRatios(companyId, filters.date);
      default:
        throw new Error(`Type de rapport non supporté: ${reportType}`);
    }
  }
}
