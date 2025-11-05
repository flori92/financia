import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HrManagerController } from './hr-manager.controller';
import { HrManagerDashboardService } from './hr-manager-dashboard.service';
import { Employee } from '../employees/entities/employee.entity';
import { LeaveRequest } from '../employees/entities/leave-request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee, LeaveRequest]),
  ],
  controllers: [HrManagerController],
  providers: [HrManagerDashboardService],
  exports: [HrManagerDashboardService],
})
export class HrManagerModule {}
