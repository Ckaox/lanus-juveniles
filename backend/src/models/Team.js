import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['4ta', '5ta', '6ta', '7ma', '8va', '9na'],
    index: true
  },
  coach: {
    type: String,
    trim: true
  },
  foundedYear: {
    type: Number
  },
  colors: {
    primary: String,
    secondary: String
  },
  stadium: {
    type: String,
    default: 'Estadio Ciudad de Lanús - Néstor Díaz Pérez'
  },
  // Estadísticas del equipo
  stats: {
    matchesPlayed: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    draws: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    goalsFor: { type: Number, default: 0 },
    goalsAgainst: { type: Number, default: 0 },
    points: { type: Number, default: 0 }
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices para mejorar performance
teamSchema.index({ category: 1, active: 1 });
teamSchema.index({ 'stats.points': -1 });

// Método virtual para diferencia de goles
teamSchema.virtual('goalDifference').get(function() {
  return this.stats.goalsFor - this.stats.goalsAgainst;
});

// Método para calcular puntos
teamSchema.methods.calculatePoints = function() {
  this.stats.points = (this.stats.wins * 3) + this.stats.draws;
  return this.stats.points;
};

export default mongoose.model('Team', teamSchema);
