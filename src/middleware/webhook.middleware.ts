// src/middleware/webhook.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { stripe, stripeConfig } from '../config';
import { CustomError } from '../utils/error.utils';
import { Logger } from '../utils/logger.utils';

export const webhookMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const signature = req.headers['stripe-signature'];

    if (!signature) {
      throw new CustomError('No Stripe signature found', 400);
    }

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        stripeConfig.webhook_secret
      );
      req.body = event;
      next();
    } catch (error) {
      Logger.error('Webhook signature verification failed:', error);
      throw new CustomError('Invalid webhook signature', 400);
    }
  } catch (error) {
    next(error);
  }
};