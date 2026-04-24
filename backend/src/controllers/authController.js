const { execute } = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// ==========================================
// 1. REGISTRAR USUARIO
// ==========================================
exports.registrarUsuario = async (req, res) => {
    const { nombre, ap_paterno, ap_materno, correo, celular, password } = req.body;

    if (!nombre || !correo || !password) {
        return res.status(400).json({ error: 'El nombre, correo y contraseña son obligatorios' });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const passwordHashed = await bcrypt.hash(password, salt);
        const idTipoUsuario = 1; 

        const sql = `
            INSERT INTO usuario (
                nombre, ap_paterno, ap_materno, correo, celular, password, tipo_usuario_id_tipo_usuario
            ) VALUES (
                :nombre, :ap_paterno, :ap_materno, :correo, :celular, :password, :tipo_usuario
            )
        `;

        const binds = {
            nombre: nombre,
            ap_paterno: ap_paterno || null,
            ap_materno: ap_materno || null,
            correo: correo,
            celular: celular || null,
            password: passwordHashed,
            tipo_usuario: idTipoUsuario
        };

        await execute(sql, binds);

        res.status(201).json({ 
            mensaje: '¡Usuario registrado exitosamente en Oracle Cloud!',
            perfil: { nombre, ap_paterno, correo }
        });

    } catch (error) {
        console.error('Error en registro:', error);
        if (error.message && error.message.includes('ORA-00001')) {
            return res.status(409).json({ error: 'El correo o número de celular ya están registrados.' });
        }
        res.status(500).json({ error: 'Error interno del servidor al registrar.' });
    }
};

// ==========================================
// 2. LOGIN DE USUARIO
// ==========================================
exports.loginUsuario = async (req, res) => {
    const { correo, password } = req.body;

    if (!correo || !password) {
        return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
    }

    try {
        const sql = `
            SELECT id_usuario, nombre, ap_paterno, correo, password, tipo_usuario_id_tipo_usuario 
            FROM usuario 
            WHERE correo = :correo
        `;
        const result = await execute(sql, { correo: correo });

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const usuario = result.rows[0];

        // Comparar la contraseña ingresada con el Hash de Oracle
        // Nota: Oracle devuelve los nombres de columnas en MAYÚSCULAS
        const passwordValido = await bcrypt.compare(password, usuario.PASSWORD);
        if (!passwordValido) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Generar el Token JWT
        const payload = {
            id: usuario.ID_USUARIO,
            nombre: usuario.NOMBRE,
            rol: usuario.TIPO_USUARIO_ID_TIPO_USUARIO
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

        res.status(200).json({
            mensaje: '¡Login exitoso!',
            token: token,
            usuario: {
                id: usuario.ID_USUARIO,
                nombre: usuario.NOMBRE,
                correo: usuario.CORREO
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor en el login' });
    }
};