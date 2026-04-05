import { Request, Response, NextFunction } from 'express';
import { PolicyService } from '../../application/services/PolicyService';
import { ForbiddenError, UnauthorizedError } from '../../shared/errors/AppError';
import { UserRole } from '../../domain/entities/User';

/**
 * Creates the requirePermission middleware factory
 * Returns a middleware that checks if the authenticated user's role
 * has permission to perform the given action on the given resource
 */
export const createPermissionMiddleware = (policyService: PolicyService) => {
  return (resource: string, action: string) => {
    return (req: Request, _res: Response, next: NextFunction): void => {
      try {
        if (!req.user) {
          throw new UnauthorizedError('Authentication required');
        }

        const role = req.user.role as UserRole;
        const allowed = policyService.hasPermission(role, resource, action);

        if (!allowed) {
          throw new ForbiddenError(
            `Role '${role}' does not have permission to ${action} ${resource}`
          );
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  };
};