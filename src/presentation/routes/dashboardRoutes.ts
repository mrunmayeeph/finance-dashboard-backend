import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';
import { authMiddleware } from '../../infrastructure/middleware/authMiddleware';

type PermissionMiddleware = (resource: string, action: string) => typeof authMiddleware;

/**
 * Creates dashboard routes
 */
export const createDashboardRoutes = (
  dashboardController: DashboardController,
  requirePermission: PermissionMiddleware
): Router => {
  const router = Router();

  // All dashboard routes require authentication
  router.use(authMiddleware);

  /**
   * GET /dashboard/summary
   * Returns aggregated financial summary — analyst and admin only
   */
  router.get('/summary', requirePermission('dashboard', 'read'), dashboardController.getSummary);

  return router;
};