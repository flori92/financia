import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { HrManagerDashboardService } from './hr-manager-dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Profiles } from '../auth/decorators/profile.decorator';
import { UserRole } from '../auth/guards/roles.guard';
import { UserProfile } from '../auth/guards/user-profiles';

/**
 * Contrôleur pour l'espace RH Manager
 */
@ApiTags('RH Manager')
@Controller('hr-manager')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class HrManagerController {
  constructor(
    private readonly dashboardService: HrManagerDashboardService,
  ) {}

  @Get('dashboard/metrics')
  @Profiles(UserProfile.HR_MANAGER, UserProfile.ADMIN)
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Métriques du dashboard RH Manager' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiResponse({
    status: 200,
    description: 'Dashboard avec effectifs, absences, masse salariale, turnover',
  })
  async getDashboardMetrics(@Query('companyId') companyId: string): Promise<any> {
    return this.dashboardService.getDashboardMetrics(companyId);
  }
}
