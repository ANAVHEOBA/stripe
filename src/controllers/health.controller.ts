// src/controllers/health.controller.ts
import { Request, Response } from 'express';
import { stripe } from '../config';
import { ResponseUtil } from '../utils/response.utils';
import { CustomError } from '../utils/error.utils';
import pkg from '../../package.json';

export class HealthController {
  static async checkHealth(req: Request, res: Response) {
    ResponseUtil.success(res, {
      status: 'healthy',
      version: pkg.version,
      timestamp: new Date().toISOString(),
    });
  }

  static async deepCheck(req: Request, res: Response) {
    try {
      // Check Stripe API
      await stripe.paymentMethods.list({ limit: 1 });

      // Add more health checks here (database, cache, etc.)

      ResponseUtil.success(res, {
        status: 'healthy',
        version: pkg.version,
        timestamp: new Date().toISOString(),
        services: {
          stripe: 'connected',
          // Add more service statuses here
        },
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Unknown error occurred';

      ResponseUtil.error(
        res,
        'Service unhealthy',
        'HEALTH_CHECK_FAILED',
        503,
        { error: errorMessage }
      );
    }
  }
}