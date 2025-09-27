import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
  match: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true,
    index: true
  },
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: true,
    index: true
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
    index: true
  },
  minute: {
    type: Number,
    required: true,
    min: 1,
    max: 120 // Incluyendo tiempo extra
  },
  period: {
    type: String,
    enum: ['Primer Tiempo', 'Segundo Tiempo', 'Tiempo Extra'],
    required: true
  },
  extraTime: {
    type: Number,
    default: 0,
    min: 0
  },
  // Tipo de gol
  type: {
    type: String,
    enum: ['Normal', 'Penal', 'Tiro Libre', 'Cabezazo', 'Autogol', 'Rebote'],
    default: 'Normal'
  },
  // Jugador que asistió (opcional)
  assistedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  },
  // Descripción del gol
  description: {
    type: String,
    trim: true
  },
  // Posición en el campo donde se marcó
  position: {
    x: Number, // coordenada X (0-100)
    y: Number  // coordenada Y (0-100)
  },
  // Si fue validado por VAR (para categorías que lo tengan)
  varChecked: {
    type: Boolean,
    default: false
  },
  // Estado del gol
  valid: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices para mejorar performance
goalSchema.index({ match: 1, minute: 1 });
goalSchema.index({ player: 1, match: 1 });
goalSchema.index({ team: 1, match: 1 });

// Método virtual para obtener el tiempo completo del gol
goalSchema.virtual('fullTime').get(function() {
  if (this.extraTime > 0) {
    return `${this.minute}+${this.extraTime}'`;
  }
  return `${this.minute}'`;
});

// Método para verificar si es autogol
goalSchema.methods.isOwnGoal = function() {
  return this.type === 'Autogol';
};

export default mongoose.model('Goal', goalSchema);
