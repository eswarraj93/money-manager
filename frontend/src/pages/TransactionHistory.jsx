import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import FilterPanel from '../components/FilterPanel';
import { transactionAPI } from '../services/api';
import { formatCurrency, formatDateTime, canEditTransaction } from '../utils/dateUtils';
import { useToast } from '../context/ToastContext';

const TransactionHistory = () => {
    const [transactions, setTransactions] = useState([]);
    const [filters, setFilters] = useState({});
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const itemsPerPage = 20;
    const { addToast } = useToast();

    // Fetch transactions
    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const response = await transactionAPI.getAll(filters);
            setTransactions(response.data);
            setCurrentPage(1); // Reset to first page when filters change
        } catch (err) {
            console.error('Error fetching transactions:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [JSON.stringify(filters)]);

    // Export to CSV
    const exportToCSV = () => {
        if (transactions.length === 0) {
            addToast('No transactions to export', 'warning');
            return;
        }

        const headers = ['Date', 'Type', 'Category', 'Division', 'Amount', 'Description'];
        const csvData = transactions.map((t) => [
            new Date(t.date).toLocaleDateString(),
            t.type,
            t.category,
            t.division,
            t.amount,
            t.description || '',
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(',')),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        addToast('Transactions exported successfully!', 'success');
    };

    // Handle delete
    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this transaction?')) {
            return;
        }

        try {
            await transactionAPI.delete(id);
            fetchTransactions();
            addToast('Transaction deleted successfully!', 'success');
        } catch (err) {
            addToast(err.response?.data?.message || 'Failed to delete transaction', 'error');
        }
    };

    // Filter transactions by search query
    const filteredTransactions = transactions.filter(t =>
        t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.type.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTransactions = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Transaction History</h2>
                        <p className="text-gray-600 mt-1">
                            View and manage all your transactions
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={exportToCSV}
                            className="btn-success flex items-center gap-2"
                        >
                            📥 Export CSV
                        </button>
                        <Link to="/dashboard" className="btn-secondary">
                            ← Back to Dashboard
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6">
                    <FilterPanel onFilterChange={setFilters} />
                </div>

                {/* Search Bar */}
                <div className="card mb-6">
                    <div className="relative">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search by category, description, or type..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1); // Reset to first page on search
                            }}
                            className="search-input"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="card mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-600">Total Transactions</p>
                            <p className="text-2xl font-bold text-gray-900">{filteredTransactions.length}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600">Showing</p>
                            <p className="text-lg font-semibold text-gray-900">
                                {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredTransactions.length)} of {filteredTransactions.length}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Transactions Table */}
                {loading ? (
                    <div className="card text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading transactions...</p>
                    </div>
                ) : currentTransactions.length === 0 ? (
                    <div className="card text-center py-12">
                        <div className="text-6xl mb-4">📊</div>
                        <p className="text-gray-600 text-lg">No transactions found</p>
                        <p className="text-gray-500 text-sm mt-2">
                            Try adjusting your filters or add some transactions
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="card overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date & Time
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Division
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Description
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentTransactions.map((transaction) => {
                                        const isEditable = canEditTransaction(transaction.createdAt);

                                        return (
                                            <tr key={transaction._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatDateTime(transaction.date)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${transaction.type === 'income'
                                                            ? 'bg-success-100 text-success-800'
                                                            : 'bg-danger-100 text-danger-800'
                                                            }`}
                                                    >
                                                        {transaction.type === 'income' ? '💰 Income' : '💸 Expense'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {transaction.category}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {transaction.division}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                                                    {transaction.description || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold">
                                                    <span
                                                        className={
                                                            transaction.type === 'income'
                                                                ? 'text-success-600'
                                                                : 'text-danger-600'
                                                        }
                                                    >
                                                        {transaction.type === 'income' ? '+' : '-'}
                                                        {formatCurrency(transaction.amount)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => handleDelete(transaction._id)}
                                                        className="text-danger-600 hover:text-danger-900 ml-3"
                                                    >
                                                        🗑️
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-6">
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    ← Previous
                                </button>

                                <div className="flex gap-2">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`px-4 py-2 rounded-lg ${currentPage === page
                                                ? 'bg-primary-600 text-white'
                                                : 'bg-white border border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default TransactionHistory;
