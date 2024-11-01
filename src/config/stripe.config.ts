// src/config/stripe.config.ts
import Stripe from 'stripe';
import env from './env.config';

// Initialize Stripe with your secret key
export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-09-30.acacia', // Current stable API version
  typescript: true,
});

export const stripeConfig = {
  currency: 'usd',
  payment_methods: ['card'] as const,
  webhook_secret: process.env.STRIPE_WEBHOOK_SECRET!,
  
  defaults: {
    payment_link: {
      billing_address_collection: 'auto' as const,
      allow_promotion_codes: true,
      automatic_tax: { enabled: true },
    },
  },
  
  urls: {
    success: `${process.env.API_URL}/payments/success`,
    cancel: `${process.env.API_URL}/payments/cancel`,
  },
};

export default { stripe, stripeConfig };