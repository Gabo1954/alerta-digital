const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rutas Públicas (No requieren Token)
router.post('/registro', authController.registrarUsuario);
router.post('/login', authController.loginUsuario);
router.post('/google-login', authController.googleLogin); // Asegúrate de tener esta si usas Google Login
router.post('/recuperar-password', authController.recuperarPassword); // NUEVA RUTA
router.post('/restablecer-password', authController.actualizarPassword);

module.exports = router;