import express from 'express';
import {
  getAllPlayers,
  getPlayerById,
  getPlayersByTeam,
  createPlayer,
  updatePlayer,
  deletePlayer,
  getPlayerStats
} from '../controllers/playerController.js';

const router = express.Router();

// Rutas para jugadores
router.get('/', getAllPlayers);                    // GET /api/players
router.get('/:id', getPlayerById);                 // GET /api/players/:id
router.get('/:id/stats', getPlayerStats);          // GET /api/players/:id/stats
router.get('/team/:teamId', getPlayersByTeam);     // GET /api/players/team/:teamId
router.post('/', createPlayer);                    // POST /api/players
router.put('/:id', updatePlayer);                  // PUT /api/players/:id
router.delete('/:id', deletePlayer);               // DELETE /api/players/:id

export default router;
