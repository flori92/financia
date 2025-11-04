import { IsString, IsOptional, IsEnum, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export enum ReportType {
  BALANCE_SHEET = 'balance_sheet',
  INCOME_STATEMENT = 'income_statement',
  CASH_FLOW = 'cash_flow',
  KPIS = 'kpis',
  SIG = 'sig',
  CAF = 'caf',
  RATIOS = 'ratios',
  SALES_ANALYSIS = 'sales_analysis',
  EXPENSE_ANALYSIS = 'expense_analysis',
  CUSTOMER_ANALYSIS = 'customer_analysis',
  PRODUCT_ANALYSIS = 'product_analysis'
}

export enum ExportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv'
}

class ReportFilters {
  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  period?: string;

  @IsObject()
  @IsOptional()
  customFilters?: Record<string, any>;
}

export class ExportReportDto {
  @IsString()
  companyId: string;

  @IsEnum(ReportType)
  reportType: ReportType;

  @IsEnum(ExportFormat)
  @IsOptional()
  format?: ExportFormat;

  @ValidateNested()
  @Type(() => ReportFilters)
  @IsOptional()
  filters?: ReportFilters;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  includeCharts?: boolean;

  @IsBoolean()
  @IsOptional()
  includeDetails?: boolean;

  @IsString()
  @IsOptional()
  language?: string;
}
