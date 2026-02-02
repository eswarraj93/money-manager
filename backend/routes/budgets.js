import express from 'express';
import auth from '../middleware/auth.js';
import * as budgetController from '../controllers/budgetController.js';

const router = express.Router();

router.get('/', auth, budgetController.getBudgets);
router.post('/', auth, budgetController.createBudget);
router.put('/:id', auth, budgetController.updateBudget);
router.delete('/:id', auth, budgetController.deleteBudget);

export default router;
