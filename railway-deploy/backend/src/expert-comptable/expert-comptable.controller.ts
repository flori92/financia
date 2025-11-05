import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ExpertComptableDashboardService } from './expert-comptable-dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Profiles } from '../auth/decorators/profile.decorator';
import { UserRole } from '../auth/guards/roles.guard';
import { UserProfile } from '../auth/guards/user-profiles';

/**
 * Contrôleur pour l'espace Expert Comptable
 */
@ApiTags('Expert Comptable')
@Controller('expert-comptable')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ExpertComptableController {
  constructor(
    private readonly dashboardService: ExpertComptableDashboardService,
  ) {}

  @Get('dashboard/metrics')
  @Profiles(UserProfile.EXPERT_COMPTABLE, UserProfile.ADMIN)
  @Roles(UserRole.ADMIN, UserRole.EXPERT_COMPTABLE)
  @ApiOperation({ summary: 'Métriques du dashboard Expert Comptable' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard avec KPIs, sociétés gérées, alertes, performance',
  })
  async getDashboardMetrics(@Request() req: any): Promise<any> {
    const userId = req.user?.id || req.user?.sub;
    return this.dashboardService.getDashboardMetrics(userId);
  }
}
