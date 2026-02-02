import Transaction from '../models/Transaction.js';

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Private
export const createTransaction = async (req, res) => {
    try {
        const { type, amount, category, division, description, date } = req.body;

        // Validation
        if (!type || !amount || !category || !division) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const transaction = await Transaction.create({
            user: req.user._id,
            type,
            amount,
            category,
            division,
            description,
            date: date || new Date(),
        });

        res.status(201).json(transaction);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Private
export const getTransactions = async (req, res) => {
    try {
        const { category, division, startDate, endDate, type } = req.query;

        // Build query
        const query = { user: req.user._id };

        if (category) query.category = category;
        if (division) query.division = division;
        if (type) query.type = type;
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const transactions = await Transaction.find(query).sort({ date: -1 });

        res.json(transactions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
export const updateTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // Check ownership
        if (transaction.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Check 12-hour restriction
        const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
        if (transaction.createdAt < twelveHoursAgo) {
            return res.status(403).json({
                message: 'Cannot edit transaction after 12 hours',
            });
        }

        const { type, amount, category, division, description, date } = req.body;

        transaction.type = type || transaction.type;
        transaction.amount = amount || transaction.amount;
        transaction.category = category || transaction.category;
        transaction.division = division || transaction.division;
        transaction.description = description !== undefined ? description : transaction.description;
        transaction.date = date || transaction.date;

        const updatedTransaction = await transaction.save();

        res.json(updatedTransaction);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
export const deleteTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // Check ownership
        if (transaction.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await transaction.deleteOne();

        res.json({ message: 'Transaction removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get dashboard stats
// @route   GET /api/transactions/stats
// @access  Private
export const getStats = async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user._id });

        const totalIncome = transactions
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpense = transactions
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const balance = totalIncome - totalExpense;

        res.json({
            totalIncome,
            totalExpense,
            balance,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get analytics data
// @route   GET /api/transactions/analytics
// @access  Private
export const getAnalytics = async (req, res) => {
    try {
        const { period, startDate, endDate } = req.query;

        let dateFilter = {};
        const now = new Date();

        if (period === 'weekly') {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            dateFilter = { date: { $gte: weekAgo } };
        } else if (period === 'monthly') {
            const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            dateFilter = { date: { $gte: monthAgo } };
        } else if (period === 'yearly') {
            const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            dateFilter = { date: { $gte: yearAgo } };
        } else if (startDate || endDate) {
            dateFilter.date = {};
            if (startDate) dateFilter.date.$gte = new Date(startDate);
            if (endDate) dateFilter.date.$lte = new Date(endDate);
        }

        const transactions = await Transaction.find({
            user: req.user._id,
            ...dateFilter,
        }).sort({ date: 1 });

        // Category breakdown
        const categoryBreakdown = {};
        transactions.forEach((t) => {
            if (t.type === 'expense') {
                categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
            }
        });

        // Income vs Expense over time
        const incomeExpenseData = {};
        transactions.forEach((t) => {
            const dateKey = t.date.toISOString().split('T')[0];
            if (!incomeExpenseData[dateKey]) {
                incomeExpenseData[dateKey] = { date: dateKey, income: 0, expense: 0 };
            }
            if (t.type === 'income') {
                incomeExpenseData[dateKey].income += t.amount;
            } else {
                incomeExpenseData[dateKey].expense += t.amount;
            }
        });

        res.json({
            categoryBreakdown: Object.entries(categoryBreakdown).map(([name, value]) => ({
                name,
                value,
            })),
            incomeExpenseData: Object.values(incomeExpenseData),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
