import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async findAll(companyId: string, filters?: {
    search?: string;
    category?: string;
    status?: string;
  }): Promise<Product[]> {
    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .where('product.companyId = :companyId', { companyId });

    if (filters?.search) {
      queryBuilder.andWhere(
        '(product.name ILIKE :search OR product.sku ILIKE :search OR product.category ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    if (filters?.category) {
      queryBuilder.andWhere('product.category = :category', { category: filters.category });
    }

    if (filters?.status) {
      queryBuilder.andWhere('product.status = :status', { status: filters.status });
    }

    return queryBuilder
      .orderBy('product.name', 'ASC')
      .getMany();
  }

  async findOne(id: string, companyId: string): Promise<Product> {
    return this.productRepository.findOne({
      where: { id, companyId },
    });
  }

  async create(productData: Partial<Product>, companyId: string): Promise<Product> {
    const product = this.productRepository.create({
      ...productData,
      companyId,
      id: undefined, // Laisser la base générer l'ID
      lastUpdated: new Date(),
    });
    return this.productRepository.save(product);
  }

  async update(id: string, productData: Partial<Product>, companyId: string): Promise<Product> {
    await this.productRepository.update({ id, companyId }, {
      ...productData,
      lastUpdated: new Date(),
    });
    return this.findOne(id, companyId);
  }

  async remove(id: string, companyId: string): Promise<void> {
    await this.productRepository.delete({ id, companyId });
  }

  async getInventoryStats(companyId: string) {
    const products = await this.findAll(companyId);
    const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.unitPrice), 0);
    const lowStockProducts = products.filter(p => p.status === 'low_stock');
    const outOfStockProducts = products.filter(p => p.status === 'out_of_stock');
    
    return {
      totalProducts: products.length,
      totalValue,
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStockProducts.length,
      categories: [...new Set(products.map(p => p.category))],
      alertProducts: [...lowStockProducts, ...outOfStockProducts],
    };
  }

  async updateStockLevels(companyId: string) {
    const products = await this.findAll(companyId);
    
    for (const product of products) {
      let status: 'in_stock' | 'low_stock' | 'out_of_stock';
      
      if (product.quantity === 0) {
        status = 'out_of_stock';
      } else if (product.quantity <= product.minQuantity) {
        status = 'low_stock';
      } else {
        status = 'in_stock';
      }

      if (product.status !== status) {
        await this.productRepository.update(product.id, { 
          status, 
          lastUpdated: new Date() 
        });
      }
    }
  }
}
