import { ITransactionRepository } from '../../../domain/repositories/ITransactionRepository';
import { NotFoundError } from '../../../shared/errors/AppError';

export interface DeleteTransactionInput {
  transactionId: string;
}

/**
 * Delete Transaction Use Case
 * Soft-deletes a financial record by setting deletedAt timestamp
 */
export class DeleteTransactionUseCase {
  constructor(private readonly transactionRepository: ITransactionRepository) {}

  async execute(input: DeleteTransactionInput): Promise<void> {
    const deleted = await this.transactionRepository.softDelete(input.transactionId);
    if (!deleted) {
      throw new NotFoundError('Transaction not found');
    }
  }
}