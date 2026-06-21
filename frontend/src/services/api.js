import axios from 'axios';

// 🔥 URL OFICIAL EN LA NUBE (Render)
// Reemplazamos la IP local (192.168.1.149) por tu servidor en producción
const API_URL = 'https://alerta-digital.onrender.com/api';

console.log('%c[API] URL Base:', 'background: #3b82f6; color: white; font-weight: bold;', API_URL);
console.log('%c[API] Platform:', 'background: #3b82f6; color: white; font-weight: bold;', 
    typeof window !== 'undefined' ? (window.Capacitor ? window.Capacitor.getPlatform() : 'web') : 'unknown');

const api = axios.create({
    baseURL: API_URL,
});

// Interceptor para inyectar el token automáticamente
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;