import { Injectable } from '@nestjs/common';

@Injectable()
export class ValuationService {
  async calculateFIFO(itemId: string, quantity: number): Promise<number> {
    const batches = await this.getBatches(itemId);
    let remaining = quantity;
    let cost = 0;
    for (const batch of batches.sort((a, b) => a.date - b.date)) {
      const qty = Math.min(remaining, batch.quantity);
      cost += qty * batch.unitCost;
      remaining -= qty;
      if (remaining === 0) break;
    }
    return cost;
  }

  async calculateLIFO(itemId: string, quantity: number): Promise<number> {
    const batches = await this.getBatches(itemId);
    let remaining = quantity;
    let cost = 0;
    for (const batch of batches.sort((a, b) => b.date - a.date)) {
      const qty = Math.min(remaining, batch.quantity);
      cost += qty * batch.unitCost;
      remaining -= qty;
      if (remaining === 0) break;
    }
    return cost;
  }

  async calculateWeightedAverage(itemId: string): Promise<number> {
    const batches = await this.getBatches(itemId);
    const totalQty = batches.reduce((s, b) => s + b.quantity, 0);
    const totalCost = batches.reduce((s, b) => s + b.quantity * b.unitCost, 0);
    return totalQty > 0 ? totalCost / totalQty : 0;
  }

  private async getBatches(itemId: string): Promise<any[]> {
    return [];
  }
}
