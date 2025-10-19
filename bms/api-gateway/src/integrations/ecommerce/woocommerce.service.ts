import { Injectable, HttpException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class WooCommerceService {
  async connect(storeUrl: string, consumerKey: string, consumerSecret: string): Promise<boolean> {
    try {
      const response = await axios.get(`${storeUrl}/wp-json/wc/v3/system_status`, {
        auth: {
          username: consumerKey,
          password: consumerSecret,
        },
      });
      return response.status === 200;
    } catch (error) {
      throw new HttpException('WooCommerce connection failed', 500);
    }
  }

  async getOrders(storeUrl: string, consumerKey: string, consumerSecret: string, page = 1): Promise<any[]> {
    try {
      const response = await axios.get(`${storeUrl}/wp-json/wc/v3/orders`, {
        params: { page, per_page: 100 },
        auth: {
          username: consumerKey,
          password: consumerSecret,
        },
      });
      return response.data;
    } catch (error) {
      throw new HttpException('Failed to fetch orders', 500);
    }
  }

  async getProducts(storeUrl: string, consumerKey: string, consumerSecret: string, page = 1): Promise<any[]> {
    try {
      const response = await axios.get(`${storeUrl}/wp-json/wc/v3/products`, {
        params: { page, per_page: 100 },
        auth: {
          username: consumerKey,
          password: consumerSecret,
        },
      });
      return response.data;
    } catch (error) {
      throw new HttpException('Failed to fetch products', 500);
    }
  }

  async getCustomers(storeUrl: string, consumerKey: string, consumerSecret: string, page = 1): Promise<any[]> {
    try {
      const response = await axios.get(`${storeUrl}/wp-json/wc/v3/customers`, {
        params: { page, per_page: 100 },
        auth: {
          username: consumerKey,
          password: consumerSecret,
        },
      });
      return response.data;
    } catch (error) {
      throw new HttpException('Failed to fetch customers', 500);
    }
  }

  async createInvoiceFromOrder(order: any): Promise<any> {
    return {
      customerName: `${order.billing.first_name} ${order.billing.last_name}`,
      customerEmail: order.billing.email,
      items: order.line_items.map((item: any) => ({
        description: item.name,
        quantity: item.quantity,
        unitPrice: parseFloat(item.price),
        total: parseFloat(item.total),
      })),
      total: parseFloat(order.total),
      currency: order.currency,
      externalId: order.id.toString(),
      externalSource: 'woocommerce',
    };
  }

  async handleWebhook(payload: any, signature: string, secret: string): Promise<any> {
    // Verify webhook signature
    const crypto = require('crypto');
    const hash = crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('base64');
    
    if (hash !== signature) {
      throw new HttpException('Invalid webhook signature', 401);
    }

    return {
      event: payload.event,
      orderId: payload.id,
      status: payload.status,
    };
  }
}
