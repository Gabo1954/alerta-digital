const { execute } = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const oracledb = require('oracledb');
const nodemailer = require('nodemailer');

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
        const idTipoUsuario = 1;

        const sql = `
            INSERT INTO usuario (
                nombre, ap_paterno, ap_materno, fecha_nacimiento, correo, celular, password, es_vip, tipo_usuario_id_tipo_usuario
            ) VALUES (
                :nombre, :ap_paterno, :ap_materno, TO_DATE(:fecha_nacimiento, 'DD/MM/YYYY'), :correo, :celular, :password, 0, :tipo_usuario
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
            out_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
        };

        const result = await execute(sql, binds);
        const nuevoIdUsuario = result.outBinds.out_id[0];

        res.status(201).json({
            mensaje: '¡Usuario registrado exitosamente en Oracle Cloud!',
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

// ==========================================
// 4. RECUPERAR CONTRASEÑA (ENVÍO DE CORREO)
// ==========================================
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Llama al correo desde el .env
        pass: process.env.EMAIL_PASS  // Llama a la contraseña desde el .env
    }
});

exports.recuperarPassword = async (req, res) => {
    const { correo } = req.body;

    if (!correo) {
        return res.status(400).json({ error: 'El correo electrónico es obligatorio.' });
    }

    try {
        const sql = `SELECT id_usuario, correo, nombre FROM usuario WHERE correo = :correo`;
        const result = await execute(sql, { correo });

        if (result.rows.length === 0) {
            return res.status(200).json({ mensaje: 'Si el correo existe en nuestro sistema, hemos enviado un enlace de recuperación.' });
        }

        const usuario = {
            id: result.rows[0].ID_USUARIO,
            correo: result.rows[0].CORREO,
            nombre: result.rows[0].NOMBRE
        };

        const resetToken = jwt.sign(
            { id: usuario.id, correo: usuario.correo },
            process.env.JWT_SECRET || 'super_secreto_alerta_digital_duoc',
            { expiresIn: '15m' }
        );

        const resetLink = `http://localhost:5173/restablecer-password?token=${resetToken}`;

        const mailOptions = {
            from: `"Alerta Digital" <${process.env.EMAIL_USER}>`,
            to: usuario.correo,
            subject: '🔒 Recuperación de Contraseña - Alerta Digital',
            html: `
                <div style="font-family: Arial, sans-serif; background-color: #000; color: #fff; padding: 40px 20px;">
                    <div style="max-width: 500px; margin: auto; background-color: #111827; padding: 30px; border-radius: 15px; border: 1px solid #1f2937; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
                        <div style="text-align: center; margin-bottom: 20px;">
                            <h2 style="color: #fff; margin: 0; font-size: 24px; font-weight: 900;">Alerta <span style="color: #3b82f6;">Digital</span></h2>
                            <p style="color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px;">Escudo Heurístico</p>
                        </div>
                        <p style="color: #d1d5db;">Hola <strong>${usuario.nombre}</strong>,</p>
                        <p style="color: #d1d5db; line-height: 1.6;">Hemos recibido una solicitud para restablecer el acceso a tu cuenta. Haz clic en el botón de abajo para configurar una nueva contraseña segura.</p>
                        <div style="text-align: center; margin: 35px 0;">
                            <a href="${resetLink}" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; text-transform: uppercase; font-size: 13px; letter-spacing: 1px;">Restablecer Contraseña</a>
                        </div>
                        <div style="background-color: rgba(239, 68, 68, 0.1); border-left: 3px solid #ef4444; padding: 10px 15px; margin-top: 30px;">
                            <p style="font-size: 12px; color: #fca5a5; margin: 0;"><strong>Atención:</strong> Este enlace expirará en 15 minutos por seguridad.</p>
                        </div>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ mensaje: 'Si el correo existe en nuestro sistema, hemos enviado un enlace de recuperación.' });

    } catch (error) {
        console.error('Error en recuperarPassword:', error);
        res.status(500).json({ error: 'Error procesando la solicitud de recuperación.' });
    }
};

// ==========================================
// 5. ACTUALIZAR CONTRASEÑA EN LA BD
// ==========================================
exports.actualizarPassword = async (req, res) => {
    const { token, nuevaPassword } = req.body;

    if (!token || !nuevaPassword) {
        return res.status(400).json({ error: 'Faltan datos para restablecer la contraseña.' });
    }

    try {
        // Verificar que el token sea válido y no haya expirado
        const decodificado = jwt.verify(token, process.env.JWT_SECRET || 'super_secreto_alerta_digital_duoc');
        const idUsuario = decodificado.id;

        // Encriptar la nueva contraseña
        const salt = await bcrypt.genSalt(10);
        const passwordHashed = await bcrypt.hash(nuevaPassword, salt);

        // Actualizar la base de datos Oracle
        const sql = `UPDATE usuario SET password = :password WHERE id_usuario = :id`;
        const result = await execute(sql, { password: passwordHashed, id: idUsuario });

        if (result.rowsAffected === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado en el sistema.' });
        }

        res.status(200).json({ mensaje: '¡Contraseña actualizada correctamente! Ya puedes iniciar sesión.' });

    } catch (error) {
        console.error('Error al actualizar contraseña:', error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'El enlace ha expirado por seguridad. Por favor, solicita uno nuevo.' });
        }
        res.status(401).json({ error: 'El enlace es inválido o está corrupto.' });
    }
};