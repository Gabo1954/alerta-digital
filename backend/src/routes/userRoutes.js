const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware'); 

// Rutas Privadas (Requieren que el usuario pase por el authMiddleware)
router.get('/', authMiddleware, userController.obtenerUsuarios);
router.get('/:id', authMiddleware, userController.obtenerUsuarioPorId);

// NUEVA RUTA: Eliminación de cuenta
router.post('/eliminar-cuenta', authMiddleware, userController.solicitarEliminacion);
router.post('/cancelar-suscripcion', authMiddleware, userController.cancelarSuscripcion);

module.exports = router;