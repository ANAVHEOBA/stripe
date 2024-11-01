// src/services/stripe.service.ts
import { stripe } from '../config';
import { Logger } from '../utils/logger.utils';
import { CustomError } from '../utils/error.utils';
import { CreatePaymentLinkDto } from '../types/payment.types';

export class StripeService {
  static async createPaymentLink(data: CreatePaymentLinkDto) {
    try {
      const { amount, currency, metadata } = data;

      // Create a product
      const product = await stripe.products.create({
        name: metadata?.productName || 'One-time payment',
        metadata,
      });

      // Create a price
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: amount,
        currency: currency.toLowerCase(),
      });

      // Create payment link
      const paymentLink = await stripe.paymentLinks.create({
        line_items: [{ price: price.id, quantity: 1 }],
        metadata,
      });

      return paymentLink;
    } catch (error) {
      Logger.error('Error creating payment link:', error);
      throw new CustomError('Failed to create payment link', 500);
    }
  }

  static async retrievePaymentLink(id: string) {
    try {
      const paymentLink = await stripe.paymentLinks.retrieve(id);
      return paymentLink;
    } catch (error) {
      Logger.error('Error retrieving payment link:', error);
      throw new CustomError('Failed to retrieve payment link', 500);
    }
  }

  static async deactivatePaymentLink(id: string) {
    try {
      const paymentLink = await stripe.paymentLinks.update(id, {
        active: false,
      });
      return paymentLink;
    } catch (error) {
      Logger.error('Error deactivating payment link:', error);
      throw new CustomError('Failed to deactivate payment link', 500);
    }
  }
}