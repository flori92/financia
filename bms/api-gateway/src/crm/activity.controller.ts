import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActivityService } from './activity.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { CompanyId } from '../common/decorators/company-id.decorator';
import { ActivityType, ActivityStatus } from './entities/activity.entity';
import { Permissions } from '../rbac/decorators/permissions.decorator';
import { AuditLog } from '../audit/decorators/audit-log.decorator';

@ApiTags('CRM - Activities')
@ApiBearerAuth()
@Controller('crm/activities')
@UseGuards(JwtAuthGuard)
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new activity' })
  @Permissions('contacts:create')
  @AuditLog('activity', 'create')
  create(
    @Body() dto: CreateActivityDto,
    @CompanyId() companyId: string,
  ) {
    return this.activityService.create(dto, companyId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all activities with filters' })
  @Permissions('contacts:read')
  findAll(
    @CompanyId() companyId: string,
    @Query('contactId') contactId?: string,
    @Query('type') type?: ActivityType,
    @Query('status') status?: ActivityStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.activityService.findAll(companyId, {
      contactId,
      type,
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming activities' })
  getUpcoming(
    @CompanyId() companyId: string,
    @Query('days') days?: number,
  ) {
    return this.activityService.getUpcoming(companyId, days ? +days : 7);
  }

  @Get('overdue')
  @ApiOperation({ summary: 'Get overdue activities' })
  getOverdue(@CompanyId() companyId: string) {
    return this.activityService.getOverdue(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get activity by ID' })
  findOne(
    @Param('id') id: string,
    @CompanyId() companyId: string,
  ) {
    return this.activityService.findOne(id, companyId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update activity' })
  @Permissions('contacts:update')
  @AuditLog('activity', 'update')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateActivityDto,
    @CompanyId() companyId: string,
  ) {
    return this.activityService.update(id, dto, companyId);
  }

  @Put(':id/complete')
  @ApiOperation({ summary: 'Mark activity as completed' })
  complete(
    @Param('id') id: string,
    @CompanyId() companyId: string,
  ) {
    return this.activityService.complete(id, companyId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete activity' })
  @Permissions('contacts:delete')
  @AuditLog('activity', 'delete')
  remove(
    @Param('id') id: string,
    @CompanyId() companyId: string,
  ) {
    return this.activityService.remove(id, companyId);
  }
}
