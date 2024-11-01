// src/utils/validation.utils.ts
import Joi from 'joi';
import { CustomError } from './error.utils';

export const ValidationSchemas = {
  paymentLink: Joi.object({
    amount: Joi.number().positive().required(),
    currency: Joi.string().length(3).lowercase().default('usd'),
    metadata: Joi.object({
      orderId: Joi.string(),
      customerEmail: Joi.string().email(),
      productName: Joi.string(),
    }).unknown(true),
  }),

  webhook: Joi.object({
    type: Joi.string().required(),
    data: Joi.object().required(),
  }),
};

export const validate = (schema: Joi.Schema, data: any) => {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });
  
  if (error) {
    const details = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
    }));
    throw new CustomError('Validation error', 400, 'VALIDATION_ERROR', { details });
  }
  
  return value;
};

// Add some common validation helpers
export const ValidationHelpers = {
  isValidEmail: (email: string): boolean => {
    const emailSchema = Joi.string().email();
    return !emailSchema.validate(email).error;
  },

  isValidCurrency: (currency: string): boolean => {
    const currencySchema = Joi.string().length(3).lowercase();
    return !currencySchema.validate(currency).error;
  },

  isPositiveNumber: (number: number): boolean => {
    const numberSchema = Joi.number().positive();
    return !numberSchema.validate(number).error;
  },

  sanitizeString: (str: string): string => {
    return str.trim().replace(/[<>]/g, '');
  },
};