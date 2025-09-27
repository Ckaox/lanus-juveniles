import express from 'express';
import {
  createCard,
  getCardsByMatch,
  getCardsByPlayer,
  updateCard,
  deleteCard
} from '../controllers/cardController.js';

const router = express.Router();

// Rutas para tarjetas
router.post('/', createCard);                           // POST /api/cards
router.get('/match/:matchId', getCardsByMatch);         // GET /api/cards/match/:matchId
router.get('/player/:playerId', getCardsByPlayer);      // GET /api/cards/player/:playerId
router.put('/:id', updateCard);                         // PUT /api/cards/:id
router.delete('/:id', deleteCard);                      // DELETE /api/cards/:id

export default router;
