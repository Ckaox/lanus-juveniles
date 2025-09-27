import express from 'express';
import {
  getAllMatches,
  getMatchById,
  getLiveMatches,
  createMatch,
  updateMatch,
  startMatch,
  finishMatch,
  updateMatchTime,
  getMatchEvents
} from '../controllers/matchController.js';

const router = express.Router();

// Rutas para partidos
router.get('/', getAllMatches);                    // GET /api/matches
router.get('/live', getLiveMatches);               // GET /api/matches/live
router.get('/:id', getMatchById);                  // GET /api/matches/:id
router.get('/:id/events', getMatchEvents);         // GET /api/matches/:id/events
router.post('/', createMatch);                     // POST /api/matches
router.put('/:id', updateMatch);                   // PUT /api/matches/:id
router.patch('/:id/start', startMatch);            // PATCH /api/matches/:id/start
router.patch('/:id/finish', finishMatch);          // PATCH /api/matches/:id/finish
router.patch('/:id/time', updateMatchTime);        // PATCH /api/matches/:id/time

export default router;
