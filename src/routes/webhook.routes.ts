// src/routes/webhook.routes.ts
import { Router } from 'express';
import express from 'express';
import { StripeWebhookHandler } from '../webhooks/stripe.webhook';
import { webhookMiddleware } from '../middleware/webhook.middleware';

const router = Router();

/**
 * @route   POST /api/webhooks/stripe
 * @desc    Handle Stripe webhook events
 * @access  Public (IP restricted)
 */
router.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  webhookMiddleware,
  StripeWebhookHandler.handleWebhook
);

export default router;