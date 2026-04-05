import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../../shared/errors/AppError';

/**
 * 404 Not Found Middleware
 * Catches requests that did not match any route
 */
export const notFoundMiddleware = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
};

/**
 * Global Error Middleware
 * Handles all errors thrown or passed via next(error)
 */
export const errorMiddleware = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (error instanceof ValidationError) {
    res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        errors: error.errors,
      },
    });
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
      },
    });
    return;
  }

  // Unhandled / unexpected errors
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  });
};