import { stripe } from '../config';
import { Property } from '../models/property.model';
import { PlanType, PropertyPlan } from '../types/property.types';
import { CustomError } from '../utils/error.utils';
import { Logger } from '../utils/logger.utils';
import Stripe from 'stripe';

interface PaymentLinkResponse {
  url: string;
  id: string;
}

export class PropertyService {
  private static readonly PLANS: Record<PlanType, PropertyPlan> = {
    [PlanType.BASIC]: {
      planType: PlanType.BASIC,
      price: 9900,
      features: ['Basic features', 'Limited access', 'Email support'],
      duration: 365
    },
    [PlanType.PRO]: {
      planType: PlanType.PRO,
      price: 19900,
      features: ['Pro features', 'Full access', 'Priority support'],
      duration: 365
    },
    [PlanType.PREMIUM]: {
      planType: PlanType.PREMIUM,
      price: 29900,
      features: ['Premium features', 'Full access', '24/7 support', 'Custom solutions'],
      duration: 365
    }
  };

  static async createPaymentLink(
    planType: PlanType,
    propertyId: string,
    userId: string
  ): Promise<PaymentLinkResponse> {
    try {
      const plan = this.PLANS[planType];
      if (!plan) {
        throw new CustomError('Invalid plan type', 400);
      }

      // Verify property exists and can be upgraded
      const property = await Property.findById(propertyId);
      if (!property) {
        throw new CustomError('Property not found', 404);
      }

      if (property.userId !== userId) {
        throw new CustomError('Unauthorized access to property', 403);
      }

      // Create or retrieve the product for this plan
      const product = await this.getOrCreateProduct(planType);

      // Create a price for the product
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.price,
        currency: 'usd',
        metadata: {
          planType,
          propertyId,
          userId
        }
      });

      // Create payment link
      const paymentLink = await stripe.paymentLinks.create({
        line_items: [
          {
            price: price.id,
            quantity: 1
          }
        ],
        metadata: {
          planType,
          propertyId,
          userId
        },
        after_completion: {
          type: 'redirect',
          redirect: {
            url: `${process.env.FRONTEND_URL}/property/${propertyId}/success`
          }
        },
        automatic_tax: { enabled: true },
        allow_promotion_codes: true,
        billing_address_collection: 'required'
      });

      return {
        url: paymentLink.url,
        id: paymentLink.id
      };
    } catch (error) {
      Logger.error('Error creating payment link:', error);
      throw error;
    }
  }

  static async activatePropertyPlan(propertyId: string, planType: PlanType) {
    try {
      const plan = this.PLANS[planType];
      const now = new Date();
      const endDate = new Date(now.getTime() + plan.duration * 24 * 60 * 60 * 1000);

      const property = await Property.findByIdAndUpdate(
        propertyId,
        {
          planType,
          planStartDate: now,
          planEndDate: endDate,
          isActive: true
        },
        { new: true }
      );

      if (!property) {
        throw new CustomError('Property not found', 404);
      }

      return property;
    } catch (error) {
      Logger.error('Error activating property plan:', error);
      throw error;
    }
  }

  static async checkPlanExpiration(propertyId: string) {
    try {
      const property = await Property.findById(propertyId);
      if (!property) {
        throw new CustomError('Property not found', 404);
      }

      const now = new Date();
      if (now > property.planEndDate) {
        // Plan has expired
        await Property.findByIdAndUpdate(propertyId, {
          isActive: false
        });
        return false;
      }

      return true;
    } catch (error) {
      Logger.error('Error checking plan expiration:', error);
      throw error;
    }
  }

  private static async getOrCreateProduct(planType: PlanType): Promise<Stripe.Product> {
    try {
      // Try to find existing product
      const products = await stripe.products.search({
        query: `metadata['planType']:'${planType}' AND active:'true'`
      });
  
      if (products.data.length > 0) {
        return products.data[0];
      }
  
      // Create new product if none exists
      return await stripe.products.create({
        name: `Property Plan - ${planType.toUpperCase()}`,
        description: `Annual ${planType} plan for property management`,
        metadata: {
          planType
        },
        default_price_data: {
          currency: 'usd',
          unit_amount: this.PLANS[planType].price,
          // Remove recurring for one-time payment
          tax_behavior: 'exclusive'
        }
      });
    } catch (error) {
      Logger.error('Error getting/creating product:', error);
      throw error;
    }
  }

  static async getPlanDetails(planType: PlanType): Promise<PropertyPlan> {
    const plan = this.PLANS[planType];
    if (!plan) {
      throw new CustomError('Invalid plan type', 400);
    }
    return plan;
  }

  static async getPropertyPlanHistory(propertyId: string): Promise<any[]> {
    try {
      const property = await Property.findById(propertyId);
      if (!property) {
        throw new CustomError('Property not found', 404);
      }
  
      // Use search instead of list for metadata filtering
      const payments = await stripe.paymentIntents.search({
        query: `metadata['propertyId']:'${propertyId}'`,
        limit: 100
      });
  
      return payments.data.map(payment => ({
        id: payment.id,
        amount: payment.amount,
        status: payment.status,
        created: new Date(payment.created * 1000),
        metadata: payment.metadata
      }));
    } catch (error) {
      Logger.error('Error getting property plan history:', error);
      throw error;
    }
  }
  static async cancelPropertyPlan(propertyId: string): Promise<void> {
    try {
      const property = await Property.findById(propertyId);
      if (!property) {
        throw new CustomError('Property not found', 404);
      }

      await Property.findByIdAndUpdate(propertyId, {
        isActive: false,
        planEndDate: new Date() // End plan immediately
      });
    } catch (error) {
      Logger.error('Error canceling property plan:', error);
      throw error;
    }
  }
}