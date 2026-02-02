import { useState } from 'react';
import { getDateInputValue } from '../utils/dateUtils';

const CATEGORIES = [
    'All',
    'Salary',
    'Freelance',
    'Investment',
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
    'Other Income',
    'Other Expense',
];

const FilterPanel = ({ onFilterChange }) => {
    const [filters, setFilters] = useState({
        category: '',
        division: '',
        startDate: '',
        endDate: '',
        type: '',
    });

    const handleChange = (name, value) => {
        const newFilters = { ...filters, [name]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleReset = () => {
        const resetFilters = {
            category: '',
            division: '',
            startDate: '',
            endDate: '',
            type: '',
        };
        setFilters(resetFilters);
        onFilterChange(resetFilters);
    };

    return (
        <div className="card">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <button
                    onClick={handleReset}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                    Reset All
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Type Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type
                    </label>
                    <select
                        value={filters.type}
                        onChange={(e) => handleChange('type', e.target.value)}
                        className="input-field text-sm"
                    >
                        <option value="">All Types</option>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                    </select>
                </div>

                {/* Category Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                    </label>
                    <select
                        value={filters.category}
                        onChange={(e) => handleChange('category', e.target.value)}
                        className="input-field text-sm"
                    >
                        <option value="">All Categories</option>
                        {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Division Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Division
                    </label>
                    <select
                        value={filters.division}
                        onChange={(e) => handleChange('division', e.target.value)}
                        className="input-field text-sm"
                    >
                        <option value="">All Divisions</option>
                        <option value="Personal">Personal</option>
                        <option value="Office">Office</option>
                    </select>
                </div>

                {/* Start Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        From Date
                    </label>
                    <input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => handleChange('startDate', e.target.value)}
                        className="input-field text-sm"
                    />
                </div>

                {/* End Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        To Date
                    </label>
                    <input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => handleChange('endDate', e.target.value)}
                        className="input-field text-sm"
                    />
                </div>
            </div>
        </div>
    );
};

export default FilterPanel;
