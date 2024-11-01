// src/types/webhook.types.ts
import Stripe from 'stripe';

export interface WebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
  created: number;
  livemode: boolean;
  pending_webhooks: number;
  request?: {
    id: string;
    idempotency_key: string;
  };
}

export interface WebhookHandlerResponse {
  received: boolean;
  error?: string;
}

export type StripeWebhookEventType =
  | 'checkout.session.completed'
  | 'payment_intent.succeeded'
  | 'payment_intent.payment_failed'
  | 'charge.refunded'
  | string;

export interface WebhookHandlerConfig {
  secretKey: string;
  tolerance: number;
  apiVersion: Stripe.LatestApiVersion;
}

// Base interface for Stripe events
export interface BaseStripeWebhookEvent {
  id: string;
  created: number;
  livemode: boolean;
  pending_webhooks: number;
  request?: {
    id: string;
    idempotency_key: string;
  };
}

// Specific Stripe event types with the base properties
export interface StripeWebhookEvents {
  'checkout.session.completed': BaseStripeWebhookEvent & {
    type: 'checkout.session.completed';
    data: {
      object: Stripe.Checkout.Session;
    };
  };
  'payment_intent.succeeded': BaseStripeWebhookEvent & {
    type: 'payment_intent.succeeded';
    data: {
      object: Stripe.PaymentIntent;
    };
  };
  'payment_intent.payment_failed': BaseStripeWebhookEvent & {
    type: 'payment_intent.payment_failed';
    data: {
      object: Stripe.PaymentIntent;
    };
  };
  'charge.refunded': BaseStripeWebhookEvent & {
    type: 'charge.refunded';
    data: {
      object: Stripe.Charge;
    };
  };
}

// Helper type for getting the data object type from an event
export type StripeEventData<T extends keyof StripeWebhookEvents> = 
  StripeWebhookEvents[T]['data']['object'];

// Type guard to check if an event is a specific Stripe event
export function isStripeEvent<T extends keyof StripeWebhookEvents>(
  event: WebhookEvent,
  type: T
): event is StripeWebhookEvents[T] {
  return event.type === type;
}

// Helper function to safely access event data
export function getEventData<T extends keyof StripeWebhookEvents>(
  event: WebhookEvent,
  type: T
): StripeEventData<T> | null {
  if (isStripeEvent(event, type)) {
    return event.data.object as StripeEventData<T>;
  }
  return null;
}