import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  jerseyNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 99
  },
  position: {
    type: String,
    required: true,
    enum: ['Arquero', 'Defensor', 'Mediocampista', 'Delantero'],
    index: true
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
    index: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  height: {
    type: Number, // en cm
    min: 140,
    max: 220
  },
  weight: {
    type: Number, // en kg
    min: 40,
    max: 120
  },
  nationality: {
    type: String,
    default: 'Argentina'
  },
  // Estadísticas del jugador
  stats: {
    matchesPlayed: { type: Number, default: 0 },
    goals: { type: Number, default: 0 },
    assists: { type: Number, default: 0 },
    yellowCards: { type: Number, default: 0 },
    redCards: { type: Number, default: 0 },
    minutesPlayed: { type: Number, default: 0 }
  },
  // Estado del jugador
  status: {
    type: String,
    enum: ['Activo', 'Lesionado', 'Suspendido', 'Inactivo'],
    default: 'Activo'
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices compuestos para mejorar performance
playerSchema.index({ team: 1, active: 1 });
playerSchema.index({ team: 1, jerseyNumber: 1 }, { unique: true });
playerSchema.index({ position: 1, team: 1 });

// Método virtual para nombre completo
playerSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Método virtual para calcular edad
playerSchema.virtual('age').get(function() {
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Método para calcular promedio de goles por partido
playerSchema.methods.getGoalsPerMatch = function() {
  if (this.stats.matchesPlayed === 0) return 0;
  return (this.stats.goals / this.stats.matchesPlayed).toFixed(2);
};

export default mongoose.model('Player', playerSchema);
