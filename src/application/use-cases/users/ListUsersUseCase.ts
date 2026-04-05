import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { User } from '../../../domain/entities/User';

export interface ListUsersInput {
  page: number;
  limit: number;
}

export interface ListUsersOutput {
  users: Omit<User, 'password'>[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * List Users Use Case
 * Returns a paginated list of active users
 */
export class ListUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: ListUsersInput): Promise<ListUsersOutput> {
    const { page, limit } = input;
    const { users, total } = await this.userRepository.findAll(page, limit);

    return {
      users: users.map(({ password: _password, ...safeUser }) => safeUser),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}