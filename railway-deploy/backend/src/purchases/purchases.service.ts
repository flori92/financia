import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { PurchaseReceipt } from './entities/purchase-receipt.entity';
import { Invoice } from '../invoices/entities/invoice.entity';

@Injectable()
export class PurchasesService {
  private suppliers: any[] = []; // Stockage temporaire en mémoire
  
  constructor(
    @InjectRepository(PurchaseOrder) private poRepo: Repository<PurchaseOrder>,
    @InjectRepository(PurchaseReceipt) private receiptRepo: Repository<PurchaseReceipt>,
    @InjectRepository(Invoice) private invoiceRepo: Repository<Invoice>,
  ) {}

  // Méthodes pour les fournisseurs
  async getSuppliers(companyId: string) {
    return this.suppliers.filter(s => s.companyId === companyId);
  }

  async createSupplier(supplierData: any) {
    const supplier = {
      id: `SUP-${Date.now()}`,
      ...supplierData,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.suppliers.push(supplier);
    return supplier;
  }

  async getSupplier(id: string, companyId: string) {
    return this.suppliers.find(s => s.id === id && s.companyId === companyId);
  }

  async updateSupplier(id: string, data: any, companyId: string) {
    const index = this.suppliers.findIndex(s => s.id === id && s.companyId === companyId);
    if (index === -1) {
      throw new Error('Fournisseur non trouvé');
    }
    
    this.suppliers[index] = {
      ...this.suppliers[index],
      ...data,
      updatedAt: new Date()
    };
    return this.suppliers[index];
  }

  async deleteSupplier(id: string, companyId: string) {
    const index = this.suppliers.findIndex(s => s.id === id && s.companyId === companyId);
    if (index === -1) {
      throw new Error('Fournisseur non trouvé');
    }
    
    const deleted = this.suppliers[index];
    this.suppliers.splice(index, 1);
    return { deleted: true, supplier: deleted };
  }

  // Méthodes pour les commandes d'achat
  async getOrders(companyId: string) {
    return this.poRepo.find({ where: { companyId } });
  }

  async getOrder(id: string, companyId: string) {
    return this.poRepo.findOne({ where: { id, companyId } });
  }

  async updateOrder(id: string, data: any, companyId: string) {
    await this.poRepo.update({ id, companyId }, data);
    return this.getOrder(id, companyId);
  }

  // Méthodes pour les réceptions
  async getReceipts(companyId: string) {
    return this.receiptRepo.find({ where: { companyId } });
  }

  // Méthodes existantes
  async createOrder(data: any) {
    const orderNumber = await this.generateOrderNumber(data.companyId);
    const order = this.poRepo.create({ ...data, orderNumber });
    return this.poRepo.save(order);
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

  async getPurchaseStats(companyId: string) {
    const orders = await this.getOrders(companyId);
    const receipts = await this.getReceipts(companyId);
    const suppliers = await this.getSuppliers(companyId);
    
    const totalOrders = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const activeSuppliers = suppliers.filter(s => s.status === 'active').length;
    
    return {
      totalOrders,
      totalOrdersCount: orders.length,
      pendingOrders,
      completedOrders: orders.filter(o => o.status === 'completed').length,
      totalReceipts: receipts.length,
      activeSuppliers,
      totalSuppliers: suppliers.length
    };
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
