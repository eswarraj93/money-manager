import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        type: {
            type: String,
            enum: ['income', 'expense'],
            required: [true, 'Please specify transaction type'],
        },
        amount: {
            type: Number,
            required: [true, 'Please provide an amount'],
            min: [0, 'Amount cannot be negative'],
        },
        category: {
            type: String,
            required: [true, 'Please provide a category'],
            enum: [
                'Salary',
                'Freelance',
                'Investment',
                'Other Income',
                'Food',
                'Fuel',
                'Rent',
                'Medical',
                'Loan',
                'Shopping',
                'Entertainment',
                'Utilities',
                'Education',
                'Travel',
                'Other Expense',
            ],
        },
        division: {
            type: String,
            required: [true, 'Please specify division'],
            enum: ['Personal', 'Office'],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [200, 'Description cannot exceed 200 characters'],
        },
        date: {
            type: Date,
            required: [true, 'Please provide a date'],
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, type: 1 });
transactionSchema.index({ user: 1, category: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
