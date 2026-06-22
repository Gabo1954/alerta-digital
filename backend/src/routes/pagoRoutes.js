const express = require('express');
const router = express.Router();
const pagoController = require('../controllers/pagoController');
const authMiddleware = require('../middlewares/authMiddleware');

// 1. CREACIÓN: El usuario está dentro de la app, SÍ tenemos su token.
router.post('/crear-sesion', authMiddleware, pagoController.crearSesionPago);

// 2. CONFIRMACIÓN: Lo llama Transbank desde fuera, NO requiere autenticación.
// Usamos .all() para aceptar tanto GET (éxito) como POST (anulación de Webpay).
router.all('/retorno', pagoController.confirmarPago);

module.exports = router;