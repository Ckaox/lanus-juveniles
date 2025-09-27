import mongoose from 'mongoose';

const statisticsSchema = new mongoose.Schema({
  // Puede ser estadística de jugador, equipo o general
  type: {
    type: String,
    enum: ['player', 'team', 'match', 'season'],
    required: true,
    index: true
  },
  // Referencias opcionales según el tipo
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  match: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match'
  },
  category: {
    type: String,
    enum: ['4ta', '5ta', '6ta', '7ma', '8va', '9na'],
    index: true
  },
  season: {
    type: String,
    default: '2024'
  },
  // Estadísticas generales
  stats: {
    // Partidos
    matchesPlayed: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    draws: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    
    // Goles
    goals: { type: Number, default: 0 },
    goalsAgainst: { type: Number, default: 0 },
    assists: { type: Number, default: 0 },
    
    // Tarjetas
    yellowCards: { type: Number, default: 0 },
    redCards: { type: Number, default: 0 },
    
    // Tiempo
    minutesPlayed: { type: Number, default: 0 },
    
    // Estadísticas específicas de jugadores
    saves: { type: Number, default: 0 }, // Para arqueros
    cleanSheets: { type: Number, default: 0 }, // Para arqueros
    tackles: { type: Number, default: 0 }, // Para defensores
    passes: { type: Number, default: 0 },
    passAccuracy: { type: Number, default: 0 }, // Porcentaje
    
    // Estadísticas específicas de equipos
    points: { type: Number, default: 0 },
    homeWins: { type: Number, default: 0 },
    awayWins: { type: Number, default: 0 },
    homeGoals: { type: Number, default: 0 },
    awayGoals: { type: Number, default: 0 },
    
    // Estadísticas avanzadas
    shotsOnTarget: { type: Number, default: 0 },
    totalShots: { type: Number, default: 0 },
    possession: { type: Number, default: 0 }, // Porcentaje promedio
    fouls: { type: Number, default: 0 },
    corners: { type: Number, default: 0 },
    offsides: { type: Number, default: 0 }
  },
  
  // Período de las estadísticas
  period: {
    startDate: Date,
    endDate: Date
  },
  
  // Última actualización
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índices para mejorar performance
statisticsSchema.index({ type: 1, category: 1, season: 1 });
statisticsSchema.index({ player: 1, season: 1 });
statisticsSchema.index({ team: 1, season: 1 });
statisticsSchema.index({ match: 1 });

// Método virtual para calcular diferencia de goles
statisticsSchema.virtual('goalDifference').get(function() {
  return this.stats.goals - this.stats.goalsAgainst;
});

// Método virtual para calcular puntos (para equipos)
statisticsSchema.virtual('totalPoints').get(function() {
  return (this.stats.wins * 3) + this.stats.draws;
});

// Método virtual para calcular porcentaje de victorias
statisticsSchema.virtual('winPercentage').get(function() {
  if (this.stats.matchesPlayed === 0) return 0;
  return ((this.stats.wins / this.stats.matchesPlayed) * 100).toFixed(1);
});

// Método para actualizar estadísticas
statisticsSchema.methods.updateStats = function(newStats) {
  Object.keys(newStats).forEach(key => {
    if (this.stats[key] !== undefined) {
      this.stats[key] = newStats[key];
    }
  });
  this.lastUpdated = new Date();
  return this.save();
};

export default mongoose.model('Statistics', statisticsSchema);
