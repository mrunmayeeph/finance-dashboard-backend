import { UserRole } from '../../domain/entities/User';

/**
 * Role permissions map
 * Defines which actions each role can perform on each resource.
 * Roles are hardcoded for this assignment scope — no dynamic permission collection needed.
 */
const ROLE_PERMISSIONS: Record<UserRole, Record<string, string[]>> = {
  viewer: {
    transactions: ['read'],
    dashboard: [],
    users: [],
  },
  analyst: {
    transactions: ['read'],
    dashboard: ['read'],
    users: [],
  },
  admin: {
    transactions: ['create', 'read', 'update', 'delete'],
    dashboard: ['read'],
    users: ['create', 'read', 'update'],
  },
};

/**
 * Policy Service
 * Handles RBAC permission evaluation against hardcoded role definitions.
 */
export class PolicyService {
  /**
   * Check if a role has permission to perform an action on a resource
   */
  hasPermission(role: UserRole, resource: string, action: string): boolean {
    const resourcePermissions = ROLE_PERMISSIONS[role]?.[resource];
    if (!resourcePermissions) return false;
    return resourcePermissions.includes(action);
  }
}