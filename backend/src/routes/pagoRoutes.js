const express = require('express');
const router = express.Router();
const pagoController = require('../controllers/pagoController');
const authMiddleware = require('../middlewares/authMiddleware');

// Crear sesión de pago en Transbank
router.post('/crear-sesion', authMiddleware, pagoController.crearSesionPago);

// Confirmar resultado de la transacción
router.post('/confirmar', authMiddleware, pagoController.confirmarPago);

module.exports = router;