import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankPartnerController } from './bank-partner.controller';
import { BankPartnerDashboardService } from './bank-partner-dashboard.service';
import { Company } from '../companies/entities/company.entity';
import { JournalEntry } from '../accounting/entities/journal-entry.entity';
import { Account } from '../accounting/entities/account.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company, JournalEntry, Account]),
  ],
  controllers: [BankPartnerController],
  providers: [BankPartnerDashboardService],
  exports: [BankPartnerDashboardService],
})
export class BankPartnerModule {}
