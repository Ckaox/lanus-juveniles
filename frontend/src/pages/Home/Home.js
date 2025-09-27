import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { matchesAPI, teamsAPI } from '../../services/api';
import Loading from '../../components/Common/Loading';
import ErrorMessage from '../../components/Common/ErrorMessage';
import './Home.css';

const Home = () => {
  const [liveMatches, setLiveMatches] = useState([]);
  const [recentMatches, setRecentMatches] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [liveResponse, recentResponse, upcomingResponse] = await Promise.all([
        matchesAPI.getLive(),
        matchesAPI.getAll({ status: 'Finalizado', limit: 5 }),
        matchesAPI.getAll({ status: 'Programado', limit: 5 })
      ]);

      setLiveMatches(liveResponse.data.data || []);
      setRecentMatches(recentResponse.data.data || []);
      setUpcomingMatches(upcomingResponse.data.data || []);
    } catch (err) {
      setError('Error al cargar los datos del inicio');
      console.error('Error fetching home data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading message="Cargando información..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchHomeData} />;

  return (
    <div className="home">
      <div className="container">
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-content">
            <h1>Bienvenido a Lanús Juveniles</h1>
            <p>Seguí todos los partidos, resultados y estadísticas de las divisiones inferiores del Granate</p>
            <div className="hero-buttons">
              <Link to="/partidos" className="btn btn-primary">Ver Partidos</Link>
              <Link to="/equipos" className="btn btn-secondary">Ver Equipos</Link>
            </div>
          </div>
        </section>

        {/* Live Matches */}
        {liveMatches.length > 0 && (
          <section className="section">
            <div className="section-header">
              <h2>🔴 Partidos en Vivo</h2>
              <Link to="/en-vivo" className="section-link">Ver todos</Link>
            </div>
            <div className="matches-grid">
              {liveMatches.map(match => (
                <div key={match._id} className="match-card live-match">
                  <div className="match-teams">
                    <div className="team">
                      <span className="team-name">{match.homeTeam.name}</span>
                      <span className="team-category">{match.homeTeam.category}</span>
                    </div>
                    <div className="match-score">
                      <span className="score">{match.score.home} - {match.score.away}</span>
                      <span className="match-time">{match.time.minute}'</span>
                    </div>
                    <div className="team">
                      <span className="team-name">{match.awayTeam.name}</span>
                      <span className="team-category">{match.awayTeam.category}</span>
                    </div>
                  </div>
                  <div className="match-status">
                    <span className="live-indicator">EN VIVO</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recent Matches */}
        <section className="section">
          <div className="section-header">
            <h2>Últimos Resultados</h2>
            <Link to="/partidos?status=Finalizado" className="section-link">Ver todos</Link>
          </div>
          {recentMatches.length > 0 ? (
            <div className="matches-grid">
              {recentMatches.map(match => (
                <div key={match._id} className="match-card">
                  <div className="match-teams">
                    <div className="team">
                      <span className="team-name">{match.homeTeam.name}</span>
                      <span className="team-category">{match.homeTeam.category}</span>
                    </div>
                    <div className="match-score">
                      <span className="score">{match.score.home} - {match.score.away}</span>
                    </div>
                    <div className="team">
                      <span className="team-name">{match.awayTeam.name}</span>
                      <span className="team-category">{match.awayTeam.category}</span>
                    </div>
                  </div>
                  <div className="match-date">
                    {new Date(match.date).toLocaleDateString('es-AR')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No hay resultados recientes</p>
          )}
        </section>

        {/* Upcoming Matches */}
        <section className="section">
          <div className="section-header">
            <h2>Próximos Partidos</h2>
            <Link to="/partidos?status=Programado" className="section-link">Ver todos</Link>
          </div>
          {upcomingMatches.length > 0 ? (
            <div className="matches-grid">
              {upcomingMatches.map(match => (
                <div key={match._id} className="match-card upcoming-match">
                  <div className="match-teams">
                    <div className="team">
                      <span className="team-name">{match.homeTeam.name}</span>
                      <span className="team-category">{match.homeTeam.category}</span>
                    </div>
                    <div className="match-vs">VS</div>
                    <div className="team">
                      <span className="team-name">{match.awayTeam.name}</span>
                      <span className="team-category">{match.awayTeam.category}</span>
                    </div>
                  </div>
                  <div className="match-date">
                    {new Date(match.date).toLocaleDateString('es-AR')} - {new Date(match.date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No hay partidos programados</p>
          )}
        </section>

        {/* Quick Links */}
        <section className="section">
          <h2>Accesos Rápidos</h2>
          <div className="quick-links">
            <Link to="/equipos" className="quick-link">
              <div className="quick-link-icon">👥</div>
              <h3>Equipos</h3>
              <p>Ver todos los equipos por categoría</p>
            </Link>
            <Link to="/estadisticas" className="quick-link">
              <div className="quick-link-icon">📊</div>
              <h3>Estadísticas</h3>
              <p>Estadísticas de jugadores y equipos</p>
            </Link>
            <Link to="/tablas" className="quick-link">
              <div className="quick-link-icon">🏆</div>
              <h3>Tablas</h3>
              <p>Posiciones por categoría</p>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
