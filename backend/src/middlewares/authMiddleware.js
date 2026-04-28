const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // 1. Leer el token desde los Headers de la petición
    const authHeader = req.header('Authorization');

    // Si no trae el header, le negamos el paso de inmediato con código 403 (Prohibido)
    if (!authHeader) {
        return res.status(403).json({ error: 'Acceso denegado. Se requiere un token de autenticación.' });
    }

    try {
        // 2. Extraer el token real (Suele venir como "Bearer eyJhbGciOi...")
        const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

        // 3. Validar que el token sea auténtico usando tu firma secreta
        // Se añade el "fallback" por si process.env.JWT_SECRET falla al cargar
        const secreto = process.env.JWT_SECRET || 'super_secreto_alerta_digital_duoc';
        const verificado = jwt.verify(token, secreto);

        // 4. Guardar los datos del usuario dentro de la request para usarlos en el controlador
        req.usuario = verificado; 

        // 5. ¡Dejarlo pasar! (Llama a la siguiente función del controlador)
        next();
    } catch (error) {
        // Si el token fue modificado, expiró o es de otro proyecto
        console.error('Error de token:', error.message);
        return res.status(401).json({ error: 'Token inválido o expirado. Por favor, inicia sesión nuevamente.' });
    }
};

module.exports = authMiddleware;