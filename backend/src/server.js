const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { inicializarPool } = require('./config/db');

const app = express();

// 1. CONFIGURAR CORS (Debe ir primero)
app.use(cors({
    origin: 'http://localhost:5173', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. CONFIGURAR PARSER DE JSON (Debe ir antes de las rutas)
app.use(express.json());

// 3. RUTAS DE LA API
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const mensajeRoutes = require('./routes/mensajeRoutes');
const pagoRoutes = require('./routes/pagoRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/mensajes', mensajeRoutes);
app.use('/api/pagos', pagoRoutes); 

app.get('/', (req, res) => {
    res.json({ estado: 'Online', proyecto: 'Alerta Digital' });
});

const PORT = process.env.PORT || 5000;

inicializarPool().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor Express corriendo en http://localhost:${PORT}`);
    });
});