import {
  Transaction,
  CreateTransactionDTO,
  UpdateTransactionDTO,
  TransactionFilters,
} from '../entities/Transaction';

/**
 * Transaction Repository Interface
 * Defines the contract for financial record data access operations
 */
export interface ITransactionRepository {
  findById(id: string): Promise<Transaction | null>;
  findAll(filters: TransactionFilters): Promise<{ transactions: Transaction[]; total: number }>;
  create(data: CreateTransactionDTO): Promise<Transaction>;
  update(id: string, data: UpdateTransactionDTO): Promise<Transaction | null>;
  softDelete(id: string): Promise<boolean>;
  getDashboardSummary(userId?: string): Promise<DashboardSummary>;
}

export interface CategoryTotal {
  _id: string;
  total: number;
}

export interface MonthlyTrend {
  _id: { year: number; month: number };
  income: number;
  expenses: number;
}

export interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  categoryTotals: CategoryTotal[];
  monthlyTrends: MonthlyTrend[];
  recentTransactions: Transaction[];
}