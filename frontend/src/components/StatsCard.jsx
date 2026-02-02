import { formatCurrency } from '../utils/dateUtils';

const StatsCard = ({ title, amount, icon, type }) => {
    const getColorClasses = () => {
        switch (type) {
            case 'income':
                return 'bg-success-50 text-success-600 border-success-200';
            case 'expense':
                return 'bg-danger-50 text-danger-600 border-danger-200';
            case 'balance':
                return amount >= 0
                    ? 'bg-primary-50 text-primary-600 border-primary-200'
                    : 'bg-danger-50 text-danger-600 border-danger-200';
            default:
                return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };

    return (
        <div className="card hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(amount)}
                    </p>
                </div>
                <div className={`p-4 rounded-full border-2 ${getColorClasses()}`}>
                    <span className="text-2xl">{icon}</span>
                </div>
            </div>
        </div>
    );
};

export default StatsCard;
