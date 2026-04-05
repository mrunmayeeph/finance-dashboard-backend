import { Request, Response, NextFunction } from 'express';
import { CreateTransactionUseCase } from '../../application/use-cases/transactions/CreateTransactionUseCase';
import { ListTransactionsUseCase } from '../../application/use-cases/transactions/ListTransactionsUseCase';
import { UpdateTransactionUseCase } from '../../application/use-cases/transactions/UpdateTransactionUseCase';
import { DeleteTransactionUseCase } from '../../application/use-cases/transactions/DeleteTransactionUseCase';

/**
 * Transaction Controller
 * Handles HTTP requests for financial record endpoints
 */
export class TransactionController {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    private readonly listTransactionsUseCase: ListTransactionsUseCase,
    private readonly updateTransactionUseCase: UpdateTransactionUseCase,
    private readonly deleteTransactionUseCase: DeleteTransactionUseCase
  ) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const transaction = await this.createTransactionUseCase.execute({
        ...req.body,
        userId: req.user!.userId,
      });
      res.status(201).json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.listTransactionsUseCase.execute(req.query as never);
      res.status(200).json({
        success: true,
        data: result.transactions,
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
      const transaction = await this.updateTransactionUseCase.execute({
        transactionId: req.params.id,
        ...req.body,
      });
      res.status(200).json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.deleteTransactionUseCase.execute({ transactionId: req.params.id });
      res.status(200).json({
        success: true,
        message: 'Transaction deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}