/**
 * Transaction Domain Entity
 * Transactions represent financial records in this system.
 * Framework-agnostic representation of a financial record.
 */
export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: Date;
  notes?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTransactionDTO {
  userId: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: Date;
  notes?: string;
}

export interface UpdateTransactionDTO {
  amount?: number;
  type?: TransactionType;
  category?: string;
  date?: Date;
  notes?: string;
}

export interface TransactionFilters {
  type?: TransactionType;
  category?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}