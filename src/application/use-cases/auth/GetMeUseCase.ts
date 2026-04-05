import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { User } from '../../../domain/entities/User';
import { NotFoundError } from '../../../shared/errors/AppError';

export interface GetMeInput {
  userId: string;
}

/**
 * Get Me Use Case
 * Returns the currently authenticated user's profile
 */
export class GetMeUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: GetMeInput): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const { password: _password, ...safeUser } = user;
    return safeUser;
  }
}