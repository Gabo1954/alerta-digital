const { execute } = require('../config/db');
const bcrypt = require('bcryptjs'); // Asegúrate de usar bcryptjs o bcrypt
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

// ==========================================
// 1. REGISTRAR USUARIO (MARIADB/AWS)
// ==========================================
exports.registrarUsuario = async (req, res) => {
    const { nombre, ap_paterno, ap_materno, fecha_nacimiento, correo, celular, password } = req.body;

    if (!nombre || !correo || !password) {
        return res.status(400).json({ error: 'El nombre, correo y contraseña son obligatorios' });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const passwordHashed = await bcrypt.hash(password, salt);
        const idTipoUsuario = 1; // 1 = Usuario Normal

        // MySQL/MariaDB usa '?' para los valores y captura el ID automáticamente
        const sql = `
            INSERT INTO usuario (
                nombre, ap_paterno, ap_materno, fecha_nacimiento, correo, celular, password, es_vip, tipo_usuario_id_tipo_usuario
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)
        `;

        const binds = [
            nombre,
            ap_paterno || null,
            ap_materno || null,
            fecha_nacimiento || null, 
            correo,
            celular || null,
            passwordHashed,
            idTipoUsuario
        ];

        const result = await execute(sql, binds);
        const nuevoIdUsuario = result.rows.insertId; // Así se saca el ID recién creado en MySQL

        res.status(201).json({ 
            mensaje: '¡Usuario registrado exitosamente en AWS!',
            usuario: { 
                id: nuevoIdUsuario,
                nombre, 
                correo,
                es_vip: false 
            },
            token: jwt.sign({ id: nuevoIdUsuario, correo, rol: idTipoUsuario }, process.env.JWT_SECRET || 'super_secreto_alerta_digital_duoc', { expiresIn: '8h' })
        });

    } catch (error) {
        console.error('Error en registro:', error);
        // Error de clave duplicada en MySQL/MariaDB es el código 1062
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'El correo o celular ya están registrados en el sistema.' });
        }
        res.status(500).json({ error: 'Error interno del servidor al registrar.' });
    }
};

// ==========================================
// 2. LOGIN DE USUARIO (MARIADB/AWS)
// ==========================================
exports.loginUsuario = async (req, res) => {
    const { correo, password } = req.body;

    if (!correo || !password) {
        return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
    }

    try {
        const sql = `
            SELECT id_usuario, nombre, ap_paterno, correo, password, es_vip, tipo_usuario_id_tipo_usuario 
            FROM usuario 
            WHERE correo = ?
        `;
        const result = await execute(sql, [correo]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const usuario = result.rows[0];

        // MySQL devuelve las columnas en minúscula por defecto (Oracle era mayúscula)
        const passwordValido = await bcrypt.compare(password, usuario.password);
        if (!passwordValido) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const payload = {
            id: usuario.id_usuario,
            nombre: usuario.nombre,
            rol: usuario.tipo_usuario_id_tipo_usuario
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET || 'super_secreto_alerta_digital_duoc', { expiresIn: '8h' });

        res.status(200).json({
            mensaje: '¡Login exitoso!',
            token: token,
            usuario: {
                id: usuario.id_usuario,
                nombre: usuario.nombre,
                correo: usuario.correo,
                es_vip: usuario.es_vip === 1 
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor en el login' });
    }
};

// ==========================================
// 3. LOGIN CON GOOGLE OAUTH
// ==========================================
const CLIENT_ID = "240556836925-j0alagivti7gr579ajs3d98kmbh59d4i.apps.googleusercontent.com";
const googleClient = new OAuth2Client(CLIENT_ID);

exports.googleLogin = async (req, res) => {
    const { token } = req.body;

    if (!token) return res.status(400).json({ error: 'Token de Google no proporcionado.' });

    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        });
        
        const { email, name } = ticket.getPayload();

        const sqlBuscar = `SELECT id_usuario, nombre, correo, es_vip, tipo_usuario_id_tipo_usuario FROM usuario WHERE correo = ?`;
        const resultBuscar = await execute(sqlBuscar, [email]);

        let usuario;

        if (resultBuscar.rows.length === 0) {
            const sqlInsert = `
                INSERT INTO usuario (nombre, correo, password, es_vip, tipo_usuario_id_tipo_usuario) 
                VALUES (?, ?, 'AUTH_GOOGLE_PROTECTED', 0, 1)
            `;
            const resultInsert = await execute(sqlInsert, [name, email]);
            
            usuario = {
                id: resultInsert.rows.insertId,
                nombre: name,
                correo: email,
                es_vip: false,
                rol: 1
            };
        } else {
            const row = resultBuscar.rows[0];
            usuario = {
                id: row.id_usuario,
                nombre: row.nombre,
                correo: row.correo,
                es_vip: row.es_vip === 1,
                rol: row.tipo_usuario_id_tipo_usuario
            };
        }

        const sessionToken = jwt.sign(
            { id: usuario.id, correo: usuario.correo, rol: usuario.rol },
            process.env.JWT_SECRET || 'super_secreto_alerta_digital_duoc',
            { expiresIn: '8h' }
        );

        res.status(200).json({
            token: sessionToken,
            usuario
        });

    } catch (error) {
        console.error('Error en googleLogin:', error);
        res.status(401).json({ error: 'Fallo en la validación de Google.' });
    }
};