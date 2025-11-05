import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FiscalAdminDashboardService } from './fiscal-admin-dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Profiles } from '../auth/decorators/profile.decorator';
import { UserRole } from '../auth/guards/roles.guard';
import { UserProfile } from '../auth/guards/user-profiles';

/**
 * Contrôleur pour l'espace Administration Fiscale
 */
@ApiTags('Administration Fiscale')
@Controller('fiscal-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class FiscalAdminController {
  constructor(
    private readonly dashboardService: FiscalAdminDashboardService,
  ) {}

  @Get('dashboard/metrics')
  @Profiles(UserProfile.ADMINISTRATION_FISCAL, UserProfile.ADMIN)
  @Roles(UserRole.ADMIN, UserRole.TAX_ADMIN)
  @ApiOperation({ summary: 'Métriques du dashboard Administration Fiscale' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiResponse({
    status: 200,
    description: 'Dashboard avec déclarations, conformité, contrôles, statistiques fiscales',
  })
  async getDashboardMetrics(@Query('companyId') companyId: string): Promise<any> {
    return this.dashboardService.getDashboardMetrics(companyId);
  }
}
