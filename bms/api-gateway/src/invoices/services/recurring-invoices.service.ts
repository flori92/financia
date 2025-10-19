import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '../entities/invoice.entity';

interface RecurringInvoice {
  id: string;
  companyId: string;
  templateInvoiceId: string;
  frequency: 'monthly' | 'quarterly' | 'yearly';
  startDate: Date;
  endDate?: Date;
  nextGenerationDate: Date;
  isActive: boolean;
}

@Injectable()
export class RecurringInvoicesService {
  private recurringInvoices: RecurringInvoice[] = [];

  constructor(
    @InjectRepository(Invoice) private invoiceRepo: Repository<Invoice>,
  ) {}

  async createRecurring(data: any) {
    const recurring: RecurringInvoice = {
      id: `REC-${Date.now()}`,
      ...data,
      nextGenerationDate: data.startDate,
      isActive: true,
    };
    this.recurringInvoices.push(recurring);
    return recurring;
  }

  async generateDueInvoices() {
    const now = new Date();
    const generated = [];

    for (const rec of this.recurringInvoices.filter(r => r.isActive)) {
      if (rec.nextGenerationDate <= now) {
        const template = await this.invoiceRepo.findOne({ where: { id: rec.templateInvoiceId } });
        if (template) {
          const newInvoice = this.invoiceRepo.create({
            ...template,
            id: undefined,
            invoiceDate: now,
            reference: `${template.reference}-${now.getTime()}`,
          });
          const saved = await this.invoiceRepo.save(newInvoice);
          generated.push(saved);

          rec.nextGenerationDate = this.calculateNextDate(rec.nextGenerationDate, rec.frequency);
        }
      }
    }
    return generated;
  }

  private calculateNextDate(date: Date, frequency: string): Date {
    const next = new Date(date);
    if (frequency === 'monthly') next.setMonth(next.getMonth() + 1);
    else if (frequency === 'quarterly') next.setMonth(next.getMonth() + 3);
    else if (frequency === 'yearly') next.setFullYear(next.getFullYear() + 1);
    return next;
  }
}
