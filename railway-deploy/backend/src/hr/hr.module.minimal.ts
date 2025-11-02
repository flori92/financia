import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Services
import { HRCalendarService } from './services/calendar.service';
import { EmployeeService } from './services/employee.service';
import { LeaveService } from './services/leave.service';
import { TimesheetService } from './services/timesheet.service';

// Controllers
import { EmployeeController } from './controllers/employee.controller';
import { LeaveController } from './controllers/leave.controller';
import { TimesheetController } from './controllers/timesheet.controller';
import { CalendarController } from './controllers/calendar.controller';

@Module({
  imports: [
    // Pas d'entités pour le moment - services basés sur des mock data
  ],
  controllers: [
    EmployeeController,
    LeaveController,
    TimesheetController,
    CalendarController,
  ],
  providers: [
    HRCalendarService,
    EmployeeService,
    LeaveService,
    TimesheetService,
  ],
  exports: [
    EmployeeService,
    LeaveService,
    TimesheetService,
    HRCalendarService,
  ],
})
export class HRModule {}
