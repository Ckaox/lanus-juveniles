import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Team, Player, Match, Goal, Card } from '../models/index.js';

// Cargar variables de entorno
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lanus-juveniles';

// Datos de ejemplo
const sampleTeams = [
  { name: 'Lanús 4ta División', category: '4ta', coach: 'Carlos Rodríguez', colors: { primary: '#800000', secondary: '#FFFFFF' } },
  { name: 'Lanús 5ta División', category: '5ta', coach: 'Miguel González', colors: { primary: '#800000', secondary: '#FFFFFF' } },
  { name: 'Lanús 6ta División', category: '6ta', coach: 'Roberto Martínez', colors: { primary: '#800000', secondary: '#FFFFFF' } },
  { name: 'Lanús 7ma División', category: '7ma', coach: 'Diego López', colors: { primary: '#800000', secondary: '#FFFFFF' } },
  { name: 'Lanús 8va División', category: '8va', coach: 'Fernando Silva', colors: { primary: '#800000', secondary: '#FFFFFF' } },
  { name: 'Lanús 9na División', category: '9na', coach: 'Alejandro Pérez', colors: { primary: '#800000', secondary: '#FFFFFF' } }
];

const samplePlayers = [
  // 4ta División
  { firstName: 'Juan', lastName: 'García', jerseyNumber: 1, position: 'Arquero', dateOfBirth: new Date('2005-03-15'), height: 180, weight: 75 },
  { firstName: 'Carlos', lastName: 'López', jerseyNumber: 2, position: 'Defensor', dateOfBirth: new Date('2005-07-22'), height: 175, weight: 70 },
  { firstName: 'Miguel', lastName: 'Rodríguez', jerseyNumber: 10, position: 'Mediocampista', dateOfBirth: new Date('2005-01-08'), height: 170, weight: 68 },
  { firstName: 'Diego', lastName: 'Martínez', jerseyNumber: 9, position: 'Delantero', dateOfBirth: new Date('2005-11-30'), height: 178, weight: 72 },
  
  // 5ta División
  { firstName: 'Sebastián', lastName: 'González', jerseyNumber: 1, position: 'Arquero', dateOfBirth: new Date('2006-05-12'), height: 182, weight: 76 },
  { firstName: 'Mateo', lastName: 'Fernández', jerseyNumber: 4, position: 'Defensor', dateOfBirth: new Date('2006-09-18'), height: 177, weight: 73 },
  { firstName: 'Lucas', lastName: 'Silva', jerseyNumber: 8, position: 'Mediocampista', dateOfBirth: new Date('2006-02-25'), height: 172, weight: 69 },
  { firstName: 'Nicolás', lastName: 'Herrera', jerseyNumber: 11, position: 'Delantero', dateOfBirth: new Date('2006-12-03'), height: 176, weight: 71 },
  
  // 6ta División
  { firstName: 'Tomás', lastName: 'Morales', jerseyNumber: 1, position: 'Arquero', dateOfBirth: new Date('2007-04-20'), height: 179, weight: 74 },
  { firstName: 'Agustín', lastName: 'Castro', jerseyNumber: 3, position: 'Defensor', dateOfBirth: new Date('2007-08-14'), height: 174, weight: 69 },
  { firstName: 'Franco', lastName: 'Ruiz', jerseyNumber: 6, position: 'Mediocampista', dateOfBirth: new Date('2007-01-17'), height: 169, weight: 66 },
  { firstName: 'Valentín', lastName: 'Vargas', jerseyNumber: 7, position: 'Delantero', dateOfBirth: new Date('2007-10-09'), height: 175, weight: 70 }
];

async function seedDatabase() {
  try {
    console.log('🌱 Iniciando seed de la base de datos...');
    
    // Conectar a MongoDB
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Conectado a MongoDB');

    // Limpiar datos existentes
    await Promise.all([
      Team.deleteMany({}),
      Player.deleteMany({}),
      Match.deleteMany({}),
      Goal.deleteMany({}),
      Card.deleteMany({})
    ]);
    console.log('🗑️ Datos existentes eliminados');

    // Crear equipos
    const createdTeams = await Team.insertMany(sampleTeams);
    console.log(`👥 ${createdTeams.length} equipos creados`);

    // Crear jugadores y asignarlos a equipos
    const playersWithTeams = [];
    let playerIndex = 0;
    
    for (const team of createdTeams) {
      const teamPlayers = samplePlayers.slice(playerIndex, playerIndex + 4).map(player => ({
        ...player,
        team: team._id
      }));
      playersWithTeams.push(...teamPlayers);
      playerIndex += 4;
    }

    const createdPlayers = await Player.insertMany(playersWithTeams);
    console.log(`⚽ ${createdPlayers.length} jugadores creados`);

    // Crear algunos partidos de ejemplo
    const sampleMatches = [];
    const today = new Date();
    
    for (let i = 0; i < createdTeams.length - 1; i += 2) {
      const matchDate = new Date(today);
      matchDate.setDate(today.getDate() - Math.floor(Math.random() * 30)); // Partidos en el último mes
      
      sampleMatches.push({
        homeTeam: createdTeams[i]._id,
        awayTeam: createdTeams[i + 1]._id,
        date: matchDate,
        matchday: 1,
        category: createdTeams[i].category,
        status: 'Finalizado',
        score: {
          home: Math.floor(Math.random() * 4),
          away: Math.floor(Math.random() * 4)
        }
      });
    }

    const createdMatches = await Match.insertMany(sampleMatches);
    console.log(`🏟️ ${createdMatches.length} partidos creados`);

    // Actualizar estadísticas de equipos basadas en los partidos
    for (const match of createdMatches) {
      const homeTeam = await Team.findById(match.homeTeam);
      const awayTeam = await Team.findById(match.awayTeam);

      // Actualizar estadísticas del equipo local
      homeTeam.stats.matchesPlayed += 1;
      homeTeam.stats.goalsFor += match.score.home;
      homeTeam.stats.goalsAgainst += match.score.away;

      if (match.score.home > match.score.away) {
        homeTeam.stats.wins += 1;
      } else if (match.score.home < match.score.away) {
        homeTeam.stats.losses += 1;
      } else {
        homeTeam.stats.draws += 1;
      }

      homeTeam.calculatePoints();
      await homeTeam.save();

      // Actualizar estadísticas del equipo visitante
      awayTeam.stats.matchesPlayed += 1;
      awayTeam.stats.goalsFor += match.score.away;
      awayTeam.stats.goalsAgainst += match.score.home;

      if (match.score.away > match.score.home) {
        awayTeam.stats.wins += 1;
      } else if (match.score.away < match.score.home) {
        awayTeam.stats.losses += 1;
      } else {
        awayTeam.stats.draws += 1;
      }

      awayTeam.calculatePoints();
      await awayTeam.save();
    }

    console.log('📊 Estadísticas de equipos actualizadas');

    // Crear algunos goles de ejemplo
    const sampleGoals = [];
    for (const match of createdMatches) {
      const totalGoals = match.score.home + match.score.away;
      const matchPlayers = await Player.find({
        team: { $in: [match.homeTeam, match.awayTeam] }
      });

      for (let i = 0; i < totalGoals; i++) {
        const randomPlayer = matchPlayers[Math.floor(Math.random() * matchPlayers.length)];
        sampleGoals.push({
          match: match._id,
          player: randomPlayer._id,
          team: randomPlayer.team,
          minute: Math.floor(Math.random() * 90) + 1,
          period: Math.random() > 0.5 ? 'Primer Tiempo' : 'Segundo Tiempo',
          type: 'Normal'
        });
      }
    }

    if (sampleGoals.length > 0) {
      await Goal.insertMany(sampleGoals);
      console.log(`⚽ ${sampleGoals.length} goles creados`);

      // Actualizar estadísticas de jugadores
      for (const goal of sampleGoals) {
        await Player.findByIdAndUpdate(goal.player, {
          $inc: { 'stats.goals': 1, 'stats.matchesPlayed': 1 }
        });
      }
    }

    console.log('✅ Seed completado exitosamente');
    console.log('📋 Resumen:');
    console.log(`   - ${createdTeams.length} equipos`);
    console.log(`   - ${createdPlayers.length} jugadores`);
    console.log(`   - ${createdMatches.length} partidos`);
    console.log(`   - ${sampleGoals.length} goles`);

  } catch (error) {
    console.error('❌ Error durante el seed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📤 Desconectado de MongoDB');
    process.exit(0);
  }
}

// Ejecutar seed si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export default seedDatabase;
