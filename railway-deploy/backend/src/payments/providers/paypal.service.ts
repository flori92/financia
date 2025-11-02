import { Injectable, HttpException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PayPalService {
  private readonly baseUrl = process.env.PAYPAL_MODE === 'live' 
    ? 'https://api-m.paypal.com' 
    : 'https://api-m.sandbox.paypal.com';
  private readonly clientId = process.env.PAYPAL_CLIENT_ID;
  private readonly clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  async createOrder(amount: number, currency: string, description: string): Promise<any> {
    try {
      const token = await this.getAccessToken();
      const response = await axios.post(
        `${this.baseUrl}/v2/checkout/orders`,
        {
          intent: 'CAPTURE',
          purchase_units: [
            {
              amount: {
                currency_code: currency,
                value: amount.toFixed(2),
              },
              description,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data;
    } catch (error) {
      throw new HttpException(error.response?.data || 'Failed to create order', 500);
    }
  }

  async captureOrder(orderId: string): Promise<any> {
    try {
      const token = await this.getAccessToken();
      const response = await axios.post(
        `${this.baseUrl}/v2/checkout/orders/${orderId}/capture`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data;
    } catch (error) {
      throw new HttpException(error.response?.data || 'Failed to capture order', 500);
    }
  }

  async getOrder(orderId: string): Promise<any> {
    try {
      const token = await this.getAccessToken();
      const response = await axios.get(
        `${this.baseUrl}/v2/checkout/orders/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      throw new HttpException(error.response?.data || 'Failed to get order', 500);
    }
  }

  async createRefund(captureId: string, amount?: number, currency?: string): Promise<any> {
    try {
      const token = await this.getAccessToken();
      const body: any = {};
      if (amount && currency) {
        body.amount = {
          value: amount.toFixed(2),
          currency_code: currency,
        };
      }

      const response = await axios.post(
        `${this.baseUrl}/v2/payments/captures/${captureId}/refund`,
        body,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data;
    } catch (error) {
      throw new HttpException(error.response?.data || 'Failed to create refund', 500);
    }
  }

  async verifyWebhook(payload: string, headers: any): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      const response = await axios.post(
        `${this.baseUrl}/v1/notifications/verify-webhook-signature`,
        {
          transmission_id: headers['paypal-transmission-id'],
          transmission_time: headers['paypal-transmission-time'],
          cert_url: headers['paypal-cert-url'],
          auth_algo: headers['paypal-auth-algo'],
          transmission_sig: headers['paypal-transmission-sig'],
          webhook_id: process.env.PAYPAL_WEBHOOK_ID,
          webhook_event: JSON.parse(payload),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data.verification_status === 'SUCCESS';
    } catch (error) {
      return false;
    }
  }

  private async getAccessToken(): Promise<string> {
    if (!this.clientId || !this.clientSecret) {
      throw new HttpException('PayPal credentials not configured', 500);
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          auth: {
            username: this.clientId,
            password: this.clientSecret,
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
      return response.data.access_token;
    } catch (error) {
      throw new HttpException('PayPal authentication failed', 500);
    }
  }
}
