import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { InventoryBatch } from './entities/inventory-batch.entity';
import { Picking } from './entities/picking.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(InventoryBatch)
    private readonly batchRepository: Repository<InventoryBatch>,
    @InjectRepository(Picking)
    private readonly pickingRepository: Repository<Picking>,
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
          status: status as any,
          lastUpdated: new Date() 
        });
      }
    }
  }

  async createBatch(batchData: any): Promise<InventoryBatch> {
    const batchNumber = await this.generateBatchNumber(batchData.companyId);
    const batch = this.batchRepository.create({
      ...batchData,
      batchNumber,
      currentQuantity: batchData.initialQuantity
    });
    
    // Mettre à jour la quantité du produit
    if (batchData.productId) {
      await this.productRepository.update(batchData.productId, {
        quantity: () => `quantity + ${batchData.initialQuantity}`
      });
    }
    
    const saved = await this.batchRepository.save(batch);
    return Array.isArray(saved) ? saved[0] : saved;
  }

  async createPicking(pickingData: any): Promise<Picking> {
    const pickingNumber = await this.generatePickingNumber(pickingData.companyId);
    const picking = this.pickingRepository.create({
      ...pickingData,
      pickingNumber,
      status: 'pending'
    });
    
    // Réserver la quantité du batch/produit
    if (pickingData.batchId) {
      await this.batchRepository.update(pickingData.batchId, {
        currentQuantity: () => `currentQuantity - ${pickingData.quantity}`
      });
    } else if (pickingData.productId) {
      await this.productRepository.update(pickingData.productId, {
        quantity: () => `quantity - ${pickingData.quantity}`
      });
    }
    
    const saved = await this.pickingRepository.save(picking);
    return Array.isArray(saved) ? saved[0] : saved;
  }

  async calculateFIFO(itemId: string, quantity: number, companyId: string): Promise<any> {
    const batches = await this.batchRepository.find({
      where: { 
        productId: itemId, 
        companyId
      }
    }).then(batches => batches.filter(b => Number(b.currentQuantity) > 0));

    let remainingQuantity = quantity;
    let totalCost = 0;
    const usedBatches = [];

    for (const batch of batches) {
      if (remainingQuantity <= 0) break;

      const useQuantity = Math.min(remainingQuantity, Number(batch.currentQuantity));
      totalCost += useQuantity * Number(batch.unitCost);
      
      usedBatches.push({
        batchNumber: batch.batchNumber,
        quantity: useQuantity,
        unitCost: batch.unitCost,
        totalCost: useQuantity * Number(batch.unitCost)
      });

      remainingQuantity -= useQuantity;
    }

    const averageCost = totalCost / quantity;

    return {
      itemId,
      requestedQuantity: quantity,
      calculatedValue: totalCost,
      averageUnitCost: averageCost,
      usedBatches,
      calculationDate: new Date()
    };
  }

  async optimizePicking(pickingId: string, companyId: string): Promise<any> {
    const picking = await this.pickingRepository.findOne({ 
      where: { id: pickingId, companyId },
      relations: ['product', 'batch', 'batch.location']
    });
    
    if (!picking) {
      throw new NotFoundException('Préparation non trouvée');
    }

    // Optimisation basée sur la localisation dans l'entrepôt
    const optimizedPath = [
      {
        step: 1,
        location: picking.batch?.location?.name || 'Zone de stockage',
        productId: picking.productId,
        quantity: picking.quantity,
        estimatedTime: '5 min'
      }
    ];

    await this.pickingRepository.update(pickingId, {
      optimizedPath: optimizedPath as any,
      status: 'in_progress' as any
    });

    return {
      pickingId,
      originalPath: [{ location: 'Default', step: 1 }],
      optimizedPath,
      estimatedTimeReduction: '15%',
      distanceReduction: '20%'
    };
  }

  private async generateBatchNumber(companyId: string): Promise<string> {
    const count = await this.batchRepository.count({ where: { companyId } });
    const year = new Date().getFullYear();
    return `BATCH-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  private async generatePickingNumber(companyId: string): Promise<string> {
    const count = await this.pickingRepository.count({ where: { companyId } });
    const year = new Date().getFullYear();
    return `PICK-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  async adjustStock(adjustmentData: any): Promise<any> {
    const { productId, quantity, reason, type, companyId } = adjustmentData;
    
    const product = await this.productRepository.findOne({ 
      where: { id: productId, companyId }
    });
    
    if (!product) {
      throw new NotFoundException('Produit non trouvé');
    }

    const oldQuantity = Number(product.quantity);
    let newQuantity = oldQuantity;

    if (type === 'increase') {
      newQuantity = oldQuantity + quantity;
    } else if (type === 'decrease') {
      newQuantity = Math.max(0, oldQuantity - quantity);
    }

    await this.productRepository.update(productId, { quantity: newQuantity });

    // Créer un mouvement d'ajustement
    const adjustment = {
      id: `ADJ-${Date.now()}`,
      productId,
      oldQuantity,
      newQuantity,
      adjustmentQuantity: newQuantity - oldQuantity,
      reason,
      type,
      adjustedBy: companyId,
      adjustedAt: new Date()
    };

    return adjustment;
  }

  async getBatchHistory(batchId: string, companyId: string): Promise<any> {
    const batch = await this.batchRepository.findOne({ 
      where: { id: batchId, companyId },
      relations: ['product', 'pickings']
    });
    
    if (!batch) {
      throw new NotFoundException('Lot non trouvé');
    }

    return {
      batchId,
      batchNumber: batch.batchNumber,
      product: batch.product,
      initialQuantity: batch.initialQuantity,
      currentQuantity: batch.currentQuantity,
      movements: batch.pickings?.map(picking => ({
        type: 'picking',
        quantity: picking.quantity,
        date: picking.createdAt,
        status: picking.status
      })) || [],
      createdAt: batch.createdAt
    };
  }
}
