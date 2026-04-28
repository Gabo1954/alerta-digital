const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { inicializarPool } = require('./config/db');

const app = express();

// 🔐 CORS (en producción deberías restringir el origin)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 📦 Límite de payload (imágenes, etc.)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 📌 Rutas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const mensajeRoutes = require('./routes/mensajeRoutes');
const pagoRoutes = require('./routes/pagoRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/mensajes', mensajeRoutes);
app.use('/api/pagos', pagoRoutes);

// 🟢 Health check (Render lo usa)
app.get('/', (req, res) => {
  res.status(200).json({
    estado: 'Online',
    proyecto: 'Alerta Digital API',
    nube: 'Render + AWS MariaDB'
  });
});

// ⚠️ Manejo global de errores (evita caídas silenciosas)
app.use((err, req, res, next) => {
  console.error('❌ Error global:', err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// 🔥 Puerto dinámico (CLAVE para Render)
const PORT = process.env.PORT || 10000;

// 🚀 Inicio controlado del servidor
async function startServer() {
  try {
    console.log('⏳ Inicializando conexión a AWS MariaDB...');
    
    await inicializarPool();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`🌐 URL: http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error.message);
    process.exit(1);
  }
}

startServer();