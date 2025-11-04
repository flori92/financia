import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { PurchaseReceipt } from './entities/purchase-receipt.entity';
import { Supplier } from './entities/supplier.entity';
import { Invoice } from '../invoices/entities/invoice.entity';

@Injectable()
export class PurchasesService {
  constructor(
    @InjectRepository(PurchaseOrder) private poRepo: Repository<PurchaseOrder>,
    @InjectRepository(PurchaseReceipt) private receiptRepo: Repository<PurchaseReceipt>,
    @InjectRepository(Supplier) private supplierRepo: Repository<Supplier>,
    @InjectRepository(Invoice) private invoiceRepo: Repository<Invoice>,
  ) {}

  // Méthodes pour les fournisseurs
  async getSuppliers(companyId: string): Promise<Supplier[]> {
    return this.supplierRepo.find({ 
      where: { companyId },
      relations: ['purchaseOrders']
    });
  }

  async createSupplier(supplierData: any): Promise<Supplier> {
    const supplier = this.supplierRepo.create({
      ...supplierData,
      status: supplierData.status || 'active'
    });
    const saved = await this.supplierRepo.save(supplier);
    return Array.isArray(saved) ? saved[0] : saved;
  }

  async getSupplier(id: string, companyId: string): Promise<Supplier> {
    const supplier = await this.supplierRepo.findOne({ 
      where: { id, companyId },
      relations: ['purchaseOrders']
    });
    
    if (!supplier) {
      throw new NotFoundException('Fournisseur non trouvé');
    }
    
    return supplier;
  }

  async updateSupplier(id: string, data: any, companyId: string): Promise<Supplier> {
    const supplier = await this.getSupplier(id, companyId);
    
    Object.assign(supplier, data);
    return this.supplierRepo.save(supplier);
  }

  async deleteSupplier(id: string, companyId: string): Promise<void> {
    const supplier = await this.getSupplier(id, companyId);
    await this.supplierRepo.remove(supplier);
  }

  // Méthodes pour les commandes d'achat
  async getOrders(companyId: string): Promise<PurchaseOrder[]> {
    return this.poRepo.find({ 
      where: { companyId },
      relations: ['supplier']
    });
  }

  async getOrder(id: string, companyId: string): Promise<PurchaseOrder> {
    const order = await this.poRepo.findOne({ 
      where: { id, companyId },
      relations: ['supplier']
    });
    
    if (!order) {
      throw new NotFoundException('Commande non trouvée');
    }
    
    return order;
  }

  async updateOrder(id: string, data: any, companyId: string): Promise<PurchaseOrder> {
    const order = await this.getOrder(id, companyId);
    
    Object.assign(order, data);
    return this.poRepo.save(order);
  }

  // Méthodes pour les réceptions
  async getReceipts(companyId: string): Promise<PurchaseReceipt[]> {
    return this.receiptRepo.find({ 
      where: { companyId },
      relations: ['purchaseOrder']
    });
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
    const pendingOrders = orders.filter(o => o.status === 'draft' || o.status === 'submitted').length;
    const activeSuppliers = suppliers.filter(s => s.status === 'active').length;
    
    return {
      totalOrders,
      totalOrdersCount: orders.length,
      pendingOrders,
      completedOrders: orders.filter(o => o.status === 'received').length,
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
