import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '../../invoices/entities/invoice.entity';
import { Product } from '../../inventory/entities/product.entity';
import { PurchaseOrder } from '../../purchases/entities/purchase-order.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Invoice) private invoiceRepo: Repository<Invoice>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(PurchaseOrder) private purchaseOrderRepo: Repository<PurchaseOrder>,
  ) {}

  async getRevenueAnalytics(companyId: string, period: string) {
    // Analyse des revenus basée sur les factures réelles
    const startDate = this.getStartDate(period);
    
    const revenueData = await this.invoiceRepo
      .createQueryBuilder('invoice')
      .select([
        'DATE(invoice.createdAt) as date',
        'SUM(invoice.totalAmount) as revenue',
        'COUNT(invoice.id) as invoiceCount'
      ])
      .where('invoice.companyId = :companyId', { companyId })
      .andWhere('invoice.invoiceType = :type', { type: 'sale' })
      .andWhere('invoice.createdAt >= :startDate', { startDate })
      .andWhere('invoice.status = :status', { status: 'paid' })
      .groupBy('DATE(invoice.createdAt)')
      .orderBy('DATE(invoice.createdAt)', 'ASC')
      .getRawMany();

    const totalRevenue = revenueData.reduce((sum, day) => sum + Number(day.revenue), 0);
    const totalInvoices = revenueData.reduce((sum, day) => sum + Number(day.invoiceCount), 0);
    
    return { 
      period,
      totalRevenue,
      totalInvoices,
      averageInvoiceValue: totalInvoices > 0 ? totalRevenue / totalInvoices : 0,
      dailyData: revenueData.map(day => ({
        date: day.date,
        revenue: Number(day.revenue),
        invoiceCount: Number(day.invoiceCount)
      }))
    };
  }

  async getExpenseAnalytics(companyId: string, period: string) {
    // Analyse des dépenses basée sur les commandes d'achat réelles
    const startDate = this.getStartDate(period);
    
    const expenseData = await this.purchaseOrderRepo
      .createQueryBuilder('order')
      .leftJoin('order.supplier', 'supplier')
      .select([
        'supplier.name as category',
        'SUM(order.totalAmount) as amount',
        'COUNT(order.id) as orderCount'
      ])
      .where('order.companyId = :companyId', { companyId })
      .andWhere('order.orderDate >= :startDate', { startDate })
      .andWhere('order.status IN (:...statuses)', { statuses: ['approved', 'received'] })
      .groupBy('supplier.id, supplier.name')
      .orderBy('amount', 'DESC')
      .getRawMany();

    const totalExpenses = expenseData.reduce((sum, cat) => sum + Number(cat.amount), 0);
    
    return { 
      period,
      totalExpenses,
      categoryBreakdown: expenseData.map(cat => ({
        category: cat.category || 'Non catégorisé',
        amount: Number(cat.amount),
        orderCount: Number(cat.orderCount),
        percentage: totalExpenses > 0 ? (Number(cat.amount) / totalExpenses) * 100 : 0
      }))
    };
  }

  async getCustomerAnalytics(companyId: string) {
    // Analyse des clients basée sur les factures
    const customerData = await this.invoiceRepo
      .createQueryBuilder('invoice')
      .select([
        'invoice.customerName as name',
        'COUNT(invoice.id) as invoiceCount',
        'SUM(invoice.totalAmount) as totalSpent',
        'MAX(invoice.createdAt) as lastInvoiceDate'
      ])
      .where('invoice.companyId = :companyId', { companyId })
      .andWhere('invoice.invoiceType = :type', { type: 'sale' })
      .andWhere('invoice.customerName IS NOT NULL')
      .groupBy('invoice.customerName')
      .orderBy('totalSpent', 'DESC')
      .limit(20)
      .getRawMany();

    const totalCustomers = customerData.length;
    const totalRevenue = customerData.reduce((sum, cust) => sum + Number(cust.totalSpent), 0);
    const totalInvoices = customerData.reduce((sum, cust) => sum + Number(cust.invoiceCount), 0);
    const averageInvoiceValue = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;
    
    return { 
      totalCustomers,
      totalRevenue,
      totalInvoices,
      averageInvoiceValue,
      topCustomers: customerData.map(cust => ({
        name: cust.name,
        invoiceCount: Number(cust.invoiceCount),
        totalSpent: Number(cust.totalSpent),
        lastInvoiceDate: cust.lastInvoiceDate,
        averageInvoiceValue: Number(cust.invoiceCount) > 0 ? Number(cust.totalSpent) / Number(cust.invoiceCount) : 0
      }))
    };
  }

  async getProductAnalysis(companyId: string) {
    // Analyse des produits basée sur les stocks et ventes
    const productData = await this.productRepo
      .createQueryBuilder('product')
      .leftJoin('product.batches', 'batch')
      .select([
        'product.name',
        'product.category',
        'product.quantity as currentStock',
        'product.minQuantity',
        'product.maxQuantity',
        'COUNT(batch.id) as batchCount',
        'AVG(batch.unitCost) as averageCost'
      ])
      .where('product.companyId = :companyId', { companyId })
      .groupBy('product.id, product.name, product.category, product.quantity, product.minQuantity, product.maxQuantity')
      .orderBy('product.quantity', 'DESC')
      .getRawMany();

    const totalProducts = productData.length;
    const lowStockProducts = productData.filter(p => Number(p.currentStock) <= Number(p.minQuantity)).length;
    const outOfStockProducts = productData.filter(p => Number(p.currentStock) === 0).length;
    const totalStockValue = productData.reduce((sum, p) => sum + (Number(p.currentStock) * Number(p.averageCost || 0)), 0);
    
    return { 
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      totalStockValue,
      stockStatus: {
        inStock: totalProducts - lowStockProducts - outOfStockProducts,
        lowStock: lowStockProducts,
        outOfStock: outOfStockProducts
      },
      topProducts: productData.slice(0, 10).map(product => ({
        name: product.name,
        category: product.category,
        currentStock: Number(product.currentStock),
        minStock: Number(product.minQuantity),
        maxStock: Number(product.maxQuantity),
        stockValue: Number(product.currentStock) * Number(product.averageCost || 0),
        batchCount: Number(product.batchCount),
        averageCost: Number(product.averageCost || 0)
      }))
    };
  }

  private getStartDate(period: string): Date {
    const now = new Date();
    switch (period) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case '1y':
        return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }

  // Méthodes legacy pour compatibilité
  async getSalesAnalysis(companyId: string, period: string) {
    return this.getRevenueAnalytics(companyId, period);
  }

  async getExpenseAnalysis(companyId: string, period: string) {
    return this.getExpenseAnalytics(companyId, period);
  }

  async getProductAnalytics(companyId: string) {
    return this.getProductAnalysis(companyId);
  }
}
