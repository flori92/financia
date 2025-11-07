import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UnifiedDashboardService } from './services/unified-dashboard.service';
import { DashboardPreloadService } from './services/dashboard-preload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Dashboard')
@Controller('api/v1/dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(
    private readonly unifiedDashboard: UnifiedDashboardService,
    private readonly preloadService: DashboardPreloadService,
  ) {}

  @Get(':companyId/:profile')
  @ApiOperation({ summary: 'Récupère les données du dashboard' })
  async getDashboard(
    @Param('companyId') companyId: string,
    @Param('profile') profile: string,
    @Query('forceRefresh') forceRefresh?: string,
    @Query('widgets') widgets?: string,
  ) {
    const options = {
      forceRefresh: forceRefresh === 'true',
      widgets: widgets ? widgets.split(',') : undefined,
    };

    return this.unifiedDashboard.getDashboardData(companyId, profile, options);
  }

  @Get(':companyId/:profile/widget/:widget')
  @ApiOperation({ summary: 'Récupère un widget spécifique' })
  async getWidget(
    @Param('companyId') companyId: string,
    @Param('profile') profile: string,
    @Param('widget') widget: string,
  ) {
    return this.unifiedDashboard.getWidget(companyId, profile, widget);
  }

  @Get(':companyId/preload')
  @ApiOperation({ summary: 'Précharge les données pour une entreprise' })
  async preloadCompany(@Param('companyId') companyId: string) {
    await this.preloadService.preloadCompany(companyId);
    return { message: 'Preload completed', companyId };
  }
}

