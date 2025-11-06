import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HRController } from './hr.controller';
import { PayrollService } from './payroll.service';
import { LeaveService } from './leave.service';
import { ExpenseService } from './expense.service';
import { RecruitmentService } from './recruitment.service';
import { Employee } from './entities/employee.entity';
import { Payroll } from './entities/payroll.entity';
import { HrCertificate } from './entities/hr-certificate.entity';
import { HrLeave } from './entities/hr-leave.entity';
import { HrLeaveBalance } from './entities/hr-leave-balance.entity';
import { HrLeaveApproval } from './entities/hr-leave-approval.entity';
import { HrCertificateService } from './hr-certificate.service';
import { Company } from '../../companies/entities/company.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Employee,
      Payroll,
      HrCertificate,
      HrLeave,
      HrLeaveBalance,
      HrLeaveApproval,
      Company,
    ]),
  ],
  controllers: [HRController],
  providers: [
    PayrollService,
    LeaveService,
    ExpenseService,
    RecruitmentService,
    HrCertificateService,
  ],
  exports: [PayrollService, HrCertificateService],
})
export class HRModule {}
