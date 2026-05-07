const { execute } = require('../config/db');
const oracledb = require('oracledb');
const analizadorServicio = require('../services/AnalizadorServicio');
const axios = require('axios'); 

// ==========================================
// 1. ANALIZAR MENSAJE (TEXTO NORMAL)
// ==========================================
exports.analizarMensaje = async (req, res) => {
    const { contenido } = req.body;
    // Extraemos el ID de forma segura previendo diferentes formatos del token
    const idUsuario = req.usuario?.id || req.usuario?.ID_USUARIO; 

    if (!idUsuario) return res.status(401).json({ error: 'Sesión corrupta. Inicia sesión nuevamente.' });
    if (!contenido) return res.status(400).json({ error: 'Debes enviar el contenido del mensaje a analizar.' });

    try {
        const reporteAnalisis = await analizadorServicio.evaluarMensaje(contenido);

        const sqlMensaje = `
            INSERT INTO mensaje (contenido, fecha_recepcion, usuario_id_usuario) 
            VALUES (:contenido, SYSTIMESTAMP, :usuario_id)
            RETURNING id_mensaje INTO :out_id
        `;
        const bindsMensaje = {
            contenido: contenido,
            usuario_id: idUsuario,
            out_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } 
        };
        const resultMensaje = await execute(sqlMensaje, bindsMensaje);
        const idMensajeInsertado = resultMensaje.outBinds.out_id[0];

        const sqlAnalisis = `
            INSERT INTO analisis (fecha_analisis, mensaje_id_mensaje, nivel_riesgo_id_nivel, resultado_analisis_id_resultado)
            VALUES (SYSTIMESTAMP, :mensaje_id, :nivel_riesgo, :resultado_id)
        `;
        await execute(sqlAnalisis, {
            mensaje_id: idMensajeInsertado,
            nivel_riesgo: reporteAnalisis.idNivelRiesgo,
            resultado_id: reporteAnalisis.idResultado
        });

        const etiquetasRiesgo = { 1: 'Bajo', 2: 'Medio', 3: 'Alto' };
        const etiquetasResultado = { 1: '✅ Mensaje Seguro', 2: '⚠️ Mensaje Sospechoso', 3: '🚨 Phishing Detectado' };

        res.status(201).json({
            mensaje: 'Análisis completado',
            reporte: {
                id_mensaje: idMensajeInsertado,
                texto_analizado: contenido,
                nivel_riesgo: etiquetasRiesgo[reporteAnalisis.idNivelRiesgo],
                resultado: etiquetasResultado[reporteAnalisis.idResultado],
                score_peligro: reporteAnalisis.puntajeTotal,
                categoria: reporteAnalisis.categoria || 'Comunicación Estándar',
                motivos: reporteAnalisis.detalles
            }
        });

    } catch (error) {
        console.error('Error al analizar mensaje:', error);
        res.status(500).json({ error: 'Error interno al procesar el mensaje.' });
    }
};

// ==========================================
// 2. ANALIZAR IMAGEN VIP (CONEXIÓN A PYTHON)
// ==========================================
exports.analizarImagenVIP = async (req, res) => {
    const { imagen_base64 } = req.body;
    const idUsuario = req.usuario?.id || req.usuario?.ID_USUARIO;

    if (!idUsuario) return res.status(401).json({ error: 'Sesión corrupta. Inicia sesión nuevamente.' });
    if (!imagen_base64) return res.status(400).json({ error: "No se proporcionó ninguna imagen." });

    try {
        // [!] SOLUCIÓN AL ERROR 500 AL ESCANEAR IMAGEN: 
        // Agregamos límites infinitos para que Axios soporte imágenes pesadas sin caerse.
        const pythonResponse = await axios.post('http://127.0.0.1:8000/api/ia/ocr', {
            image_base64: imagen_base64
        }, {
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });

        if (!pythonResponse.data.success) {
            console.error("Python OCR devolvió error:", pythonResponse.data.error);
            return res.status(500).json({ error: 'El motor OCR de Python falló: ' + pythonResponse.data.error });
        }

        const textoExtraido = pythonResponse.data.text;

        if (!textoExtraido || textoExtraido.trim() === '') {
            return res.status(200).json({ 
                reporte: {
                    resultado: "IMAGEN LIMPIA",
                    score_peligro: 0,
                    nivel_riesgo: "Bajo",
                    categoria: "Imagen sin texto",
                    motivos: ["No se detectó texto sospechoso en la imagen."]
                }
            });
        }

        const reporteAnalisis = await analizadorServicio.evaluarMensaje(textoExtraido);

        const sqlMensaje = `
            INSERT INTO mensaje (contenido, fecha_recepcion, usuario_id_usuario) 
            VALUES (:contenido, SYSTIMESTAMP, :usuario_id)
            RETURNING id_mensaje INTO :out_id
        `;
        const resultMensaje = await execute(sqlMensaje, {
            contenido: "(FOTO ESCANEADA): " + textoExtraido.substring(0, 3000), 
            usuario_id: idUsuario,
            out_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } 
        });
        const idMensajeInsertado = resultMensaje.outBinds.out_id[0];

        const sqlAnalisis = `
            INSERT INTO analisis (fecha_analisis, mensaje_id_mensaje, nivel_riesgo_id_nivel, resultado_analisis_id_resultado)
            VALUES (SYSTIMESTAMP, :mensaje_id, :nivel_riesgo, :resultado_id)
        `;
        await execute(sqlAnalisis, {
            mensaje_id: idMensajeInsertado,
            nivel_riesgo: reporteAnalisis.idNivelRiesgo,
            resultado_id: reporteAnalisis.idResultado
        });

        const etiquetasRiesgo = { 1: 'Bajo', 2: 'Medio', 3: 'Alto' };
        const etiquetasResultado = { 1: '✅ Mensaje Seguro', 2: '⚠️ Mensaje Sospechoso', 3: '🚨 Phishing Detectado' };

        res.status(200).json({
            reporte: {
                id_mensaje: idMensajeInsertado,
                texto_analizado: "(IMAGEN) " + textoExtraido,
                texto_leido_oculto: textoExtraido, 
                nivel_riesgo: etiquetasRiesgo[reporteAnalisis.idNivelRiesgo],
                resultado: etiquetasResultado[reporteAnalisis.idResultado],
                score_peligro: reporteAnalisis.puntajeTotal,
                categoria: reporteAnalisis.categoria || 'Imagen procesada',
                motivos: reporteAnalisis.detalles
            }
        });

    } catch (error) {
        console.error("Error crítico en Gateway de IA:", error.message || error);
        res.status(500).json({ error: "Error de comunicación con el Microservicio IA en Python." });
    }
};

// ==========================================
// 3. FEEDBACK MENSAJE (ENTRENAMIENTO IA)
// ==========================================
exports.feedbackMensaje = async (req, res) => {
    const { contenido, esFraude } = req.body;

    if (!contenido || typeof esFraude === 'undefined') {
        return res.status(400).json({ error: 'Faltan datos para el entrenamiento del modelo.' });
    }

    try {
        const resultadoEntrenamiento = await analizadorServicio.entrenarModelo(contenido, esFraude);
        console.log(`IA Actualizada en Oracle: Usuario reportó texto como ${esFraude ? 'FRAUDE' : 'SEGURO'}`);
        res.status(200).json({ 
            mensaje: 'Feedback procesado exitosamente.',
            estado: resultadoEntrenamiento.message
        });
    } catch (error) {
        console.error('Error interno al entrenar el modelo ML:', error);
        res.status(500).json({ error: 'Error interno en el motor de aprendizaje.' });
    }
};

// ==========================================
// 4. OBTENER HISTORIAL DEL USUARIO
// ==========================================
exports.obtenerHistorial = async (req, res) => {
    try {
        const idUsuario = req.usuario?.id || req.usuario?.ID_USUARIO; 

        if (!idUsuario) {
            return res.status(401).json({ error: "Sesión corrupta o token expirado. Por favor, cierra sesión y vuelve a ingresar." });
        }

        // [!] SOLUCIÓN AL ERROR 500 EN EL HISTORIAL: 
        // Se agregó DBMS_LOB.SUBSTR(m.contenido, 4000, 1) para obligar a Oracle a parsear el CLOB a Texto y evitar errores circulares en Node.
        const sql = `
            SELECT 
                m.id_mensaje AS id,
                TO_CHAR(a.fecha_analisis, 'DD/MM/YYYY HH24:MI') AS fecha,
                DBMS_LOB.SUBSTR(m.contenido, 4000, 1) AS texto, 
                nr.nombre AS riesgo
            FROM mensaje m
            JOIN analisis a ON m.id_mensaje = a.mensaje_id_mensaje
            JOIN nivel_riesgo nr ON a.nivel_riesgo_id_nivel = nr.id_nivel
            WHERE m.usuario_id_usuario = :id_usuario
            ORDER BY a.fecha_analisis DESC
        `;

        const result = await execute(sql, { id_usuario: idUsuario });

        // Oracle retorna columnas en MAYÚSCULAS
        const historialFormat = result.rows.map(row => ({
            id: row.ID || row.id,
            fecha: row.FECHA || row.fecha,
            texto: row.TEXTO || row.texto,
            riesgo: row.RIESGO || row.riesgo
        }));

        res.status(200).json({ historial: historialFormat });

    } catch (error) {
        console.error("Error crítico obteniendo historial desde Oracle:", error);
        res.status(500).json({ error: "Fallo interno en la base de datos al cargar el historial." });
    }
};