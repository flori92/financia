import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TreasuryService } from './treasury.service';

@ApiTags('Treasury')
@ApiBearerAuth()
@Controller('treasury')
export class TreasuryController {
  constructor(private readonly treasuryService: TreasuryService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Résumé de trésorerie (solde initial/final, entrées/sorties, net)' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  @ApiResponse({ status: 200, description: 'Résumé calculé' })
  async getSummary(
    @Query('companyId') companyId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.treasuryService.getSummary(companyId, startDate, endDate);
  }

  @Get('timeseries')
  @ApiOperation({ summary: 'Séries temporelles des flux (in/out/net, solde cumulé)' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  @ApiQuery({ name: 'granularity', required: false, enum: ['day', 'month'], description: 'Par jour ou par mois (défaut: month)' })
  @ApiResponse({ status: 200, description: 'Séries temporelles' })
  async getTimeseries(
    @Query('companyId') companyId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('granularity') granularity: 'day'|'month' = 'month',
  ) {
    return this.treasuryService.getTimeseries(companyId, startDate, endDate, granularity);
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Alertes trésorerie (runway, tendances, seuils configurables)' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiQuery({ name: 'criticalRunwayDays', required: false, description: 'Seuil critique en jours (défaut: 15)' })
  @ApiQuery({ name: 'warningRunwayDays', required: false, description: 'Seuil warning en jours (défaut: 30)' })
  @ApiResponse({ status: 200, description: 'Alertes et métriques' })
  async getAlerts(
    @Query('companyId') companyId: string,
    @Query('criticalRunwayDays') criticalRunwayDays?: number,
    @Query('warningRunwayDays') warningRunwayDays?: number,
  ) {
    return this.treasuryService.getAlerts(
      companyId,
      criticalRunwayDays ? Number(criticalRunwayDays) : 15,
      warningRunwayDays ? Number(warningRunwayDays) : 30,
    );
  }
}
