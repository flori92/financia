import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Invoice } from '../entities/invoice.entity';
import { NotificationsService } from '../../notifications/notifications.service';

@Injectable()
export class RemindersService {
  constructor(
    @InjectRepository(Invoice) private invoiceRepo: Repository<Invoice>,
    private notificationsService: NotificationsService,
  ) {}

  async sendReminders() {
    const now = new Date();
    const unpaidInvoices = await this.invoiceRepo.find({
      where: { paymentStatus: 'unpaid', dueDate: LessThan(now) },
    });

    const reminders = [];
    for (const invoice of unpaidInvoices) {
      const daysOverdue = Math.floor((now.getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24));
      
      let level: 'gentle' | 'firm' | 'formal' | 'legal' = 'gentle';
      if (daysOverdue > 45) level = 'legal';
      else if (daysOverdue > 30) level = 'formal';
      else if (daysOverdue > 15) level = 'firm';

      const penalty = this.calculatePenalty(invoice.totalAmount, daysOverdue);
      
      await this.notificationsService.sendInvoiceReminder({
        customerEmail: 'customer@example.com', // TODO: récupérer depuis invoice
        customerPhone: '+22900000000', // TODO: récupérer depuis invoice
        invoiceNumber: invoice.invoiceNumber,
        amount: Number(invoice.totalAmount),
        daysOverdue,
        invoiceUrl: `https://app.bms.com/invoices/${invoice.id}`,
      });

      reminders.push({ invoice: invoice.invoiceNumber, level, daysOverdue, penalty });
    }
    return reminders;
  }

  private calculatePenalty(amount: number, daysOverdue: number): number {
    const rate = 0.0004; // 0.04% par jour
    return Math.round(amount * rate * daysOverdue + 40); // +40 XOF indemnité forfaitaire
  }
}
