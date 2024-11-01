// src/types/index.ts
export * from './payment.types';
export * from './order.types';
export * from './notification.types';
export * from './error.types';
export * from './config.types';

// Additional utility types
export interface PaginationParams {
  limit?: number;
  startingAfter?: string;
  endingBefore?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  hasMore: boolean;
  totalCount?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    status: number;
    details?: Record<string, any>;
  };
}