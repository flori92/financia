import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../../accounting/entities/account.entity';

@Injectable()
export class CostAccountingService {
  constructor(
    @InjectRepository(Account) private accountsRepo: Repository<Account>,
  ) {}

  async calculateCostPrice(companyId: string, productId: string) {
    const accounts = await this.accountsRepo.find({ where: { companyId } });
    
    const directCosts = this.sumAccounts(accounts, ['601', '602']);
    const indirectCosts = this.sumAccounts(accounts, ['611', '613', '615']);
    const laborCosts = this.sumAccounts(accounts, ['64']);
    
    const totalCost = directCosts + indirectCosts + laborCosts;
    
    return {
      productId,
      directCosts,
      indirectCosts,
      laborCosts,
      totalCost,
      breakdown: {
        materials: directCosts,
        overhead: indirectCosts,
        labor: laborCosts,
      },
    };
  }

  async calculateMargins(companyId: string, startDate: string, endDate: string) {
    const accounts = await this.accountsRepo.find({ where: { companyId } });
    
    const revenue = this.sumAccounts(accounts, ['701', '706', '707']);
    const costs = this.sumAccounts(accounts, ['601', '602', '606', '607']);
    
    const grossMargin = revenue - costs;
    const grossMarginRate = revenue > 0 ? (grossMargin / revenue) * 100 : 0;
    
    return {
      revenue,
      costs,
      grossMargin,
      grossMarginRate,
      period: { startDate, endDate },
    };
  }

  private sumAccounts(accounts: Account[], prefixes: string[]): number {
    return accounts
      .filter(a => prefixes.some(p => a.accountNumber.startsWith(p)))
      .reduce((sum, a) => sum + Math.abs(Number(a.balance || 0)), 0);
  }
}
