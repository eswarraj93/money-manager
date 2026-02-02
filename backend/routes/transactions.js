import express from 'express';
import {
    createTransaction,
    getTransactions,
    updateTransaction,
    deleteTransaction,
    getStats,
    getAnalytics,
} from '../controllers/transactionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/').get(getTransactions).post(createTransaction);
router.route('/stats').get(getStats);
router.route('/analytics').get(getAnalytics);
router.route('/:id').put(updateTransaction).delete(deleteTransaction);

export default router;
