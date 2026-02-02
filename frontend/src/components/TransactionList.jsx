import { formatCurrency, formatDateTime, canEditTransaction } from '../utils/dateUtils';

const TransactionList = ({ transactions, onEdit, onDelete }) => {
    if (transactions.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-gray-600 text-lg">No transactions yet</p>
                <p className="text-gray-500 text-sm mt-2">
                    Click "Add Transaction" to get started
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {transactions.map((transaction) => {
                const isEditable = canEditTransaction(transaction.createdAt);

                return (
                    <div
                        key={transaction._id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                            <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0 ${transaction.type === 'income'
                                        ? 'bg-success-100'
                                        : 'bg-danger-100'
                                    }`}
                            >
                                {transaction.type === 'income' ? '💰' : '💸'}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 flex-wrap">
                                    <h4 className="font-semibold text-gray-900">
                                        {transaction.category}
                                    </h4>
                                    <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded">
                                        {transaction.division}
                                    </span>
                                </div>
                                {transaction.description && (
                                    <p className="text-sm text-gray-600 mt-1 truncate">
                                        {transaction.description}
                                    </p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                    {formatDateTime(transaction.date)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0 ml-2">
                            <div className="text-right">
                                <p
                                    className={`text-base sm:text-lg font-bold ${transaction.type === 'income'
                                            ? 'text-success-600'
                                            : 'text-danger-600'
                                        }`}
                                >
                                    {transaction.type === 'income' ? '+' : '-'}
                                    {formatCurrency(transaction.amount)}
                                </p>
                            </div>

                            <div className="flex space-x-1 sm:space-x-2">
                                {isEditable && (
                                    <button
                                        onClick={() => onEdit(transaction)}
                                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                        title="Edit transaction"
                                    >
                                        ✏️
                                    </button>
                                )}
                                <button
                                    onClick={() => onDelete(transaction._id)}
                                    className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                                    title="Delete transaction"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default TransactionList;
