import { Card, Match, Player } from '../models/index.js';

// Crear nueva tarjeta
export const createCard = async (req, res) => {
  try {
    const {
      match,
      player,
      team,
      minute,
      period,
      extraTime,
      type,
      reason,
      description
    } = req.body;
    
    // Verificar que el partido existe y está en vivo
    const matchDoc = await Match.findById(match);
    if (!matchDoc) {
      return res.status(404).json({
        success: false,
        message: 'Partido no encontrado'
      });
    }
    
    if (matchDoc.status !== 'En Vivo') {
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden agregar tarjetas a partidos en vivo'
      });
    }
    
    // Verificar que el jugador existe y pertenece al equipo
    const playerDoc = await Player.findById(player);
    if (!playerDoc) {
      return res.status(404).json({
        success: false,
        message: 'Jugador no encontrado'
      });
    }
    
    if (playerDoc.team.toString() !== team) {
      return res.status(400).json({
        success: false,
        message: 'El jugador no pertenece al equipo especificado'
      });
    }
    
    // Verificar que el equipo participa en el partido
    if (matchDoc.homeTeam.toString() !== team && matchDoc.awayTeam.toString() !== team) {
      return res.status(400).json({
        success: false,
        message: 'El equipo no participa en este partido'
      });
    }
    
    // Verificar si el jugador ya tiene tarjeta roja en este partido
    const existingRedCard = await Card.findOne({
      match,
      player,
      $or: [
        { type: 'Roja' },
        { type: 'Doble Amarilla' }
      ]
    });
    
    if (existingRedCard) {
      return res.status(400).json({
        success: false,
        message: 'El jugador ya fue expulsado en este partido'
      });
    }
    
    // Si es segunda amarilla, cambiar a doble amarilla
    let cardType = type;
    let resultedInEjection = false;
    
    if (type === 'Amarilla') {
      const existingYellowCard = await Card.findOne({
        match,
        player,
        type: 'Amarilla'
      });
      
      if (existingYellowCard) {
        cardType = 'Doble Amarilla';
        resultedInEjection = true;
      }
    } else if (type === 'Roja' || type === 'Doble Amarilla') {
      resultedInEjection = true;
    }
    
    const card = new Card({
      match,
      player,
      team,
      minute,
      period,
      extraTime,
      type: cardType,
      reason,
      description,
      resulted_in_ejection: resultedInEjection
    });
    
    await card.save();
    await card.populate('player team match');
    
    // Actualizar estadísticas del jugador
    if (cardType === 'Amarilla') {
      playerDoc.stats.yellowCards += 1;
    } else if (cardType === 'Roja' || cardType === 'Doble Amarilla') {
      playerDoc.stats.redCards += 1;
    }
    await playerDoc.save();
    
    res.status(201).json({
      success: true,
      message: 'Tarjeta registrada exitosamente',
      data: card
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al registrar tarjeta',
      error: error.message
    });
  }
};

// Obtener tarjetas de un partido
export const getCardsByMatch = async (req, res) => {
  try {
    const { matchId } = req.params;
    
    const cards = await Card.find({ match: matchId })
      .populate('player team')
      .sort({ minute: 1, extraTime: 1 });
    
    res.json({
      success: true,
      data: cards
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener tarjetas del partido',
      error: error.message
    });
  }
};

// Obtener tarjetas de un jugador
export const getCardsByPlayer = async (req, res) => {
  try {
    const { playerId } = req.params;
    const { season, type } = req.query;
    
    let query = { player: playerId };
    
    if (type) query.type = type;
    
    // Si se especifica temporada, filtrar por fechas
    if (season) {
      const startDate = new Date(`${season}-01-01`);
      const endDate = new Date(`${season}-12-31`);
      
      // Obtener partidos de la temporada
      const matches = await Match.find({
        date: { $gte: startDate, $lte: endDate }
      }).select('_id');
      
      query.match = { $in: matches.map(m => m._id) };
    }
    
    const cards = await Card.find(query)
      .populate('match team')
      .sort({ 'match.date': -1, minute: 1 });
    
    res.json({
      success: true,
      data: cards
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener tarjetas del jugador',
      error: error.message
    });
  }
};

// Actualizar tarjeta
export const updateCard = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const card = await Card.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('player team match');
    
    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Tarjeta no encontrada'
      });
    }
    
    res.json({
      success: true,
      message: 'Tarjeta actualizada exitosamente',
      data: card
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al actualizar tarjeta',
      error: error.message
    });
  }
};

// Eliminar tarjeta
export const deleteCard = async (req, res) => {
  try {
    const { id } = req.params;
    
    const card = await Card.findById(id).populate('player');
    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Tarjeta no encontrada'
      });
    }
    
    // Actualizar estadísticas del jugador
    const player = card.player;
    if (card.type === 'Amarilla') {
      player.stats.yellowCards = Math.max(0, player.stats.yellowCards - 1);
    } else if (card.type === 'Roja' || card.type === 'Doble Amarilla') {
      player.stats.redCards = Math.max(0, player.stats.redCards - 1);
    }
    await player.save();
    
    await Card.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Tarjeta eliminada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar tarjeta',
      error: error.message
    });
  }
};
