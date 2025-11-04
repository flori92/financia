import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReportingService } from './reporting.service';

@ApiTags('Reporting')
@Controller('reporting')
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Tableau de bord général' })
  @ApiResponse({ status: 200, description: 'Données du tableau de bord retournées' })
  async getDashboard(@Query('companyId') companyId: string) {
    if (!companyId) {
      throw new Error('companyId est requis');
    }
    return this.reportingService.getDashboard(companyId);
  }

  @Get('financial-reports')
  @ApiOperation({ summary: 'Rapports financiers' })
  @ApiResponse({ status: 200, description: 'Rapports financiers générés' })
  async getFinancialReports(
    @Query('companyId') companyId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    if (!companyId) {
      throw new Error('companyId est requis');
    }
    if (!startDate || !endDate) {
      throw new Error('startDate et endDate sont requis');
    }
    return this.reportingService.getFinancialReports(companyId, new Date(startDate), new Date(endDate));
  }

  @Post('custom-analysis')
  @ApiOperation({ summary: 'Analyse personnalisée' })
  @ApiResponse({ status: 200, description: 'Analyse personnalisée générée' })
  async getCustomAnalysis(@Body() params: any) {
    if (!params.companyId) {
      throw new Error('companyId est requis');
    }
    return this.reportingService.getCustomAnalysis(params);
  }

  @Get('kpis')
  @ApiOperation({ summary: 'Indicateurs clés de performance' })
  @ApiResponse({ status: 200, description: 'KPIs retournés' })
  async getKPIs(@Query('companyId') companyId: string) {
    if (!companyId) {
      throw new Error('companyId est requis');
    }
    return this.reportingService.getKPIs(companyId);
  }

  @Get('sig')
  @ApiOperation({ summary: 'Soldes Intermédiaires de Gestion' })
  @ApiResponse({ status: 200, description: 'SIG calculés' })
  async getSIG(
    @Query('companyId') companyId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    if (!companyId || !startDate || !endDate) {
      throw new Error('companyId, startDate et endDate sont requis');
    }
    return this.reportingService.getSIG(companyId, startDate, endDate);
  }

  @Get('caf')
  @ApiOperation({ summary: 'Capacité d\'Autofinancement' })
  @ApiResponse({ status: 200, description: 'CAF calculée' })
  async getCAF(
    @Query('companyId') companyId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    if (!companyId || !startDate || !endDate) {
      throw new Error('companyId, startDate et endDate sont requis');
    }
    return this.reportingService.getCAF(companyId, startDate, endDate);
  }

  @Get('ratios')
  @ApiOperation({ summary: 'Ratios financiers' })
  @ApiResponse({ status: 200, description: 'Ratios calculés' })
  async getRatios(
    @Query('companyId') companyId: string,
    @Query('date') date: string
  ) {
    if (!companyId || !date) {
      throw new Error('companyId et date sont requis');
    }
    return this.reportingService.getRatios(companyId, date);
  }

  @Get('balance-sheet')
  @ApiOperation({ summary: 'Bilan comptable' })
  @ApiResponse({ status: 200, description: 'Bilan généré' })
  async getBalanceSheet(
    @Query('companyId') companyId: string,
    @Query('date') date: string
  ) {
    if (!companyId || !date) {
      throw new Error('companyId et date sont requis');
    }
    return this.reportingService.getBalanceSheet(companyId, new Date(date));
  }

  @Get('income-statement')
  @ApiOperation({ summary: 'Compte de résultat' })
  @ApiResponse({ status: 200, description: 'Compte de résultat généré' })
  async getIncomeStatement(
    @Query('companyId') companyId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    if (!companyId || !startDate || !endDate) {
      throw new Error('companyId, startDate et endDate sont requis');
    }
    return this.reportingService.getIncomeStatement(companyId, new Date(startDate), new Date(endDate));
  }

  @Get('cash-flow')
  @ApiOperation({ summary: 'Tableau des flux de trésorerie' })
  @ApiResponse({ status: 200, description: 'Flux de trésorerie générés' })
  async getCashFlow(
    @Query('companyId') companyId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    if (!companyId || !startDate || !endDate) {
      throw new Error('companyId, startDate et endDate sont requis');
    }
    return this.reportingService.getCashFlow(companyId, new Date(startDate), new Date(endDate));
  }

  @Post('export')
  @ApiOperation({ summary: 'Exporter un rapport' })
  @ApiResponse({ status: 200, description: 'Rapport exporté' })
  async exportReport(@Body() data: any) {
    if (!data.companyId || !data.reportType) {
      throw new Error('companyId et reportType sont requis');
    }
    return this.reportingService.exportReport(data);
  }
}