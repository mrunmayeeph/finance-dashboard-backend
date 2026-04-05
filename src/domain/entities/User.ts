/**
 * User Domain Entity
 * Framework-agnostic representation of a User.
 * Roles are hardcoded as viewer | analyst | admin for this assignment scope.
 */
export type UserRole = 'viewer' | 'analyst' | 'admin';

export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface UpdateUserDTO {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  isActive?: boolean;
}