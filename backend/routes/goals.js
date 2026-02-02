import express from 'express';
import auth from '../middleware/auth.js';
import * as goalController from '../controllers/goalController.js';

const router = express.Router();

router.get('/', auth, goalController.getGoals);
router.post('/', auth, goalController.createGoal);
router.put('/:id', auth, goalController.updateGoal);
router.delete('/:id', auth, goalController.deleteGoal);
router.post('/:id/add', auth, goalController.addToGoal);

export default router;
