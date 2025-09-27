import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { teamsAPI, playersAPI } from '../../services/api';
import Loading from '../../components/Common/Loading';
import ErrorMessage from '../../components/Common/ErrorMessage';
import './Teams.css';

const Teams = () => {
  return (
    <div className="teams-page">
      <Routes>
        <Route path="/" element={<TeamsOverview />} />
        <Route path="/:teamId" element={<TeamDetail />} />
        <Route path="/categoria/:category" element={<CategoryTeams />} />
      </Routes>
    </div>
  );
};

// Vista general de equipos por categorías
const TeamsOverview = () => {
  const [teamsByCategory, setTeamsByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = ['4ta', '5ta', '6ta', '7ma', '8va', '9na'];

  useEffect(() => {
    fetchTeamsByCategories();
  }, []);

  const fetchTeamsByCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const promises = categories.map(category => 
        teamsAPI.getByCategory(category)
      );

      const responses = await Promise.all(promises);
      
      const teamsData = {};
      responses.forEach((response, index) => {
        teamsData[categories[index]] = response.data.data || [];
      });

      setTeamsByCategory(teamsData);
    } catch (err) {
      setError('Error al cargar los equipos');
      console.error('Error fetching teams:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading message="Cargando equipos..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchTeamsByCategories} />;

  return (
    <div className="container">
      <div className="page-header">
        <h1>Equipos por Categoría</h1>
        <p>Explora todos los equipos de las divisiones inferiores de Lanús</p>
      </div>

      <div className="categories-grid">
        {categories.map(category => (
          <div key={category} className="category-section">
            <div className="category-header">
              <h2>{category} División</h2>
              <Link 
                to={`/equipos/categoria/${category}`} 
                className="view-all-link"
              >
                Ver detalles
              </Link>
            </div>
            
            <div className="teams-grid">
              {teamsByCategory[category]?.length > 0 ? (
                teamsByCategory[category].map(team => (
                  <TeamCard key={team._id} team={team} />
                ))
              ) : (
                <div className="no-teams">
                  <p>No hay equipos registrados en esta categoría</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Vista de equipos de una categoría específica
const CategoryTeams = () => {
  const { category } = useParams();
  const [teams, setTeams] = useState([]);
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('teams');

  useEffect(() => {
    fetchCategoryData();
  }, [category]);

  const fetchCategoryData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [teamsResponse, standingsResponse] = await Promise.all([
        teamsAPI.getByCategory(category),
        teamsAPI.getStandings(category)
      ]);

      setTeams(teamsResponse.data.data || []);
      setStandings(standingsResponse.data.data?.standings || []);
    } catch (err) {
      setError(`Error al cargar datos de ${category} división`);
      console.error('Error fetching category data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading message={`Cargando ${category} división...`} />;
  if (error) return <ErrorMessage message={error} onRetry={fetchCategoryData} />;

  return (
    <div className="container">
      <div className="page-header">
        <Link to="/equipos" className="back-link">← Volver a equipos</Link>
        <h1>{category} División</h1>
      </div>

      <div className="category-tabs">
        <button 
          className={`tab ${activeTab === 'teams' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('teams')}
        >
          Equipos ({teams.length})
        </button>
        <button 
          className={`tab ${activeTab === 'standings' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('standings')}
        >
          Tabla de Posiciones
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'teams' && (
          <div className="teams-grid">
            {teams.map(team => (
              <TeamCard key={team._id} team={team} detailed />
            ))}
          </div>
        )}

        {activeTab === 'standings' && (
          <div className="standings-table">
            {standings.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Pos</th>
                    <th>Equipo</th>
                    <th>PJ</th>
                    <th>G</th>
                    <th>E</th>
                    <th>P</th>
                    <th>GF</th>
                    <th>GC</th>
                    <th>DG</th>
                    <th>Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((standing, index) => (
                    <tr key={standing.team.id}>
                      <td className="position">{standing.position}</td>
                      <td className="team-name">
                        <Link to={`/equipos/${standing.team.id}`}>
                          {standing.team.name}
                        </Link>
                      </td>
                      <td>{standing.stats.matchesPlayed}</td>
                      <td>{standing.stats.wins}</td>
                      <td>{standing.stats.draws}</td>
                      <td>{standing.stats.losses}</td>
                      <td>{standing.stats.goalsFor}</td>
                      <td>{standing.stats.goalsAgainst}</td>
                      <td className={standing.goalDifference >= 0 ? 'positive' : 'negative'}>
                        {standing.goalDifference > 0 ? '+' : ''}{standing.goalDifference}
                      </td>
                      <td className="points">{standing.stats.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-data">
                <p>No hay datos de tabla de posiciones disponibles</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Detalle de un equipo específico
const TeamDetail = () => {
  const { teamId } = useParams();
  const [team, setTeam] = useState(null);
  const [roster, setRoster] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('roster');

  useEffect(() => {
    fetchTeamData();
  }, [teamId]);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [teamResponse, rosterResponse, statsResponse] = await Promise.all([
        teamsAPI.getById(teamId),
        teamsAPI.getRoster(teamId),
        teamsAPI.getStats(teamId)
      ]);

      setTeam(teamResponse.data.data);
      setRoster(rosterResponse.data.data);
      setStats(statsResponse.data.data);
    } catch (err) {
      setError('Error al cargar información del equipo');
      console.error('Error fetching team data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading message="Cargando equipo..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchTeamData} />;
  if (!team) return <ErrorMessage message="Equipo no encontrado" />;

  return (
    <div className="container">
      <div className="page-header">
        <Link to="/equipos" className="back-link">← Volver a equipos</Link>
        <div className="team-header">
          <h1>{team.name}</h1>
          <span className="team-category">{team.category} División</span>
        </div>
      </div>

      <div className="team-info-card">
        <div className="team-info-grid">
          <div className="info-item">
            <label>Entrenador</label>
            <span>{team.coach || 'No asignado'}</span>
          </div>
          <div className="info-item">
            <label>Estadio</label>
            <span>{team.stadium}</span>
          </div>
          <div className="info-item">
            <label>Jugadores</label>
            <span>{stats?.playersCount || 0}</span>
          </div>
          <div className="info-item">
            <label>Partidos Jugados</label>
            <span>{team.stats.matchesPlayed}</span>
          </div>
        </div>
      </div>

      <div className="team-tabs">
        <button 
          className={`tab ${activeTab === 'roster' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('roster')}
        >
          Plantel
        </button>
        <button 
          className={`tab ${activeTab === 'stats' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Estadísticas
        </button>
        <button 
          className={`tab ${activeTab === 'matches' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('matches')}
        >
          Partidos Recientes
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'roster' && roster && (
          <RosterView roster={roster} />
        )}

        {activeTab === 'stats' && (
          <TeamStatsView team={team} stats={stats} />
        )}

        {activeTab === 'matches' && stats?.recentMatches && (
          <RecentMatchesView matches={stats.recentMatches} teamId={teamId} />
        )}
      </div>
    </div>
  );
};

// Componente para mostrar el plantel
const RosterView = ({ roster }) => {
  const positions = [
    { key: 'arqueros', label: 'Arqueros', icon: '🥅' },
    { key: 'defensores', label: 'Defensores', icon: '🛡️' },
    { key: 'mediocampistas', label: 'Mediocampistas', icon: '⚽' },
    { key: 'delanteros', label: 'Delanteros', icon: '🎯' }
  ];

  return (
    <div className="roster-view">
      {positions.map(position => (
        <div key={position.key} className="position-group">
          <h3 className="position-title">
            <span className="position-icon">{position.icon}</span>
            {position.label} ({roster.roster[position.key]?.length || 0})
          </h3>
          <div className="players-grid">
            {roster.roster[position.key]?.map(player => (
              <div key={player._id} className="player-card">
                <div className="player-number">{player.jerseyNumber}</div>
                <div className="player-info">
                  <h4>{player.firstName} {player.lastName}</h4>
                  <p>Edad: {player.age || 'N/A'}</p>
                  <p>Estado: <span className={`status ${player.status.toLowerCase()}`}>{player.status}</span></p>
                </div>
              </div>
            )) || (
              <p className="no-players">No hay jugadores en esta posición</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Componente para mostrar estadísticas del equipo
const TeamStatsView = ({ team, stats }) => {
  const winPercentage = team.stats.matchesPlayed > 0 
    ? ((team.stats.wins / team.stats.matchesPlayed) * 100).toFixed(1)
    : 0;

  return (
    <div className="team-stats-view">
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Rendimiento General</h3>
          <div className="stat-item">
            <label>Partidos Jugados</label>
            <span>{team.stats.matchesPlayed}</span>
          </div>
          <div className="stat-item">
            <label>Victorias</label>
            <span className="wins">{team.stats.wins}</span>
          </div>
          <div className="stat-item">
            <label>Empates</label>
            <span className="draws">{team.stats.draws}</span>
          </div>
          <div className="stat-item">
            <label>Derrotas</label>
            <span className="losses">{team.stats.losses}</span>
          </div>
          <div className="stat-item">
            <label>% Victorias</label>
            <span>{winPercentage}%</span>
          </div>
        </div>

        <div className="stat-card">
          <h3>Goles</h3>
          <div className="stat-item">
            <label>Goles a Favor</label>
            <span className="goals-for">{team.stats.goalsFor}</span>
          </div>
          <div className="stat-item">
            <label>Goles en Contra</label>
            <span className="goals-against">{team.stats.goalsAgainst}</span>
          </div>
          <div className="stat-item">
            <label>Diferencia de Gol</label>
            <span className={team.goalDifference >= 0 ? 'positive' : 'negative'}>
              {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
            </span>
          </div>
          <div className="stat-item">
            <label>Promedio Goles/Partido</label>
            <span>
              {team.stats.matchesPlayed > 0 
                ? (team.stats.goalsFor / team.stats.matchesPlayed).toFixed(1)
                : '0.0'
              }
            </span>
          </div>
        </div>

        <div className="stat-card">
          <h3>Puntos</h3>
          <div className="stat-item">
            <label>Puntos Totales</label>
            <span className="points">{team.stats.points}</span>
          </div>
          <div className="stat-item">
            <label>Promedio Puntos/Partido</label>
            <span>
              {team.stats.matchesPlayed > 0 
                ? (team.stats.points / team.stats.matchesPlayed).toFixed(2)
                : '0.00'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para mostrar partidos recientes
const RecentMatchesView = ({ matches, teamId }) => {
  return (
    <div className="recent-matches-view">
      <h3>Últimos 5 Partidos</h3>
      {matches.length > 0 ? (
        <div className="matches-list">
          {matches.map(match => (
            <div key={match._id} className="match-item">
              <div className="match-teams">
                <span className={match.homeTeam._id === teamId ? 'team-highlight' : ''}>
                  {match.homeTeam.name}
                </span>
                <span className="match-score">
                  {match.score.home} - {match.score.away}
                </span>
                <span className={match.awayTeam._id === teamId ? 'team-highlight' : ''}>
                  {match.awayTeam.name}
                </span>
              </div>
              <div className="match-date">
                {new Date(match.date).toLocaleDateString('es-AR')}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-data">No hay partidos recientes</p>
      )}
    </div>
  );
};

// Componente de tarjeta de equipo
const TeamCard = ({ team, detailed = false }) => {
  return (
    <Link to={`/equipos/${team._id}`} className="team-card">
      <div className="team-card-header">
        <h3>{team.name}</h3>
        <span className="team-category">{team.category}</span>
      </div>
      
      {detailed && (
        <div className="team-card-body">
          <div className="team-stat">
            <label>Entrenador</label>
            <span>{team.coach || 'No asignado'}</span>
          </div>
          <div className="team-stats-row">
            <div className="stat">
              <span className="stat-value">{team.stats.matchesPlayed}</span>
              <span className="stat-label">PJ</span>
            </div>
            <div className="stat">
              <span className="stat-value">{team.stats.wins}</span>
              <span className="stat-label">G</span>
            </div>
            <div className="stat">
              <span className="stat-value">{team.stats.draws}</span>
              <span className="stat-label">E</span>
            </div>
            <div className="stat">
              <span className="stat-value">{team.stats.losses}</span>
              <span className="stat-label">P</span>
            </div>
            <div className="stat">
              <span className="stat-value">{team.stats.points}</span>
              <span className="stat-label">Pts</span>
            </div>
          </div>
        </div>
      )}
    </Link>
  );
};

export default Teams;
