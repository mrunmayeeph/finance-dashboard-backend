import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { comparePassword } from '../../../shared/utils/password';
import { generateAccessToken } from '../../../shared/utils/jwt';
import { UnauthorizedError } from '../../../shared/errors/AppError';

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginOutput {
  accessToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

/**
 * Login Use Case
 * Validates credentials and returns a signed access token
 */
export class LoginUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    const { email, password } = input;

    const user = await this.userRepository.findByEmail(email);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const passwordValid = await comparePassword(password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    await this.userRepository.updateLastLogin(user.id);

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }
}