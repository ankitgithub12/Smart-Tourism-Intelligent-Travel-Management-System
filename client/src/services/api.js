import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Attach Bearer token from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/register', data),
  login: (data) => api.post('/login', data),
  logout: () => api.post('/logout'),
  me: () => api.get('/me'),
};

// ── Tourist Places ────────────────────────────────────
export const placesAPI = {
  getAll: (params) => api.get('/places', { params }),
  getOne: (id) => api.get(`/places/${id}`),
  create: (data) => api.post('/places', data),
  update: (id, data) => api.put(`/places/${id}`, data),
  remove: (id) => api.delete(`/places/${id}`),
};

// ── Bookings ──────────────────────────────────────────
export const bookingsAPI = {
  getAll: () => api.get('/bookings'),
  create: (data) => api.post('/bookings', data),
  remove: (id) => api.delete(`/bookings/${id}`),
};

// ── Reviews ───────────────────────────────────────────
export const reviewsAPI = {
  getByPlace: (placeId) => api.get(`/reviews/${placeId}`),
  create: (data) => api.post('/reviews', data),
};

// ── Transport ─────────────────────────────────────────
export const transportAPI = {
  getAll: () => api.get('/transports'),
};

// ── AI ────────────────────────────────────────────────
export const aiAPI = {
  chat: (message) => api.post('/ai/chat', { message }),
  recommend: (preferences) => api.post('/ai/recommend', { preferences }),
  crowdPredict: (location_data) => api.post('/ai/crowd-predict', { location_data }),
  sentiment: (text) => api.post('/ai/sentiment', { text }),
};

// ── User Profile ──────────────────────────────────────
export const userAPI = {
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => api.put('/profile', data),
};

export default api;
