import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';

// Get all budgets for user
export const getBudgets = async (req, res) => {
    try {
        const budgets = await Budget.find({ userId: req.user._id }).sort({ createdAt: -1 });

        // Calculate spending for each budget
        const budgetsWithSpending = await Promise.all(budgets.map(async (budget) => {
            const startDate = new Date();
            if (budget.period === 'monthly') {
                startDate.setDate(1);
                startDate.setHours(0, 0, 0, 0);
            } else {
                startDate.setMonth(0, 1);
                startDate.setHours(0, 0, 0, 0);
            }

            const spending = await Transaction.aggregate([
                {
                    $match: {
                        user: req.user._id,
                        category: budget.category,
                        type: 'expense',
                        date: { $gte: startDate }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$amount' }
                    }
                }
            ]);

            return {
                ...budget.toObject(),
                spent: spending.length > 0 ? spending[0].total : 0,
                remaining: budget.amount - (spending.length > 0 ? spending[0].total : 0),
                percentage: spending.length > 0 ? ((spending[0].total / budget.amount) * 100).toFixed(1) : 0
            };
        }));

        res.json(budgetsWithSpending);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching budgets', error: error.message });
    }
};

// Create budget
export const createBudget = async (req, res) => {
    try {
        const { category, amount, period } = req.body;

        // Check if budget already exists for this category
        const existingBudget = await Budget.findOne({
            userId: req.user._id,
            category,
            isActive: true
        });

        if (existingBudget) {
            return res.status(400).json({ message: 'Budget already exists for this category' });
        }

        const budget = new Budget({
            userId: req.user._id,
            category,
            amount,
            period: period || 'monthly'
        });

        await budget.save();
        res.status(201).json(budget);
    } catch (error) {
        res.status(500).json({ message: 'Error creating budget', error: error.message });
    }
};

// Update budget
export const updateBudget = async (req, res) => {
    try {
        const { id } = req.params;
        const { category, amount, period, isActive } = req.body;

        const budget = await Budget.findOne({ _id: id, userId: req.user._id });

        if (!budget) {
            return res.status(404).json({ message: 'Budget not found' });
        }

        if (category) budget.category = category;
        if (amount) budget.amount = amount;
        if (period) budget.period = period;
        if (typeof isActive !== 'undefined') budget.isActive = isActive;

        await budget.save();
        res.json(budget);
    } catch (error) {
        res.status(500).json({ message: 'Error updating budget', error: error.message });
    }
};

// Delete budget
export const deleteBudget = async (req, res) => {
    try {
        const { id } = req.params;
        const budget = await Budget.findOneAndDelete({ _id: id, userId: req.user._id });

        if (!budget) {
            return res.status(404).json({ message: 'Budget not found' });
        }

        res.json({ message: 'Budget deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting budget', error: error.message });
    }
};
