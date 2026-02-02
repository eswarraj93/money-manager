import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { transactionAPI } from '../services/api';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency } from '../utils/dateUtils';
import { useToast } from '../context/ToastContext';

const COLORS = ['#0284c7', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

const Reports = () => {
    const [period, setPeriod] = useState('monthly');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [reportData, setReportData] = useState({
        monthlyComparison: [],
        categoryTrends: [],
        topCategories: [],
        incomeSources: [],
        summary: { totalIncome: 0, totalExpense: 0, netSavings: 0 }
    });
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    useEffect(() => {
        fetchReportData();
    }, [period, dateRange]);

    const fetchReportData = async () => {
        try {
            setLoading(true);
            const filters = {};
            if (dateRange.start) filters.startDate = dateRange.start;
            if (dateRange.end) filters.endDate = dateRange.end;

            const response = await transactionAPI.getAll(filters);
            const transactions = response.data;

            // Calculate summary
            const summary = transactions.reduce((acc, t) => {
                if (t.type === 'income') acc.totalIncome += t.amount;
                else acc.totalExpense += t.amount;
                return acc;
            }, { totalIncome: 0, totalExpense: 0, netSavings: 0 });
            summary.netSavings = summary.totalIncome - summary.totalExpense;

            // Monthly comparison (last 6 months)
            const monthlyData = getMonthlyComparison(transactions);

            // Category trends
            const categoryData = getCategoryBreakdown(transactions);

            // Top spending categories
            const topCategories = getTopCategories(transactions);

            // Income sources
            const incomeSources = getIncomeSources(transactions);

            setReportData({
                monthlyComparison: monthlyData,
                categoryTrends: categoryData,
                topCategories,
                incomeSources,
                summary
            });
        } catch (err) {
            console.error('Error fetching report data:', err);
        } finally {
            setLoading(false);
        }
    };

    const getMonthlyComparison = (transactions) => {
        const monthlyMap = {};
        const now = new Date();

        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthlyMap[key] = { month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), income: 0, expense: 0 };
        }

        transactions.forEach(t => {
            const date = new Date(t.date);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (monthlyMap[key]) {
                if (t.type === 'income') monthlyMap[key].income += t.amount;
                else monthlyMap[key].expense += t.amount;
            }
        });

        return Object.values(monthlyMap);
    };

    const getCategoryBreakdown = (transactions) => {
        const categoryMap = {};
        transactions.forEach(t => {
            if (!categoryMap[t.category]) {
                categoryMap[t.category] = { name: t.category, value: 0, count: 0 };
            }
            categoryMap[t.category].value += t.amount;
            categoryMap[t.category].count += 1;
        });
        return Object.values(categoryMap).sort((a, b) => b.value - a.value);
    };

    const getTopCategories = (transactions) => {
        const expenseMap = {};
        transactions.filter(t => t.type === 'expense').forEach(t => {
            if (!expenseMap[t.category]) expenseMap[t.category] = 0;
            expenseMap[t.category] += t.amount;
        });
        return Object.entries(expenseMap)
            .map(([category, amount]) => ({ category, amount }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);
    };

    const getIncomeSources = (transactions) => {
        const incomeMap = {};
        transactions.filter(t => t.type === 'income').forEach(t => {
            if (!incomeMap[t.category]) incomeMap[t.category] = 0;
            incomeMap[t.category] += t.amount;
        });
        return Object.entries(incomeMap).map(([category, amount]) => ({ name: category, value: amount }));
    };

    const exportToCSV = () => {
        try {
            let csvContent = "Financial Report\n";
            csvContent += `Generated: ${new Date().toLocaleDateString()}\n\n`;

            if (dateRange.start && dateRange.end) {
                csvContent += `Period: ${new Date(dateRange.start).toLocaleDateString()} - ${new Date(dateRange.end).toLocaleDateString()}\n\n`;
            }

            // Summary Section
            csvContent += "SUMMARY\n";
            csvContent += "Metric,Amount\n";
            csvContent += `Total Income,${formatCurrency(reportData.summary.totalIncome)}\n`;
            csvContent += `Total Expense,${formatCurrency(reportData.summary.totalExpense)}\n`;
            csvContent += `Net Savings,${formatCurrency(reportData.summary.netSavings)}\n\n`;

            // Monthly Comparison
            if (reportData.monthlyComparison.length > 0) {
                csvContent += "MONTHLY INCOME VS EXPENSE\n";
                csvContent += "Month,Income,Expense,Net\n";
                reportData.monthlyComparison.forEach(m => {
                    csvContent += `${m.month},${formatCurrency(m.income)},${formatCurrency(m.expense)},${formatCurrency(m.income - m.expense)}\n`;
                });
                csvContent += "\n";
            }

            // Top Spending Categories
            if (reportData.topCategories.length > 0) {
                csvContent += "TOP 5 SPENDING CATEGORIES\n";
                csvContent += "#,Category,Amount,% of Total\n";
                reportData.topCategories.forEach((cat, index) => {
                    const percentage = reportData.summary.totalExpense > 0
                        ? ((cat.amount / reportData.summary.totalExpense) * 100).toFixed(1)
                        : '0';
                    csvContent += `${index + 1},${cat.category},${formatCurrency(cat.amount)},${percentage}%\n`;
                });
                csvContent += "\n";
            }

            // Income Sources
            if (reportData.incomeSources.length > 0) {
                csvContent += "INCOME SOURCES\n";
                csvContent += "#,Source,Amount,% of Total\n";
                reportData.incomeSources.forEach((source, index) => {
                    const percentage = reportData.summary.totalIncome > 0
                        ? ((source.value / reportData.summary.totalIncome) * 100).toFixed(1)
                        : '0';
                    csvContent += `${index + 1},${source.name},${formatCurrency(source.value)},${percentage}%\n`;
                });
            }

            // Create and download CSV file
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `financial-report-${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error generating CSV:', error);
            addToast('Failed to generate CSV. Please try again.', 'error');
        }
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
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Financial Reports</h2>
                        <p className="text-gray-600 mt-1">Detailed insights and trends</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={exportToCSV} className="btn-success">
                            📊 Export CSV
                        </button>
                        <Link to="/dashboard" className="btn-secondary">
                            ← Back
                        </Link>
                    </div>
                </div>

                {/* Date Range Filter */}
                <div className="card mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Date Range</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                className="input-field"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={() => setDateRange({ start: '', end: '' })}
                                className="btn-secondary w-full"
                            >
                                Clear Filter
                            </button>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="card bg-gradient-to-br from-success-500 to-success-600 text-white">
                        <h3 className="text-sm font-medium opacity-90">Total Income</h3>
                        <p className="text-3xl font-bold mt-2">{formatCurrency(reportData.summary.totalIncome)}</p>
                    </div>
                    <div className="card bg-gradient-to-br from-danger-500 to-danger-600 text-white">
                        <h3 className="text-sm font-medium opacity-90">Total Expense</h3>
                        <p className="text-3xl font-bold mt-2">{formatCurrency(reportData.summary.totalExpense)}</p>
                    </div>
                    <div className={`card bg-gradient-to-br ${reportData.summary.netSavings >= 0 ? 'from-primary-500 to-primary-600' : 'from-gray-500 to-gray-600'} text-white`}>
                        <h3 className="text-sm font-medium opacity-90">Net Savings</h3>
                        <p className="text-3xl font-bold mt-2">{formatCurrency(reportData.summary.netSavings)}</p>
                    </div>
                </div>

                {/* Monthly Comparison Chart */}
                <div className="card mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Income vs Expense</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={reportData.monthlyComparison}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={(value) => formatCurrency(value)} />
                            <Legend />
                            <Bar dataKey="income" fill="#10b981" name="Income" />
                            <Bar dataKey="expense" fill="#ef4444" name="Expense" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Category Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div className="card">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Distribution</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={reportData.categoryTrends}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={(entry) => entry.name}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {reportData.categoryTrends.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="card">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Spending Categories</h3>
                        <div className="space-y-4">
                            {reportData.topCategories.map((cat, index) => (
                                <div key={index}>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm font-medium text-gray-700">{cat.category}</span>
                                        <span className="text-sm font-semibold text-gray-900">{formatCurrency(cat.amount)}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-danger-500 h-2 rounded-full"
                                            style={{ width: `${(cat.amount / reportData.summary.totalExpense) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Income Sources */}
                {reportData.incomeSources.length > 0 && (
                    <div className="card">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Income Sources</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={reportData.incomeSources}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {reportData.incomeSources.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reports;
