import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home/Home';
import './App.css';

// Importar páginas (las crearemos después)
const Teams = React.lazy(() => import('./pages/Teams/Teams'));
const Matches = React.lazy(() => import('./pages/Matches/Matches'));
const LiveMatches = React.lazy(() => import('./pages/LiveMatches/LiveMatches'));
const Statistics = React.lazy(() => import('./pages/Statistics/Statistics'));
const Tables = React.lazy(() => import('./pages/Tables/Tables'));

function App() {
  return (
    <Router>
      <div className="App">
        <Layout>
          <React.Suspense fallback={<div className="loading-fallback">Cargando...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/equipos/*" element={<Teams />} />
              <Route path="/partidos/*" element={<Matches />} />
              <Route path="/en-vivo" element={<LiveMatches />} />
              <Route path="/estadisticas/*" element={<Statistics />} />
              <Route path="/tablas/*" element={<Tables />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </React.Suspense>
        </Layout>
      </div>
    </Router>
  );
}

// Componente 404
const NotFound = () => (
  <div style={{ textAlign: 'center', padding: '3rem' }}>
    <h2>Página no encontrada</h2>
    <p>La página que buscas no existe.</p>
    <a href="/" style={{ color: '#800000' }}>Volver al inicio</a>
  </div>
);

export default App;
