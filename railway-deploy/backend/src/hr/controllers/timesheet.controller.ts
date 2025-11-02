import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TimesheetService } from '../services/timesheet.service';

@ApiTags('HR Timesheets')
@Controller('hr/timesheets')
export class TimesheetController {
  constructor(private readonly timesheetService: TimesheetService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une feuille de temps' })
  async create(@Body() timesheetData: any) {
    return this.timesheetService.create(timesheetData);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les feuilles de temps' })
  async findAll(
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: string,
    @Query('weekStartDate') weekStartDate?: string
  ) {
    return this.timesheetService.findAll(employeeId, { status, weekStartDate });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir une feuille de temps' })
  async findOne(@Param('id') id: string) {
    return this.timesheetService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour une feuille de temps' })
  async update(@Param('id') id: string, @Body() updateData: any) {
    return this.timesheetService.update(id, updateData);
  }

  @Put(':id/submit')
  @ApiOperation({ summary: 'Soumettre une feuille de temps' })
  async submit(@Param('id') id: string) {
    return this.timesheetService.submit(id);
  }

  @Put(':id/approve')
  @ApiOperation({ summary: 'Approuver une feuille de temps' })
  async approve(@Param('id') id: string, @Body() data: any) {
    return this.timesheetService.approve(id, data.approverId, data.comments);
  }

  @Put(':id/reject')
  @ApiOperation({ summary: 'Rejeter une feuille de temps' })
  async reject(@Param('id') id: string, @Body() data: any) {
    return this.timesheetService.reject(id, data.approverId, data.comments);
  }

  @Get('employee/:employeeId/period')
  @ApiOperation({ summary: 'Obtenir les feuilles de temps d\'un employé pour une période' })
  async getEmployeeTimesheets(
    @Param('employeeId') employeeId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.timesheetService.getEmployeeTimesheets(
      employeeId,
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Get('project/:projectId/period')
  @ApiOperation({ summary: 'Obtenir les heures facturables pour un projet' })
  async getProjectHours(
    @Param('projectId') projectId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.timesheetService.getProjectHours(
      projectId,
      new Date(startDate),
      new Date(endDate)
    );
  }
}
