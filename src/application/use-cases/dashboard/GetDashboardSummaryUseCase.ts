import { ITransactionRepository, DashboardSummary } from '../../../domain/repositories/ITransactionRepository';

export interface GetDashboardSummaryInput {
  userId?: string;
}

/**
 * Get Dashboard Summary Use Case
 * Delegates to the repository's aggregation pipeline.
 * Dashboard calculations use MongoDB aggregation pipelines for efficiency and scalability.
 * For large-scale systems, this can be cached using Redis or precomputed via background jobs.
 */
export class GetDashboardSummaryUseCase {
  constructor(private readonly transactionRepository: ITransactionRepository) {}

  async execute(input: GetDashboardSummaryInput): Promise<DashboardSummary> {
    return this.transactionRepository.getDashboardSummary(input.userId);
  }
}