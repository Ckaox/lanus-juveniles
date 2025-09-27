import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useParams } from 'react-router-dom';
import { playersAPI, teamsAPI, goalsAPI, cardsAPI } from '../../services/api';
import Loading from '../../components/Common/Loading';
import ErrorMessage from '../../components/Common/ErrorMessage';
import './Statistics.css';

const Statistics = () => {
  return (
    <div className="statistics-page">
      <Routes>
        <Route path="/" element={<StatisticsOverview />} />
        <Route path="/jugadores" element={<PlayersStats />} />
        <Route path="/equipos" element={<TeamsStats />} />
        <Route path="/goleadores" element={<TopScorers />} />
      </Routes>
    </div>
  );
};

// Vista general de estadísticas
const StatisticsOverview = () => {
  const [stats, setStats] = useState({
    topScorers: [],
    topAssists: [],
    mostCards: [],
    teamStats: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOverviewStats();
  }, []);

  const fetchOverviewStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener estadísticas generales
      const [playersResponse, teamsResponse] = await Promise.all([
        playersAPI.getAll({ limit: 50 }),
        teamsAPI.getAll()
      ]);

      const players = playersResponse.data.data || [];
      const teams = teamsResponse.data.data || [];

      // Procesar estadísticas
      const topScorers = players
        .filter(p => p.stats.goals > 0)
        .sort((a, b) => b.stats.goals - a.stats.goals)
        .slice(0, 10);

      const topAssists = players
        .filter(p => p.stats.assists > 0)
        .sort((a, b) => b.stats.assists - a.stats.assists)
        .slice(0, 10);

      const mostCards = players
        .filter(p => (p.stats.yellowCards + p.stats.redCards) > 0)
        .sort((a, b) => (b.stats.yellowCards + b.stats.redCards) - (a.stats.yellowCards + a.stats.redCards))
        .slice(0, 10);

      const teamStats = teams
        .sort((a, b) => b.stats.points - a.stats.points)
        .slice(0, 6);

      setStats({
        topScorers,
        topAssists,
        mostCards,
        teamStats
      });
    } catch (err) {
      setError('Error al cargar estadísticas');
      console.error('Error fetching overview stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading message="Cargando estadísticas..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchOverviewStats} />;

  return (
    <div className="container">
      <div className="page-header">
        <h1>📊 Estadísticas</h1>
        <p>Rendimiento de jugadores y equipos en todas las categorías</p>
      </div>

      {/* Enlaces rápidos */}
      <div className="stats-navigation">
        <Link to="/estadisticas/jugadores" className="stats-nav-card">
          <div className="nav-icon">👤</div>
          <h3>Estadísticas de Jugadores</h3>
          <p>Rendimiento individual por categoría</p>
        </Link>
        <Link to="/estadisticas/equipos" className="stats-nav-card">
          <div className="nav-icon">👥</div>
          <h3>Estadísticas de Equipos</h3>
          <p>Rendimiento de equipos por categoría</p>
        </Link>
        <Link to="/estadisticas/goleadores" className="stats-nav-card">
          <div className="nav-icon">⚽</div>
          <h3>Tabla de Goleadores</h3>
          <p>Los máximos anotadores</p>
        </Link>
      </div>

      {/* Resumen de estadísticas principales */}
      <div className="stats-overview-grid">
        {/* Top Goleadores */}
        <div className="stats-section">
          <div className="section-header">
            <h2>🥇 Top Goleadores</h2>
            <Link to="/estadisticas/goleadores" className="view-all-link">Ver todos</Link>
          </div>
          <div className="stats-list">
            {stats.topScorers.slice(0, 5).map((player, index) => (
              <div key={player._id} className="stat-item">
                <span className="position">{index + 1}</span>
                <div className="player-info">
                  <span className="player-name">{player.firstName} {player.lastName}</span>
                  <span className="player-team">{player.team?.name} - {player.team?.category}</span>
                </div>
                <span className="stat-value">{player.stats.goals} goles</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Asistencias */}
        <div className="stats-section">
          <div className="section-header">
            <h2>🎯 Top Asistencias</h2>
            <Link to="/estadisticas/jugadores" className="view-all-link">Ver todos</Link>
          </div>
          <div className="stats-list">
            {stats.topAssists.slice(0, 5).map((player, index) => (
              <div key={player._id} className="stat-item">
                <span className="position">{index + 1}</span>
                <div className="player-info">
                  <span className="player-name">{player.firstName} {player.lastName}</span>
                  <span className="player-team">{player.team?.name} - {player.team?.category}</span>
                </div>
                <span className="stat-value">{player.stats.assists} asist.</span>
              </div>
            ))}
          </div>
        </div>

        {/* Equipos con más puntos */}
        <div className="stats-section">
          <div className="section-header">
            <h2>🏆 Mejores Equipos</h2>
            <Link to="/tablas" className="view-all-link">Ver tablas</Link>
          </div>
          <div className="stats-list">
            {stats.teamStats.map((team, index) => (
              <div key={team._id} className="stat-item">
                <span className="position">{index + 1}</span>
                <div className="player-info">
                  <span className="player-name">{team.name}</span>
                  <span className="player-team">{team.category} División</span>
                </div>
                <span className="stat-value">{team.stats.points} pts</span>
              </div>
            ))}
          </div>
        </div>

        {/* Jugadores con más tarjetas */}
        <div className="stats-section">
          <div className="section-header">
            <h2>🟨 Más Tarjetas</h2>
            <Link to="/estadisticas/jugadores" className="view-all-link">Ver todos</Link>
          </div>
          <div className="stats-list">
            {stats.mostCards.slice(0, 5).map((player, index) => (
              <div key={player._id} className="stat-item">
                <span className="position">{index + 1}</span>
                <div className="player-info">
                  <span className="player-name">{player.firstName} {player.lastName}</span>
                  <span className="player-team">{player.team?.name} - {player.team?.category}</span>
                </div>
                <span className="stat-value">
                  {player.stats.yellowCards + player.stats.redCards} tarjetas
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Estadísticas de jugadores
const PlayersStats = () => {
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    position: '',
    sortBy: 'goals'
  });

  const categories = ['4ta', '5ta', '6ta', '7ma', '8va', '9na'];
  const positions = ['Arquero', 'Defensor', 'Mediocampista', 'Delantero'];
  const sortOptions = [
    { value: 'goals', label: 'Goles' },
    { value: 'assists', label: 'Asistencias' },
    { value: 'matchesPlayed', label: 'Partidos Jugados' },
    { value: 'yellowCards', label: 'Tarjetas Amarillas' },
    { value: 'redCards', label: 'Tarjetas Rojas' }
  ];

  useEffect(() => {
    fetchPlayersStats();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [players, filters]);

  const fetchPlayersStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await playersAPI.getAll({ limit: 200 });
      const playersData = response.data.data || [];
      
      setPlayers(playersData);
    } catch (err) {
      setError('Error al cargar estadísticas de jugadores');
      console.error('Error fetching players stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...players];

    // Filtrar por categoría
    if (filters.category) {
      filtered = filtered.filter(player => player.team?.category === filters.category);
    }

    // Filtrar por posición
    if (filters.position) {
      filtered = filtered.filter(player => player.position === filters.position);
    }

    // Ordenar
    filtered.sort((a, b) => {
      const aValue = a.stats[filters.sortBy] || 0;
      const bValue = b.stats[filters.sortBy] || 0;
      return bValue - aValue;
    });

    setFilteredPlayers(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  if (loading) return <Loading message="Cargando estadísticas de jugadores..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchPlayersStats} />;

  return (
    <div className="container">
      <div className="page-header">
        <Link to="/estadisticas" className="back-link">← Volver a estadísticas</Link>
        <h1>Estadísticas de Jugadores</h1>
      </div>

      {/* Filtros */}
      <div className="filters-section">
        <div className="filters-grid">
          <div className="filter-group">
            <label>Categoría</label>
            <select 
              className="form-control form-select"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">Todas las categorías</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category} División
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Posición</label>
            <select 
              className="form-control form-select"
              value={filters.position}
              onChange={(e) => handleFilterChange('position', e.target.value)}
            >
              <option value="">Todas las posiciones</option>
              {positions.map(position => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Ordenar por</label>
            <select 
              className="form-control form-select"
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de estadísticas */}
      <div className="stats-table-container">
        <table className="table stats-table">
          <thead>
            <tr>
              <th>Pos</th>
              <th>Jugador</th>
              <th>Equipo</th>
              <th>Posición</th>
              <th>PJ</th>
              <th>Goles</th>
              <th>Asist.</th>
              <th>🟨</th>
              <th>🟥</th>
              <th>Minutos</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlayers.map((player, index) => (
              <tr key={player._id}>
                <td className="position-cell">{index + 1}</td>
                <td className="player-cell">
                  <div className="player-info">
                    <span className="player-name">{player.firstName} {player.lastName}</span>
                    <span className="jersey-number">#{player.jerseyNumber}</span>
                  </div>
                </td>
                <td className="team-cell">
                  <div className="team-info">
                    <span className="team-name">{player.team?.name}</span>
                    <span className="team-category">{player.team?.category}</span>
                  </div>
                </td>
                <td className="position-cell">{player.position}</td>
                <td>{player.stats.matchesPlayed}</td>
                <td className="goals-cell">{player.stats.goals}</td>
                <td className="assists-cell">{player.stats.assists}</td>
                <td className="yellow-cards-cell">{player.stats.yellowCards}</td>
                <td className="red-cards-cell">{player.stats.redCards}</td>
                <td>{player.stats.minutesPlayed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredPlayers.length === 0 && (
        <div className="no-data">
          <p>No se encontraron jugadores con los filtros seleccionados</p>
        </div>
      )}
    </div>
  );
};

// Estadísticas de equipos
const TeamsStats = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = ['4ta', '5ta', '6ta', '7ma', '8va', '9na'];

  useEffect(() => {
    fetchTeamsStats();
  }, []);

  const fetchTeamsStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await teamsAPI.getAll();
      const teamsData = response.data.data || [];
      
      setTeams(teamsData);
    } catch (err) {
      setError('Error al cargar estadísticas de equipos');
      console.error('Error fetching teams stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTeams = selectedCategory 
    ? teams.filter(team => team.category === selectedCategory)
    : teams;

  const sortedTeams = filteredTeams.sort((a, b) => b.stats.points - a.stats.points);

  if (loading) return <Loading message="Cargando estadísticas de equipos..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchTeamsStats} />;

  return (
    <div className="container">
      <div className="page-header">
        <Link to="/estadisticas" className="back-link">← Volver a estadísticas</Link>
        <h1>Estadísticas de Equipos</h1>
      </div>

      {/* Filtro de categoría */}
      <div className="category-filter">
        <button 
          className={`category-btn ${selectedCategory === '' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('')}
        >
          Todas
        </button>
        {categories.map(category => (
          <button 
            key={category}
            className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category} División
          </button>
        ))}
      </div>

      {/* Tabla de estadísticas de equipos */}
      <div className="stats-table-container">
        <table className="table stats-table">
          <thead>
            <tr>
              <th>Pos</th>
              <th>Equipo</th>
              <th>Categoría</th>
              <th>PJ</th>
              <th>G</th>
              <th>E</th>
              <th>P</th>
              <th>GF</th>
              <th>GC</th>
              <th>DG</th>
              <th>Pts</th>
              <th>%</th>
            </tr>
          </thead>
          <tbody>
            {sortedTeams.map((team, index) => {
              const winPercentage = team.stats.matchesPlayed > 0 
                ? ((team.stats.wins / team.stats.matchesPlayed) * 100).toFixed(1)
                : 0;
              
              return (
                <tr key={team._id}>
                  <td className="position-cell">{index + 1}</td>
                  <td className="team-cell">
                    <Link to={`/equipos/${team._id}`} className="team-link">
                      {team.name}
                    </Link>
                  </td>
                  <td className="category-cell">{team.category}</td>
                  <td>{team.stats.matchesPlayed}</td>
                  <td className="wins-cell">{team.stats.wins}</td>
                  <td className="draws-cell">{team.stats.draws}</td>
                  <td className="losses-cell">{team.stats.losses}</td>
                  <td className="goals-for-cell">{team.stats.goalsFor}</td>
                  <td className="goals-against-cell">{team.stats.goalsAgainst}</td>
                  <td className={`goal-diff-cell ${team.goalDifference >= 0 ? 'positive' : 'negative'}`}>
                    {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                  </td>
                  <td className="points-cell">{team.stats.points}</td>
                  <td className="percentage-cell">{winPercentage}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Tabla de goleadores
const TopScorers = () => {
  const [scorers, setScorers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = ['4ta', '5ta', '6ta', '7ma', '8va', '9na'];

  useEffect(() => {
    fetchTopScorers();
  }, []);

  const fetchTopScorers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await playersAPI.getAll({ limit: 100 });
      const playersData = response.data.data || [];
      
      // Filtrar solo jugadores con goles
      const scorersData = playersData
        .filter(player => player.stats.goals > 0)
        .sort((a, b) => b.stats.goals - a.stats.goals);
      
      setScorers(scorersData);
    } catch (err) {
      setError('Error al cargar tabla de goleadores');
      console.error('Error fetching top scorers:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredScorers = selectedCategory 
    ? scorers.filter(player => player.team?.category === selectedCategory)
    : scorers;

  if (loading) return <Loading message="Cargando tabla de goleadores..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchTopScorers} />;

  return (
    <div className="container">
      <div className="page-header">
        <Link to="/estadisticas" className="back-link">← Volver a estadísticas</Link>
        <h1>⚽ Tabla de Goleadores</h1>
      </div>

      {/* Filtro de categoría */}
      <div className="category-filter">
        <button 
          className={`category-btn ${selectedCategory === '' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('')}
        >
          Todas
        </button>
        {categories.map(category => (
          <button 
            key={category}
            className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category} División
          </button>
        ))}
      </div>

      {/* Tabla de goleadores */}
      <div className="scorers-grid">
        {filteredScorers.map((player, index) => (
          <div key={player._id} className="scorer-card">
            <div className="scorer-position">
              {index + 1}
            </div>
            <div className="scorer-info">
              <h3>{player.firstName} {player.lastName}</h3>
              <p className="scorer-team">{player.team?.name} - {player.team?.category}</p>
              <p className="scorer-position-text">{player.position}</p>
            </div>
            <div className="scorer-stats">
              <div className="goals-count">{player.stats.goals}</div>
              <div className="goals-label">Goles</div>
              {player.stats.assists > 0 && (
                <div className="assists-info">{player.stats.assists} asistencias</div>
              )}
              <div className="matches-info">{player.stats.matchesPlayed} partidos</div>
            </div>
          </div>
        ))}
      </div>

      {filteredScorers.length === 0 && (
        <div className="no-data">
          <p>No hay goleadores en la categoría seleccionada</p>
        </div>
      )}
    </div>
  );
};

export default Statistics;
