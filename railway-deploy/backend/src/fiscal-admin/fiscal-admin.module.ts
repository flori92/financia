import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FiscalAdminController } from './fiscal-admin.controller';
import { FiscalAdminDashboardService } from './fiscal-admin-dashboard.service';
import { Company } from '../companies/entities/company.entity';
import { JournalEntry } from '../accounting/entities/journal-entry.entity';
import { Account } from '../accounting/entities/account.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company, JournalEntry, Account]),
  ],
  controllers: [FiscalAdminController],
  providers: [FiscalAdminDashboardService],
  exports: [FiscalAdminDashboardService],
})
export class FiscalAdminModule {}
