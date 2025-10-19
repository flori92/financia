import { Injectable, HttpException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ShopifyService {
  async connect(shopDomain: string, accessToken: string): Promise<boolean> {
    try {
      const response = await axios.get(`https://${shopDomain}/admin/api/2024-01/shop.json`, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
        },
      });
      return response.status === 200;
    } catch (error) {
      throw new HttpException('Shopify connection failed', 500);
    }
  }

  async getOrders(shopDomain: string, accessToken: string, status = 'any'): Promise<any[]> {
    try {
      const response = await axios.get(
        `https://${shopDomain}/admin/api/2024-01/orders.json`,
        {
          params: { status, limit: 250 },
          headers: {
            'X-Shopify-Access-Token': accessToken,
          },
        },
      );
      return response.data.orders || [];
    } catch (error) {
      throw new HttpException('Failed to fetch orders', 500);
    }
  }

  async getProducts(shopDomain: string, accessToken: string): Promise<any[]> {
    try {
      const response = await axios.get(
        `https://${shopDomain}/admin/api/2024-01/products.json`,
        {
          params: { limit: 250 },
          headers: {
            'X-Shopify-Access-Token': accessToken,
          },
        },
      );
      return response.data.products || [];
    } catch (error) {
      throw new HttpException('Failed to fetch products', 500);
    }
  }

  async getCustomers(shopDomain: string, accessToken: string): Promise<any[]> {
    try {
      const response = await axios.get(
        `https://${shopDomain}/admin/api/2024-01/customers.json`,
        {
          params: { limit: 250 },
          headers: {
            'X-Shopify-Access-Token': accessToken,
          },
        },
      );
      return response.data.customers || [];
    } catch (error) {
      throw new HttpException('Failed to fetch customers', 500);
    }
  }

  async updateInventory(shopDomain: string, accessToken: string, inventoryItemId: string, quantity: number): Promise<void> {
    try {
      await axios.post(
        `https://${shopDomain}/admin/api/2024-01/inventory_levels/set.json`,
        {
          inventory_item_id: inventoryItemId,
          available: quantity,
        },
        {
          headers: {
            'X-Shopify-Access-Token': accessToken,
          },
        },
      );
    } catch (error) {
      throw new HttpException('Failed to update inventory', 500);
    }
  }

  async createInvoiceFromOrder(order: any): Promise<any> {
    return {
      customerName: order.customer?.first_name + ' ' + order.customer?.last_name,
      customerEmail: order.customer?.email,
      items: order.line_items.map((item: any) => ({
        description: item.title,
        quantity: item.quantity,
        unitPrice: parseFloat(item.price),
        total: parseFloat(item.price) * item.quantity,
      })),
      total: parseFloat(order.total_price),
      currency: order.currency,
      externalId: order.id.toString(),
      externalSource: 'shopify',
    };
  }

  verifyWebhook(payload: string, hmacHeader: string, secret: string): boolean {
    const crypto = require('crypto');
    const hash = crypto.createHmac('sha256', secret).update(payload).digest('base64');
    return hash === hmacHeader;
  }
}
