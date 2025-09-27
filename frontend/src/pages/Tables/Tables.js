import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useParams } from 'react-router-dom';
import { teamsAPI } from '../../services/api';
import Loading from '../../components/Common/Loading';
import ErrorMessage from '../../components/Common/ErrorMessage';
import './Tables.css';

const Tables = () => {
  return (
    <div className="tables-page">
      <Routes>
        <Route path="/" element={<TablesOverview />} />
        <Route path="/:category" element={<CategoryTable />} />
      </Routes>
    </div>
  );
};

// Vista general de todas las tablas
const TablesOverview = () => {
  const [tablesByCategory, setTablesByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = ['4ta', '5ta', '6ta', '7ma', '8va', '9na'];

  useEffect(() => {
    fetchAllTables();
  }, []);

  const fetchAllTables = async () => {
    try {
      setLoading(true);
      setError(null);

      const promises = categories.map(category => 
        teamsAPI.getStandings(category)
      );

      const responses = await Promise.all(promises);
      
      const tablesData = {};
      responses.forEach((response, index) => {
        tablesData[categories[index]] = response.data.data?.standings || [];
      });

      setTablesByCategory(tablesData);
    } catch (err) {
      setError('Error al cargar las tablas de posiciones');
      console.error('Error fetching tables:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading message="Cargando tablas de posiciones..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchAllTables} />;

  return (
    <div className="container">
      <div className="page-header">
        <h1>🏆 Tablas de Posiciones</h1>
        <p>Clasificaciones de todas las categorías de divisiones inferiores</p>
      </div>

      {/* Navegación rápida */}
      <div className="categories-nav">
        {categories.map(category => (
          <Link 
            key={category}
            to={`/tablas/${category}`}
            className="category-nav-btn"
          >
            {category} División
          </Link>
        ))}
      </div>

      {/* Resumen de tablas */}
      <div className="tables-overview-grid">
        {categories.map(category => (
          <div key={category} className="table-summary-card">
            <div className="table-header">
              <h2>{category} División</h2>
              <Link 
                to={`/tablas/${category}`}
                className="view-full-table-btn"
              >
                Ver tabla completa
              </Link>
            </div>
            
            {tablesByCategory[category]?.length > 0 ? (
              <div className="mini-table">
                <div className="mini-table-header">
                  <span>Pos</span>
                  <span>Equipo</span>
                  <span>PJ</span>
                  <span>Pts</span>
                </div>
                {tablesByCategory[category].slice(0, 5).map((standing) => (
                  <div key={standing.team.id} className="mini-table-row">
                    <span className="position">{standing.position}</span>
                    <span className="team-name">{standing.team.name}</span>
                    <span className="matches">{standing.stats.matchesPlayed}</span>
                    <span className="points">{standing.stats.points}</span>
                  </div>
                ))}
                {tablesByCategory[category].length > 5 && (
                  <div className="more-teams">
                    +{tablesByCategory[category].length - 5} equipos más
                  </div>
                )}
              </div>
            ) : (
              <div className="no-data-mini">
                <p>No hay datos disponibles</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Estadísticas generales */}
      <div className="general-stats">
        <h2>Estadísticas Generales</h2>
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-value">
              {Object.values(tablesByCategory).reduce((total, table) => total + table.length, 0)}
            </div>
            <div className="stat-label">Equipos Totales</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">
              {Object.values(tablesByCategory).reduce((total, table) => 
                total + table.reduce((sum, team) => sum + team.stats.matchesPlayed, 0), 0
              )}
            </div>
            <div className="stat-label">Partidos Jugados</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">
              {Object.values(tablesByCategory).reduce((total, table) => 
                total + table.reduce((sum, team) => sum + team.stats.goalsFor, 0), 0
              )}
            </div>
            <div className="stat-label">Goles Totales</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">{categories.length}</div>
            <div className="stat-label">Categorías</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Vista detallada de una categoría específica
const CategoryTable = () => {
  const { category } = useParams();
  const [standings, setStandings] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('table');

  useEffect(() => {
    fetchCategoryData();
  }, [category]);

  const fetchCategoryData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [standingsResponse, teamsResponse] = await Promise.all([
        teamsAPI.getStandings(category),
        teamsAPI.getByCategory(category)
      ]);

      setStandings(standingsResponse.data.data?.standings || []);
      setTeams(teamsResponse.data.data || []);
    } catch (err) {
      setError(`Error al cargar datos de ${category} división`);
      console.error('Error fetching category data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading message={`Cargando tabla de ${category} división...`} />;
  if (error) return <ErrorMessage message={error} onRetry={fetchCategoryData} />;

  const categoryStats = standings.reduce((acc, standing) => {
    acc.totalMatches += standing.stats.matchesPlayed;
    acc.totalGoals += standing.stats.goalsFor;
    acc.totalTeams += 1;
    return acc;
  }, { totalMatches: 0, totalGoals: 0, totalTeams: 0 });

  return (
    <div className="container">
      <div className="page-header">
        <Link to="/tablas" className="back-link">← Volver a tablas</Link>
        <h1>{category} División - Tabla de Posiciones</h1>
      </div>

      {/* Estadísticas de la categoría */}
      <div className="category-stats">
        <div className="stat-item">
          <span className="stat-number">{categoryStats.totalTeams}</span>
          <span className="stat-text">Equipos</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{categoryStats.totalMatches}</span>
          <span className="stat-text">Partidos</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{categoryStats.totalGoals}</span>
          <span className="stat-text">Goles</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {categoryStats.totalMatches > 0 ? (categoryStats.totalGoals / categoryStats.totalMatches).toFixed(1) : '0.0'}
          </span>
          <span className="stat-text">Goles/Partido</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="table-tabs">
        <button 
          className={`tab ${activeView === 'table' ? 'tab-active' : ''}`}
          onClick={() => setActiveView('table')}
        >
          Tabla de Posiciones
        </button>
        <button 
          className={`tab ${activeView === 'form' ? 'tab-active' : ''}`}
          onClick={() => setActiveView('form')}
        >
          Tabla de Forma
        </button>
        <button 
          className={`tab ${activeView === 'stats' ? 'tab-active' : ''}`}
          onClick={() => setActiveView('stats')}
        >
          Estadísticas Detalladas
        </button>
      </div>

      {/* Contenido de tabs */}
      <div className="tab-content">
        {activeView === 'table' && (
          <StandingsTable standings={standings} />
        )}

        {activeView === 'form' && (
          <FormTable teams={teams} />
        )}

        {activeView === 'stats' && (
          <DetailedStats standings={standings} />
        )}
      </div>
    </div>
  );
};

// Componente de tabla de posiciones
const StandingsTable = ({ standings }) => {
  if (standings.length === 0) {
    return (
      <div className="no-data">
        <p>No hay datos de tabla de posiciones disponibles</p>
      </div>
    );
  }

  return (
    <div className="standings-table-container">
      <table className="table standings-table">
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
            <th>%</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((standing, index) => {
            const winPercentage = standing.stats.matchesPlayed > 0 
              ? ((standing.stats.wins / standing.stats.matchesPlayed) * 100).toFixed(1)
              : 0;

            let positionClass = '';
            if (index === 0) positionClass = 'champion';
            else if (index <= 2) positionClass = 'promotion';
            else if (index >= standings.length - 2) positionClass = 'relegation';

            return (
              <tr key={standing.team.id} className={positionClass}>
                <td className="position-cell">
                  <span className="position-number">{standing.position}</span>
                </td>
                <td className="team-cell">
                  <Link to={`/equipos/${standing.team.id}`} className="team-link">
                    <span className="team-name">{standing.team.name}</span>
                  </Link>
                </td>
                <td>{standing.stats.matchesPlayed}</td>
                <td className="wins">{standing.stats.wins}</td>
                <td className="draws">{standing.stats.draws}</td>
                <td className="losses">{standing.stats.losses}</td>
                <td className="goals-for">{standing.stats.goalsFor}</td>
                <td className="goals-against">{standing.stats.goalsAgainst}</td>
                <td className={`goal-difference ${standing.goalDifference >= 0 ? 'positive' : 'negative'}`}>
                  {standing.goalDifference > 0 ? '+' : ''}{standing.goalDifference}
                </td>
                <td className="points">{standing.stats.points}</td>
                <td className="percentage">{winPercentage}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Leyenda */}
      <div className="table-legend">
        <div className="legend-item champion">
          <span className="legend-color"></span>
          <span>Campeón</span>
        </div>
        <div className="legend-item promotion">
          <span className="legend-color"></span>
          <span>Clasificación</span>
        </div>
        <div className="legend-item relegation">
          <span className="legend-color"></span>
          <span>Descenso</span>
        </div>
      </div>
    </div>
  );
};

// Componente de tabla de forma (últimos 5 partidos)
const FormTable = ({ teams }) => {
  return (
    <div className="form-table-container">
      <div className="form-info">
        <h3>Tabla de Forma - Últimos 5 Partidos</h3>
        <p>Rendimiento de cada equipo en sus últimos encuentros</p>
      </div>
      
      <div className="form-grid">
        {teams.map(team => (
          <div key={team._id} className="form-card">
            <div className="form-header">
              <h4>{team.name}</h4>
              <span className="current-position">Pos: {team.stats.position || 'N/A'}</span>
            </div>
            
            <div className="form-stats">
              <div className="stat">
                <span className="value">{team.stats.points}</span>
                <span className="label">Pts</span>
              </div>
              <div className="stat">
                <span className="value">{team.stats.matchesPlayed}</span>
                <span className="label">PJ</span>
              </div>
            </div>
            
            {/* Simulación de forma - en una implementación real vendría del backend */}
            <div className="recent-form">
              <span className="form-label">Últimos 5:</span>
              <div className="form-results">
                {/* Esto sería dinámico basado en los últimos partidos */}
                <span className="result win">G</span>
                <span className="result draw">E</span>
                <span className="result win">G</span>
                <span className="result loss">P</span>
                <span className="result win">G</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente de estadísticas detalladas
const DetailedStats = ({ standings }) => {
  const topStats = {
    bestAttack: standings.reduce((best, current) => 
      current.stats.goalsFor > best.stats.goalsFor ? current : best, standings[0] || {}),
    bestDefense: standings.reduce((best, current) => 
      current.stats.goalsAgainst < best.stats.goalsAgainst ? current : best, standings[0] || {}),
    mostWins: standings.reduce((best, current) => 
      current.stats.wins > best.stats.wins ? current : best, standings[0] || {}),
    fewestLosses: standings.reduce((best, current) => 
      current.stats.losses < best.stats.losses ? current : best, standings[0] || {})
  };

  return (
    <div className="detailed-stats-container">
      <div className="stats-highlights">
        <h3>Destacados de la Categoría</h3>
        <div className="highlights-grid">
          <div className="highlight-card">
            <div className="highlight-icon">⚽</div>
            <div className="highlight-content">
              <h4>Mejor Ataque</h4>
              <p>{topStats.bestAttack.team?.name}</p>
              <span>{topStats.bestAttack.stats?.goalsFor} goles</span>
            </div>
          </div>
          
          <div className="highlight-card">
            <div className="highlight-icon">🛡️</div>
            <div className="highlight-content">
              <h4>Mejor Defensa</h4>
              <p>{topStats.bestDefense.team?.name}</p>
              <span>{topStats.bestDefense.stats?.goalsAgainst} goles recibidos</span>
            </div>
          </div>
          
          <div className="highlight-card">
            <div className="highlight-icon">🏆</div>
            <div className="highlight-content">
              <h4>Más Victorias</h4>
              <p>{topStats.mostWins.team?.name}</p>
              <span>{topStats.mostWins.stats?.wins} victorias</span>
            </div>
          </div>
          
          <div className="highlight-card">
            <div className="highlight-icon">💪</div>
            <div className="highlight-content">
              <h4>Menos Derrotas</h4>
              <p>{topStats.fewestLosses.team?.name}</p>
              <span>{topStats.fewestLosses.stats?.losses} derrotas</span>
            </div>
          </div>
        </div>
      </div>

      <div className="comparison-stats">
        <h3>Comparación de Equipos</h3>
        <div className="comparison-table">
          <table className="table">
            <thead>
              <tr>
                <th>Equipo</th>
                <th>Eficiencia Ofensiva</th>
                <th>Eficiencia Defensiva</th>
                <th>Promedio Goles/Partido</th>
                <th>Promedio Puntos/Partido</th>
              </tr>
            </thead>
            <tbody>
              {standings.map(standing => {
                const goalsPerMatch = standing.stats.matchesPlayed > 0 
                  ? (standing.stats.goalsFor / standing.stats.matchesPlayed).toFixed(2)
                  : '0.00';
                const pointsPerMatch = standing.stats.matchesPlayed > 0 
                  ? (standing.stats.points / standing.stats.matchesPlayed).toFixed(2)
                  : '0.00';
                const offensiveEff = standing.stats.matchesPlayed > 0 
                  ? ((standing.stats.goalsFor / standing.stats.matchesPlayed) * 100).toFixed(1)
                  : '0.0';
                const defensiveEff = standing.stats.matchesPlayed > 0 
                  ? (100 - (standing.stats.goalsAgainst / standing.stats.matchesPlayed) * 100).toFixed(1)
                  : '100.0';

                return (
                  <tr key={standing.team.id}>
                    <td className="team-name">{standing.team.name}</td>
                    <td>{offensiveEff}%</td>
                    <td>{defensiveEff}%</td>
                    <td>{goalsPerMatch}</td>
                    <td>{pointsPerMatch}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Tables;
