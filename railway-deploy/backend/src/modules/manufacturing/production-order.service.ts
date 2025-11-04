import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductionOrderService {
  async createOrder(data: any): Promise<any> {
    return { id: this.generateId(), ...data, status: 'draft', progress: 0 };
  }

  async planOrder(orderId: string): Promise<any> {
    const order = await this.getOrder(orderId);
    const materials = await this.checkMaterials(order.bomId);
    const capacity = await this.checkCapacity(order.workcenterId, order.quantity);
    return { orderId, startDate: capacity.availableDate, materials, status: 'planned' };
  }

  async startProduction(orderId: string): Promise<any> {
    return { orderId, status: 'in_progress', startedAt: new Date() };
  }

  async reportProgress(orderId: string, quantity: number): Promise<any> {
    const order = await this.getOrder(orderId);
    const progress = (quantity / order.quantity) * 100;
    return { orderId, produced: quantity, progress, status: progress === 100 ? 'completed' : 'in_progress' };
  }

  private async getOrder(id: string): Promise<any> {
    return { bomId: '', workcenterId: '', quantity: 0 };
  }

  private async checkMaterials(bomId: string): Promise<any> {
    return { available: true };
  }

  private async checkCapacity(workcenterId: string, quantity: number): Promise<any> {
    return { availableDate: new Date() };
  }

  private generateId(): string {
    return `OF-${Date.now()}`;
  }
}
