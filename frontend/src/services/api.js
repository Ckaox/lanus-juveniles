import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

// Configurar axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Teams API
export const teamsAPI = {
  getAll: (params = {}) => api.get('/teams', { params }),
  getById: (id) => api.get(`/teams/${id}`),
  getByCategory: (category) => api.get(`/teams/category/${category}`),
  getStandings: (category) => api.get(`/teams/category/${category}/standings`),
  getRoster: (id) => api.get(`/teams/${id}/roster`),
  getStats: (id) => api.get(`/teams/${id}/stats`),
  create: (data) => api.post('/teams', data),
  update: (id, data) => api.put(`/teams/${id}`, data),
  delete: (id) => api.delete(`/teams/${id}`),
};

// Players API
export const playersAPI = {
  getAll: (params = {}) => api.get('/players', { params }),
  getById: (id) => api.get(`/players/${id}`),
  getByTeam: (teamId) => api.get(`/players/team/${teamId}`),
  getStats: (id) => api.get(`/players/${id}/stats`),
  create: (data) => api.post('/players', data),
  update: (id, data) => api.put(`/players/${id}`, data),
  delete: (id) => api.delete(`/players/${id}`),
};

// Matches API
export const matchesAPI = {
  getAll: (params = {}) => api.get('/matches', { params }),
  getById: (id) => api.get(`/matches/${id}`),
  getLive: (params = {}) => api.get('/matches/live', { params }),
  getEvents: (id) => api.get(`/matches/${id}/events`),
  create: (data) => api.post('/matches', data),
  update: (id, data) => api.put(`/matches/${id}`, data),
  start: (id) => api.patch(`/matches/${id}/start`),
  finish: (id) => api.patch(`/matches/${id}/finish`),
  updateTime: (id, data) => api.patch(`/matches/${id}/time`, data),
};

// Goals API
export const goalsAPI = {
  create: (data) => api.post('/goals', data),
  getByMatch: (matchId) => api.get(`/goals/match/${matchId}`),
  getByPlayer: (playerId, params = {}) => api.get(`/goals/player/${playerId}`, { params }),
  update: (id, data) => api.put(`/goals/${id}`, data),
  delete: (id) => api.delete(`/goals/${id}`),
};

// Cards API
export const cardsAPI = {
  create: (data) => api.post('/cards', data),
  getByMatch: (matchId) => api.get(`/cards/match/${matchId}`),
  getByPlayer: (playerId, params = {}) => api.get(`/cards/player/${playerId}`, { params }),
  update: (id, data) => api.put(`/cards/${id}`, data),
  delete: (id) => api.delete(`/cards/${id}`),
};

export default api;
