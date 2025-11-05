import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BankPartnerDashboardService } from './bank-partner-dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Profiles } from '../auth/decorators/profile.decorator';
import { UserRole } from '../auth/guards/roles.guard';
import { UserProfile } from '../auth/guards/user-profiles';

/**
 * Contrôleur pour l'espace Banque/Partenaire
 */
@ApiTags('Banque Partenaire')
@Controller('bank-partner')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BankPartnerController {
  constructor(
    private readonly dashboardService: BankPartnerDashboardService,
  ) {}

  @Get('dashboard/metrics')
  @Profiles(UserProfile.ADMIN)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Métriques du dashboard Banque Partenaire' })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiResponse({
    status: 200,
    description: 'Dashboard avec portefeuille, scoring, financier, risque',
  })
  async getDashboardMetrics(@Query('companyId') companyId?: string): Promise<any> {
    return this.dashboardService.getDashboardMetrics(companyId);
  }
}
