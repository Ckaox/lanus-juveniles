import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { matchesAPI, goalsAPI, cardsAPI } from '../../services/api';
import Loading from '../../components/Common/Loading';
import ErrorMessage from '../../components/Common/ErrorMessage';
import './LiveMatches.css';

const LiveMatches = () => {
  const [liveMatches, setLiveMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(null);

  // Auto-refresh cada 30 segundos
  const REFRESH_INTERVAL = 30000;

  const fetchLiveMatches = useCallback(async () => {
    try {
      setError(null);
      const response = await matchesAPI.getLive();
      const matches = response.data.data || [];
      
      setLiveMatches(matches);
      
      // Si hay un partido seleccionado, actualizarlo
      if (selectedMatch) {
        const updatedMatch = matches.find(m => m._id === selectedMatch._id);
        if (updatedMatch) {
          setSelectedMatch(updatedMatch);
        } else {
          // El partido ya no está en vivo
          setSelectedMatch(null);
        }
      }
    } catch (err) {
      setError('Error al cargar partidos en vivo');
      console.error('Error fetching live matches:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedMatch]);

  useEffect(() => {
    fetchLiveMatches();
    
    // Configurar auto-refresh
    const interval = setInterval(fetchLiveMatches, REFRESH_INTERVAL);
    setRefreshInterval(interval);
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fetchLiveMatches]);

  const handleMatchSelect = (match) => {
    setSelectedMatch(match);
  };

  if (loading) return <Loading message="Cargando partidos en vivo..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchLiveMatches} />;

  return (
    <div className="live-matches-page">
      <div className="container">
        <div className="page-header">
          <h1>🔴 Partidos en Vivo</h1>
          <p>Seguimiento en tiempo real de todos los partidos</p>
          <div className="refresh-info">
            <span>Actualización automática cada 30 segundos</span>
            <button 
              className="btn btn-small btn-outline"
              onClick={fetchLiveMatches}
            >
              Actualizar ahora
            </button>
          </div>
        </div>

        {liveMatches.length === 0 ? (
          <div className="no-live-matches">
            <div className="no-live-icon">⚽</div>
            <h2>No hay partidos en vivo</h2>
            <p>Actualmente no hay partidos siendo jugados</p>
            <Link to="/partidos" className="btn btn-primary">
              Ver todos los partidos
            </Link>
          </div>
        ) : (
          <div className="live-matches-layout">
            {/* Lista de partidos en vivo */}
            <div className="live-matches-sidebar">
              <h3>Partidos en Vivo ({liveMatches.length})</h3>
              <div className="live-matches-list">
                {liveMatches.map(match => (
                  <LiveMatchCard 
                    key={match._id} 
                    match={match}
                    isSelected={selectedMatch?._id === match._id}
                    onSelect={() => handleMatchSelect(match)}
                  />
                ))}
              </div>
            </div>

            {/* Detalle del partido seleccionado */}
            <div className="live-match-detail">
              {selectedMatch ? (
                <LiveMatchDetail match={selectedMatch} />
              ) : (
                <div className="select-match-prompt">
                  <h3>Selecciona un partido</h3>
                  <p>Elige un partido de la lista para ver el seguimiento en vivo</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Tarjeta de partido en vivo (sidebar)
const LiveMatchCard = ({ match, isSelected, onSelect }) => {
  return (
    <div 
      className={`live-match-card ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
    >
      <div className="live-match-header">
        <span className="match-category">{match.category}</span>
        <span className="live-indicator">
          <span className="live-dot"></span>
          EN VIVO
        </span>
      </div>
      
      <div className="live-match-teams">
        <div className="team">
          <span className="team-name">{match.homeTeam.name}</span>
          <span className="team-score">{match.score.home}</span>
        </div>
        <div className="vs-separator">-</div>
        <div className="team">
          <span className="team-score">{match.score.away}</span>
          <span className="team-name">{match.awayTeam.name}</span>
        </div>
      </div>
      
      <div className="live-match-time">
        {match.time.minute}' - {match.time.period}
      </div>
    </div>
  );
};

// Detalle completo del partido en vivo
const LiveMatchDetail = ({ match }) => {
  const [events, setEvents] = useState({ goals: [], cards: [], events: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (match) {
      fetchMatchEvents();
    }
  }, [match]);

  const fetchMatchEvents = async () => {
    try {
      setLoading(true);
      const response = await matchesAPI.getEvents(match._id);
      setEvents(response.data.data);
    } catch (err) {
      console.error('Error fetching match events:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="live-match-detail-content">
      {/* Header del partido */}
      <div className="live-detail-header">
        <div className="match-info">
          <span className="category">{match.category} División</span>
          <span className="matchday">Fecha {match.matchday}</span>
        </div>
        
        <div className="teams-score">
          <div className="team-section home">
            <h2>{match.homeTeam.name}</h2>
            <div className="score">{match.score.home}</div>
          </div>
          
          <div className="match-status">
            <div className="time-display">
              <span className="minute">{match.time.minute}'</span>
              {match.time.extraTime > 0 && (
                <span className="extra-time">+{match.time.extraTime}</span>
              )}
            </div>
            <div className="period">{match.time.period}</div>
            <div className="live-badge">
              <span className="live-dot"></span>
              EN VIVO
            </div>
          </div>
          
          <div className="team-section away">
            <h2>{match.awayTeam.name}</h2>
            <div className="score">{match.score.away}</div>
          </div>
        </div>
      </div>

      {/* Eventos del partido */}
      <div className="live-events-section">
        <div className="section-header">
          <h3>Eventos del Partido</h3>
          <button 
            className="btn btn-small btn-outline"
            onClick={fetchMatchEvents}
            disabled={loading}
          >
            {loading ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>

        {events.events.length > 0 ? (
          <div className="events-timeline">
            {events.events
              .sort((a, b) => b.minute - a.minute) // Más recientes primero
              .map((event, index) => (
                <EventItem key={`${event.eventType}-${event._id}`} event={event} />
              ))
            }
          </div>
        ) : (
          <div className="no-events">
            <p>No hay eventos registrados aún</p>
          </div>
        )}
      </div>

      {/* Resumen de estadísticas */}
      <div className="live-stats-section">
        <h3>Estadísticas del Partido</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Goles</span>
            <div className="stat-values">
              <span>{match.score.home}</span>
              <span>-</span>
              <span>{match.score.away}</span>
            </div>
          </div>
          
          <div className="stat-item">
            <span className="stat-label">Tarjetas Amarillas</span>
            <div className="stat-values">
              <span>{events.cards.filter(c => c.type === 'Amarilla' && c.team._id === match.homeTeam._id).length}</span>
              <span>-</span>
              <span>{events.cards.filter(c => c.type === 'Amarilla' && c.team._id === match.awayTeam._id).length}</span>
            </div>
          </div>
          
          <div className="stat-item">
            <span className="stat-label">Tarjetas Rojas</span>
            <div className="stat-values">
              <span>{events.cards.filter(c => (c.type === 'Roja' || c.type === 'Doble Amarilla') && c.team._id === match.homeTeam._id).length}</span>
              <span>-</span>
              <span>{events.cards.filter(c => (c.type === 'Roja' || c.type === 'Doble Amarilla') && c.team._id === match.awayTeam._id).length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Link al detalle completo */}
      <div className="full-detail-link">
        <Link 
          to={`/partidos/${match._id}`}
          className="btn btn-primary"
        >
          Ver detalle completo del partido
        </Link>
      </div>
    </div>
  );
};

// Componente para mostrar un evento individual
const EventItem = ({ event }) => {
  const getEventIcon = () => {
    if (event.eventType === 'goal') {
      return '⚽';
    } else if (event.type === 'Amarilla') {
      return '🟨';
    } else {
      return '🟥';
    }
  };

  const getEventDescription = () => {
    if (event.eventType === 'goal') {
      let desc = `Gol de ${event.player.firstName} ${event.player.lastName}`;
      if (event.type !== 'Normal') {
        desc += ` (${event.type})`;
      }
      if (event.assistedBy) {
        desc += ` - Asistencia de ${event.assistedBy.firstName} ${event.assistedBy.lastName}`;
      }
      return desc;
    } else {
      return `Tarjeta ${event.type.toLowerCase()} para ${event.player.firstName} ${event.player.lastName} (${event.reason})`;
    }
  };

  return (
    <div className="event-item">
      <div className="event-time">
        {event.minute}'
        {event.extraTime > 0 && `+${event.extraTime}`}
      </div>
      
      <div className="event-icon">
        {getEventIcon()}
      </div>
      
      <div className="event-content">
        <div className="event-description">
          {getEventDescription()}
        </div>
        <div className="event-team">
          {event.team.name}
        </div>
      </div>
    </div>
  );
};

export default LiveMatches;
