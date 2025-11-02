import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GanttService } from './gantt.service';
import { TimesheetService } from './timesheet.service';

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly ganttService: GanttService,
    private readonly timesheetService: TimesheetService,
  ) {}

  @Get('gantt/:projectId')
  @ApiOperation({ summary: 'Générer le diagramme de Gantt' })
  async getGantt(@Param('projectId') projectId: string) {
    return this.ganttService.generateGantt(projectId);
  }

  @Post('timesheet')
  @ApiOperation({ summary: 'Enregistrer du temps' })
  async logTime(@Body() data: any) {
    return this.timesheetService.logTime(data.employeeId, data);
  }

  @Get('timesheet')
  @ApiOperation({ summary: 'Consulter les feuilles de temps' })
  async getTimesheet(@Query('employeeId') employeeId: string, @Query() period: any) {
    return this.timesheetService.getTimesheet(employeeId, period);
  }

  @Post('timesheet/:id/submit')
  @ApiOperation({ summary: 'Soumettre une feuille de temps' })
  async submitTimesheet(@Param('id') id: string, @Body() data: any) {
    return this.timesheetService.submitTimesheet(data.employeeId, data.period);
  }

  @Post('timesheet/:id/approve')
  @ApiOperation({ summary: 'Approuver une feuille de temps' })
  async approveTimesheet(@Param('id') id: string, @Body() data: any) {
    return this.timesheetService.approveTimesheet(id, data.approverId);
  }
}
