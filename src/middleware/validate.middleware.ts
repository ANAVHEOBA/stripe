// src/middleware/validate.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { CustomError } from '../utils/error.utils';

export const validateRequest = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(', ');
      next(new CustomError(errorMessage, 400));
      return;
    }

    next();
  };
};