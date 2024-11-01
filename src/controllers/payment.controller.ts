// src/controllers/payment.controller.ts
import { Request, Response, NextFunction } from 'express';
import { stripe, stripeConfig } from '../config';
import { Logger } from '../utils/logger.utils';
import { CustomError } from '../utils/error.utils';
import { EmailService } from '../services/email.service';
import { OrderService } from '../services/order.service';
import { NotificationService } from '../services/notification.service';
import { Payment } from '../models/payment.model';
import { 
  CreatePaymentLinkDto, 
  PaymentLinkMetadata,
  PaymentLinkResponse,
  PaymentStatus 
} from '../types/payment.types';

export class PaymentController {
  static async createPaymentLink(
    req: Request<{}, {}, CreatePaymentLinkDto>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { amount, currency = stripeConfig.currency, metadata } = req.body;

      // Convert metadata to Stripe-compatible format
      const stripeMetadata: Record<string, string> = {};
      if (metadata) {
        Object.entries(metadata).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            stripeMetadata[key] = String(value);
          }
        });
      }

      // Create a product for this payment
      const product = await stripe.products.create({
        name: metadata?.productName || 'One-time payment',
        metadata: stripeMetadata,
      });

      // Create a price for the product
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: amount,
        currency: currency.toLowerCase(),
      });

       // Create the payment link
       const paymentLink = await stripe.paymentLinks.create({
        line_items: [
          {
            price: price.id,
            quantity: 1,
          },
        ],
        after_completion: {
          type: 'redirect',
          redirect: {
            url: `${stripeConfig.urls.success}?session_id={CHECKOUT_SESSION_ID}`,
          },
        },
        metadata: stripeMetadata,
        ...stripeConfig.defaults.payment_link,
      });

      Logger.info(`Payment link created: ${paymentLink.id}`);

      const response: PaymentLinkResponse = {
        id: paymentLink.id,
        url: paymentLink.url,
        amount,
        currency,
        metadata,
        expiresAt: null,
      };

      res.status(201).json({
        success: true,
        data: response,
      });
    } catch (error) {
      Logger.error('Error creating payment link:', error);
      next(error);
    }
  }

  /**
   * Get payment link details
   * @route GET /api/payments/link/:id
   */
  static async getPaymentLink(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      const paymentLink = await stripe.paymentLinks.retrieve(id);

      if (!paymentLink) {
        throw new CustomError('Payment link not found', 404);
      }

      res.json({
        success: true,
        data: paymentLink,
      });
    } catch (error) {
      Logger.error('Error retrieving payment link:', error);
      next(error);
    }
  }

  /**
   * Deactivate a payment link
   * @route POST /api/payments/link/:id/deactivate
   */
  static async deactivatePaymentLink(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      const paymentLink = await stripe.paymentLinks.update(id, {
        active: false,
      });

      res.json({
        success: true,
        data: paymentLink,
      });
    } catch (error) {
      Logger.error('Error deactivating payment link:', error);
      next(error);
    }
  }

  /**
   * Handle successful payment
   * @route GET /api/payments/success
   */
  static async handlePaymentSuccess(
    req: Request<{}, {}, {}, { session_id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { session_id } = req.query;

      // 1. Retrieve the checkout session with expanded details
      const session = await stripe.checkout.sessions.retrieve(session_id, {
        expand: ['line_items', 'payment_intent', 'customer']
      });

      if (!session) {
        throw new CustomError('Checkout session not found', 404);
      }

      // 2. Extract payment data
      const paymentData = {
        sessionId: session.id,
        paymentIntentId: session.payment_intent as string,
        customerId: session.customer as string,
        customerEmail: session.customer_details?.email,
        amountTotal: session.amount_total,
        currency: session.currency,
        metadata: session.metadata,
        paymentStatus: session.payment_status,
        items: session.line_items?.data
      };

      // 3. Update order status
     // Update order status if orderId exists
     if (session.metadata?.orderId) {
      try {
        await OrderService.updateOrderStatus({
          orderId: session.metadata.orderId,
          status: PaymentStatus.PAID,
          paymentDetails: {
            paymentId: session.payment_intent as string,
            amount: session.amount_total ?? 0,
            currency: session.currency ?? 'usd',
            paymentMethod: session.payment_method_types[0] ?? 'card',
            paidAt: new Date()
          }
        });
        Logger.info(`Order ${session.metadata.orderId} status updated to PAID`);
      } catch (error) {
        Logger.error('Error updating order status:', error);
      }
    }

      // Send confirmation email if email exists
      if (session.customer_details?.email) {
        try {
          await EmailService.sendPaymentConfirmation({
            to: session.customer_details.email,
            orderDetails: {
              orderId: session.metadata?.orderId ?? 'N/A',
              amount: session.amount_total ?? 0,
              currency: session.currency ?? 'usd',
              items: session.line_items?.data ?? [],
              paymentDate: new Date()
            }
          });
          Logger.info(`Payment confirmation email sent to ${session.customer_details.email}`);
        } catch (error) {
          Logger.error('Error sending confirmation email:', error);
        }
      }

      // This Send notifications
      try {
        const notificationData = {
          orderId: session.metadata?.orderId || 'UNKNOWN',
          amount: session.amount_total || 0,
          currency: session.currency || 'usd',
          customerEmail: session.customer_details?.email || 'unknown@email.com',
          paymentDate: new Date()
        };
    
        await NotificationService.notifyPaymentSuccess(notificationData);
        Logger.info(`Success notifications sent for order ${notificationData.orderId}`);
      } catch (error) {
        Logger.error('Error sending notifications:', error);
      }
    

      //This Store payment details
      try {
        await PaymentController.storePaymentDetails(paymentData);
        Logger.info(`Payment details stored for session ${session_id}`);
      } catch (error) {
        Logger.error('Error storing payment details:', error);
      }

      //  Send response
      res.json({
        success: true,
        data: {
          sessionId: session.id,
          paymentStatus: session.payment_status,
          customerEmail: session.customer_details?.email,
          amountTotal: session.amount_total,
          currency: session.currency,
          orderId: session.metadata?.orderId
        },
        message: 'Payment processed successfully'
      });

    } catch (error) {
      Logger.error('Error handling successful payment:', error);
      next(error);
    }
  }

  /**
   * List all payment links
   * @route GET /api/payments/links
   */
  static async listPaymentLinks(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { limit = 10, starting_after, active } = req.query;

      const paymentLinks = await stripe.paymentLinks.list({
        limit: Number(limit),
        starting_after: starting_after as string,
        active: active === 'true',
      });

      res.json({
        success: true,
        data: paymentLinks,
      });
    } catch (error) {
      Logger.error('Error listing payment links:', error);
      next(error);
    }
  }

  /**
   * Store payment details in database
   * @private
   */
  private static async storePaymentDetails(paymentData: any): Promise<void> {
    try {
      await Payment.create({
        sessionId: paymentData.sessionId,
        paymentIntentId: paymentData.paymentIntentId,
        customerId: paymentData.customerId,
        customerEmail: paymentData.customerEmail,
        amount: paymentData.amountTotal,
        currency: paymentData.currency,
        status: paymentData.paymentStatus,
        metadata: paymentData.metadata,
        items: paymentData.items,
        createdAt: new Date()
      });
    } catch (error) {
      throw new CustomError('Failed to store payment details', 500);
    }
  }
}