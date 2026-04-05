import mongoose, { Document, Schema } from 'mongoose';
import { TransactionType } from '../../../../domain/entities/Transaction';

export interface ITransactionDocument extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  type: TransactionType;
  category: string;
  date: Date;
  notes?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransactionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: true,
      index: true, // Optimizes filtering and aggregation queries
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true, // Optimizes filtering and aggregation queries
    },
    date: {
      type: Date,
      required: true,
      index: true, // Optimizes filtering and aggregation queries
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        const { _id, __v, ...rest } = ret;
        return { ...rest, id: _id.toString() };
      },
    },
  }
);

// Compound indexes for common filter combinations
TransactionSchema.index({ type: 1, category: 1 });
TransactionSchema.index({ date: 1, type: 1 });
TransactionSchema.index({ userId: 1, deletedAt: 1 });

export const TransactionModel = mongoose.model<ITransactionDocument>(
  'Transaction',
  TransactionSchema
);