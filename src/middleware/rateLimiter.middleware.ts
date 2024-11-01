// src/middleware/rateLimiter.middleware.ts
import rateLimit from 'express-rate-limit';
import { env } from '../config';
import { CustomError } from '../utils/error.utils';

export const rateLimiterMiddleware = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW,
  max: env.RATE_LIMIT_MAX,
  message: {
    success: false,
    error: {
      message: 'Too many requests, please try again later',
      code: 'RATE_LIMIT_EXCEEDED',
      status: 429,
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});