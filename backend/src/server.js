const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { inicializarPool } = require('./config/db');

const app = express();

app.use(cors()); 
app.use(express.json()); 

// --- RUTAS DE LA API ---
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const mensajeRoutes = require('./routes/mensajeRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/mensajes', mensajeRoutes); 

app.get('/', (req, res) => {
    res.json({ estado: 'Online', db: 'Oracle Autonomous Database' });
});

const PORT = process.env.PORT || 5000;

inicializarPool().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor Express corriendo en http://localhost:${PORT}`);
    });
});