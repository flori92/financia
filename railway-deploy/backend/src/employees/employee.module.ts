import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import { Timesheet } from './entities/timesheet.entity';
import { TimesheetLine } from './entities/timesheet-line.entity';
import { LeaveRequest } from './entities/leave-request.entity';
import { PayrollRecord } from './entities/payroll-record.entity';
import { EmployeeService } from './services/employee.service';
import { TimesheetService } from './services/timesheet.service';
import { LeaveRequestService } from './services/leave-request.service';
import { EmployeeController } from './employee.controller';
import { TimesheetController } from './timesheet.controller';
import { LeaveRequestController } from './leave-request.controller';
import { Company } from '../companies/entities/company.entity';
import { User } from '../auth/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Employee,
      Timesheet,
      TimesheetLine,
      LeaveRequest,
      PayrollRecord,
      Company,
      User,
    ]),
  ],
  controllers: [EmployeeController, TimesheetController, LeaveRequestController],
  providers: [EmployeeService, TimesheetService, LeaveRequestService],
  exports: [EmployeeService, TimesheetService, LeaveRequestService],
})
export class EmployeeModule {}
