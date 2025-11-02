import { Injectable } from '@nestjs/common';

interface BillOfExchange {
  id: string;
  companyId: string;
  billNumber: string;
  amount: number;
  issueDate: Date;
  dueDate: Date;
  drawer: string;
  drawee: string;
  status: 'issued' | 'accepted' | 'discounted' | 'paid' | 'dishonored';
}

@Injectable()
export class BillsOfExchangeService {
  private bills: BillOfExchange[] = [];

  async create(data: any) {
    const bill: BillOfExchange = {
      id: `BOE-${Date.now()}`,
      billNumber: `LCR-${new Date().getFullYear()}-${String(this.bills.length + 1).padStart(4, '0')}`,
      status: 'issued',
      ...data,
    };
    this.bills.push(bill);
    return bill;
  }

  async discount(billId: string, bankRate: number) {
    const bill = this.bills.find(b => b.id === billId);
    if (!bill || bill.status !== 'accepted') throw new Error('Traite non acceptée');

    const daysToMaturity = Math.ceil((new Date(bill.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const discountAmount = (bill.amount * bankRate * daysToMaturity) / 36000;
    const netAmount = bill.amount - discountAmount;

    bill.status = 'discounted';
    return { billId, amount: bill.amount, discountAmount, netAmount, daysToMaturity };
  }

  async findAll(companyId: string) {
    return this.bills.filter(b => b.companyId === companyId);
  }
}
