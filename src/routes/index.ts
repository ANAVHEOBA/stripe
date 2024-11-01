// src/routes/index.ts
import { Router } from 'express';
import paymentRoutes from './payment.routes';
import webhookRoutes from './webhook.routes';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Public routes (no authentication required)
router.use('/webhooks', webhookRoutes);

// Protected routes (require authentication)
router.use('/payments', authMiddleware, paymentRoutes);

export default router;