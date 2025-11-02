import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LeaveService } from '../services/leave.service';

@ApiTags('HR Leaves')
@Controller('hr/leaves')
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post()
  @ApiOperation({ summary: 'Demander un congé' })
  async requestLeave(@Body() leaveData: any) {
    return this.leaveService.requestLeave(leaveData.employeeId, leaveData);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les demandes de congé' })
  async findAll(
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: string,
    @Query('type') type?: string
  ) {
    return this.leaveService.findAll(employeeId, { status, type });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir les détails d\'une demande de congé' })
  async findOne(@Param('id') id: string) {
    return this.leaveService.findOne(id);
  }

  @Put(':id/approve')
  @ApiOperation({ summary: 'Approuver une demande de congé' })
  async approve(@Param('id') id: string, @Body() data: any) {
    return this.leaveService.approveLeave(id, data.approverId, data.comments);
  }

  @Put(':id/reject')
  @ApiOperation({ summary: 'Rejeter une demande de congé' })
  async reject(@Param('id') id: string, @Body() data: any) {
    return this.leaveService.rejectLeave(id, data.approverId, data.comments);
  }

  @Get('balance/:employeeId')
  @ApiOperation({ summary: 'Obtenir le solde de congés d\'un employé' })
  async getBalance(@Param('employeeId') employeeId: string) {
    return this.leaveService.getEmployeeBalance(employeeId);
  }

  @Get('calendar/:companyId')
  @ApiOperation({ summary: 'Obtenir le calendrier des congés' })
  async getLeaveCalendar(
    @Param('companyId') companyId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.leaveService.getLeaveCalendar(
      companyId,
      new Date(startDate),
      new Date(endDate)
    );
  }
}
