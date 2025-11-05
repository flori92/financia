import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntrepreneurController } from './entrepreneur.controller';
import { EntrepreneurDashboardService } from './entrepreneur-dashboard.service';
import { JournalEntry } from '../accounting/entities/journal-entry.entity';
import { Account } from '../accounting/entities/account.entity';
import { Company } from '../companies/entities/company.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([JournalEntry, Account, Company]),
  ],
  controllers: [EntrepreneurController],
  providers: [EntrepreneurDashboardService],
  exports: [EntrepreneurDashboardService],
})
export class EntrepreneurModule {}
