import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="header-logo">
          <h1>Lanús Juveniles</h1>
          <span>Inferiores Granates</span>
        </Link>

        <nav className={`header-nav ${isMenuOpen ? 'header-nav--open' : ''}`}>
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') && location.pathname === '/' ? 'nav-link--active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Inicio
          </Link>
          <Link 
            to="/equipos" 
            className={`nav-link ${isActive('/equipos') ? 'nav-link--active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Equipos
          </Link>
          <Link 
            to="/partidos" 
            className={`nav-link ${isActive('/partidos') ? 'nav-link--active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Partidos
          </Link>
          <Link 
            to="/en-vivo" 
            className={`nav-link ${isActive('/en-vivo') ? 'nav-link--active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            En Vivo
          </Link>
          <Link 
            to="/estadisticas" 
            className={`nav-link ${isActive('/estadisticas') ? 'nav-link--active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Estadísticas
          </Link>
          <Link 
            to="/tablas" 
            className={`nav-link ${isActive('/tablas') ? 'nav-link--active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Tablas
          </Link>
        </nav>

        <button 
          className="header-menu-toggle"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  );
};

export default Header;
