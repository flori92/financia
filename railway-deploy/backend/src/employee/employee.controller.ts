import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EmployeeDashboardService } from './employee-dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Profiles } from '../auth/decorators/profile.decorator';
import { UserRole } from '../auth/guards/roles.guard';
import { UserProfile } from '../auth/guards/user-profiles';

/**
 * Contrôleur pour l'espace Employé
 */
@ApiTags('Employee')
@Controller('employee')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class EmployeeController {
  constructor(
    private readonly dashboardService: EmployeeDashboardService,
  ) {}

  @Get('dashboard/metrics')
  @Profiles(UserProfile.EMPLOYEE, UserProfile.ADMIN)
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Métriques du dashboard Employé' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiResponse({
    status: 200,
    description: 'Dashboard avec congés, paie, tâches, objectifs',
  })
  async getDashboardMetrics(
    @Request() req: any,
    @Query('companyId') companyId: string,
  ): Promise<any> {
    const userId = req.user?.id || req.user?.sub;
    return this.dashboardService.getDashboardMetrics(userId, companyId);
  }
}
