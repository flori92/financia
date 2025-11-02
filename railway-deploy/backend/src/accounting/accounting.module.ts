import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountingController } from './accounting.controller';
import { AccountingClosureController } from './accounting-closure.controller';
import { AssetsController } from './controllers/assets.controller';
import { AccountingService } from './accounting.service';
import { AccountingAutomationService } from './accounting-automation.service';
import { AccountingClosureService } from './accounting-closure.service';
import { AccountingDashboardService } from './accounting-dashboard.service';
import { AssetsService } from './services/assets.service';
import { Account } from './entities/account.entity';
import { JournalEntry } from './entities/journal-entry.entity';
import { JournalEntryLine } from './entities/journal-entry-line.entity';
import { PeriodClosure } from './entities/period-closure.entity';
import { Asset } from './entities/asset.entity';

/**
 * Module de comptabilité OHADA (SYSCOHADA)
 * - Gestion du plan comptable
 * - Écritures comptables avec partie double
 * - Rapports financiers (Bilan, Compte de résultat, Grand livre)
 * - Automatisation des écritures (ventes, achats, paiements)
 * - Clôture de période
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Account, JournalEntry, JournalEntryLine, PeriodClosure, Asset]),
  ],
  controllers: [AccountingController, AccountingClosureController, AssetsController],
  providers: [AccountingService, AccountingAutomationService, AccountingClosureService, AccountingDashboardService, AssetsService],
  exports: [AccountingService, AccountingAutomationService, AccountingClosureService, AccountingDashboardService, AssetsService],
})
export class AccountingModule {}
