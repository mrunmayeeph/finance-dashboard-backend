import { ITransactionRepository } from '../../../domain/repositories/ITransactionRepository';
import { Transaction, CreateTransactionDTO } from '../../../domain/entities/Transaction';

export interface CreateTransactionInput extends CreateTransactionDTO {}

/**
 * Create Transaction Use Case
 * Creates a new financial record
 */
export class CreateTransactionUseCase {
  constructor(private readonly transactionRepository: ITransactionRepository) {}

  async execute(input: CreateTransactionInput): Promise<Transaction> {
    return this.transactionRepository.create(input);
  }
}