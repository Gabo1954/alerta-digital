const jwt = require('jsonwebtoken');
const { execute } = require('../config/db');

const authMiddleware = async (req, res, next) => {
    // 1. Leer el token desde los Headers
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        return res.status(403).json({ error: 'Acceso denegado. Se requiere un token.' });
    }

    try {
        // 2. Extraer el token
        const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
        const secreto = process.env.JWT_SECRET || 'super_secreto_alerta_digital_duoc';
        
        // 3. Validar la firma
        const verificado = jwt.verify(token, secreto);

        // 4. EL BLOQUEO: Verificar que el usuario exista y NO esté eliminado lógicamente
        const sqlVerificar = `
            SELECT id_usuario 
            FROM usuario 
            WHERE id_usuario = :id AND fecha_eliminacion_logica IS NULL
        `;
        const result = await execute(sqlVerificar, { id: verificado.id });

        if (result.rows.length === 0) {
            return res.status(401).json({ 
                error: 'Cuenta desactivada. Inicie sesión nuevamente si desea reactivarla.' 
            });
        }
        req.usuario = verificado; 
        next();
        
    } catch (error) {
        console.error('Error de token/middleware:', error.message);
        return res.status(401).json({ error: 'Token inválido o expirado.' });
    }
};

module.exports = authMiddleware;