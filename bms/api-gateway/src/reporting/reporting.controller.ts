import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ReportingService } from './reporting.service';

@Controller('reporting')
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @Get('dashboard')
  async getDashboard(@Query('companyId') companyId: string) {
    return this.reportingService.getDashboard(companyId);
  }

  @Get('financial-reports')
  async getFinancialReports(
    @Query('companyId') companyId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportingService.getFinancialReports(companyId, startDate, endDate);
  }

  @Post('custom-analysis')
  async getCustomAnalysis(@Body() params: any) {
    return this.reportingService.getCustomAnalysis(params);
  }

  @Get('kpis')
  async getKPIs(@Query('companyId') companyId: string) {
    return this.reportingService.getKPIs(companyId);
  }
}