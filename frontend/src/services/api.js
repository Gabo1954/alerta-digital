import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api', // Desarrollo
   
});

// Interceptor para inyectar el token automáticamente
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        // Aseguramos el formato estándar "Bearer token"
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;