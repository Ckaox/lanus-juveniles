import express from 'express';
import {
  getAllTeams,
  getTeamById,
  getTeamsByCategory,
  createTeam,
  updateTeam,
  deleteTeam,
  getTeamStats,
  getTeamRoster,
  getStandingsByCategory
} from '../controllers/teamController.js';

const router = express.Router();

// Rutas para equipos
router.get('/', getAllTeams);                           // GET /api/teams
router.get('/:id', getTeamById);                        // GET /api/teams/:id
router.get('/:id/stats', getTeamStats);                 // GET /api/teams/:id/stats
router.get('/:id/roster', getTeamRoster);               // GET /api/teams/:id/roster
router.get('/category/:category', getTeamsByCategory);  // GET /api/teams/category/:category
router.get('/category/:category/standings', getStandingsByCategory); // GET /api/teams/category/:category/standings
router.post('/', createTeam);                           // POST /api/teams
router.put('/:id', updateTeam);                         // PUT /api/teams/:id
router.delete('/:id', deleteTeam);                      // DELETE /api/teams/:id

export default router;
