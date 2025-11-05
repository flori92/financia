import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ManagerDashboardService } from './manager-dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Profiles } from '../auth/decorators/profile.decorator';
import { UserRole } from '../auth/guards/roles.guard';
import { UserProfile } from '../auth/guards/user-profiles';

/**
 * Contrôleur pour l'espace Manager
 */
@ApiTags('Manager')
@Controller('manager')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ManagerController {
  constructor(
    private readonly dashboardService: ManagerDashboardService,
  ) {}

  @Get('dashboard/metrics')
  @Profiles(UserProfile.MANAGER, UserProfile.ADMIN)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Métriques du dashboard Manager' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiResponse({
    status: 200,
    description: 'Dashboard avec équipe, absences, projets, objectifs',
  })
  async getDashboardMetrics(
    @Request() req: any,
    @Query('companyId') companyId: string,
  ): Promise<any> {
    const userId = req.user?.id || req.user?.sub;
    return this.dashboardService.getDashboardMetrics(userId, companyId);
  }
}
