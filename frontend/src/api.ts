import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 90000,
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
  ballByBall: (id: string, params?: any) => api.get(`/matches/${id}/balls`, { params }),
  fantasy: (id: string) => api.get(`/matches/${id}/fantasy`),
  chat: (id: string) => api.get(`/matches/${id}/chat`),
  postChat: (id: string, message: string) => api.post(`/matches/${id}/chat`, { message }),
};

export const playersApi = {
  detail: (id: string) => api.get(`/players/${id}`),
  trending: () => api.get('/players/trending'),
};

export const teamsApi = {
  detail: (id: string) => api.get(`/teams/${id}`),
};

export const followApi = {
  follow: (target_id: string, target_type: string) => api.post('/follow', { target_id, target_type }),
  unfollow: (target_id: string, target_type: string) => api.delete('/follow', { data: { target_id, target_type } }),
  list: () => api.get('/follow'),
};

export const aiApi = {
  ask: (question: string) => api.post('/ai/ask', { question }),
};

export const miscApi = {
  homeFeed: () => api.get('/home-feed'),
  topPerformers: () => api.get('/top-performers'),
  news: () => api.get('/news'),
  polls: () => api.get('/polls'),
  vote: (poll_id: string, option_idx: number) => api.post('/polls/vote', { poll_id, option_idx }),
  alerts: () => api.get('/alerts'),
  feedback: (message: string) => api.post('/feedback', { message }),
};

export const adminApi = {
  users: () => api.get('/admin/users'),
  toggleAdmin: (user_id: string) => api.post(`/admin/users/${user_id}/toggle-admin`),
  togglePro: (user_id: string) => api.post(`/admin/users/${user_id}/toggle-pro`),
  createNews: (title: string, content: string, image?: string) => api.post('/admin/news', { title, content, image }),
  deleteNews: (id: string) => api.delete(`/admin/news/${id}`),
  createPoll: (question: string, options: string[]) => api.post('/admin/polls', { question, options }),
  deletePoll: (id: string) => api.delete(`/admin/polls/${id}`),
  feedback: () => api.get('/admin/feedback'),
};

export const paymentsApi = {
  createOrder: () => api.post('/payments/razorpay/create-order'),
  verify: (order_id: string, payment_id: string, signature: string) =>
    api.post('/payments/razorpay/verify', { order_id, payment_id, signature }),
};
