const express = require('express');
const router = express.Router();
const mensajeController = require('../controllers/mensajeController');
const authMiddleware = require('../middlewares/authMiddleware');

// Ruta protegida: POST http://localhost:5000/api/mensajes/analizar
router.post('/analizar', authMiddleware, mensajeController.analizarMensaje);

module.exports = router;