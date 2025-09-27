import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useParams, useSearchParams } from 'react-router-dom';
import { matchesAPI, goalsAPI, cardsAPI } from '../../services/api';
import Loading from '../../components/Common/Loading';
import ErrorMessage from '../../components/Common/ErrorMessage';
import './Matches.css';

const Matches = () => {
  return (
    <div className="matches-page">
      <Routes>
        <Route path="/" element={<MatchesOverview />} />
        <Route path="/:matchId" element={<MatchDetail />} />
      </Routes>
    </div>
  );
};

// Vista general de partidos
const MatchesOverview = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  
  // Filtros
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    category: searchParams.get('category') || '',
    date: searchParams.get('date') || '',
    page: parseInt(searchParams.get('page')) || 1
  });

  const categories = ['4ta', '5ta', '6ta', '7ma', '8va', '9na'];
  const statuses = [
    { value: '', label: 'Todos los estados' },
    { value: 'Programado', label: 'Programados' },
    { value: 'En Vivo', label: 'En Vivo' },
    { value: 'Finalizado', label: 'Finalizados' },
    { value: 'Suspendido', label: 'Suspendidos' },
    { value: 'Cancelado', label: 'Cancelados' }
  ];

  useEffect(() => {
    fetchMatches();
  }, [filters]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        ...filters,
        limit: 12
      };

      // Limpiar parámetros vacíos
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const response = await matchesAPI.getAll(params);
      setMatches(response.data.data || []);
      setPagination(response.data.pagination || {});
    } catch (err) {
      setError('Error al cargar los partidos');
      console.error('Error fetching matches:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    
    // Actualizar URL
    const newSearchParams = new URLSearchParams();
    Object.keys(newFilters).forEach(k => {
      if (newFilters[k]) newSearchParams.set(k, newFilters[k]);
    });
    setSearchParams(newSearchParams);
  };

  const handlePageChange = (page) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', page);
    setSearchParams(newSearchParams);
  };

  if (loading) return <Loading message="Cargando partidos..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchMatches} />;

  return (
    <div className="container">
      <div className="page-header">
        <h1>Partidos</h1>
        <p>Todos los partidos de las divisiones inferiores</p>
      </div>

      {/* Filtros */}
      <div className="filters-section">
        <div className="filters-grid">
          <div className="filter-group">
            <label>Estado</label>
            <select 
              className="form-control form-select"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              {statuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

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
            <label>Fecha</label>
            <input 
              type="date"
              className="form-control"
              value={filters.date}
              onChange={(e) => handleFilterChange('date', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <button 
              className="btn btn-secondary"
              onClick={() => {
                setFilters({ status: '', category: '', date: '', page: 1 });
                setSearchParams(new URLSearchParams());
              }}
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Lista de partidos */}
      {matches.length > 0 ? (
        <>
          <div className="matches-grid">
            {matches.map(match => (
              <MatchCard key={match._id} match={match} />
            ))}
          </div>

          {/* Paginación */}
          {pagination.pages > 1 && (
            <div className="pagination">
              <button 
                className="btn btn-secondary"
                disabled={filters.page <= 1}
                onClick={() => handlePageChange(filters.page - 1)}
              >
                Anterior
              </button>
              
              <span className="pagination-info">
                Página {pagination.current} de {pagination.pages}
              </span>
              
              <button 
                className="btn btn-secondary"
                disabled={filters.page >= pagination.pages}
                onClick={() => handlePageChange(filters.page + 1)}
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="no-data">
          <h3>No se encontraron partidos</h3>
          <p>Intenta cambiar los filtros para ver más resultados</p>
        </div>
      )}
    </div>
  );
};

// Detalle de un partido específico
const MatchDetail = () => {
  const { matchId } = useParams();
  const [match, setMatch] = useState(null);
  const [events, setEvents] = useState({ goals: [], cards: [], events: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMatchData();
  }, [matchId]);

  const fetchMatchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [matchResponse, eventsResponse] = await Promise.all([
        matchesAPI.getById(matchId),
        matchesAPI.getEvents(matchId)
      ]);

      setMatch(matchResponse.data.data);
      setEvents(eventsResponse.data.data);
    } catch (err) {
      setError('Error al cargar información del partido');
      console.error('Error fetching match data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading message="Cargando partido..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchMatchData} />;
  if (!match) return <ErrorMessage message="Partido no encontrado" />;

  return (
    <div className="container">
      <div className="page-header">
        <Link to="/partidos" className="back-link">← Volver a partidos</Link>
      </div>

      <MatchDetailView match={match} events={events} />
    </div>
  );
};

// Componente de tarjeta de partido
const MatchCard = ({ match }) => {
  const getStatusClass = (status) => {
    switch (status) {
      case 'En Vivo': return 'status-live';
      case 'Finalizado': return 'status-finished';
      case 'Programado': return 'status-scheduled';
      case 'Suspendido': return 'status-suspended';
      case 'Cancelado': return 'status-cancelled';
      default: return '';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-AR', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Link to={`/partidos/${match._id}`} className="match-card">
      <div className="match-header">
        <span className="match-category">{match.category} División</span>
        <span className={`match-status ${getStatusClass(match.status)}`}>
          {match.status}
        </span>
      </div>

      <div className="match-teams">
        <div className="team home-team">
          <h3>{match.homeTeam.name}</h3>
          <span className="team-category">{match.homeTeam.category}</span>
        </div>

        <div className="match-score-section">
          {match.status === 'Finalizado' || match.status === 'En Vivo' ? (
            <div className="match-score">
              <span className="score">{match.score.home} - {match.score.away}</span>
              {match.status === 'En Vivo' && (
                <span className="match-time">{match.time.minute}'</span>
              )}
            </div>
          ) : (
            <div className="match-vs">VS</div>
          )}
        </div>

        <div className="team away-team">
          <h3>{match.awayTeam.name}</h3>
          <span className="team-category">{match.awayTeam.category}</span>
        </div>
      </div>

      <div className="match-info">
        <div className="match-date">
          <span>{formatDate(match.date)}</span>
          <span>{formatTime(match.date)}</span>
        </div>
        <div className="match-venue">
          {match.venue}
        </div>
      </div>

      {match.status === 'En Vivo' && (
        <div className="live-indicator">
          <span className="live-dot"></span>
          EN VIVO
        </div>
      )}
    </Link>
  );
};

// Vista detallada del partido
const MatchDetailView = ({ match, events }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="match-detail">
      {/* Header del partido */}
      <div className="match-detail-header">
        <div className="match-title">
          <span className="match-category">{match.category} División</span>
          <span className={`match-status ${match.status.toLowerCase().replace(' ', '-')}`}>
            {match.status}
          </span>
        </div>

        <div className="match-teams-detail">
          <div className="team-detail home">
            <h2>{match.homeTeam.name}</h2>
            <span className="team-category">{match.homeTeam.category}</span>
          </div>

          <div className="score-detail">
            {match.status === 'Finalizado' || match.status === 'En Vivo' ? (
              <>
                <div className="score-display">
                  <span className="score-home">{match.score.home}</span>
                  <span className="score-separator">-</span>
                  <span className="score-away">{match.score.away}</span>
                </div>
                {match.status === 'En Vivo' && (
                  <div className="match-time-detail">
                    <span>{match.time.minute}'</span>
                    <span className="period">{match.time.period}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="vs-detail">VS</div>
            )}
          </div>

          <div className="team-detail away">
            <h2>{match.awayTeam.name}</h2>
            <span className="team-category">{match.awayTeam.category}</span>
          </div>
        </div>

        <div className="match-meta">
          <div className="meta-item">
            <span className="meta-label">Fecha:</span>
            <span>{formatDate(match.date)} - {formatTime(match.date)}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Estadio:</span>
            <span>{match.venue}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Fecha:</span>
            <span>Fecha {match.matchday}</span>
          </div>
          {match.referee?.main && (
            <div className="meta-item">
              <span className="meta-label">Árbitro:</span>
              <span>{match.referee.main}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="match-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Resumen
        </button>
        <button 
          className={`tab ${activeTab === 'events' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          Eventos ({events.events.length})
        </button>
        <button 
          className={`tab ${activeTab === 'stats' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Estadísticas
        </button>
      </div>

      {/* Contenido de tabs */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <MatchOverview match={match} events={events} />
        )}

        {activeTab === 'events' && (
          <MatchEvents events={events} />
        )}

        {activeTab === 'stats' && (
          <MatchStats match={match} />
        )}
      </div>
    </div>
  );
};

// Resumen del partido
const MatchOverview = ({ match, events }) => {
  return (
    <div className="match-overview">
      <div className="overview-grid">
        {/* Goles */}
        {events.goals.length > 0 && (
          <div className="overview-section">
            <h3>⚽ Goles</h3>
            <div className="goals-list">
              {events.goals.map(goal => (
                <div key={goal._id} className="goal-item">
                  <span className="goal-time">{goal.minute}'</span>
                  <span className="goal-player">{goal.player.firstName} {goal.player.lastName}</span>
                  <span className="goal-team">({goal.team.name})</span>
                  {goal.type !== 'Normal' && (
                    <span className="goal-type">{goal.type}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tarjetas */}
        {events.cards.length > 0 && (
          <div className="overview-section">
            <h3>🟨🟥 Tarjetas</h3>
            <div className="cards-list">
              {events.cards.map(card => (
                <div key={card._id} className="card-item">
                  <span className="card-time">{card.minute}'</span>
                  <span className={`card-type ${card.type.toLowerCase().replace(' ', '-')}`}>
                    {card.type === 'Amarilla' ? '🟨' : '🟥'}
                  </span>
                  <span className="card-player">{card.player.firstName} {card.player.lastName}</span>
                  <span className="card-team">({card.team.name})</span>
                  <span className="card-reason">{card.reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Información adicional */}
        <div className="overview-section">
          <h3>ℹ️ Información del Partido</h3>
          <div className="match-info-grid">
            <div className="info-row">
              <span>Estado:</span>
              <span className={`status ${match.status.toLowerCase().replace(' ', '-')}`}>
                {match.status}
              </span>
            </div>
            <div className="info-row">
              <span>Categoría:</span>
              <span>{match.category} División</span>
            </div>
            <div className="info-row">
              <span>Fecha:</span>
              <span>Fecha {match.matchday}</span>
            </div>
            {match.weather?.condition && (
              <div className="info-row">
                <span>Clima:</span>
                <span>{match.weather.condition}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Eventos del partido
const MatchEvents = ({ events }) => {
  if (events.events.length === 0) {
    return (
      <div className="no-data">
        <p>No hay eventos registrados en este partido</p>
      </div>
    );
  }

  return (
    <div className="match-events">
      <div className="events-timeline">
        {events.events.map((event, index) => (
          <div key={`${event.eventType}-${event._id}`} className="event-item">
            <div className="event-time">
              {event.minute}'
              {event.extraTime > 0 && `+${event.extraTime}`}
            </div>
            
            <div className="event-icon">
              {event.eventType === 'goal' ? '⚽' : 
               event.type === 'Amarilla' ? '🟨' : '🟥'}
            </div>
            
            <div className="event-details">
              <div className="event-player">
                {event.player.firstName} {event.player.lastName}
              </div>
              <div className="event-team">
                {event.team.name}
              </div>
              {event.eventType === 'goal' && event.type !== 'Normal' && (
                <div className="event-type">{event.type}</div>
              )}
              {event.eventType === 'card' && (
                <div className="event-reason">{event.reason}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Estadísticas del partido
const MatchStats = ({ match }) => {
  return (
    <div className="match-stats">
      <div className="stats-comparison">
        <div className="team-stats">
          <h4>{match.homeTeam.name}</h4>
          <div className="stat-item">
            <span className="stat-value">{match.score.home}</span>
            <span className="stat-label">Goles</span>
            <span className="stat-value">{match.score.away}</span>
          </div>
        </div>
        
        <div className="vs-separator">VS</div>
        
        <div className="team-stats">
          <h4>{match.awayTeam.name}</h4>
        </div>
      </div>
      
      {match.stats?.attendance && (
        <div className="additional-stats">
          <div className="stat-row">
            <span>Asistencia:</span>
            <span>{match.stats.attendance} personas</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Matches;
