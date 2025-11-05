import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpertComptableController } from './expert-comptable.controller';
import { ExpertComptableDashboardService } from './expert-comptable-dashboard.service';
import { JournalEntry } from '../accounting/entities/journal-entry.entity';
import { Account } from '../accounting/entities/account.entity';
import { Company } from '../companies/entities/company.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([JournalEntry, Account, Company]),
  ],
  controllers: [ExpertComptableController],
  providers: [ExpertComptableDashboardService],
  exports: [ExpertComptableDashboardService],
})
export class ExpertComptableModule {}
