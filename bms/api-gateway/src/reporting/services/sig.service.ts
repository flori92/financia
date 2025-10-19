import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../../accounting/entities/account.entity';
import { JournalEntry } from '../../accounting/entities/journal-entry.entity';

@Injectable()
export class SigService {
  constructor(
    @InjectRepository(Account) private accountsRepo: Repository<Account>,
    @InjectRepository(JournalEntry) private entriesRepo: Repository<JournalEntry>,
  ) {}

  async calculateSIG(companyId: string, startDate: string, endDate: string) {
    const accounts = await this.accountsRepo.find({ where: { companyId } });
    
    // Classe 7: Produits
    const ventes = this.sumAccounts(accounts, ['701', '706', '707']);
    const autresProduits = this.sumAccounts(accounts, ['75', '781']);
    
    // Classe 6: Charges
    const achats = this.sumAccounts(accounts, ['601', '602', '606', '607']);
    const servicesExt = this.sumAccounts(accounts, ['611', '613', '615', '618']);
    const impots = this.sumAccounts(accounts, ['63']);
    const personnel = this.sumAccounts(accounts, ['64']);
    const dotations = this.sumAccounts(accounts, ['68']);
    
    const margeCommerciale = ventes - achats;
    const production = ventes;
    const consommations = achats + servicesExt;
    const valeurAjoutee = production - consommations;
    const ebe = valeurAjoutee - impots - personnel;
    const resultatExploitation = ebe - dotations;
    const resultatCourant = resultatExploitation;
    const resultatNet = resultatCourant;

    return {
      margeCommerciale,
      production,
      consommations,
      valeurAjoutee,
      ebe,
      resultatExploitation,
      resultatCourant,
      resultatNet,
      period: { startDate, endDate },
    };
  }

  private sumAccounts(accounts: Account[], prefixes: string[]): number {
    return accounts
      .filter(a => prefixes.some(p => a.accountNumber.startsWith(p)))
      .reduce((sum, a) => sum + Number(a.balance || 0), 0);
  }
}
