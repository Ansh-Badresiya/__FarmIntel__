import axios from 'axios';

// Strip any trailing /api/v1 from the env var so we don't double-append,
// then always add /api/v1 — this way VITE_API_URL can be either:
//   https://farmintel-backend-7mpz.onrender.com          ✅
//   https://farmintel-backend-7mpz.onrender.com/api/v1   ✅ (both work)
const _base = (import.meta.env.VITE_API_URL || 'http://localhost:8000')
  .replace(/\/api\/v1\/?$/, '')  // remove /api/v1 suffix if already present
  .replace(/\/$/, '');           // remove any trailing slash

const api = axios.create({
  baseURL: `${_base}/api/v1`,
});

// Add a request interceptor to attach the Authorization header automatically
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
