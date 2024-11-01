// src/utils/error.utils.ts
export class CustomError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_SERVER_ERROR',
    public details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, details?: any) {
    return new CustomError(message, 400, 'BAD_REQUEST', details);
  }

  static unauthorized(message: string = 'Unauthorized') {
    return new CustomError(message, 401, 'UNAUTHORIZED');
  }

  static forbidden(message: string = 'Forbidden') {
    return new CustomError(message, 403, 'FORBIDDEN');
  }

  static notFound(message: string = 'Resource not found') {
    return new CustomError(message, 404, 'NOT_FOUND');
  }

  static conflict(message: string, details?: any) {
    return new CustomError(message, 409, 'CONFLICT', details);
  }

  static validationError(message: string, details?: any) {
    return new CustomError(message, 422, 'VALIDATION_ERROR', details);
  }

  static tooManyRequests(message: string = 'Too many requests') {
    return new CustomError(message, 429, 'TOO_MANY_REQUESTS');
  }

  static internal(message: string = 'Internal server error') {
    return new CustomError(message, 500, 'INTERNAL_SERVER_ERROR');
  }
}