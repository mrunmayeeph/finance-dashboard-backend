import { Router, RequestHandler } from 'express';
import { TransactionController } from '../controllers/TransactionController';
import { authMiddleware } from '../../infrastructure/middleware/authMiddleware';
import { validate } from '../../infrastructure/middleware/validationMiddleware';
import {
  createTransactionSchema,
  updateTransactionSchema,
  transactionIdParamSchema,
  listTransactionsQuerySchema,
} from '../validators/transactionValidator';

type PermissionMiddleware = (resource: string, action: string) => typeof authMiddleware;

/**
 * Creates transaction routes
 */
export const createTransactionRoutes = (
  transactionController: TransactionController,
  requirePermission: PermissionMiddleware
): Router => {
  const router = Router();

  // All transaction routes require authentication
  router.use(authMiddleware);

  /**
   * POST /transactions
   * Create a new financial record — admin only
   */
  router.post(
    '/',
    requirePermission('transactions', 'create'),
    validate(createTransactionSchema),
    transactionController.create
  );

  /**
   * GET /transactions
   * List financial records with optional filters — all roles
   */
  router.get(
    '/',
    requirePermission('transactions', 'read'),
    validate(listTransactionsQuerySchema, 'query'),
    transactionController.list
  );

  /**
   * PATCH /transactions/:id
   * Update a financial record — admin only
   */
  router.patch(
    '/:id',
    requirePermission('transactions', 'update'),
    validate(transactionIdParamSchema, 'params'),
    validate(updateTransactionSchema),
    transactionController.update
  );

  /**
   * DELETE /transactions/:id
   * Soft-delete a financial record — admin only
   */
  router.delete(
    '/:id',
    requirePermission('transactions', 'delete'),
    validate(transactionIdParamSchema, 'params'),
    transactionController.delete
  );

  return router;
};