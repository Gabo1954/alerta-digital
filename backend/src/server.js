const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { inicializarPool } = require('./config/db');

const app = express();

app.use(cors({
    origin: 'http://localhost:5173', 
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
    res.json({ estado: 'Online', proyecto: 'Alerta Digital Node.js' });
});

const PORT = process.env.PORT || 5000;

inicializarPool().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor Express corriendo en http://localhost:${PORT}`);
    });
}).catch((error) => {
    console.error("❌ Error al inicializar el pool de base de datos:", error);
});