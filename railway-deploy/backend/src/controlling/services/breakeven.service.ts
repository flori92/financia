import { Injectable } from '@nestjs/common';
import { CostAccountingService } from './cost-accounting.service';

@Injectable()
export class BreakevenService {
  constructor(private costService: CostAccountingService) {}

  async calculateBreakeven(companyId: string, startDate: string, endDate: string) {
    const margins = await this.costService.calculateMargins(companyId, startDate, endDate);
    
    const fixedCosts = 100000; // À calculer depuis les comptes
    const variableCostRate = margins.costs / margins.revenue;
    const contributionMarginRate = 1 - variableCostRate;
    
    const breakevenRevenue = contributionMarginRate > 0 ? fixedCosts / contributionMarginRate : 0;
    const currentRevenue = margins.revenue;
    const safetyMargin = currentRevenue - breakevenRevenue;
    const safetyMarginRate = currentRevenue > 0 ? (safetyMargin / currentRevenue) * 100 : 0;
    
    return {
      breakevenRevenue,
      currentRevenue,
      safetyMargin,
      safetyMarginRate,
      fixedCosts,
      variableCostRate: variableCostRate * 100,
      contributionMarginRate: contributionMarginRate * 100,
    };
  }
}
