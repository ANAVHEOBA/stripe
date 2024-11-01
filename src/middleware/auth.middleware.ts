// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../utils/error.utils';
import { stripe } from '../config';

export interface AuthenticatedRequest extends Request {
  apiKey?: string;
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new CustomError('No authorization token provided', 401);
    }

    const apiKey = authHeader.split(' ')[1];

    // Verify the API key with Stripe
    try {
      await stripe.paymentLinks.list({ limit: 1 }, { apiKey });
      req.apiKey = apiKey;
      next();
    } catch (error) {
      throw new CustomError('Invalid API key', 401);
    }
  } catch (error) {
    next(error);
  }
};