import { Injectable } from '@nestjs/common';

@Injectable()
export class CartService {
  async addToCart(sessionId: string, productId: string, quantity: number): Promise<any> {
    return { sessionId, items: [{ productId, quantity, price: 100 }], total: 100 * quantity };
  }

  async applyPromo(sessionId: string, code: string): Promise<any> {
    return { sessionId, discount: 10, promoCode: code, total: 90 };
  }

  async checkout(sessionId: string, data: any): Promise<any> {
    return { id: `ORDER-${Date.now()}`, sessionId, ...data };
  }
}
