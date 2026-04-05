import { ITransactionRepository } from '../../../domain/repositories/ITransactionRepository';
import { Transaction, TransactionFilters } from '../../../domain/entities/Transaction';

export interface ListTransactionsInput extends TransactionFilters {}

export interface ListTransactionsOutput {
  transactions: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * List Transactions Use Case
 * Returns paginated financial records with optional filters
 */
export class ListTransactionsUseCase {
  constructor(private readonly transactionRepository: ITransactionRepository) {}

  async execute(input: ListTransactionsInput): Promise<ListTransactionsOutput> {
    const page = input.page ?? 1;
    const limit = input.limit ?? 20;

    const { transactions, total } = await this.transactionRepository.findAll({
      ...input,
      page,
      limit,
    });

    return {
      transactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}