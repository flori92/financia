import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JournalEntry } from '../../accounting/entities/journal-entry.entity';
import { JournalEntryLine } from '../../accounting/entities/journal-entry-line.entity';

@Injectable()
export class FecService {
  constructor(
    @InjectRepository(JournalEntry) private entriesRepo: Repository<JournalEntry>,
    @InjectRepository(JournalEntryLine) private linesRepo: Repository<JournalEntryLine>,
  ) {}

  async generateFEC(companyId: string, year: number): Promise<string> {
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;
    
    const entries = await this.entriesRepo
      .createQueryBuilder('entry')
      .leftJoinAndSelect('entry.lines', 'line')
      .leftJoinAndSelect('line.account', 'account')
      .where('entry.companyId = :companyId', { companyId })
      .andWhere('entry.entryDate BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('entry.status = :status', { status: 'posted' })
      .orderBy('entry.entryDate', 'ASC')
      .getMany();

    const lines = [];
    lines.push(this.getFECHeader());
    
    for (const entry of entries) {
      for (const line of entry.lines) {
        lines.push(this.formatFECLine(entry, line));
      }
    }
    
    return lines.join('\n');
  }

  private getFECHeader(): string {
    return 'JournalCode|JournalLib|EcritureNum|EcritureDate|CompteNum|CompteLib|CompAuxNum|CompAuxLib|PieceRef|PieceDate|EcritureLib|Debit|Credit|EcritureLet|DateLet|ValidDate|Montantdevise|Idevise';
  }

  private formatFECLine(entry: JournalEntry, line: JournalEntryLine): string {
    const date = this.formatDate(entry.entryDate);
    return [
      entry.journalType.toUpperCase(),
      this.getJournalLabel(entry.journalType),
      entry.entryNumber,
      date,
      line.account.accountNumber,
      line.account.accountName,
      '',
      '',
      entry.reference || '',
      date,
      line.label,
      this.formatAmount(line.debit),
      this.formatAmount(line.credit),
      '',
      '',
      date,
      '',
      'XOF',
    ].join('|');
  }

  private formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().slice(0, 10).replace(/-/g, '');
  }

  private formatAmount(amount: number | string): string {
    return Number(amount || 0).toFixed(2).replace('.', ',');
  }

  private getJournalLabel(type: string): string {
    const labels = {
      sales: 'Ventes',
      purchase: 'Achats',
      bank: 'Banque',
      general: 'Opérations Diverses',
    };
    return labels[type] || type;
  }
}
