// src/types/error.types.ts
export enum ErrorCode {
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
    AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
    NOT_FOUND = 'NOT_FOUND',
    STRIPE_ERROR = 'STRIPE_ERROR',
    DATABASE_ERROR = 'DATABASE_ERROR',
    NOTIFICATION_ERROR = 'NOTIFICATION_ERROR',
    INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR'
  }
  
  export interface ErrorResponse {
    success: false;
    error: {
      message: string;
      code: ErrorCode;
      status: number;
      details?: Record<string, any>;
    };
  }