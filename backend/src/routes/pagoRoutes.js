const express = require('express');
const router = express.Router();
const pagoController = require('../controllers/pagoController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/crear-sesion', authMiddleware, pagoController.crearSesionPago);
router.post('/confirmar', authMiddleware, pagoController.confirmarPago);

module.exports = router;