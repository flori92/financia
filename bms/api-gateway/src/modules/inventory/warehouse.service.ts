import { Injectable } from '@nestjs/common';

@Injectable()
export class WarehouseService {
  async createWarehouse(data: any): Promise<any> {
    return { id: this.generateId(), ...data, locations: [] };
  }

  async createLocation(warehouseId: string, data: any): Promise<any> {
    return { id: this.generateId(), warehouseId, ...data, type: data.type || 'storage' };
  }

  async transferBetweenWarehouses(fromId: string, toId: string, items: any[]): Promise<any> {
    return { id: this.generateId(), from: fromId, to: toId, items, status: 'pending', createdAt: new Date() };
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

  private generateId(): string {
    return `WH-${Date.now()}`;
  }
}
