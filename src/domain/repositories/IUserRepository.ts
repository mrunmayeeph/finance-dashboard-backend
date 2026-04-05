import { User, CreateUserDTO, UpdateUserDTO } from '../entities/User';

/**
 * User Repository Interface
 * Defines the contract for user data access operations
 */
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(page: number, limit: number): Promise<{ users: User[]; total: number }>;
  create(data: CreateUserDTO): Promise<User>;
  update(id: string, data: UpdateUserDTO): Promise<User | null>;
  updateLastLogin(id: string): Promise<void>;
  existsByEmail(email: string): Promise<boolean>;
}