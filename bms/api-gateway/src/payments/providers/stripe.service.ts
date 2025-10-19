import { Injectable, HttpException } from '@nestjs/common';

@Injectable()
export class StripeService {
  private stripe: any;

  constructor() {
    // Lazy load Stripe to avoid requiring it if not configured
    if (process.env.STRIPE_SECRET_KEY) {
      const Stripe = require('stripe');
      this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2023-10-16',
      });
    }
  }

  async createPaymentIntent(amount: number, currency: string, metadata?: any): Promise<any> {
    if (!this.stripe) {
      throw new HttpException('Stripe not configured', 500);
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        metadata,
      });
      return paymentIntent;
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  async confirmPayment(paymentIntentId: string): Promise<any> {
    if (!this.stripe) {
      throw new HttpException('Stripe not configured', 500);
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  async createCustomer(email: string, name: string, metadata?: any): Promise<any> {
    if (!this.stripe) {
      throw new HttpException('Stripe not configured', 500);
    }

    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata,
      });
      return customer;
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  async createSubscription(customerId: string, priceId: string): Promise<any> {
    if (!this.stripe) {
      throw new HttpException('Stripe not configured', 500);
    }

    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
      });
      return subscription;
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  async createRefund(paymentIntentId: string, amount?: number): Promise<any> {
    if (!this.stripe) {
      throw new HttpException('Stripe not configured', 500);
    }

    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined,
      });
      return refund;
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  async handleWebhook(payload: string, signature: string): Promise<any> {
    if (!this.stripe) {
      throw new HttpException('Stripe not configured', 500);
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new HttpException('Webhook secret not configured', 500);
    }

    try {
      const event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      return event;
    } catch (error) {
      throw new HttpException('Invalid webhook signature', 401);
    }
  }

  async getPaymentIntent(paymentIntentId: string): Promise<any> {
    if (!this.stripe) {
      throw new HttpException('Stripe not configured', 500);
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }
}
