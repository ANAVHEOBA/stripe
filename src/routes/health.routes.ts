// src/routes/health.routes.ts
import { Router } from 'express';
import { HealthController } from '../controllers/health.controller';

const router = Router();

/**
 * @route   GET /api/health
 * @desc    Check API health status
 * @access  Public
 */
router.get('/', HealthController.checkHealth);

/**
 * @route   GET /api/health/deep
 * @desc    Perform deep health check including database and external services
 * @access  Private
 */
router.get(
  '/deep',
  HealthController.deepCheck
);

export default router;