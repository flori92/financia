import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountingController } from './accounting.controller';
import { AccountingService } from './accounting.service';
import { AccountingAutomationService } from './accounting-automation.service';
import { Account } from './entities/account.entity';
import { JournalEntry } from './entities/journal-entry.entity';
import { JournalEntryLine } from './entities/journal-entry-line.entity';

/**
 * Module de comptabilité OHADA (SYSCOHADA)
 * - Gestion du plan comptable
 * - Écritures comptables avec partie double
 * - Rapports financiers (Bilan, Compte de résultat, Grand livre)
 * - Automatisation des écritures (ventes, achats, paiements)
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Account, JournalEntry, JournalEntryLine]),
  ],
  controllers: [AccountingController],
  providers: [AccountingService, AccountingAutomationService],
  exports: [AccountingService, AccountingAutomationService],
})
export class AccountingModule {}
