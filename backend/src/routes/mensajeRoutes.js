const express = require('express');
const router = express.Router();
const mensajeController = require('../controllers/mensajeController');
const authMiddleware = require('../middlewares/authMiddleware');

// Ruta protegida: POST http://localhost:5000/api/mensajes/analizar
// Sirve para analizar un mensaje con el motor heurístico
router.post('/analizar', authMiddleware, mensajeController.analizarMensaje);

// NUEVA RUTA PROTEGIDA: POST http://localhost:5000/api/mensajes/feedback
// Sirve para recibir la corrección del usuario (Sí/No) y entrenar al modelo de Machine Learning
router.post('/feedback', authMiddleware, mensajeController.feedbackMensaje);

module.exports = router;