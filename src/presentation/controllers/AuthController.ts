import { Request, Response, NextFunction } from 'express';
import { LoginUseCase } from '../../application/use-cases/auth/LoginUseCase';
import { GetMeUseCase } from '../../application/use-cases/auth/GetMeUseCase';

/**
 * Auth Controller
 * Handles HTTP requests for authentication endpoints
 */
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly getMeUseCase: GetMeUseCase
  ) {}

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.loginUseCase.execute(req.body);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.getMeUseCase.execute({ userId: req.user!.userId });
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };
}