import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../../accounting/entities/account.entity';

@Injectable()
export class RatiosService {
  constructor(
    @InjectRepository(Account) private accountsRepo: Repository<Account>,
  ) {}

  async calculateRatios(companyId: string, date: string) {
    const accounts = await this.accountsRepo.find({ where: { companyId } });
    
    const actifImmobilise = this.sumByClass(accounts, 2);
    const actifCirculant = this.sumByClass(accounts, 3) + this.sumByClass(accounts, 4, 'asset');
    const tresorerie = this.sumByClass(accounts, 5);
    const totalActif = actifImmobilise + actifCirculant + tresorerie;
    
    const capitaux = this.sumByClass(accounts, 1, 'equity');
    const dettes = this.sumByClass(accounts, 1, 'liability') + this.sumByClass(accounts, 4, 'liability');
    const totalPassif = capitaux + dettes;
    
    const fondsRoulement = capitaux - actifImmobilise;
    const bfr = actifCirculant - dettes;
    const tresorerieNette = fondsRoulement - bfr;
    
    const liquiditeGenerale = actifCirculant / (dettes || 1);
    const endettement = dettes / (capitaux || 1);
    const autonomieFinanciere = capitaux / totalPassif;

    return {
      structure: { fondsRoulement, bfr, tresorerieNette },
      liquidite: { liquiditeGenerale },
      endettement: { tauxEndettement: endettement, autonomieFinanciere },
      date,
    };
  }

  private sumByClass(accounts: Account[], cls: number, type?: string): number {
    return accounts
      .filter(a => a.syscohadaClass === cls && (!type || a.accountType === type))
      .reduce((sum, a) => sum + Math.abs(Number(a.balance || 0)), 0);
  }
}
