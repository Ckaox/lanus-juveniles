import express from 'express';
import {
  createGoal,
  getGoalsByMatch,
  getGoalsByPlayer,
  updateGoal,
  deleteGoal
} from '../controllers/goalController.js';

const router = express.Router();

// Rutas para goles
router.post('/', createGoal);                           // POST /api/goals
router.get('/match/:matchId', getGoalsByMatch);         // GET /api/goals/match/:matchId
router.get('/player/:playerId', getGoalsByPlayer);      // GET /api/goals/player/:playerId
router.put('/:id', updateGoal);                         // PUT /api/goals/:id
router.delete('/:id', deleteGoal);                      // DELETE /api/goals/:id

export default router;
