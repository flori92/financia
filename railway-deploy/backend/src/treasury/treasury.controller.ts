import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TreasuryService } from './treasury.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ProfileGuard } from '../auth/guards/profile.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';
import { CompanyId } from '../common/decorators/company-id.decorator';

@ApiTags('Treasury')
@ApiBearerAuth()
@Controller('treasury')
@UseGuards(JwtAuthGuard, RolesGuard, ProfileGuard)
@RequirePermissions('treasury:read')
export class TreasuryController {
  constructor(private readonly treasuryService: TreasuryService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Résumé de trésorerie (solde initial/final, entrées/sorties, net)' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  @ApiResponse({ status: 200, description: 'Résumé calculé' })
  async getSummary(
    @CompanyId() companyId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.treasuryService.getSummary(companyId, startDate, endDate);
  }

  @Get('timeseries')
  @ApiOperation({ summary: 'Séries temporelles des flux (in/out/net, solde cumulé)' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  @ApiQuery({ name: 'granularity', required: false, enum: ['day', 'month'], description: 'Par jour ou par mois (défaut: month)' })
  @ApiResponse({ status: 200, description: 'Séries temporelles' })
  async getTimeseries(
    @CompanyId() companyId: string,
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

  @Get('check-and-notify')
  @ApiOperation({ summary: 'Vérifier alertes et envoyer notifications automatiques (email/SMS)' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiQuery({ name: 'userEmail', required: true })
  @ApiQuery({ name: 'userPhone', required: true })
  @ApiQuery({ name: 'companyName', required: true })
  @ApiQuery({ name: 'criticalRunwayDays', required: false, description: 'Seuil notification critique (défaut: 7)' })
  @ApiQuery({ name: 'warningRunwayDays', required: false, description: 'Seuil notification warning (défaut: 15)' })
  @ApiResponse({ status: 200, description: 'Notifications envoyées' })
  async checkAndNotifyAlerts(
    @Query('companyId') companyId: string,
    @Query('userEmail') userEmail: string,
    @Query('userPhone') userPhone: string,
    @Query('companyName') companyName: string,
    @Query('criticalRunwayDays') criticalRunwayDays?: number,
    @Query('warningRunwayDays') warningRunwayDays?: number,
  ) {
    return this.treasuryService.checkAndNotifyAlerts({
      companyId,
      userEmail,
      userPhone,
      companyName,
      criticalRunwayDays: criticalRunwayDays ? Number(criticalRunwayDays) : 7,
      warningRunwayDays: warningRunwayDays ? Number(warningRunwayDays) : 15,
    });
  }

  @Get('forecast')
  @ApiOperation({ summary: 'Prévisions de trésorerie (naïf 30j → horizon 7/30 jours)' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiQuery({ name: 'horizonDays', required: false, description: 'Nombre de jours à prévoir (défaut: 7)' })
  @ApiResponse({ status: 200, description: 'Série prévisionnelle' })
  async getForecast(
    @Query('companyId') companyId: string,
    @Query('horizonDays') horizonDays?: number,
  ) {
    return this.treasuryService.getForecast(companyId, horizonDays ? Number(horizonDays) : 7);
  }
}
