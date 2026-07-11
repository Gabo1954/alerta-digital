const { execute } = require('../config/db');

// Traer TODOS los usuarios (Solo los activos)
exports.obtenerUsuarios = async (req, res) => {
    try {
        const sql = `
            SELECT id_usuario, nombre, correo, celular, tipo_usuario_id_tipo_usuario 
            FROM usuario
            WHERE fecha_eliminacion_logica IS NULL
            ORDER BY id_usuario DESC
        `;
        
        const result = await execute(sql);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error obteniendo usuarios:', error);
        res.status(500).json({ error: 'Error al obtener la lista de usuarios.' });
    }
};

// Traer UN usuario por su ID (Si no está eliminado)
exports.obtenerUsuarioPorId = async (req, res) => {
    const { id } = req.params;

    try {
        const sql = `
            SELECT id_usuario, nombre, correo, celular, tipo_usuario_id_tipo_usuario 
            FROM usuario 
            WHERE id_usuario = :id AND fecha_eliminacion_logica IS NULL
        `;
        
        const result = await execute(sql, { id: id });

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado o cuenta desactivada.' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error obteniendo el usuario:', error);
        res.status(500).json({ error: 'Error al obtener el usuario.' });
    }
};

// Solicitar Eliminación de Cuenta (30 Días)
exports.solicitarEliminacion = async (req, res) => {
    const idUsuario = req.usuario.id;

    try {
        const sql = `UPDATE usuario SET fecha_eliminacion_logica = SYSDATE WHERE id_usuario = :id_user`;
        await execute(sql, { id_user: idUsuario }, { autoCommit: true });

        res.status(200).json({ 
            mensaje: "Cuenta desactivada. Será eliminada permanentemente en 30 días si no vuelves a iniciar sesión." 
        });
    } catch (error) {
        console.error('Error al desactivar cuenta:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// NUEVO: Cancelar Suscripción VIP
exports.cancelarSuscripcion = async (req, res) => {
    const idUsuario = req.usuario.id;

    try {
        // Actualizamos la base de datos para quitar el estado VIP
        const sql = `UPDATE usuario SET es_vip = 0 WHERE id_usuario = :id_user`;
        await execute(sql, { id_user: idUsuario }, { autoCommit: true });

        res.status(200).json({ 
            mensaje: "Tu suscripción ha sido cancelada. Has vuelto al plan básico." 
        });
    } catch (error) {
        console.error('Error al cancelar suscripción:', error);
        res.status(500).json({ error: 'Error interno al procesar la cancelación.' });
    }
};