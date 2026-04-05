import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { User, UpdateUserDTO } from '../../../domain/entities/User';
import { NotFoundError } from '../../../shared/errors/AppError';

export interface UpdateUserStatusInput extends UpdateUserDTO {
  userId: string;
}

/**
 * Update User Use Case
 * Allows admin to update user role or active status
 */
export class UpdateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: UpdateUserStatusInput): Promise<Omit<User, 'password'>> {
    const { userId, ...updateData } = input;

    const updated = await this.userRepository.update(userId, updateData);
    if (!updated) {
      throw new NotFoundError('User not found');
    }

    const { password: _password, ...safeUser } = updated;
    return safeUser;
  }
}