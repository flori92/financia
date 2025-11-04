import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import { Timesheet } from './entities/timesheet.entity';
import { TimesheetLine } from './entities/timesheet-line.entity';
import { LeaveRequest } from './entities/leave-request.entity';
import { PayrollRecord } from './entities/payroll-record.entity';
import { BankTransfer } from './entities/bank-transfer.entity';
import { DocumentVault } from './entities/document-vault.entity';
import { EmployeeService } from './services/employee.service';
import { TimesheetService } from './services/timesheet.service';
import { LeaveRequestService } from './services/leave-request.service';
import { PayrollService } from './services/payroll.service';
import { BankTransferService } from './services/bank-transfer.service';
import { DocumentVaultService } from './services/document-vault.service';
import { EmployeeController } from './employee.controller';
import { TimesheetController } from './timesheet.controller';
import { LeaveRequestController } from './leave-request.controller';
import { PayrollController } from './payroll.controller';
import { BankTransferController } from './bank-transfer.controller';
import { DocumentVaultController } from './document-vault.controller';
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
      BankTransfer,
      DocumentVault,
      Company,
      User,
    ]),
  ],
  controllers: [EmployeeController, TimesheetController, LeaveRequestController, PayrollController, BankTransferController, DocumentVaultController],
  providers: [EmployeeService, TimesheetService, LeaveRequestService, PayrollService, BankTransferService, DocumentVaultService],
  exports: [EmployeeService, TimesheetService, LeaveRequestService, PayrollService, BankTransferService, DocumentVaultService],
})
export class EmployeeModule {}
