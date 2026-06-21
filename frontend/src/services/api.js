import axios from 'axios';

// 🔥 IP de tu PC en la red local
const IP_PC = '192.168.1.114';

// Forzamos la IP directamente - sin detección compleja que pueda fallar en Android
const API_URL = `http://${IP_PC}:5000/api`;

console.log('%c[API] URL:', 'background: #3b82f6; color: white; font-weight: bold;', API_URL);
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

// Interceptor para manejar errores de autenticación (401)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expirado o inválido - limpiar sesión y redirigir a login
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            localStorage.removeItem('isPro');
            localStorage.removeItem('escaneo_vip_regalo_usado');
            
            // Recargar la página para volver al login
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export default api;
