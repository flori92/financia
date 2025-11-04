import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quote } from './entities/quote.entity';
import { InvoicesService } from '../invoices/invoices.service';

@Injectable()
export class QuotesService {
  constructor(
    @InjectRepository(Quote) private quoteRepo: Repository<Quote>,
    private invoicesService: InvoicesService,
  ) {}

  async create(data: any) {
    const quoteNumber = await this.generateQuoteNumber(data.companyId);
    const quote = this.quoteRepo.create({ ...data, quoteNumber });
    return this.quoteRepo.save(quote);
  }

  async convertToInvoice(quoteId: string, userId: string) {
    const quote = await this.quoteRepo.findOne({ where: { id: quoteId } });
    if (!quote || quote.status !== 'accepted') {
      throw new Error('Devis non accepté');
    }

    const invoice = await this.invoicesService.create({
      companyId: quote.companyId,
      partyName: quote.customerName,
      invoiceType: 'sales' as 'sales',
      items: [{
        itemName: 'Devis ' + quote.quoteNumber,
        quantity: 1,
        unitPrice: Number(quote.totalAmount),
      }],
    }, userId);

    quote.status = 'converted';
    quote.convertedInvoiceId = invoice.id;
    await this.quoteRepo.save(quote);

    return invoice;
  }

  private async generateQuoteNumber(companyId: string) {
    const count = await this.quoteRepo.count({ where: { companyId } });
    return `QT-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
  }
}
