import { z } from 'zod';

export const createTransactionSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  type: z.enum(['income', 'expense'], {
    errorMap: () => ({ message: 'Type must be income or expense' }),
  }),
  category: z.string().min(1, 'Category is required').max(50, 'Category is too long'),
  date: z.coerce.date({ errorMap: () => ({ message: 'Invalid date format' }) }),
  notes: z.string().max(500, 'Notes must be 500 characters or less').optional(),
});

export const updateTransactionSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0').optional(),
  type: z.enum(['income', 'expense']).optional(),
  category: z.string().min(1).max(50).optional(),
  date: z.coerce.date().optional(),
  notes: z.string().max(500).optional(),
});

export const transactionIdParamSchema = z.object({
  id: z.string().min(1, 'Transaction ID is required'),
});

export const listTransactionsQuerySchema = z.object({
  type: z.enum(['income', 'expense']).optional(),
  category: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type TransactionIdParam = z.infer<typeof transactionIdParamSchema>;
export type ListTransactionsQuery = z.infer<typeof listTransactionsQuerySchema>;