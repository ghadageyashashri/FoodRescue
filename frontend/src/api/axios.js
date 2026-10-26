import axios from 'axios';

const getBaseUrl = () => {
  let envUrl = import.meta.env.VITE_API_BASE_URL;

  // 1. If explicitly set via environment variable (e.g. on Render)
  if (envUrl && envUrl.trim() !== '') {
    envUrl = envUrl.trim();
    // Prepend https:// if only host was supplied
    if (!envUrl.startsWith('http://') && !envUrl.startsWith('https://') && !envUrl.startsWith('/')) {
      envUrl = `https://${envUrl}`;
    }
    // Append /api/v1 if not present
    if (!envUrl.endsWith('/api/v1')) {
      envUrl = envUrl.replace(/\/+$/, '') + '/api/v1';
    }
    return envUrl;
  }

  // 2. Browser runtime fallback
  if (typeof window !== 'undefined' && window.location) {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!isLocal) {
      // In production if frontend and backend are served from the same domain
      return `${window.location.origin}/api/v1`;
    }
    const host = window.location.hostname || 'localhost';
    return `http://${host}:5000/api/v1`;
  }

  return 'http://localhost:5000/api/v1';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('foodrescue_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unified error responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token invalid / expired, clear local storage
    if (error.response && error.response.status === 401) {
      const isLoginOrRegister =
        error.config.url.includes('/auth/login') || error.config.url.includes('/auth/register');
      if (!isLoginOrRegister) {
        localStorage.removeItem('foodrescue_token');
        localStorage.removeItem('foodrescue_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
