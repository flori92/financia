import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '../../invoices/entities/invoice.entity';
import { Opportunity, OpportunityStatus } from '../../crm/entities/opportunity.entity';

@Injectable()
export class RevenueForecastService {
  constructor(
    @InjectRepository(Invoice) private invoiceRepo: Repository<Invoice>,
    @InjectRepository(Opportunity) private opportunityRepo: Repository<Opportunity>,
  ) {}

  async forecastRevenue(companyId: string, months: number = 3) {
    const historical = await this.getHistoricalRevenue(companyId, 12);
    const pipeline = await this.getPipelineRevenue(companyId);
    
    const avgMonthly = historical.reduce((sum, m) => sum + m.amount, 0) / historical.length;
    const trend = this.calculateTrend(historical);
    
    const forecast = [];
    for (let i = 1; i <= months; i++) {
      const baseAmount = avgMonthly * (1 + trend * i);
      const pipelineAmount = pipeline.filter(p => p.expectedMonth === i).reduce((sum, p) => sum + p.amount, 0);
      forecast.push({
        month: i,
        baseAmount,
        pipelineAmount,
        totalForecast: baseAmount + pipelineAmount,
        confidence: Math.max(0.5, 1 - (i * 0.1)),
      });
    }

    return { forecast, avgMonthly, trend, pipelineTotal: pipeline.reduce((sum, p) => sum + p.amount, 0) };
  }

  private async getHistoricalRevenue(companyId: string, months: number) {
    const invoices = await this.invoiceRepo.find({ 
      where: { companyId, invoiceType: 'sales', status: 'validated' } 
    });
    
    const byMonth = new Map<string, number>();
    for (const inv of invoices) {
      const month = new Date(inv.invoiceDate).toISOString().slice(0, 7);
      byMonth.set(month, (byMonth.get(month) || 0) + Number(inv.totalAmount));
    }
    
    return Array.from(byMonth.entries()).map(([month, amount]) => ({ month, amount }));
  }

  private async getPipelineRevenue(companyId: string) {
    const opportunities = await this.opportunityRepo.find({ 
      where: { companyId, status: OpportunityStatus.OPEN } 
    });
    
    return opportunities.map(opp => ({
      amount: Number(opp.amount) * (opp.probability || 50) / 100,
      expectedMonth: 1,
    }));
  }

  private calculateTrend(data: Array<{ month: string; amount: number }>): number {
    if (data.length < 2) return 0;
    const recent = data.slice(-3).reduce((sum, d) => sum + d.amount, 0) / 3;
    const older = data.slice(0, 3).reduce((sum, d) => sum + d.amount, 0) / 3;
    return older > 0 ? (recent - older) / older : 0;
  }
}
