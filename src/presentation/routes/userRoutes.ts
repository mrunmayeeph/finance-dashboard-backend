import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../../infrastructure/middleware/authMiddleware';
import { validate } from '../../infrastructure/middleware/validationMiddleware';
import {
  createUserSchema,
  updateUserSchema,
  userIdParamSchema,
  listUsersQuerySchema,
} from '../validators/userValidator';

type PermissionMiddleware = (resource: string, action: string) => typeof authMiddleware;

/**
 * Creates user routes
 */
export const createUserRoutes = (
  userController: UserController,
  requirePermission: PermissionMiddleware
): Router => {
  const router = Router();

  // All user routes require authentication
  router.use(authMiddleware);

  /**
   * POST /users
   * Create a new user — admin only
   */
  router.post(
    '/',
    requirePermission('users', 'create'),
    validate(createUserSchema),
    userController.create
  );

  /**
   * GET /users
   * List all users with pagination — admin only
   */
  router.get(
    '/',
    requirePermission('users', 'read'),
    validate(listUsersQuerySchema, 'query'),
    userController.list
  );

  /**
   * PATCH /users/:id
   * Update a user's role or status — admin only
   */
  router.patch(
    '/:id',
    requirePermission('users', 'update'),
    validate(userIdParamSchema, 'params'),
    validate(updateUserSchema),
    userController.update
  );

  return router;
};