const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { inicializarPool } = require('./config/db');

const app = express();

// 1. CORS MODIFICADO: Permite que tu App Móvil (APK) se conecte sin ser bloqueada
app.use(cors({
    origin: '*', // Acepta conexiones desde cualquier dispositivo
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Límite de 50MB para permitir enviar imágenes Base64 sin error 413
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const mensajeRoutes = require('./routes/mensajeRoutes');
const pagoRoutes = require('./routes/pagoRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/mensajes', mensajeRoutes);
app.use('/api/pagos', pagoRoutes); 

app.get('/', (req, res) => {
    res.json({ estado: 'Online', proyecto: 'Alerta Digital API', nube: 'Render + Oracle' });
});

// 2. PUERTO MODIFICADO: Render inyectará su propio puerto aquí
const PORT = process.env.PORT || 5000;

inicializarPool().then(() => {
    // 3. HOST MODIFICADO: 0.0.0.0 le dice a Node que exponga la app a Internet, no solo localmente
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Servidor Express conectado a la base de datos y corriendo en el puerto ${PORT}`);
    });
}).catch((error) => {
    console.error("❌ Error al inicializar el pool de base de datos:", error);
});