import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { User, CreateUserDTO } from '../../../domain/entities/User';
import { ConflictError } from '../../../shared/errors/AppError';

export interface CreateUserInput extends CreateUserDTO {}

/**
 * Create User Use Case
 * Handles user creation with duplicate email check
 */
export class CreateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: CreateUserInput): Promise<Omit<User, 'password'>> {
    const emailExists = await this.userRepository.existsByEmail(input.email);
    if (emailExists) {
      throw new ConflictError('Email already registered');
    }

    const user = await this.userRepository.create(input);
    const { password: _password, ...safeUser } = user;
    return safeUser;
  }
}