import Goal from '../models/Goal.js';

// Get all goals for user
export const getGoals = async (req, res) => {
    try {
        const goals = await Goal.find({ userId: req.user._id }).sort({ createdAt: -1 });

        // Calculate progress for each goal
        const goalsWithProgress = goals.map(goal => ({
            ...goal.toObject(),
            progress: ((goal.currentAmount / goal.targetAmount) * 100).toFixed(1),
            remaining: goal.targetAmount - goal.currentAmount
        }));

        res.json(goalsWithProgress);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching goals', error: error.message });
    }
};

// Create goal
export const createGoal = async (req, res) => {
    try {
        const { name, targetAmount, currentAmount, deadline } = req.body;

        const goal = new Goal({
            userId: req.user._id,
            name,
            targetAmount,
            currentAmount: currentAmount || 0,
            deadline
        });

        await goal.save();
        res.status(201).json(goal);
    } catch (error) {
        res.status(500).json({ message: 'Error creating goal', error: error.message });
    }
};

// Update goal
export const updateGoal = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, targetAmount, currentAmount, deadline, isCompleted } = req.body;

        const goal = await Goal.findOne({ _id: id, userId: req.user._id });

        if (!goal) {
            return res.status(404).json({ message: 'Goal not found' });
        }

        if (name) goal.name = name;
        if (targetAmount) goal.targetAmount = targetAmount;
        if (typeof currentAmount !== 'undefined') goal.currentAmount = currentAmount;
        if (deadline) goal.deadline = deadline;
        if (typeof isCompleted !== 'undefined') goal.isCompleted = isCompleted;

        await goal.save();
        res.json(goal);
    } catch (error) {
        res.status(500).json({ message: 'Error updating goal', error: error.message });
    }
};

// Delete goal
export const deleteGoal = async (req, res) => {
    try {
        const { id } = req.params;
        const goal = await Goal.findOneAndDelete({ _id: id, userId: req.user._id });

        if (!goal) {
            return res.status(404).json({ message: 'Goal not found' });
        }

        res.json({ message: 'Goal deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting goal', error: error.message });
    }
};

// Add amount to goal
export const addToGoal = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount } = req.body;

        const goal = await Goal.findOne({ _id: id, userId: req.user._id });

        if (!goal) {
            return res.status(404).json({ message: 'Goal not found' });
        }

        goal.currentAmount += parseFloat(amount);

        // Check if goal is completed
        if (goal.currentAmount >= goal.targetAmount) {
            goal.isCompleted = true;
        }

        await goal.save();
        res.json(goal);
    } catch (error) {
        res.status(500).json({ message: 'Error adding to goal', error: error.message });
    }
};
