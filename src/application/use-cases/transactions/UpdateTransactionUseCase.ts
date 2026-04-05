import { ITransactionRepository } from '../../../domain/repositories/ITransactionRepository';
import { Transaction, UpdateTransactionDTO } from '../../../domain/entities/Transaction';
import { NotFoundError } from '../../../shared/errors/AppError';

export interface UpdateTransactionInput extends UpdateTransactionDTO {
  transactionId: string;
}

/**
 * Update Transaction Use Case
 * Updates an existing financial record
 */
export class UpdateTransactionUseCase {
  constructor(private readonly transactionRepository: ITransactionRepository) {}

  async execute(input: UpdateTransactionInput): Promise<Transaction> {
    const { transactionId, ...updateData } = input;

    const updated = await this.transactionRepository.update(transactionId, updateData);
    if (!updated) {
      throw new NotFoundError('Transaction not found');
    }

    return updated;
  }
}