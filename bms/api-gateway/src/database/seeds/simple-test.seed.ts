import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JournalEntry } from '../../accounting/entities/journal-entry.entity';
import { JournalEntryLine } from '../../accounting/entities/journal-entry-line.entity';
import { Account } from '../../accounting/entities/account.entity';

@Injectable()
export class SimpleTestSeedService {
  constructor(
    @InjectRepository(JournalEntry)
    private journalEntryRepo: Repository<JournalEntry>,
    @InjectRepository(JournalEntryLine)
    private journalLineRepo: Repository<JournalEntryLine>,
    @InjectRepository(Account)
    private accountRepo: Repository<Account>,
  ) {}

  async seedSimpleData(companyId: string) {
    console.log('🌱 Création données comptables simples...');

    // Récupérer les comptes
    const accounts = await this.accountRepo.find({ where: { companyId } });
    if (accounts.length === 0) {
      console.log('❌ Aucun compte trouvé. Exécutez d\'abord le seed SYSCOHADA.');
      return;
    }

    // Créer un mapping simple des comptes
    const accountMap: Record<string, string> = {};
    accounts.forEach(acc => {
      accountMap[acc.accountNumber] = acc.id;
    });

    // Créer des écritures sur 6 mois pour avoir des graphiques
    for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
      const currentDate = new Date();
      currentDate.setMonth(currentDate.getMonth() - monthOffset);
      
      // 10 écritures par mois
      for (let i = 0; i < 10; i++) {
        const entryDate = new Date(currentDate);
        entryDate.setDate(Math.floor(Math.random() * 28) + 1);

        // Écriture de vente (70% des cas)
        if (Math.random() > 0.3) {
          await this.createSimpleSale(entryDate, companyId, accountMap);
        } else {
          // Écriture d'achat
          await this.createSimplePurchase(entryDate, companyId, accountMap);
        }
      }
    }

    console.log('✅ Données comptables créées !');
  }

  private async createSimpleSale(date: Date, companyId: string, accountMap: Record<string, string>) {
    const amount = Math.floor(Math.random() * 2000000) + 500000;
    const vat = Math.floor(amount * 0.18);

    const entry = this.journalEntryRepo.create({
      companyId,
      entryNumber: `V${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
      entryDate: date.toISOString().split('T')[0],
      description: 'Vente marchandises',
      status: 'posted',
      totalDebit: amount + vat,
      totalCredit: amount + vat,
    });

    const savedEntry = await this.journalEntryRepo.save(entry);

    // Lignes d'écriture
    if (accountMap['411'] && accountMap['707'] && accountMap['4457']) {
      const lines = [
        {
          journalEntryId: savedEntry.id,
          accountId: accountMap['411'],
          debit: amount + vat,
          credit: 0,
          label: 'CLIENT VENTE',
        },
        {
          journalEntryId: savedEntry.id,
          accountId: accountMap['707'],
          debit: 0,
          credit: amount,
          label: 'VENTE MARCHANDISES',
        },
        {
          journalEntryId: savedEntry.id,
          accountId: accountMap['4457'],
          debit: 0,
          credit: vat,
          label: 'TVA COLLECTEE',
        },
      ];

      await this.journalLineRepo.save(lines);
    }
  }

  private async createSimplePurchase(date: Date, companyId: string, accountMap: Record<string, string>) {
    const amount = Math.floor(Math.random() * 1000000) + 200000;
    const vat = Math.floor(amount * 0.18);

    const entry = this.journalEntryRepo.create({
      companyId,
      entryNumber: `A${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
      entryDate: date.toISOString().split('T')[0],
      description: 'Achat marchandises',
      status: 'posted',
      totalDebit: amount + vat,
      totalCredit: amount + vat,
    });

    const savedEntry = await this.journalEntryRepo.save(entry);

    // Lignes d'écriture
    if (accountMap['607'] && accountMap['4456'] && accountMap['401']) {
      const lines = [
        {
          journalEntryId: savedEntry.id,
          accountId: accountMap['607'],
          debit: amount,
          credit: 0,
          label: 'ACHAT MARCHANDISES',
        },
        {
          journalEntryId: savedEntry.id,
          accountId: accountMap['4456'],
          debit: vat,
          credit: 0,
          label: 'TVA DEDUCTIBLE',
        },
        {
          journalEntryId: savedEntry.id,
          accountId: accountMap['401'],
          debit: 0,
          credit: amount + vat,
          label: 'FOURNISSEUR',
        },
      ];

      await this.journalLineRepo.save(lines);
    }
  }
}
