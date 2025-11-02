import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { HRCalendarService } from '../services/calendar.service';

@ApiTags('HR Calendar')
@Controller('hr/calendar')
export class CalendarController {
  constructor(private readonly calendarService: HRCalendarService) {}

  @Get('period')
  @ApiOperation({ summary: 'Récupérer l\'agenda RH pour une période' })
  async getPeriodCalendar(
    @Query('companyId') companyId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.calendarService.getCalendarPeriod(
      companyId,
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Récupérer l\'agenda d\'un employé' })
  async getEmployeeCalendar(
    @Param('employeeId') employeeId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.calendarService.getEmployeeCalendar(
      employeeId,
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Post('events')
  @ApiOperation({ summary: 'Créer un événement dans l\'agenda RH' })
  async createEvent(@Body() eventData: any) {
    return this.calendarService.createCalendarEvent(eventData);
  }

  @Get('events/:companyId')
  @ApiOperation({ summary: 'Lister les événements d\'une entreprise' })
  async getEvents(
    @Param('companyId') companyId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('type') type?: string
  ) {
    // Implémenter la récupération des événements
    return { companyId, startDate, endDate, type, events: [] };
  }
}
