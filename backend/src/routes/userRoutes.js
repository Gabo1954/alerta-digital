const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware'); 

// Rutas Privadas (Requieren que el usuario pase por el authMiddleware)
router.get('/', authMiddleware, userController.obtenerUsuarios);
router.get('/:id', authMiddleware, userController.obtenerUsuarioPorId);

module.exports = router;