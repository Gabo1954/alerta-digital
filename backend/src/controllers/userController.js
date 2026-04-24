const { execute } = require('../config/db');

// Traer TODOS los usuarios
exports.obtenerUsuarios = async (req, res) => {
    try {
        // Seleccionamos todo MENOS el password
        const sql = `
            SELECT id_usuario, nombre, ap_paterno, ap_materno, correo, celular, tipo_usuario_id_tipo_usuario 
            FROM usuario
            ORDER BY id_usuario DESC
        `;
        
        const result = await execute(sql);
        
        // Oracle devuelve las filas en result.rows
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error obteniendo usuarios:', error);
        res.status(500).json({ error: 'Error al obtener la lista de usuarios.' });
    }
};

// Traer UN usuario por su ID
exports.obtenerUsuarioPorId = async (req, res) => {
    const { id } = req.params;

    try {
        const sql = `
            SELECT id_usuario, nombre, ap_paterno, ap_materno, correo, celular, tipo_usuario_id_tipo_usuario 
            FROM usuario 
            WHERE id_usuario = :id
        `;
        
        const result = await execute(sql, { id: id });

        // Si no encuentra resultados
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error obteniendo el usuario:', error);
        res.status(500).json({ error: 'Error al obtener el usuario.' });
    }
};