import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
  homeTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
    index: true
  },
  awayTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  matchday: {
    type: Number,
    required: true,
    min: 1
  },
  category: {
    type: String,
    required: true,
    enum: ['4ta', '5ta', '6ta', '7ma', '8va', '9na'],
    index: true
  },
  venue: {
    type: String,
    default: 'Estadio Ciudad de Lanús - Néstor Díaz Pérez'
  },
  // Estado del partido
  status: {
    type: String,
    enum: ['Programado', 'En Vivo', 'Finalizado', 'Suspendido', 'Cancelado'],
    default: 'Programado',
    index: true
  },
  // Resultado
  score: {
    home: { type: Number, default: 0 },
    away: { type: Number, default: 0 }
  },
  // Tiempo de juego
  time: {
    minute: { type: Number, default: 0 },
    period: { 
      type: String, 
      enum: ['Primer Tiempo', 'Descanso', 'Segundo Tiempo', 'Finalizado'],
      default: 'Primer Tiempo'
    },
    extraTime: { type: Number, default: 0 }
  },
  // Árbitros
  referee: {
    main: String,
    assistant1: String,
    assistant2: String
  },
  // Clima
  weather: {
    condition: String,
    temperature: Number
  },
  // Notas adicionales
  notes: String,
  // Estadísticas del partido
  stats: {
    attendance: Number,
    homeTeamPossession: Number,
    awayTeamPossession: Number
  }
}, {
  timestamps: true
});

// Índices para mejorar performance
matchSchema.index({ date: -1, category: 1 });
matchSchema.index({ homeTeam: 1, awayTeam: 1, date: 1 });
matchSchema.index({ status: 1, date: 1 });
matchSchema.index({ matchday: 1, category: 1 });

// Método virtual para obtener el resultado como string
matchSchema.virtual('result').get(function() {
  if (this.status === 'Finalizado') {
    return `${this.score.home} - ${this.score.away}`;
  }
  return 'Sin resultado';
});

// Método para determinar el ganador
matchSchema.methods.getWinner = function() {
  if (this.status !== 'Finalizado') return null;
  
  if (this.score.home > this.score.away) {
    return { winner: this.homeTeam, result: 'home' };
  } else if (this.score.away > this.score.home) {
    return { winner: this.awayTeam, result: 'away' };
  } else {
    return { winner: null, result: 'draw' };
  }
};

// Método para verificar si el partido está en vivo
matchSchema.methods.isLive = function() {
  return this.status === 'En Vivo';
};

export default mongoose.model('Match', matchSchema);
