import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 20000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  register: (email: string, password: string, name: string) =>
    api.post('/auth/register', { email, password, name }),
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
};

export const matchesApi = {
  live: () => api.get('/matches/live'),
  upcoming: () => api.get('/matches/upcoming'),
  completed: () => api.get('/matches/completed'),
  detail: (id: string) => api.get(`/matches/${id}`),
  scorecard: (id: string) => api.get(`/matches/${id}/scorecard`),
  commentary: (id: string) => api.get(`/matches/${id}/commentary`),
  wagonWheel: (id: string, playerId: string) => api.get(`/matches/${id}/wagon-wheel/${playerId}`),
  manhattan: (id: string) => api.get(`/matches/${id}/manhattan`),
  partnerships: (id: string) => api.get(`/matches/${id}/partnerships`),
  predictedXi: (id: string) => api.get(`/matches/${id}/predicted-xi`),
};

export const playersApi = {
  list: () => api.get('/players'),
  detail: (id: string) => api.get(`/players/${id}`),
};

export const teamsApi = {
  list: () => api.get('/teams'),
  detail: (id: string) => api.get(`/teams/${id}`),
};

export const miscApi = {
  topPerformers: () => api.get('/top-performers'),
  homeFeed: () => api.get('/home-feed'),
  winProbability: (matchId: string) => api.get(`/ai/win-probability/${matchId}`),
  follow: (target_type: 'team' | 'player', target_id: string) =>
    api.post('/follow', { target_type, target_id }),
  unfollow: (target_type: 'team' | 'player', target_id: string) =>
    api.post('/unfollow', { target_type, target_id }),
  following: () => api.get('/following'),
  setAlert: (match_id: string, alert_types: string[], player_id?: string) =>
    api.post('/alerts', { match_id, alert_types, player_id }),
  listAlerts: () => api.get('/alerts'),
  askAI: (query: string, match_id?: string) => api.post('/ai/ask', { query, match_id }),
  polls: () => api.get('/community/polls'),
  votePoll: (poll_id: string, option_index: number) =>
    api.post('/community/polls/vote', { poll_id, option_index }),
  chat: (match_id: string) => api.get(`/community/chat/${match_id}`),
  sendChat: (match_id: string, message: string) =>
    api.post('/community/chat', { match_id, message }),
};
