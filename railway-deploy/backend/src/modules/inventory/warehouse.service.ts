import { Injectable } from '@nestjs/common';

@Injectable()
export class WarehouseService {
  private warehouses: any[] = []; // Stockage temporaire en mémoire

  async createWarehouse(data: any): Promise<any> {
    const warehouse = { 
      id: this.generateId(), 
      ...data, 
      locations: [],
      createdAt: new Date(),
      status: 'active'
    };
    this.warehouses.push(warehouse);
    return warehouse;
  }

  async createLocation(warehouseId: string, data: any): Promise<any> {
    return { id: this.generateId(), warehouseId, ...data, type: data.type || 'storage' };
  }

  async transferBetweenWarehouses(fromId: string, toId: string, items: any[], companyId?: string): Promise<any> {
    return { 
      id: this.generateId(), 
      from: fromId, 
      to: toId, 
      items, 
      status: 'pending', 
      createdAt: new Date(),
      companyId
    };
  }

  async getStock(warehouseId: string, itemId?: string): Promise<any> {
    if (itemId) {
      return { warehouseId, itemId, quantity: 0, locations: [] };
    }
    return { warehouseId, items: [] };
  }

  async moveToLocation(itemId: string, fromLoc: string, toLoc: string, quantity: number): Promise<any> {
    return { itemId, from: fromLoc, to: toLoc, quantity, movedAt: new Date() };
  }

  async getWarehouses(companyId: string): Promise<any[]> {
    return this.warehouses.filter(wh => wh.companyId === companyId);
  }

  private generateId(): string {
    return `WH-${Date.now()}`;
  }
}
