// src/middleware/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../utils/error.utils';
import { Logger } from '../utils/logger.utils';
import Stripe from 'stripe';

export const errorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  Logger.error('Error caught in middleware:', error);

  if (error instanceof CustomError) {
    res.status(error.statusCode).json({
      success: false,
      error: {
        message: error.message,
        code: error.code,
        status: error.statusCode,
      },
    });
    return;
  }

  if (error instanceof Stripe.errors.StripeError) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: {
        message: error.message,
        code: error.type,
        status: error.statusCode || 500,
      },
    });
    return;
  }

  res.status(500).json({
    success: false,
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR',
      status: 500,
    },
  });
};