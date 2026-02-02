import { useState, useEffect } from 'react';
import { getDateInputValue } from '../utils/dateUtils';

const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Other Income'];
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

const TransactionModal = ({ isOpen, onClose, onSubmit, transaction, isEdit }) => {
    const [formData, setFormData] = useState({
        type: 'expense',
        amount: '',
        category: '',
        division: 'Personal',
        description: '',
        date: getDateInputValue(new Date()),
    });

    useEffect(() => {
        if (transaction) {
            setFormData({
                type: transaction.type,
                amount: transaction.amount,
                category: transaction.category,
                division: transaction.division,
                description: transaction.description || '',
                date: getDateInputValue(transaction.date),
            });
        } else {
            setFormData({
                type: 'expense',
                amount: '',
                category: '',
                division: 'Personal',
                description: '',
                date: getDateInputValue(new Date()),
            });
        }
    }, [transaction, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
            // Reset category when type changes
            ...(name === 'type' && { category: '' }),
        }));
    };

    if (!isOpen) return null;

    const categories =
        formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {isEdit ? 'Edit Transaction' : 'Add Transaction'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 text-2xl"
                        >
                            ×
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Type *
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setFormData((prev) => ({ ...prev, type: 'income', category: '' }))
                                    }
                                    className={`py-3 px-4 rounded-lg font-medium transition-colors ${formData.type === 'income'
                                            ? 'bg-success-500 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    💰 Income
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setFormData((prev) => ({ ...prev, type: 'expense', category: '' }))
                                    }
                                    className={`py-3 px-4 rounded-lg font-medium transition-colors ${formData.type === 'expense'
                                            ? 'bg-danger-500 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    💸 Expense
                                </button>
                            </div>
                        </div>

                        {/* Amount */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Amount *
                            </label>
                            <input
                                type="number"
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                required
                                min="0"
                                step="0.01"
                                className="input-field"
                                placeholder="Enter amount"
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Category *
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                                className="input-field"
                            >
                                <option value="">Select category</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Division */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Division *
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setFormData((prev) => ({ ...prev, division: 'Personal' }))
                                    }
                                    className={`py-2 px-4 rounded-lg font-medium transition-colors ${formData.division === 'Personal'
                                            ? 'bg-primary-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    Personal
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setFormData((prev) => ({ ...prev, division: 'Office' }))
                                    }
                                    className={`py-2 px-4 rounded-lg font-medium transition-colors ${formData.division === 'Office'
                                            ? 'bg-primary-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    Office
                                </button>
                            </div>
                        </div>

                        {/* Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date *
                            </label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                required
                                className="input-field"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                                maxLength="200"
                                className="input-field"
                                placeholder="Add a note (optional)"
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end space-x-3 pt-4">
                            <button type="button" onClick={onClose} className="btn-secondary">
                                Cancel
                            </button>
                            <button type="submit" className="btn-primary">
                                {isEdit ? 'Update' : 'Add'} Transaction
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TransactionModal;
