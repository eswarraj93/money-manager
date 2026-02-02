import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { budgetAPI } from '../services/api';
import { formatCurrency } from '../utils/dateUtils';
import { useToast } from '../context/ToastContext';

const EXPENSE_CATEGORIES = [
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
];

const Budgets = () => {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingBudget, setEditingBudget] = useState(null);
    const [formData, setFormData] = useState({
        category: '',
        amount: '',
        period: 'monthly'
    });
    const { addToast } = useToast();

    useEffect(() => {
        fetchBudgets();
    }, []);

    const fetchBudgets = async () => {
        try {
            setLoading(true);
            const response = await budgetAPI.getAll();
            setBudgets(response.data);
        } catch (error) {
            console.error('Error fetching budgets:', error);
            addToast('Failed to load budgets', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingBudget) {
                await budgetAPI.update(editingBudget._id, formData);
                addToast('Budget updated successfully!', 'success');
            } else {
                await budgetAPI.create(formData);
                addToast('Budget created successfully!', 'success');
            }
            setShowModal(false);
            setFormData({ category: '', amount: '', period: 'monthly' });
            setEditingBudget(null);
            fetchBudgets();
        } catch (error) {
            console.error('Error saving budget:', error);
            addToast(error.response?.data?.message || 'Error saving budget', 'error');
        }
    };

    const handleEdit = (budget) => {
        setEditingBudget(budget);
        setFormData({
            category: budget.category,
            amount: budget.amount,
            period: budget.period
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this budget?')) {
            try {
                await budgetAPI.delete(id);
                fetchBudgets();
                addToast('Budget deleted successfully!', 'success');
            } catch (error) {
                console.error('Error deleting budget:', error);
                addToast('Error deleting budget', 'error');
            }
        }
    };

    const getProgressColor = (percentage) => {
        if (percentage >= 100) return 'bg-danger-500';
        if (percentage >= 80) return 'bg-yellow-500';
        return 'bg-success-500';
    };

    const getAlertLevel = (percentage) => {
        if (percentage >= 100) return { text: 'Over Budget!', color: 'text-danger-600' };
        if (percentage >= 80) return { text: 'Approaching Limit', color: 'text-yellow-600' };
        return { text: 'On Track', color: 'text-success-600' };
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Budget Planning</h2>
                        <p className="text-gray-600 mt-1">Set and track your spending limits</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setShowModal(true)} className="btn-primary">
                            + Add Budget
                        </button>
                        <Link to="/dashboard" className="btn-secondary">
                            ← Back
                        </Link>
                    </div>
                </div>

                {/* Budgets Grid */}
                {budgets.length === 0 ? (
                    <div className="card text-center py-12">
                        <p className="text-gray-500 text-lg">No budgets set yet. Create your first budget!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {budgets.map((budget) => {
                            const alert = getAlertLevel(budget.percentage);
                            return (
                                <div key={budget._id} className="card hover:shadow-lg transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{budget.category}</h3>
                                            <p className="text-sm text-gray-500 capitalize">{budget.period}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(budget)}
                                                className="text-primary-600 hover:text-primary-700"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => handleDelete(budget._id)}
                                                className="text-danger-500 hover:text-danger-600"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Budget:</span>
                                            <span className="font-semibold">{formatCurrency(budget.amount)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Spent:</span>
                                            <span className="font-semibold text-danger-600">{formatCurrency(budget.spent)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Remaining:</span>
                                            <span className={`font-semibold ${budget.remaining >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                                                {formatCurrency(budget.remaining)}
                                            </span>
                                        </div>

                                        {/* Progress Bar */}
                                        <div>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className={alert.color}>{alert.text}</span>
                                                <span className="font-semibold">{budget.percentage}%</span>
                                            </div>
                                            <div className="progress-bar">
                                                <div
                                                    className={`progress-fill animate-progress ${budget.percentage < 70 ? 'success' :
                                                            budget.percentage < 90 ? 'warning' :
                                                                'danger'
                                                        }`}
                                                    style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Budget Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">
                                {editingBudget ? 'Edit Budget' : 'Create Budget'}
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="input-field"
                                        required
                                    >
                                        <option value="">Select category</option>
                                        {EXPENSE_CATEGORIES.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Budget Amount
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        className="input-field"
                                        required
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Period
                                    </label>
                                    <select
                                        value={formData.period}
                                        onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                                        className="input-field"
                                    >
                                        <option value="monthly">Monthly</option>
                                        <option value="yearly">Yearly</option>
                                    </select>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button type="submit" className="btn-primary flex-1">
                                        {editingBudget ? 'Update' : 'Create'} Budget
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            setEditingBudget(null);
                                            setFormData({ category: '', amount: '', period: 'monthly' });
                                        }}
                                        className="btn-secondary flex-1"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Budgets;
