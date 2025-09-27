import mongoose from 'mongoose';

const cardSchema = new mongoose.Schema({
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
    max: 120
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
  // Tipo de tarjeta
  type: {
    type: String,
    enum: ['Amarilla', 'Roja', 'Doble Amarilla'],
    required: true,
    index: true
  },
  // Razón de la tarjeta
  reason: {
    type: String,
    enum: [
      'Falta', 
      'Conducta Antideportiva', 
      'Protesta', 
      'Juego Brusco', 
      'Entrada Peligrosa',
      'Mano Intencional',
      'Simulación',
      'Pérdida de Tiempo',
      'No Respetar Distancia',
      'Salir/Entrar sin Permiso',
      'Agresión',
      'Lenguaje Ofensivo',
      'Otra'
    ],
    required: true
  },
  // Descripción detallada
  description: {
    type: String,
    trim: true
  },
  // Si resultó en expulsión
  resulted_in_ejection: {
    type: Boolean,
    default: false
  },
  // Árbitro que mostró la tarjeta
  referee: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Índices para mejorar performance
cardSchema.index({ match: 1, minute: 1 });
cardSchema.index({ player: 1, type: 1 });
cardSchema.index({ team: 1, match: 1 });

// Método virtual para obtener el tiempo completo de la tarjeta
cardSchema.virtual('fullTime').get(function() {
  if (this.extraTime > 0) {
    return `${this.minute}+${this.extraTime}'`;
  }
  return `${this.minute}'`;
});

// Método para verificar si es tarjeta roja
cardSchema.methods.isRedCard = function() {
  return this.type === 'Roja' || this.type === 'Doble Amarilla';
};

// Método para verificar si causó expulsión
cardSchema.methods.causedEjection = function() {
  return this.resulted_in_ejection || this.isRedCard();
};

export default mongoose.model('Card', cardSchema);
