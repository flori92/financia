import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RbacService } from './rbac.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequirePermissions } from './decorators/require-permissions.decorator';
import { CompanyId } from '../common/decorators/company-id.decorator';

@ApiTags('rbac')
@ApiBearerAuth()
@Controller('rbac')
@UseGuards(JwtAuthGuard)
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @Get('permissions')
  @RequirePermissions('roles:read')
  @ApiOperation({ summary: 'Lister toutes les permissions disponibles' })
  @ApiResponse({ status: 200, description: 'Liste des permissions' })
  getAllPermissions() {
    return this.rbacService.getAllPermissions();
  }

  @Get('roles')
  @RequirePermissions('roles:read')
  @ApiOperation({ summary: 'Lister les rôles de la société' })
  @ApiResponse({ status: 200, description: 'Liste des rôles' })
  getRoles(@CompanyId() companyId: string) {
    return this.rbacService.getRolesByCompany(companyId);
  }

  @Post('roles')
  @RequirePermissions('roles:create')
  @ApiOperation({ summary: 'Créer un nouveau rôle' })
  @ApiResponse({ status: 201, description: 'Rôle créé' })
  createRole(
    @Body() dto: { name: string; permissionIds: string[]; description?: string },
    @CompanyId() companyId: string,
  ) {
    return this.rbacService.createRole(
      dto.name,
      companyId,
      dto.permissionIds,
      dto.description,
    );
  }

  @Patch('roles/:id/permissions')
  @RequirePermissions('roles:update')
  @ApiOperation({ summary: 'Assigner des permissions à un rôle' })
  @ApiResponse({ status: 200, description: 'Permissions assignées' })
  assignPermissions(
    @Param('id') roleId: string,
    @Body() dto: { permissionIds: string[] },
  ) {
    return this.rbacService.assignPermissions(roleId, dto.permissionIds);
  }
}
