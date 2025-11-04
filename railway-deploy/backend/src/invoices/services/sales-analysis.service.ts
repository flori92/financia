import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '../entities/invoice.entity';

@Injectable()
export class SalesAnalysisService {
  constructor(
    @InjectRepository(Invoice) private invoiceRepo: Repository<Invoice>,
  ) {}

  async getABCAnalysis(companyId: string, startDate: string, endDate: string) {
    const invoices = await this.invoiceRepo.find({
      where: { companyId, invoiceType: 'sales', status: 'validated' },
    });

    const customerSales = new Map<string, number>();
    for (const inv of invoices) {
      const current = customerSales.get(inv.partyName) || 0;
      customerSales.set(inv.partyName, current + Number(inv.totalAmount));
    }

    const sorted = Array.from(customerSales.entries())
      .sort((a, b) => b[1] - a[1]);
    
    const total = sorted.reduce((sum, [_, amount]) => sum + amount, 0);
    let cumulative = 0;
    const classified = sorted.map(([customer, amount]) => {
      cumulative += amount;
      const percentage = (cumulative / total) * 100;
      let category: 'A' | 'B' | 'C' = 'C';
      if (percentage <= 80) category = 'A';
      else if (percentage <= 95) category = 'B';
      return { customer, amount, percentage, category };
    });

    return {
      total,
      customers: classified,
      summary: {
        A: classified.filter(c => c.category === 'A').length,
        B: classified.filter(c => c.category === 'B').length,
        C: classified.filter(c => c.category === 'C').length,
      },
    };
  }

  async getParetoAnalysis(companyId: string) {
    const analysis = await this.getABCAnalysis(companyId, '', '');
    const top20Percent = Math.ceil(analysis.customers.length * 0.2);
    const top20 = analysis.customers.slice(0, top20Percent);
    const top20Revenue = top20.reduce((sum, c) => sum + c.amount, 0);
    const top20Percentage = (top20Revenue / analysis.total) * 100;

    return {
      totalCustomers: analysis.customers.length,
      top20Count: top20Percent,
      top20Revenue,
      top20Percentage,
      paretoVerified: top20Percentage >= 80,
    };
  }
}
