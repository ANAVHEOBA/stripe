// src/utils/response.utils.ts
import { Response } from 'express';
import { ApiResponse } from '../types';

export class ResponseUtil {
  static success<T>(res: Response, data: T, status: number = 200): void {
    const response: ApiResponse<T> = {
      success: true,
      data,
    };
    res.status(status).json(response);
  }

  static error(
    res: Response,
    message: string,
    code: string,
    status: number = 500,
    details?: Record<string, any>
  ): void {
    const response: ApiResponse<null> = {
      success: false,
      error: {
        message,
        code,
        status,
        details,
      },
    };
    res.status(status).json(response);
  }

  static paginated<T>(
    res: Response,
    data: T[],
    hasMore: boolean,
    totalCount?: number
  ): void {
    const response: ApiResponse<{ data: T[]; hasMore: boolean; totalCount?: number }> = {
      success: true,
      data: {
        data,
        hasMore,
        totalCount,
      },
    };
    res.status(200).json(response);
  }
}