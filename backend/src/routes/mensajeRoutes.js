const express = require('express');
const router = express.Router();
const mensajeController = require('../controllers/mensajeController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/analizar', authMiddleware, mensajeController.analizarMensaje);
router.post('/analizar-imagen', authMiddleware, mensajeController.analizarImagenVIP);
router.post('/feedback', authMiddleware, mensajeController.feedbackMensaje);
router.get('/historial', authMiddleware, mensajeController.obtenerHistorial); // AQUÍ ESTÁ LA SOLUCIÓN AL 404

module.exports = router;