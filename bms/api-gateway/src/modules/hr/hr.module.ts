import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HRController } from './hr.controller';
import { PayrollService } from './payroll.service';
import { LeaveService } from './leave.service';
import { ExpenseService } from './expense.service';
import { RecruitmentService } from './recruitment.service';
import { Employee } from './entities/employee.entity';
import { Payroll } from './entities/payroll.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee, Payroll]),
  ],
  controllers: [HRController],
  providers: [
    PayrollService,
    LeaveService,
    ExpenseService,
    RecruitmentService,
  ],
  exports: [PayrollService],
})
export class HRModule {}
