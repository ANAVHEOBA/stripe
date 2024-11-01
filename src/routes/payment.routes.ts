// src/routes/payment.routes.ts
import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { validateRequest } from '../middleware/validate.middleware';
import { ValidationSchemas } from '../utils/validation.utils';
import { rateLimiterMiddleware } from '../middleware/rateLimiter.middleware';

const router = Router();

/**
 * @route   POST /api/payments/create-link
 * @desc    Create a new payment link
 * @access  Private
 */
router.post(
  '/create-link',
  rateLimiterMiddleware,
  validateRequest(ValidationSchemas.paymentLink),
  PaymentController.createPaymentLink
);

/**
 * @route   GET /api/payments/link/:id
 * @desc    Get payment link details
 * @access  Private
 */
router.get(
  '/link/:id',
  rateLimiterMiddleware,
  PaymentController.getPaymentLink
);

/**
 * @route   POST /api/payments/link/:id/deactivate
 * @desc    Deactivate a payment link
 * @access  Private
 */
router.post(
  '/link/:id/deactivate',
  rateLimiterMiddleware,
  PaymentController.deactivatePaymentLink
);

/**
 * @route   GET /api/payments/success
 * @desc    Handle successful payment
 * @access  Public
 */
router.get(
  '/success',
  PaymentController.handlePaymentSuccess
);

/**
 * @route   GET /api/payments/links
 * @desc    List all payment links
 * @access  Private
 */
router.get(
  '/links',
  rateLimiterMiddleware,
  PaymentController.listPaymentLinks
);

export default router;