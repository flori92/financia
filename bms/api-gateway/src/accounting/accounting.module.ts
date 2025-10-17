import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountingController } from './accounting.controller';
import { AccountingClosureController } from './accounting-closure.controller';
import { AccountingService } from './accounting.service';
import { AccountingAutomationService } from './accounting-automation.service';
import { AccountingClosureService } from './accounting-closure.service';
import { Account } from './entities/account.entity';
import { JournalEntry } from './entities/journal-entry.entity';
import { JournalEntryLine } from './entities/journal-entry-line.entity';
import { PeriodClosure } from './entities/period-closure.entity';

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
    TypeOrmModule.forFeature([Account, JournalEntry, JournalEntryLine, PeriodClosure]),
  ],
  controllers: [AccountingController, AccountingClosureController],
  providers: [AccountingService, AccountingAutomationService, AccountingClosureService],
  exports: [AccountingService, AccountingAutomationService, AccountingClosureService],
})
export class AccountingModule {}
