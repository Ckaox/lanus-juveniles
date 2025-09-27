import { Player, Team } from '../models/index.js';

// Obtener todos los jugadores
export const getAllPlayers = async (req, res) => {
  try {
    const { team, position, category, status, page = 1, limit = 50 } = req.query;
    
    let query = { active: true };
    
    // Filtros opcionales
    if (position) query.position = position;
    if (status) query.status = status;
    
    // Si se especifica equipo o categoría, necesitamos hacer populate
    let playersQuery = Player.find(query).populate('team');
    
    if (team) {
      playersQuery = playersQuery.where('team').equals(team);
    }
    
    if (category) {
      playersQuery = playersQuery.where('team.category').equals(category);
    }
    
    const players = await playersQuery
      .sort({ lastName: 1, firstName: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    const total = await Player.countDocuments(query);
    
    res.json({
      success: true,
      data: players,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener jugadores',
      error: error.message
    });
  }
};

// Obtener jugador por ID
export const getPlayerById = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id).populate('team');
    
    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Jugador no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: player
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener jugador',
      error: error.message
    });
  }
};

// Obtener jugadores por equipo
export const getPlayersByTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { position, status } = req.query;
    
    let query = { team: teamId, active: true };
    
    if (position) query.position = position;
    if (status) query.status = status;
    
    const players = await Player.find(query)
      .populate('team')
      .sort({ jerseyNumber: 1 });
    
    res.json({
      success: true,
      data: players
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener jugadores del equipo',
      error: error.message
    });
  }
};

// Crear nuevo jugador
export const createPlayer = async (req, res) => {
  try {
    const { firstName, lastName, jerseyNumber, position, team, dateOfBirth, height, weight, nationality, status } = req.body;
    
    // Verificar que el equipo existe
    const teamExists = await Team.findById(team);
    if (!teamExists) {
      return res.status(400).json({
        success: false,
        message: 'El equipo especificado no existe'
      });
    }
    
    // Verificar que el número de camiseta no esté ocupado en el equipo
    const existingPlayer = await Player.findOne({ team, jerseyNumber, active: true });
    if (existingPlayer) {
      return res.status(400).json({
        success: false,
        message: `El número ${jerseyNumber} ya está ocupado en este equipo`
      });
    }
    
    const player = new Player({
      firstName,
      lastName,
      jerseyNumber,
      position,
      team,
      dateOfBirth,
      height,
      weight,
      nationality,
      status
    });
    
    await player.save();
    await player.populate('team');
    
    res.status(201).json({
      success: true,
      message: 'Jugador creado exitosamente',
      data: player
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al crear jugador',
      error: error.message
    });
  }
};

// Actualizar jugador
export const updatePlayer = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Si se está actualizando el número de camiseta, verificar disponibilidad
    if (updates.jerseyNumber) {
      const player = await Player.findById(id);
      if (!player) {
        return res.status(404).json({
          success: false,
          message: 'Jugador no encontrado'
        });
      }
      
      const existingPlayer = await Player.findOne({
        team: updates.team || player.team,
        jerseyNumber: updates.jerseyNumber,
        active: true,
        _id: { $ne: id }
      });
      
      if (existingPlayer) {
        return res.status(400).json({
          success: false,
          message: `El número ${updates.jerseyNumber} ya está ocupado en este equipo`
        });
      }
    }
    
    const player = await Player.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('team');
    
    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Jugador no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Jugador actualizado exitosamente',
      data: player
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al actualizar jugador',
      error: error.message
    });
  }
};

// Eliminar jugador (soft delete)
export const deletePlayer = async (req, res) => {
  try {
    const player = await Player.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    );
    
    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Jugador no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Jugador eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar jugador',
      error: error.message
    });
  }
};

// Obtener estadísticas de un jugador
export const getPlayerStats = async (req, res) => {
  try {
    const { id } = req.params;
    
    const player = await Player.findById(id).populate('team');
    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Jugador no encontrado'
      });
    }
    
    // Aquí podrías agregar lógica más compleja para calcular estadísticas
    // Por ahora devolvemos las estadísticas básicas del modelo
    res.json({
      success: true,
      data: {
        player: {
          id: player._id,
          name: player.fullName,
          position: player.position,
          team: player.team.name,
          category: player.team.category
        },
        stats: player.stats,
        goalsPerMatch: player.getGoalsPerMatch()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas del jugador',
      error: error.message
    });
  }
};
