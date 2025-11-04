import { Injectable } from '@nestjs/common';

@Injectable()
export class ContractsService {
  async createFrameworkContract(data: any): Promise<any> {
    return {
      id: this.generateId(),
      ...data,
      type: 'framework',
      status: 'active',
      startDate: new Date(),
      endDate: this.addYears(new Date(), data.duration || 1)
    };
  }

  async createCallOff(contractId: string, items: any[]): Promise<any> {
    const contract = await this.getContract(contractId);
    return {
      id: this.generateId(),
      contractId,
      items,
      prices: this.applyContractPrices(items, contract)
    };
  }

  private applyContractPrices(items: any[], contract: any): any[] {
    return items.map(item => ({
      ...item,
      price: contract.prices?.[item.productId] || item.price
    }));
  }

  private async getContract(id: string): Promise<any> {
    return { prices: {} };
  }

  private addYears(date: Date, years: number): Date {
    return new Date(date.getFullYear() + years, date.getMonth(), date.getDate());
  }

  private generateId(): string {
    return `CTR-${Date.now()}`;
  }
}
