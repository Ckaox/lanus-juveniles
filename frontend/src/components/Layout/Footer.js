import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Lanús Juveniles</h3>
            <p>Sistema de gestión para las divisiones inferiores del Club Atlético Lanús</p>
          </div>
          
          <div className="footer-section">
            <h4>Categorías</h4>
            <ul>
              <li>4ta División</li>
              <li>5ta División</li>
              <li>6ta División</li>
              <li>7ma División</li>
              <li>8va División</li>
              <li>9na División</li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Enlaces</h4>
            <ul>
              <li><a href="#equipos">Equipos</a></li>
              <li><a href="#partidos">Partidos</a></li>
              <li><a href="#estadisticas">Estadísticas</a></li>
              <li><a href="#tablas">Tablas de Posiciones</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Club Atlético Lanús</h4>
            <p>Estadio Ciudad de Lanús - Néstor Díaz Pérez</p>
            <p>Av. Eva Perón 1510, Lanús Este</p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 Lanús Juveniles. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
