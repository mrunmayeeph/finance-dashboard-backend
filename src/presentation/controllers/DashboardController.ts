import { Request, Response, NextFunction } from 'express';
import { GetDashboardSummaryUseCase } from '../../application/use-cases/dashboard/GetDashboardSummaryUseCase';

/**
 * Dashboard Controller
 * Handles HTTP requests for dashboard summary endpoints
 */
export class DashboardController {
  constructor(private readonly getDashboardSummaryUseCase: GetDashboardSummaryUseCase) {}

  getSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const summary = await this.getDashboardSummaryUseCase.execute({
        userId: req.query.userId as string | undefined,
      });
      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  };
}