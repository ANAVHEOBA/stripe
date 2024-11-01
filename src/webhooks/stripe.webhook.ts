// src/webhooks/stripe.webhook.ts
import { Request, Response } from 'express';
import Stripe from 'stripe';
import { stripe } from '../config';
import { Logger } from '../utils/logger.utils';
import { OrderService } from '../services/order.service';
import { NotificationService } from '../services/notification.service';
import { EmailService } from '../services/email.service';
import { PaymentStatus } from '../types/payment.types';
import {
  WebhookEvent,
  StripeWebhookEventType,
  isStripeEvent,
  StripeEventData
} from '../types/webhook.types';

export class StripeWebhookHandler {
  static async handleWebhook(req: Request, res: Response): Promise<void> {
    const event = req.body as WebhookEvent;

    try {
      Logger.info(`Processing webhook: ${event.type}`, { eventId: event.id });

      switch (event.type as StripeWebhookEventType) {
        case 'checkout.session.completed':
          if (isStripeEvent(event, 'checkout.session.completed')) {
            await StripeWebhookHandler.handleCheckoutSessionCompleted(event.data.object);
          }
          break;

        case 'payment_intent.succeeded':
          if (isStripeEvent(event, 'payment_intent.succeeded')) {
            await StripeWebhookHandler.handlePaymentIntentSucceeded(event.data.object);
          }
          break;

        case 'payment_intent.payment_failed':
          if (isStripeEvent(event, 'payment_intent.payment_failed')) {
            await StripeWebhookHandler.handlePaymentIntentFailed(event.data.object);
          }
          break;

        case 'charge.refunded':
          if (isStripeEvent(event, 'charge.refunded')) {
            await StripeWebhookHandler.handleChargeRefunded(event.data.object);
          }
          break;

        default:
          Logger.info(`Unhandled webhook event: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      Logger.error('Webhook handling error:', error);
      res.status(400).json({ error: 'Webhook handling failed' });
    }
  }


  private static async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
    try {
      const orderId = session.metadata?.orderId;
      if (!orderId) {
        throw new Error('No order ID in session metadata');
      }

      // Update order status
      await OrderService.updateOrderStatus({
        orderId,
        status: PaymentStatus.PAID,
        paymentDetails: {
          paymentId: session.payment_intent as string,
          amount: session.amount_total!,
          currency: session.currency!,
          paymentMethod: session.payment_method_types[0],
          paidAt: new Date()
        }
      });

      // Send confirmation email
      if (session.customer_details?.email) {
        await EmailService.sendPaymentConfirmation({
          to: session.customer_details.email,
          orderDetails: {
            orderId,
            amount: session.amount_total!,
            currency: session.currency!,
            items: session.line_items?.data || [],
            paymentDate: new Date()
          }
        });
      }

      // Send notifications
      await NotificationService.notifyPaymentSuccess({
        orderId,
        amount: session.amount_total!,
        currency: session.currency!,
        customerEmail: session.customer_details?.email || 'unknown',
        paymentDate: new Date()
      });

      Logger.info(`Checkout session completed for order ${orderId}`);
    } catch (error) {
      Logger.error('Error handling checkout.session.completed:', error);
      throw error;
    }
  }

  private static async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    try {
      const orderId = paymentIntent.metadata?.orderId;
      if (!orderId) {
        throw new Error('No order ID in payment intent metadata');
      }

      await OrderService.updateOrderStatus({
        orderId,
        status: PaymentStatus.PAID,
        paymentDetails: {
          paymentId: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          paymentMethod: paymentIntent.payment_method_types?.[0] || 'unknown',
          paidAt: new Date()
        }
      });

      Logger.info(`Payment intent succeeded for order ${orderId}`);
    } catch (error) {
      Logger.error('Error handling payment_intent.succeeded:', error);
      throw error;
    }
  }

  private static async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    try {
      const orderId = paymentIntent.metadata?.orderId;
      if (!orderId) {
        throw new Error('No order ID in payment intent metadata');
      }

      await OrderService.updateOrderStatus({
        orderId,
        status: PaymentStatus.FAILED,
        paymentDetails: {
          paymentId: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          paymentMethod: paymentIntent.payment_method_types?.[0] || 'unknown',
          paidAt: new Date()
        }
      });

      // Notify customer about failed payment
      if (paymentIntent.receipt_email) {
        await EmailService.sendPaymentFailedNotification({
          to: paymentIntent.receipt_email,
          orderDetails: {
            orderId,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            failureReason: paymentIntent.last_payment_error?.message || 'Unknown error'
          }
        });
      }

      Logger.info(`Payment intent failed for order ${orderId}`);
    } catch (error) {
      Logger.error('Error handling payment_intent.payment_failed:', error);
      throw error;
    }
  } 

  private static async handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
    try {
      const orderId = charge.metadata?.orderId;
      if (!orderId) {
        throw new Error('No order ID in charge metadata');
      }

      await OrderService.updateOrderStatus({
        orderId,
        status: PaymentStatus.REFUNDED,
        paymentDetails: {
          paymentId: charge.payment_intent as string,
          amount: charge.amount_refunded,
          currency: charge.currency,
          paymentMethod: charge.payment_method_details?.type || 'unknown',
          paidAt: new Date()
        }
      });

      // Send refund confirmation email
      if (charge.receipt_email) {
        await EmailService.sendRefundConfirmation({
          to: charge.receipt_email,
          orderDetails: {
            orderId,
            amount: charge.amount_refunded,
            currency: charge.currency,
            refundDate: new Date()
          }
        });
      }

      Logger.info(`Charge refunded for order ${orderId}`);
    } catch (error) {
      Logger.error('Error handling charge.refunded:', error);
      throw error;
    }
  }
}