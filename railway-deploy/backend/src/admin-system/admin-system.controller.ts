import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminSystemDashboardService } from './admin-system-dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Profiles } from '../auth/decorators/profile.decorator';
import { UserRole } from '../auth/guards/roles.guard';
import { UserProfile } from '../auth/guards/user-profiles';

/**
 * Contrôleur pour l'espace Admin Système
 */
@ApiTags('Admin Système')
@Controller('admin-system')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminSystemController {
  constructor(
    private readonly dashboardService: AdminSystemDashboardService,
  ) {}

  @Get('dashboard/metrics')
  @Profiles(UserProfile.ADMIN)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Métriques du dashboard Admin Système' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard avec utilisateurs, sociétés, système, activité',
  })
  async getDashboardMetrics(): Promise<any> {
    return this.dashboardService.getDashboardMetrics();
  }
}
