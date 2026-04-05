import { Request, Response, NextFunction } from 'express';
import { CreateUserUseCase } from '../../application/use-cases/users/CreateUserUseCase';
import { ListUsersUseCase } from '../../application/use-cases/users/ListUsersUseCase';
import { UpdateUserUseCase } from '../../application/use-cases/users/UpdateUserUseCase';

/**
 * User Controller
 * Handles HTTP requests for user management endpoints
 */
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase
  ) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.createUserUseCase.execute(req.body);
      res.status(201).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.listUsersUseCase.execute({
        page: req.query.page as unknown as number,
        limit: req.query.limit as unknown as number,
      });
      res.status(200).json({
        success: true,
        data: result.users,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.updateUserUseCase.execute({
        userId: req.params.id,
        ...req.body,
      });
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };
}