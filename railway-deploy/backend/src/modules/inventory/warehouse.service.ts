import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse } from './entities/warehouse.entity';
import { WarehouseLocation } from './entities/warehouse-location.entity';
import { InventoryBatch } from '../../inventory/entities/inventory-batch.entity';

@Injectable()
export class WarehouseService {
  constructor(
    @InjectRepository(Warehouse) private warehouseRepo: Repository<Warehouse>,
    @InjectRepository(WarehouseLocation) private locationRepo: Repository<WarehouseLocation>,
    @InjectRepository(InventoryBatch) private batchRepo: Repository<InventoryBatch>,
  ) {}

  async createWarehouse(data: any): Promise<Warehouse> {
    const warehouse = this.warehouseRepo.create({
      ...data,
      usedCapacity: 0,
      status: 'active'
    });
    const saved = await this.warehouseRepo.save(warehouse);
    return Array.isArray(saved) ? saved[0] : saved;
  }

  async createLocation(warehouseId: string, data: any): Promise<WarehouseLocation> {
    const location = this.locationRepo.create({
      ...data,
      warehouseId,
      usedCapacity: 0,
      status: 'active'
    });
    const saved = await this.locationRepo.save(location);
    return Array.isArray(saved) ? saved[0] : saved;
  }

  async getWarehouses(companyId: string): Promise<Warehouse[]> {
    return this.warehouseRepo.find({ 
      where: { companyId },
      relations: ['locations']
    });
  }

  async getWarehouse(id: string, companyId: string): Promise<Warehouse> {
    const warehouse = await this.warehouseRepo.findOne({ 
      where: { id, companyId },
      relations: ['locations']
    });
    
    if (!warehouse) {
      throw new NotFoundException('Entrepôt non trouvé');
    }
    
    return warehouse;
  }

  async transferBetweenWarehouses(
    fromWarehouseId: string, 
    toWarehouseId: string, 
    items: any[], 
    companyId: string
  ): Promise<any> {
    // Vérifier que les entrepôts existent et appartiennent à l'entreprise
    const [fromWarehouse, toWarehouse] = await Promise.all([
      this.getWarehouse(fromWarehouseId, companyId),
      this.getWarehouse(toWarehouseId, companyId)
    ]);

    const transfer = {
      id: `TRANSFER-${Date.now()}`,
      fromWarehouseId,
      toWarehouseId,
      items,
      transferredBy: companyId,
      transferredAt: new Date(),
      status: 'completed'
    };

    // Mettre à jour les capacités utilisées
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    
    await Promise.all([
      this.warehouseRepo.update(fromWarehouseId, {
        usedCapacity: Math.max(0, fromWarehouse.usedCapacity - totalQuantity)
      }),
      this.warehouseRepo.update(toWarehouseId, {
        usedCapacity: toWarehouse.usedCapacity + totalQuantity
      })
    ]);

    return transfer;
  }

  async getStock(warehouseId: string, itemId?: string): Promise<any> {
    const query = this.batchRepo.createQueryBuilder('batch')
      .leftJoin('batch.product', 'product')
      .leftJoin('batch.location', 'location')
      .where('batch.warehouseId = :warehouseId', { warehouseId })
      .andWhere('batch.currentQuantity > 0');

    if (itemId) {
      query.andWhere('batch.productId = :itemId', { itemId });
    }

    const batches = await query.getMany();
    
    return {
      warehouseId,
      totalItems: batches.length,
      totalQuantity: batches.reduce((sum, batch) => sum + Number(batch.currentQuantity), 0),
      items: batches.map(batch => ({
        productId: batch.productId,
        productName: batch.product?.name,
        quantity: batch.currentQuantity,
        batchNumber: batch.batchNumber,
        location: batch.location?.name
      }))
    };
  }

  async updateWarehouse(id: string, data: any, companyId: string): Promise<Warehouse> {
    const warehouse = await this.getWarehouse(id, companyId);
    
    Object.assign(warehouse, data);
    return this.warehouseRepo.save(warehouse);
  }

  async deleteWarehouse(id: string, companyId: string): Promise<void> {
    const warehouse = await this.getWarehouse(id, companyId);
    await this.warehouseRepo.remove(warehouse);
  }

  private generateId(): string {
    return `WH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async moveToLocation(itemId: string, fromLoc: string, toLoc: string, quantity: number): Promise<any> {
    return { itemId, from: fromLoc, to: toLoc, quantity, movedAt: new Date() };
  }
}
