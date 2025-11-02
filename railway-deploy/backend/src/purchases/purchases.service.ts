import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { PurchaseReceipt } from './entities/purchase-receipt.entity';
import { Invoice } from '../invoices/entities/invoice.entity';

@Injectable()
export class PurchasesService {
  constructor(
    @InjectRepository(PurchaseOrder) private poRepo: Repository<PurchaseOrder>,
    @InjectRepository(PurchaseReceipt) private receiptRepo: Repository<PurchaseReceipt>,
    @InjectRepository(Invoice) private invoiceRepo: Repository<Invoice>,
  ) {}

  async createOrder(data: any) {
    const orderNumber = await this.generateOrderNumber(data.companyId);
    const order = this.poRepo.create({ ...data, orderNumber });
    return this.poRepo.save(order);
  }

  async getOrders(companyId?: string) {
    if (companyId) {
      return this.poRepo.find({ 
        where: { companyId },
        order: { createdAt: 'DESC' }
      });
    }
    return this.poRepo.find({ order: { createdAt: 'DESC' } });
  }

  async createReceipt(data: any) {
    const receiptNumber = await this.generateReceiptNumber(data.companyId);
    const receipt = this.receiptRepo.create({ ...data, receiptNumber });
    const saved = await this.receiptRepo.save(receipt);
    
    const order = await this.poRepo.findOne({ where: { id: data.purchaseOrderId } });
    if (order) {
      order.receivedAmount += data.receivedAmount;
      if (order.receivedAmount >= order.totalAmount) order.status = 'received';
      await this.poRepo.save(order);
    }
    return saved;
  }

  async threeWayMatch(purchaseOrderId: string) {
    const order = await this.poRepo.findOne({ where: { id: purchaseOrderId } });
    const receipts = await this.receiptRepo.find({ where: { purchaseOrderId } });
    const invoice = await this.invoiceRepo.findOne({ 
      where: { invoiceNumber: order.orderNumber, invoiceType: 'purchase' } 
    });

    const totalReceived = receipts.reduce((sum, r) => sum + Number(r.receivedAmount), 0);
    const match = {
      orderAmount: order.totalAmount,
      receivedAmount: totalReceived,
      invoiceAmount: invoice?.totalAmount || 0,
      isMatched: Math.abs(order.totalAmount - totalReceived) < 0.01 && 
                 Math.abs(order.totalAmount - (invoice?.totalAmount || 0)) < 0.01,
    };
    return match;
  }

  private async generateOrderNumber(companyId: string) {
    const count = await this.poRepo.count({ where: { companyId } });
    const year = new Date().getFullYear();
    return `PO-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  private async generateReceiptNumber(companyId: string) {
    const count = await this.receiptRepo.count({ where: { companyId } });
    const year = new Date().getFullYear();
    return `PR-${year}-${String(count + 1).padStart(4, '0')}`;
  }
}
