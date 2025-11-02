import { Injectable } from '@nestjs/common';

@Injectable()
export class CatalogService {
  async createProduct(data: any): Promise<any> {
    return { id: `PROD-${Date.now()}`, ...data, published: false, variants: [] };
  }

  async publishProduct(productId: string): Promise<any> {
    return { productId, published: true, publishedAt: new Date() };
  }

  async searchProducts(query: string, filters: any): Promise<any[]> {
    return [];
  }
}
