import { Injectable, HttpException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PrestaShopService {
  async connect(storeUrl: string, apiKey: string): Promise<boolean> {
    try {
      const response = await axios.get(`${storeUrl}/api`, {
        auth: {
          username: apiKey,
          password: '',
        },
      });
      return response.status === 200;
    } catch (error) {
      throw new HttpException('PrestaShop connection failed', 500);
    }
  }

  async getOrders(storeUrl: string, apiKey: string): Promise<any[]> {
    try {
      const response = await axios.get(`${storeUrl}/api/orders`, {
        params: { output_format: 'JSON', display: 'full' },
        auth: {
          username: apiKey,
          password: '',
        },
      });
      return response.data.orders || [];
    } catch (error) {
      throw new HttpException('Failed to fetch orders', 500);
    }
  }

  async getProducts(storeUrl: string, apiKey: string): Promise<any[]> {
    try {
      const response = await axios.get(`${storeUrl}/api/products`, {
        params: { output_format: 'JSON', display: 'full' },
        auth: {
          username: apiKey,
          password: '',
        },
      });
      return response.data.products || [];
    } catch (error) {
      throw new HttpException('Failed to fetch products', 500);
    }
  }

  async getCustomers(storeUrl: string, apiKey: string): Promise<any[]> {
    try {
      const response = await axios.get(`${storeUrl}/api/customers`, {
        params: { output_format: 'JSON', display: 'full' },
        auth: {
          username: apiKey,
          password: '',
        },
      });
      return response.data.customers || [];
    } catch (error) {
      throw new HttpException('Failed to fetch customers', 500);
    }
  }

  async updateStock(storeUrl: string, apiKey: string, productId: string, quantity: number): Promise<void> {
    try {
      await axios.put(
        `${storeUrl}/api/stock_availables/${productId}`,
        {
          stock_available: {
            quantity,
          },
        },
        {
          params: { output_format: 'JSON' },
          auth: {
            username: apiKey,
            password: '',
          },
        },
      );
    } catch (error) {
      throw new HttpException('Failed to update stock', 500);
    }
  }

  async createInvoiceFromOrder(order: any): Promise<any> {
    return {
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      items: order.associations?.order_rows?.map((item: any) => ({
        description: item.product_name,
        quantity: parseInt(item.product_quantity),
        unitPrice: parseFloat(item.unit_price_tax_incl),
        total: parseFloat(item.total_price_tax_incl),
      })) || [],
      total: parseFloat(order.total_paid_tax_incl),
      currency: order.currency,
      externalId: order.id.toString(),
      externalSource: 'prestashop',
    };
  }
}
