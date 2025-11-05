import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EntrepreneurDashboardService } from './entrepreneur-dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Profiles } from '../auth/decorators/profile.decorator';
import { UserRole } from '../auth/guards/roles.guard';
import { UserProfile } from '../auth/guards/user-profiles';

/**
 * Contrôleur pour l'espace Entrepreneur
 */
@ApiTags('Entrepreneur')
@Controller('entrepreneur')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class EntrepreneurController {
  constructor(
    private readonly dashboardService: EntrepreneurDashboardService,
  ) {}

  @Get('dashboard/metrics')
  @Profiles(UserProfile.ADMIN)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Métriques du dashboard Entrepreneur' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiResponse({
    status: 200,
    description: 'Dashboard avec KPIs stratégiques, runway, profitabilité, croissance',
  })
  async getDashboardMetrics(@Query('companyId') companyId: string): Promise<any> {
    return this.dashboardService.getDashboardMetrics(companyId);
  }
}
