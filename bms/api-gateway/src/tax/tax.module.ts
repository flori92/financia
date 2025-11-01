import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaxController } from './tax.controller';
import { TaxService } from './tax.service';
import { FecService } from './services/fec.service';
import { DgfipService } from './services/dgfip.service';
import { PdfGeneratorService } from './services/pdf-generator.service';
import { JournalEntry } from '../accounting/entities/journal-entry.entity';
import { JournalEntryLine } from '../accounting/entities/journal-entry-line.entity';
import { Account } from '../accounting/entities/account.entity';
import { Company } from '../companies/entities/company.entity';

/**
 * Module de gestion fiscale
 * - Déclaration de TVA
 * - Calculs et exports
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      JournalEntry,
      JournalEntryLine,
      Account,
      Company,
    ]),
  ],
  controllers: [TaxController],
  providers: [TaxService, FecService, DgfipService, PdfGeneratorService],
  exports: [TaxService],
})
export class TaxModule {}
