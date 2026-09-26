import { Request, Response, NextFunction } from 'express';
import { ENV } from '../config/env';

export interface AppError extends Error {
  statusCode?: number;
  errors?: any[];
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected server error occurred.';

  // Avoid logging entire stack trace in production
  if (ENV.NODE_ENV !== 'production') {
    console.error('[Error Details]', err);
  } else {
    console.error(`[Error] ${statusCode}: ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || [],
    ...(ENV.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
};
