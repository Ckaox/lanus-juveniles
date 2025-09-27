import { Match, Team, Goal, Card, Player } from '../models/index.js';

// Obtener todos los partidos
export const getAllMatches = async (req, res) => {
  try {
    const { 
      category, 
      status, 
      team, 
      date, 
      matchday,
      page = 1, 
      limit = 20 
    } = req.query;
    
    let query = {};
    
    // Filtros opcionales
    if (category) query.category = category;
    if (status) query.status = status;
    if (matchday) query.matchday = matchday;
    if (team) {
      query.$or = [{ homeTeam: team }, { awayTeam: team }];
    }
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }
    
    const matches = await Match.find(query)
      .populate('homeTeam awayTeam')
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Match.countDocuments(query);
    
    res.json({
      success: true,
      data: matches,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener partidos',
      error: error.message
    });
  }
};

// Obtener partido por ID
export const getMatchById = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('homeTeam awayTeam');
    
    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Partido no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: match
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener partido',
      error: error.message
    });
  }
};

// Obtener partidos en vivo
export const getLiveMatches = async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = { status: 'En Vivo' };
    if (category) query.category = category;
    
    const liveMatches = await Match.find(query)
      .populate('homeTeam awayTeam')
      .sort({ date: 1 });
    
    res.json({
      success: true,
      data: liveMatches
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener partidos en vivo',
      error: error.message
    });
  }
};

// Crear nuevo partido
export const createMatch = async (req, res) => {
  try {
    const { 
      homeTeam, 
      awayTeam, 
      date, 
      matchday, 
      category, 
      venue, 
      referee 
    } = req.body;
    
    // Verificar que los equipos existen y son de la misma categoría
    const [homeTeamDoc, awayTeamDoc] = await Promise.all([
      Team.findById(homeTeam),
      Team.findById(awayTeam)
    ]);
    
    if (!homeTeamDoc || !awayTeamDoc) {
      return res.status(400).json({
        success: false,
        message: 'Uno o ambos equipos no existen'
      });
    }
    
    if (homeTeamDoc.category !== category || awayTeamDoc.category !== category) {
      return res.status(400).json({
        success: false,
        message: 'Los equipos deben ser de la misma categoría que el partido'
      });
    }
    
    if (homeTeam === awayTeam) {
      return res.status(400).json({
        success: false,
        message: 'Un equipo no puede jugar contra sí mismo'
      });
    }
    
    const match = new Match({
      homeTeam,
      awayTeam,
      date,
      matchday,
      category,
      venue,
      referee
    });
    
    await match.save();
    await match.populate('homeTeam awayTeam');
    
    res.status(201).json({
      success: true,
      message: 'Partido creado exitosamente',
      data: match
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al crear partido',
      error: error.message
    });
  }
};

// Actualizar partido
export const updateMatch = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const match = await Match.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('homeTeam awayTeam');
    
    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Partido no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Partido actualizado exitosamente',
      data: match
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al actualizar partido',
      error: error.message
    });
  }
};

// Iniciar partido (cambiar estado a "En Vivo")
export const startMatch = async (req, res) => {
  try {
    const { id } = req.params;
    
    const match = await Match.findByIdAndUpdate(
      id,
      { 
        status: 'En Vivo',
        'time.minute': 0,
        'time.period': 'Primer Tiempo'
      },
      { new: true }
    ).populate('homeTeam awayTeam');
    
    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Partido no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Partido iniciado',
      data: match
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al iniciar partido',
      error: error.message
    });
  }
};

// Finalizar partido
export const finishMatch = async (req, res) => {
  try {
    const { id } = req.params;
    
    const match = await Match.findByIdAndUpdate(
      id,
      { 
        status: 'Finalizado',
        'time.period': 'Finalizado'
      },
      { new: true }
    ).populate('homeTeam awayTeam');
    
    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Partido no encontrado'
      });
    }
    
    // Actualizar estadísticas de los equipos
    await updateTeamStats(match);
    
    res.json({
      success: true,
      message: 'Partido finalizado',
      data: match
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al finalizar partido',
      error: error.message
    });
  }
};

// Actualizar tiempo de partido
export const updateMatchTime = async (req, res) => {
  try {
    const { id } = req.params;
    const { minute, period, extraTime } = req.body;
    
    const match = await Match.findByIdAndUpdate(
      id,
      { 
        'time.minute': minute,
        'time.period': period,
        'time.extraTime': extraTime || 0
      },
      { new: true }
    ).populate('homeTeam awayTeam');
    
    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Partido no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: match
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar tiempo del partido',
      error: error.message
    });
  }
};

// Obtener eventos de un partido (goles y tarjetas)
export const getMatchEvents = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [goals, cards] = await Promise.all([
      Goal.find({ match: id })
        .populate('player team')
        .sort({ minute: 1 }),
      Card.find({ match: id })
        .populate('player team')
        .sort({ minute: 1 })
    ]);
    
    // Combinar y ordenar eventos por minuto
    const events = [
      ...goals.map(goal => ({ ...goal.toObject(), eventType: 'goal' })),
      ...cards.map(card => ({ ...card.toObject(), eventType: 'card' }))
    ].sort((a, b) => a.minute - b.minute);
    
    res.json({
      success: true,
      data: {
        goals,
        cards,
        events
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener eventos del partido',
      error: error.message
    });
  }
};

// Función auxiliar para actualizar estadísticas de equipos
const updateTeamStats = async (match) => {
  try {
    const homeTeam = await Team.findById(match.homeTeam);
    const awayTeam = await Team.findById(match.awayTeam);
    
    // Actualizar partidos jugados
    homeTeam.stats.matchesPlayed += 1;
    awayTeam.stats.matchesPlayed += 1;
    
    // Actualizar goles
    homeTeam.stats.goalsFor += match.score.home;
    homeTeam.stats.goalsAgainst += match.score.away;
    awayTeam.stats.goalsFor += match.score.away;
    awayTeam.stats.goalsAgainst += match.score.home;
    
    // Determinar resultado y actualizar estadísticas
    if (match.score.home > match.score.away) {
      // Victoria local
      homeTeam.stats.wins += 1;
      awayTeam.stats.losses += 1;
    } else if (match.score.away > match.score.home) {
      // Victoria visitante
      awayTeam.stats.wins += 1;
      homeTeam.stats.losses += 1;
    } else {
      // Empate
      homeTeam.stats.draws += 1;
      awayTeam.stats.draws += 1;
    }
    
    // Calcular puntos
    homeTeam.calculatePoints();
    awayTeam.calculatePoints();
    
    // Guardar cambios
    await Promise.all([homeTeam.save(), awayTeam.save()]);
  } catch (error) {
    console.error('Error actualizando estadísticas de equipos:', error);
  }
};

export { updateTeamStats };
