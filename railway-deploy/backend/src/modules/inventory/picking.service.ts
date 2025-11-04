import { Injectable } from '@nestjs/common';

@Injectable()
export class PickingService {
  async createPickingList(orderId: string): Promise<any> {
    const order = await this.getOrder(orderId);
    const items = await this.allocateStock(order.items);
    return { id: this.generateId(), orderId, items, status: 'pending', createdAt: new Date() };
  }

  async optimizeRoute(pickingId: string): Promise<any[]> {
    const picking = await this.getPicking(pickingId);
    return picking.items.sort((a, b) => a.location.localeCompare(b.location));
  }

  async validatePicking(pickingId: string, scannedItems: any[]): Promise<any> {
    const picking = await this.getPicking(pickingId);
    const errors = [];
    for (const item of picking.items) {
      const scanned = scannedItems.find(s => s.itemId === item.itemId);
      if (!scanned || scanned.quantity !== item.quantity) {
        errors.push({ itemId: item.itemId, expected: item.quantity, scanned: scanned?.quantity || 0 });
      }
    }
    return { pickingId, valid: errors.length === 0, errors };
  }

  private async getOrder(id: string): Promise<any> {
    return { items: [] };
  }

  private async getPicking(id: string): Promise<any> {
    return { items: [] };
  }

  private async allocateStock(items: any[]): Promise<any[]> {
    return items.map(i => ({ ...i, location: 'A-01-01' }));
  }

  private generateId(): string {
    return `PICK-${Date.now()}`;
  }
}
