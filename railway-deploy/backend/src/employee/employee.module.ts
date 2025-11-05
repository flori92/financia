import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeController } from './employee.controller';
import { EmployeeDashboardService } from './employee-dashboard.service';
import { Employee } from '../employees/entities/employee.entity';
import { LeaveRequest } from '../employees/entities/leave-request.entity';
import { Timesheet } from '../employees/entities/timesheet.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee, LeaveRequest, Timesheet]),
  ],
  controllers: [EmployeeController],
  providers: [EmployeeDashboardService],
  exports: [EmployeeDashboardService],
})
export class EmployeeDashboardModule {}
