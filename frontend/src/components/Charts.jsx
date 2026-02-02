import { useState } from 'react';
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

const COLORS = [
    '#0ea5e9',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#ec4899',
    '#14b8a6',
    '#f97316',
];

const Charts = ({ incomeExpenseData, categoryBreakdown, onPeriodChange }) => {
    const [period, setPeriod] = useState('monthly');

    const handlePeriodChange = (newPeriod) => {
        setPeriod(newPeriod);
        onPeriodChange(newPeriod);
    };

    return (
        <div className="space-y-6">
            {/* Period Filter */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
                    <div className="flex space-x-2">
                        {['weekly', 'monthly', 'yearly'].map((p) => (
                            <button
                                key={p}
                                onClick={() => handlePeriodChange(p)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${period === p
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Income vs Expense Chart */}
            <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Income vs Expense
                </h3>
                {incomeExpenseData && incomeExpenseData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={incomeExpenseData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="income" fill="#10b981" name="Income" />
                            <Bar dataKey="expense" fill="#ef4444" name="Expense" />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        No data available for the selected period
                    </div>
                )}
            </div>

            {/* Category Breakdown */}
            <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Expense by Category
                </h3>
                {categoryBreakdown && categoryBreakdown.length > 0 ? (
                    <div className="flex flex-col lg:flex-row items-center justify-center">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={categoryBreakdown}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) =>
                                        `${name}: ${(percent * 100).toFixed(0)}%`
                                    }
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {categoryBreakdown.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        No expense data available
                    </div>
                )}
            </div>
        </div>
    );
};

export default Charts;
