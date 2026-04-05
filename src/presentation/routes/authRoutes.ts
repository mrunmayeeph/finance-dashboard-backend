import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authMiddleware } from '../../infrastructure/middleware/authMiddleware';
import { validate } from '../../infrastructure/middleware/validationMiddleware';
import { loginSchema } from '../validators/authValidator';

/**
 * Creates auth routes
 */
export const createAuthRoutes = (authController: AuthController): Router => {
  const router = Router();

  /**
   * POST /auth/login
   * Authenticate user and return access token
   */
  router.post('/login', validate(loginSchema), authController.login);

  /**
   * GET /auth/me
   * Get the currently authenticated user's profile
   */
  router.get('/me', authMiddleware, authController.me);

  return router;
};