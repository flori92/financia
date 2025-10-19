import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '../../invoices/entities/invoice.entity';

@Injectable()
export class RevenueRecognitionService {
  constructor(
    @InjectRepository(Invoice) private invoiceRepo: Repository<Invoice>,
  ) {}

  async recognizeRevenue(companyId: string, method: 'invoice' | 'cash' | 'delivery' | 'percentage') {
    const invoices = await this.invoiceRepo.find({ where: { companyId, invoiceType: 'sales' } });
    
    let recognizedRevenue = 0;
    const details = [];

    for (const inv of invoices) {
      let amount = 0;
      if (method === 'invoice' && inv.status === 'validated') amount = Number(inv.totalAmount);
      else if (method === 'cash') amount = Number(inv.paidAmount || 0);
      else if (method === 'delivery' && inv.deliveryMethod) amount = Number(inv.totalAmount);
      
      recognizedRevenue += amount;
      if (amount > 0) details.push({ invoice: inv.invoiceNumber, amount, method });
    }

    return { recognizedRevenue, method, details };
  }

  async getDeferredRevenue(companyId: string) {
    const invoices = await this.invoiceRepo.find({ 
      where: { companyId, invoiceType: 'sales', status: 'validated' } 
    });

    let deferred = 0;
    for (const inv of invoices) {
      const paid = Number(inv.paidAmount || 0);
      const total = Number(inv.totalAmount);
      if (paid > total) deferred += (paid - total);
    }

    return { deferredRevenue: deferred };
  }
}
