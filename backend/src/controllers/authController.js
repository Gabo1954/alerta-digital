const { execute } = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const oracledb = require('oracledb'); // Requerido para capturar el ID

// ==========================================
// 1. REGISTRAR USUARIO (TRADICIONAL)
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

        // LA SOLUCIÓN: Agregamos RETURNING id_usuario INTO :out_id
        const sql = `
            INSERT INTO usuario (
                nombre, ap_paterno, ap_materno, fecha_nacimiento, correo, celular, password, es_vip, tipo_usuario_id_tipo_usuario
            ) VALUES (
                :nombre, :ap_paterno, :ap_materno, TO_DATE(:fecha_nacimiento, 'YYYY-MM-DD'), :correo, :celular, :password, 0, :tipo_usuario
            ) RETURNING id_usuario INTO :out_id
        `;

        const binds = {
            nombre: nombre,
            ap_paterno: ap_paterno || null,
            ap_materno: ap_materno || null,
            fecha_nacimiento: fecha_nacimiento || null, 
            correo: correo,
            celular: celular || null,
            password: passwordHashed,
            tipo_usuario: idTipoUsuario,
            out_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } // Capturamos el ID
        };

        const result = await execute(sql, binds);
        const nuevoIdUsuario = result.outBinds.out_id[0]; // Extraemos el ID recién creado

        res.status(201).json({ 
            mensaje: '¡Usuario registrado exitosamente en Oracle Cloud!',
            usuario: { 
                id: nuevoIdUsuario,
                nombre, 
                correo,
                es_vip: false 
            },
            // AHORA EL TOKEN SÍ TIENE EL ID ADENTRO
            token: jwt.sign({ id: nuevoIdUsuario, correo, rol: idTipoUsuario }, process.env.JWT_SECRET || 'super_secreto_alerta_digital_duoc', { expiresIn: '8h' })
        });

    } catch (error) {
        console.error('Error en registro:', error);
        if (error.message && error.message.includes('ORA-00001')) {
            return res.status(409).json({ error: 'El correo o celular ya están registrados en el sistema.' });
        }
        res.status(500).json({ error: 'Error interno del servidor al registrar.' });
    }
};

// ==========================================
// 2. LOGIN DE USUARIO (TRADICIONAL)
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
            WHERE correo = :correo
        `;
        const result = await execute(sql, { correo: correo });

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const usuario = result.rows[0];

        const passwordValido = await bcrypt.compare(password, usuario.PASSWORD);
        if (!passwordValido) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const payload = {
            id: usuario.ID_USUARIO,
            nombre: usuario.NOMBRE,
            rol: usuario.TIPO_USUARIO_ID_TIPO_USUARIO
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET || 'super_secreto_alerta_digital_duoc', { expiresIn: '8h' });

        res.status(200).json({
            mensaje: '¡Login exitoso!',
            token: token,
            usuario: {
                id: usuario.ID_USUARIO,
                nombre: usuario.NOMBRE,
                correo: usuario.CORREO,
                es_vip: usuario.ES_VIP === 1 
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

        const sqlBuscar = `SELECT id_usuario, nombre, correo, es_vip, tipo_usuario_id_tipo_usuario FROM usuario WHERE correo = :email`;
        const resultBuscar = await execute(sqlBuscar, { email });

        let usuario;

        if (resultBuscar.rows.length === 0) {
            const sqlInsert = `
                INSERT INTO usuario (nombre, correo, password, es_vip, tipo_usuario_id_tipo_usuario) 
                VALUES (:nombre, :correo, 'AUTH_GOOGLE_PROTECTED', 0, 1)
                RETURNING id_usuario INTO :out_id
            `;
            
            const resultInsert = await execute(sqlInsert, {
                nombre: name,
                correo: email,
                out_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } 
            });
            
            usuario = {
                id: resultInsert.outBinds.out_id[0],
                nombre: name,
                correo: email,
                es_vip: false,
                rol: 1
            };
        } else {
            const row = resultBuscar.rows[0];
            usuario = {
                id: row[0],
                nombre: row[1],
                correo: row[2],
                es_vip: row[3] === 1,
                rol: row[4]
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