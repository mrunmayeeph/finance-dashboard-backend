import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../../shared/errors/AppError';

type RequestPart = 'body' | 'query' | 'params';

/**
 * Validation Middleware
 * Validates the specified part of the request against a Zod schema
 */
export const validate = (schema: ZodSchema, part: RequestPart = 'body') => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[part]);
      req[part] = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string[]> = {};
        error.errors.forEach((err) => {
          const key = err.path.join('.');
          if (!errors[key]) errors[key] = [];
          errors[key].push(err.message);
        });
        next(new ValidationError('Validation failed', errors));
      } else {
        next(error);
      }
    }
  };
};