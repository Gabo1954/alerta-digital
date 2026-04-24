import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

// Interceptor para enviar el token automáticamente si existe
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ESTA ES LA LÍNEA QUE FALTABA O FALLÓ: Exportamos por defecto
export default api;