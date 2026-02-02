import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { goalAPI } from '../services/api';
import { formatCurrency } from '../utils/dateUtils';
import { useToast } from '../context/ToastContext';

const Goals = () => {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState(null);
    const { addToast } = useToast();
    const [editingGoal, setEditingGoal] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        targetAmount: '',
        currentAmount: '',
        deadline: ''
    });
    const [addAmount, setAddAmount] = useState('');

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        try {
            setLoading(true);
            const response = await goalAPI.getAll();
            setGoals(response.data);
        } catch (err) {
            console.error('Error fetching goals:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingGoal) {
                await goalAPI.update(editingGoal._id, formData);
            } else {
                await goalAPI.create(formData);
            }
            fetchGoals();
            setShowModal(false);
            setFormData({ name: '', targetAmount: '', currentAmount: 0, deadline: '' });
            setEditingGoal(null);
            addToast(`Goal ${editingGoal ? 'updated' : 'created'} successfully!`, 'success');
        } catch (err) {
            addToast(err.response?.data?.message || 'Error saving goal', 'error');
        }
    };

    const handleAddToGoal = async (e) => {
        e.preventDefault();
        try {
            await goalAPI.addToGoal(selectedGoal, parseFloat(addAmount));
            fetchGoals();
            setShowAddModal(false);
            setAddAmount('');
            setSelectedGoal(null);
            addToast('Amount added to goal successfully!', 'success');
        } catch (err) {
            addToast('Error adding to goal', 'error');
        }
    };

    const handleEdit = (goal) => {
        setEditingGoal(goal);
        setFormData({
            name: goal.name,
            targetAmount: goal.targetAmount,
            currentAmount: goal.currentAmount,
            deadline: goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this goal?')) {
            try {
                await goalAPI.delete(id);
                fetchGoals();
                addToast('Goal deleted successfully!', 'success');
            } catch (err) {
                addToast('Error deleting goal', 'error');
            }
        }
    };

    const getProgressColor = (progress) => {
        if (progress >= 100) return 'bg-success-500';
        if (progress >= 75) return 'bg-primary-500';
        if (progress >= 50) return 'bg-yellow-500';
        return 'bg-gray-400';
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
                        <h2 className="text-3xl font-bold text-gray-900">Financial Goals</h2>
                        <p className="text-gray-600 mt-1">Track your savings goals</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setShowModal(true)} className="btn-primary">
                            + Add Goal
                        </button>
                        <Link to="/dashboard" className="btn-secondary">
                            ← Back
                        </Link>
                    </div>
                </div>

                {/* Goals Grid */}
                {goals.length === 0 ? (
                    <div className="card text-center py-12">
                        <p className="text-gray-500 text-lg">No goals set yet. Create your first goal!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {goals.map((goal) => (
                            <div key={goal._id} className={`card hover:shadow-lg transition-shadow ${goal.isCompleted ? 'border-2 border-success-500' : ''}`}>
                                {goal.isCompleted && (
                                    <div className="mb-2 text-center">
                                        <span className="inline-block px-3 py-1 bg-success-500 text-white text-sm font-semibold rounded-full">
                                            🎉 Completed!
                                        </span>
                                    </div>
                                )}

                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">{goal.name}</h3>
                                        {goal.deadline && (
                                            <p className="text-sm text-gray-500">
                                                Due: {new Date(goal.deadline).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(goal)}
                                            className="text-primary-600 hover:text-primary-700"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => handleDelete(goal._id)}
                                            className="text-danger-500 hover:text-danger-600"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Target:</span>
                                        <span className="font-semibold">{formatCurrency(goal.targetAmount)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Saved:</span>
                                        <span className="font-semibold text-success-600">{formatCurrency(goal.currentAmount)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Remaining:</span>
                                        <span className="font-semibold text-gray-900">{formatCurrency(goal.remaining)}</span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-gray-600">Progress</span>
                                            <span className="font-semibold">{goal.progress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div
                                                className={`${getProgressColor(goal.progress)} h-3 rounded-full transition-all`}
                                                style={{ width: `${Math.min(goal.progress, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {!goal.isCompleted && (
                                        <button
                                            onClick={() => {
                                                setSelectedGoal(goal);
                                                setShowAddModal(true);
                                            }}
                                            className="btn-success w-full mt-2"
                                        >
                                            + Add Money
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Goal Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">
                                {editingGoal ? 'Edit Goal' : 'Create Goal'}
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Goal Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="input-field"
                                        required
                                        placeholder="e.g., Emergency Fund, Vacation"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Target Amount
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.targetAmount}
                                        onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                                        className="input-field"
                                        required
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Current Amount
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.currentAmount}
                                        onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                                        className="input-field"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Deadline (Optional)
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.deadline}
                                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                        className="input-field"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button type="submit" className="btn-primary flex-1">
                                        {editingGoal ? 'Update' : 'Create'} Goal
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            setEditingGoal(null);
                                            setFormData({ name: '', targetAmount: '', currentAmount: '', deadline: '' });
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

            {/* Add Money Modal */}
            {showAddModal && selectedGoal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">
                                Add Money to {selectedGoal.name}
                            </h3>
                            <form onSubmit={handleAddToGoal} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Amount to Add
                                    </label>
                                    <input
                                        type="number"
                                        value={addAmount}
                                        onChange={(e) => setAddAmount(e.target.value)}
                                        className="input-field"
                                        required
                                        min="0.01"
                                        step="0.01"
                                        placeholder="0.00"
                                        autoFocus
                                    />
                                </div>

                                <div className="bg-gray-50 p-3 rounded-lg text-sm">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-gray-600">Current:</span>
                                        <span className="font-semibold">{formatCurrency(selectedGoal.currentAmount)}</span>
                                    </div>
                                    {addAmount && (
                                        <div className="flex justify-between text-success-600">
                                            <span>New Total:</span>
                                            <span className="font-semibold">
                                                {formatCurrency(selectedGoal.currentAmount + parseFloat(addAmount || 0))}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button type="submit" className="btn-success flex-1">
                                        Add Money
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAddModal(false);
                                            setAddAmount('');
                                            setSelectedGoal(null);
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

export default Goals;
