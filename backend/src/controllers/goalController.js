import { Goal, Match, Player, Team } from '../models/index.js';

// Crear nuevo gol
export const createGoal = async (req, res) => {
  try {
    const {
      match,
      player,
      team,
      minute,
      period,
      extraTime,
      type,
      assistedBy,
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
        message: 'Solo se pueden agregar goles a partidos en vivo'
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
    
    const goal = new Goal({
      match,
      player,
      team,
      minute,
      period,
      extraTime,
      type,
      assistedBy,
      description
    });
    
    await goal.save();
    await goal.populate('player team match');
    
    // Actualizar el marcador del partido
    if (matchDoc.homeTeam.toString() === team) {
      matchDoc.score.home += 1;
    } else {
      matchDoc.score.away += 1;
    }
    await matchDoc.save();
    
    // Actualizar estadísticas del jugador
    playerDoc.stats.goals += 1;
    await playerDoc.save();
    
    // Si hay asistencia, actualizar estadísticas del asistente
    if (assistedBy) {
      const assistPlayer = await Player.findById(assistedBy);
      if (assistPlayer) {
        assistPlayer.stats.assists += 1;
        await assistPlayer.save();
      }
    }
    
    res.status(201).json({
      success: true,
      message: 'Gol registrado exitosamente',
      data: goal
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al registrar gol',
      error: error.message
    });
  }
};

// Obtener goles de un partido
export const getGoalsByMatch = async (req, res) => {
  try {
    const { matchId } = req.params;
    
    const goals = await Goal.find({ match: matchId })
      .populate('player team assistedBy')
      .sort({ minute: 1, extraTime: 1 });
    
    res.json({
      success: true,
      data: goals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener goles del partido',
      error: error.message
    });
  }
};

// Obtener goles de un jugador
export const getGoalsByPlayer = async (req, res) => {
  try {
    const { playerId } = req.params;
    const { season } = req.query;
    
    let query = { player: playerId };
    
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
    
    const goals = await Goal.find(query)
      .populate('match team assistedBy')
      .sort({ 'match.date': -1, minute: 1 });
    
    res.json({
      success: true,
      data: goals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener goles del jugador',
      error: error.message
    });
  }
};

// Actualizar gol
export const updateGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const goal = await Goal.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('player team match assistedBy');
    
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Gol no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Gol actualizado exitosamente',
      data: goal
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al actualizar gol',
      error: error.message
    });
  }
};

// Eliminar gol
export const deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;
    
    const goal = await Goal.findById(id).populate('match player');
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Gol no encontrado'
      });
    }
    
    // Actualizar marcador del partido
    const match = goal.match;
    if (match.homeTeam.toString() === goal.team.toString()) {
      match.score.home = Math.max(0, match.score.home - 1);
    } else {
      match.score.away = Math.max(0, match.score.away - 1);
    }
    await match.save();
    
    // Actualizar estadísticas del jugador
    const player = goal.player;
    player.stats.goals = Math.max(0, player.stats.goals - 1);
    await player.save();
    
    // Si había asistencia, actualizar estadísticas del asistente
    if (goal.assistedBy) {
      const assistPlayer = await Player.findById(goal.assistedBy);
      if (assistPlayer) {
        assistPlayer.stats.assists = Math.max(0, assistPlayer.stats.assists - 1);
        await assistPlayer.save();
      }
    }
    
    await Goal.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Gol eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar gol',
      error: error.message
    });
  }
};
