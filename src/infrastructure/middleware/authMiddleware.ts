import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, DecodedToken } from '../../shared/utils/jwt';
import { UnauthorizedError } from '../../shared/errors/AppError';

/**
 * Extend Express Request to include decoded token data
 */
declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}

/**
 * Authentication Middleware
 * Verifies JWT access token and attaches decoded user data to request
 */
export const authMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedError('No authorization header provided');
    }

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedError('Invalid authorization header format');
    }

    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      next(new UnauthorizedError('Invalid or expired token'));
    }
  }
};