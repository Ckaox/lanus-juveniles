import express from 'express';
import playerRoutes from './playerRoutes.js';
import teamRoutes from './teamRoutes.js';
import matchRoutes from './matchRoutes.js';
import goalRoutes from './goalRoutes.js';
import cardRoutes from './cardRoutes.js';

const router = express.Router();

// Configurar todas las rutas
router.use('/players', playerRoutes);
router.use('/teams', teamRoutes);
router.use('/matches', matchRoutes);
router.use('/goals', goalRoutes);
router.use('/cards', cardRoutes);

// Ruta de estado de la API
router.get('/status', (req, res) => {
  res.json({
    success: true,
    message: 'API Lanús Juveniles funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

export default router;
