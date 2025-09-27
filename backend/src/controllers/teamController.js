import { Team, Player, Match } from '../models/index.js';

// Obtener todos los equipos
export const getAllTeams = async (req, res) => {
  try {
    const { category, active = true } = req.query;
    
    let query = {};
    if (category) query.category = category;
    if (active !== undefined) query.active = active === 'true';
    
    const teams = await Team.find(query)
      .sort({ category: 1, name: 1 });
    
    res.json({
      success: true,
      data: teams
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener equipos',
      error: error.message
    });
  }
};

// Obtener equipo por ID
export const getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Equipo no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: team
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener equipo',
      error: error.message
    });
  }
};

// Obtener equipos por categoría
export const getTeamsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    const teams = await Team.find({ category, active: true })
      .sort({ 'stats.points': -1, name: 1 });
    
    res.json({
      success: true,
      data: teams
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener equipos por categoría',
      error: error.message
    });
  }
};

// Crear nuevo equipo
export const createTeam = async (req, res) => {
  try {
    const { name, category, coach, foundedYear, colors, stadium } = req.body;
    
    // Verificar que no existe un equipo con el mismo nombre en la misma categoría
    const existingTeam = await Team.findOne({ name, category, active: true });
    if (existingTeam) {
      return res.status(400).json({
        success: false,
        message: `Ya existe un equipo llamado "${name}" en la categoría ${category}`
      });
    }
    
    const team = new Team({
      name,
      category,
      coach,
      foundedYear,
      colors,
      stadium
    });
    
    await team.save();
    
    res.status(201).json({
      success: true,
      message: 'Equipo creado exitosamente',
      data: team
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al crear equipo',
      error: error.message
    });
  }
};

// Actualizar equipo
export const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const team = await Team.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Equipo no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Equipo actualizado exitosamente',
      data: team
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al actualizar equipo',
      error: error.message
    });
  }
};

// Eliminar equipo (soft delete)
export const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que no hay jugadores activos en el equipo
    const activePlayersCount = await Player.countDocuments({ team: id, active: true });
    if (activePlayersCount > 0) {
      return res.status(400).json({
        success: false,
        message: `No se puede eliminar el equipo porque tiene ${activePlayersCount} jugadores activos`
      });
    }
    
    const team = await Team.findByIdAndUpdate(
      id,
      { active: false },
      { new: true }
    );
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Equipo no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Equipo eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar equipo',
      error: error.message
    });
  }
};

// Obtener estadísticas de un equipo
export const getTeamStats = async (req, res) => {
  try {
    const { id } = req.params;
    
    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Equipo no encontrado'
      });
    }
    
    // Obtener jugadores del equipo
    const playersCount = await Player.countDocuments({ team: id, active: true });
    
    // Obtener partidos recientes (últimos 5)
    const recentMatches = await Match.find({
      $or: [{ homeTeam: id }, { awayTeam: id }],
      status: 'Finalizado'
    })
    .populate('homeTeam awayTeam')
    .sort({ date: -1 })
    .limit(5);
    
    res.json({
      success: true,
      data: {
        team: {
          id: team._id,
          name: team.name,
          category: team.category,
          coach: team.coach
        },
        stats: team.stats,
        goalDifference: team.goalDifference,
        playersCount,
        recentMatches
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas del equipo',
      error: error.message
    });
  }
};

// Obtener plantel de un equipo
export const getTeamRoster = async (req, res) => {
  try {
    const { id } = req.params;
    
    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Equipo no encontrado'
      });
    }
    
    const players = await Player.find({ team: id, active: true })
      .sort({ position: 1, jerseyNumber: 1 });
    
    // Agrupar jugadores por posición
    const roster = {
      arqueros: players.filter(p => p.position === 'Arquero'),
      defensores: players.filter(p => p.position === 'Defensor'),
      mediocampistas: players.filter(p => p.position === 'Mediocampista'),
      delanteros: players.filter(p => p.position === 'Delantero')
    };
    
    res.json({
      success: true,
      data: {
        team: {
          id: team._id,
          name: team.name,
          category: team.category,
          coach: team.coach
        },
        roster,
        totalPlayers: players.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener plantel del equipo',
      error: error.message
    });
  }
};

// Obtener tabla de posiciones por categoría
export const getStandingsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    const teams = await Team.find({ category, active: true })
      .sort({ 
        'stats.points': -1, 
        'stats.wins': -1,
        'stats.goalsFor': -1,
        'stats.goalsAgainst': 1
      });
    
    // Agregar posición en la tabla
    const standings = teams.map((team, index) => ({
      position: index + 1,
      team: {
        id: team._id,
        name: team.name,
        category: team.category
      },
      stats: team.stats,
      goalDifference: team.goalDifference
    }));
    
    res.json({
      success: true,
      data: {
        category,
        standings
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener tabla de posiciones',
      error: error.message
    });
  }
};
