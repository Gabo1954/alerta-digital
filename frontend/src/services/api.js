import axios from 'axios';

// 🔥 Usa variable de entorno (mejor práctica)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://backend-alerta-nj2m.onrender.com/api',
  timeout: 10000 // evita que quede colgado
});

// 🔐 Interceptor de request (token)
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('⚠️ No se pudo acceder a localStorage');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🚨 Interceptor de respuesta (manejo global de errores)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Token expirado o inválido
      if (error.response.status === 401) {
        console.warn('🔒 Sesión expirada');
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    } else if (error.code === 'ECONNABORTED') {
      console.error('⏱️ Timeout de conexión');
    } else {
      console.error('❌ Error de red');
    }

    return Promise.reject(error);
  }
);

export default api;