import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StatsCard from '../components/StatsCard';
import TransactionModal from '../components/TransactionModal';
import TransactionList from '../components/TransactionList';
import FilterPanel from '../components/FilterPanel';
import Charts from '../components/Charts';
import { transactionAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
    });
    const [transactions, setTransactions] = useState([]);
    const [analytics, setAnalytics] = useState({
        incomeExpenseData: [],
        categoryBreakdown: [],
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const { addToast } = useToast();
    const [filters, setFilters] = useState({});
    const [period, setPeriod] = useState('monthly');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch stats
    const fetchStats = async () => {
        try {
            const response = await transactionAPI.getStats();
            setStats(response.data);
        } catch (err) {
            console.error('Error fetching stats:', err);
            addToast('Failed to load stats', 'error');
        }
    };

    // Fetch transactions
    const fetchTransactions = async (currentFilters) => {
        try {
            const response = await transactionAPI.getAll(currentFilters);
            setTransactions(response.data);
        } catch (err) {
            console.error('Error fetching transactions:', err);
            setError('Failed to load transactions');
            addToast('Failed to load transactions', 'error');
        }
    };

    // Fetch analytics
    const fetchAnalytics = async (currentPeriod) => {
        try {
            const response = await transactionAPI.getAnalytics({ period: currentPeriod });
            setAnalytics(response.data);
        } catch (err) {
            console.error('Error fetching analytics:', err);
            addToast('Failed to load analytics', 'error');
        }
    };

    // Combined data fetch for dashboard refresh
    const fetchDashboardData = async () => {
        await Promise.all([
            fetchStats(),
            fetchTransactions(filters), // Pass current filters
            fetchAnalytics(period)      // Pass current period
        ]);
    };

    // Initial load
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await fetchDashboardData();
            setLoading(false);
        };
        loadData();
    }, []);

    // Reload when filters change (including initial empty filters)
    useEffect(() => {
        const loadFilteredTransactions = async () => {
            try {
                const response = await transactionAPI.getAll(filters);
                setTransactions(response.data);
            } catch (err) {
                console.error('Error fetching transactions:', err);
                setError('Failed to load transactions');
                addToast('Failed to load transactions', 'error');
            }
        };
        loadFilteredTransactions();
    }, [JSON.stringify(filters)]);

    // Reload analytics when period changes
    useEffect(() => {
        fetchAnalytics(period);
    }, [period]);

    // Handle add/edit transaction
    const handleTransactionSubmit = async (formData) => {
        try {
            if (editingTransaction) {
                await transactionAPI.update(editingTransaction._id, formData);
            } else {
                await transactionAPI.create(formData);
            }

            setIsModalOpen(false);
            setEditingTransaction(null);

            fetchDashboardData();
            addToast(`Transaction ${editingTransaction ? 'updated' : 'added'} successfully!`, 'success');
        } catch (err) {
            addToast(err.response?.data?.message || 'Failed to save transaction', 'error');
        }
    };

    // Handle delete transaction
    const handleDeleteTransaction = async (id) => {
        if (!confirm('Are you sure you want to delete this transaction?')) {
            return;
        }

        try {
            await transactionAPI.delete(id);
            fetchDashboardData();
            addToast('Transaction deleted successfully!', 'success');
        } catch (err) {
            addToast(err.response?.data?.message || 'Failed to delete transaction', 'error');
        }
    };

    // Handle edit transaction
    const handleEditTransaction = (transaction) => {
        setEditingTransaction(transaction);
        setIsModalOpen(true);
    };

    // Handle add new transaction
    const handleAddTransaction = () => {
        setEditingTransaction(null);
        setIsModalOpen(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
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
                        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
                        <p className="text-gray-600 mt-1">
                            Track and manage your finances
                        </p>
                    </div>
                    <button onClick={handleAddTransaction} className="btn-primary">
                        + Add Transaction
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatsCard
                        title="Total Income"
                        amount={stats.totalIncome}
                        icon="💰"
                        type="income"
                    />
                    <StatsCard
                        title="Total Expense"
                        amount={stats.totalExpense}
                        icon="💸"
                        type="expense"
                    />
                    <StatsCard
                        title="Current Balance"
                        amount={stats.balance}
                        icon="💵"
                        type="balance"
                    />
                </div>

                {/* Filters */}
                <div className="mb-8">
                    <FilterPanel onFilterChange={setFilters} />
                </div>

                {/* Charts */}
                <div className="mb-8">
                    <Charts
                        incomeExpenseData={analytics.incomeExpenseData}
                        categoryBreakdown={analytics.categoryBreakdown}
                        onPeriodChange={setPeriod}
                    />
                </div>

                {/* Transactions List */}
                <div className="card">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Recent Transactions
                        </h3>
                        <Link to="/history" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                            View All →
                        </Link>
                    </div>
                    <TransactionList
                        transactions={transactions.slice(0, 10)}
                        onEdit={handleEditTransaction}
                        onDelete={handleDeleteTransaction}
                    />
                </div>
            </div>

            {/* Transaction Modal */}
            <TransactionModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingTransaction(null);
                }}
                onSubmit={handleTransactionSubmit}
                transaction={editingTransaction}
                isEdit={!!editingTransaction}
            />
        </div>
    );
};

export default Dashboard;
