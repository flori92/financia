import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManagerController } from './manager.controller';
import { ManagerDashboardService } from './manager-dashboard.service';
import { Employee } from '../employees/entities/employee.entity';
import { LeaveRequest } from '../employees/entities/leave-request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee, LeaveRequest]),
  ],
  controllers: [ManagerController],
  providers: [ManagerDashboardService],
  exports: [ManagerDashboardService],
})
export class ManagerModule {}
