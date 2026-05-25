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
  me: () => api.get('/user'),
  forgotPassword: (email) => api.post('/password/email', { email }),
  resetPassword: (data) =>
    api.post('/password/reset', {
      token: data.token,
      email: data.email,
      password: data.password,
      password_confirmation: data.password_confirmation,
    }),
  
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
  getAll: (params) => api.get('/bookings', { params }),
  getOne: (id) => api.get(`/bookings/${id}`),
  create: (data) => api.post('/bookings', data),
  update: (id, data) => api.put(`/bookings/${id}`, data),
  remove: (id) => api.delete(`/bookings/${id}`),
  confirm: (id) => api.post(`/bookings/${id}/confirm`),
  cancel: (id) => api.post(`/bookings/${id}/cancel`),
  getReceipt: (id) => api.get(`/bookings/${id}/receipt`),
  bookTransport: (data) => api.post('/bookings/transport', data),
};

// ── Payments ──────────────────────────────────────────
export const paymentAPI = {
  confirm: (sessionId, tripId) => api.post('/payment/confirm', { session_id: sessionId, trip_id: tripId }),
  cancel: (tripId) => api.post('/payment/cancel', { trip_id: tripId }),
  createCheckoutSession: (tripId) => api.post('/trips/checkout', { trip_id: tripId }),
};

// ── Reviews ───────────────────────────────────────────
export const reviewsAPI = {
  getAll: () => api.get('/reviews'),
  getByPlace: (placeId) => api.get(`/reviews/${placeId}`),
  create: (data) => api.post('/reviews', data),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  remove: (id) => api.delete(`/reviews/${id}`),
};

// ── Favorites ─────────────────────────────────────────
export const favoritesAPI = {
  getAll: () => api.get('/favorites'),
  add: (placeId) => api.post('/favorites', { tourist_place_id: placeId }),
  remove: (placeId) => api.delete(`/favorites/${placeId}`),
};

export const touristAPI = {
  getAssistance: (params) => api.get('/tourist/assistance', { params }),
};

export const tripAPI = {
  options: () => api.get('/trip-options'),
  create: (data) => api.post('/trips', data),
  cancel: (id) => api.post(`/trips/${id}/cancel`),
  rate: (id, data) => api.post(`/trips/${id}/rate`, data),
};

// ── Transport ─────────────────────────────────────────
export const transportAPI = {
  getAll: (params) => api.get('/transports', { params }),
  getOne: (id) => api.get(`/transports/${id}`),
  checkAvailability: (id) => api.get(`/transports/${id}/availability`),
  create: (data) => api.post('/transports', data),
  update: (id, data) => api.put(`/transports/${id}`, data),
  updateLoad: (id, load) => api.patch(`/transports/${id}/load`, { current_load: load }),
};

export const listingAPI = {
  getPackages: () => api.get('/packages'),
  getHotels: () => api.get('/hotels'),
};

export const contactAPI = {
  send: (data) => api.post('/contact', data),
};

// ── AI ────────────────────────────────────────────────
// export const aiAPI = {
//   chat: (message) => api.post('/ai/chat', { message }),
//   chatWithHistory: (messages) => api.post('/ai/chat', { messages }),

// ── AI ────────────────────────────────────────────────
export const aiAPI = {
  chat: (message) => api.post('/ai/chat', { message }),
  chatWithHistory: (messages) => api.post('/ai/chat', { messages }),
  recommend: (preferences) => api.post('/ai/recommend', { preferences }),
  crowdPredict: (location_data) => api.post('/ai/crowd-predict', { location_data }),
  sentiment: (text) => api.post('/ai/sentiment', { text }),
};

// ── User Profile & Admin ──────────────────────────────
export const userAPI = {
  getProfile: () => api.get('/user'),
  updateProfile: (data) => api.put('/user', data),
  getProfileStats: () => api.get('/user/profile-stats'),
  getAdminStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  deactivateUser: (id) => api.post(`/admin/users/${id}/deactivate`),
  activateUser: (id) => api.post(`/admin/users/${id}/activate`),
};
// ── Third-party API Keys ──────────────────────────
export const externalAPIs = {
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  openWeatherApiKey: import.meta.env.VITE_OPENWEATHER_API_KEY || '',
};

// ── Telemetry / City Authority Dashboard ──────────
export const telemetryAPI = {
  get: ()              => api.get('/admin/telemetry'),
  tick: ()             => api.post('/admin/telemetry/tick'),
  updateEmergency: (id, status) =>
    api.post(`/admin/emergencies/${id}/update-status`, { status }),
  updateAgency: (id, status) =>
    api.post(`/admin/agencies/${id}/update-status`, { status }),
};

// ── Agency Dashboard ──────────────────────────────
export const agencyAPI = {
  getDashboard: ()                  => api.get('/agency/dashboard'),
  createPackage: (data)             => api.post('/agency/packages', data, data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined),
  updatePackage: (id, data)         => api.post(`/agency/packages/${id}`, data, data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined),
  updatePackageStatus: (id, status) => api.patch(`/agency/packages/${id}/status`, { status }),
  deletePackage: (id)               => api.delete(`/agency/packages/${id}`),
  createHotel: (data)               => api.post('/agency/hotels', data, data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined),
  updateHotel: (id, data)           => api.post(`/agency/hotels/${id}`, data, data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined),
  updateHotelStatus: (id, status)   => api.patch(`/agency/hotels/${id}/status`, { status }),
  deleteHotel: (id)                 => api.delete(`/agency/hotels/${id}`),
  createTour: (data)                => api.post('/agency/tours', data),
  createVehicle: (data)             => api.post('/agency/vehicles', data),
  updateVehicleStatus: (id, status) => api.patch(`/agency/vehicles/${id}/status`, { status }),
  deleteVehicle: (id)               => api.delete(`/agency/vehicles/${id}`),
  createGuide: (data)               => api.post('/agency/guides', data),
  updateGuideStatus: (id, status)   => api.patch(`/agency/guides/${id}/status`, { status }),
  deleteGuide: (id)                 => api.delete(`/agency/guides/${id}`),
  updateBookingStatus: (id, status) => api.patch(`/agency/bookings/${id}/status`, { status }),
};

// ── Notifications ─────────────────────────────────
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  create: (data) => api.post('/notifications', data),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.post('/notifications/read-all'),
  clearAll: () => api.delete('/notifications'),
};

export default api;
