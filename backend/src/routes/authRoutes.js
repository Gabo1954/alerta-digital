const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rutas Públicas (No requieren Token)
router.post('/registro', authController.registrarUsuario);
router.post('/login', authController.loginUsuario);

module.exports = router;