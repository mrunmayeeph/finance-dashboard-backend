import { ITransactionRepository, DashboardSummary } from '../../../../domain/repositories/ITransactionRepository';
import {
  Transaction,
  CreateTransactionDTO,
  UpdateTransactionDTO,
  TransactionFilters,
} from '../../../../domain/entities/Transaction';
import { TransactionModel, ITransactionDocument } from '../models/TransactionModel';

/**
 * MongoDB implementation of Transaction Repository
 * Dashboard calculations use MongoDB aggregation pipelines for efficiency and scalability.
 */
export class MongoTransactionRepository implements ITransactionRepository {
  private mapToEntity(doc: ITransactionDocument): Transaction {
    return {
      id: doc._id.toString(),
      userId: doc.userId.toString(),
      amount: doc.amount,
      type: doc.type,
      category: doc.category,
      date: doc.date,
      notes: doc.notes,
      deletedAt: doc.deletedAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async findById(id: string): Promise<Transaction | null> {
    const doc = await TransactionModel.findOne({ _id: id, deletedAt: null });
    return doc ? this.mapToEntity(doc) : null;
  }

  async findAll(
    filters: TransactionFilters
  ): Promise<{ transactions: Transaction[]; total: number }> {
    const { type, category, startDate, endDate, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = { deletedAt: null };

    if (type) query.type = type;
    if (category) query.category = { $regex: category, $options: 'i' };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) (query.date as Record<string, unknown>).$gte = startDate;
      if (endDate) (query.date as Record<string, unknown>).$lte = endDate;
    }

    const [docs, total] = await Promise.all([
      TransactionModel.find(query).skip(skip).limit(limit).sort({ date: -1 }),
      TransactionModel.countDocuments(query),
    ]);

    return {
      transactions: docs.map((doc) => this.mapToEntity(doc)),
      total,
    };
  }

  async create(data: CreateTransactionDTO): Promise<Transaction> {
    const doc = await TransactionModel.create(data);
    return this.mapToEntity(doc);
  }

  async update(id: string, data: UpdateTransactionDTO): Promise<Transaction | null> {
    const doc = await TransactionModel.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: data },
      { new: true, runValidators: true }
    );
    return doc ? this.mapToEntity(doc) : null;
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await TransactionModel.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: { deletedAt: new Date() } }
    );
    return result !== null;
  }

  /**
   * Dashboard aggregation pipeline
   * Runs four parallel aggregations for maximum efficiency
   */
  async getDashboardSummary(userId?: string): Promise<DashboardSummary> {
    const baseMatch: Record<string, unknown> = { deletedAt: null };
    if (userId) baseMatch.userId = userId;

    const [totalsResult, categoryResult, trendsResult, recentDocs] = await Promise.all([
      // 1. Total income, total expenses, net balance
      TransactionModel.aggregate([
        { $match: baseMatch },
        {
          $group: {
            _id: '$type',
            total: { $sum: '$amount' },
          },
        },
      ]),

      // 2. Category-wise totals
      TransactionModel.aggregate([
        { $match: baseMatch },
        {
          $group: {
            _id: '$category',
            total: { $sum: '$amount' },
          },
        },
        { $sort: { total: -1 } },
      ]),

      // 3. Monthly trends — income vs expenses grouped by year-month
      TransactionModel.aggregate([
        { $match: baseMatch },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' },
              type: '$type',
            },
            total: { $sum: '$amount' },
          },
        },
        {
          $group: {
            _id: { year: '$_id.year', month: '$_id.month' },
            income: {
              $sum: { $cond: [{ $eq: ['$_id.type', 'income'] }, '$total', 0] },
            },
            expenses: {
              $sum: { $cond: [{ $eq: ['$_id.type', 'expense'] }, '$total', 0] },
            },
          },
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 },
      ]),

      // 4. Recent 5 transactions
      TransactionModel.find(baseMatch).sort({ date: -1 }).limit(5),
    ]);

    // Derive totals from aggregation result
    const incomeDoc = totalsResult.find((r) => r._id === 'income');
    const expenseDoc = totalsResult.find((r) => r._id === 'expense');
    const totalIncome = incomeDoc?.total ?? 0;
    const totalExpenses = expenseDoc?.total ?? 0;

    return {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      categoryTotals: categoryResult,
      monthlyTrends: trendsResult,
      recentTransactions: recentDocs.map((doc) => this.mapToEntity(doc)),
    };
  }
}