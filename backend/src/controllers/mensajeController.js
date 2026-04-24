// backend/src/controllers/mensajeController.js
const { execute } = require('../config/db');
const oracledb = require('oracledb');
const analyzerService = require('../services/analyzerService'); // Importamos el cerebro

exports.analizarMensaje = async (req, res) => {
    const { contenido } = req.body;
    const idUsuario = req.usuario.id; 

    if (!contenido) {
        return res.status(400).json({ error: 'Debes enviar el contenido del mensaje a analizar.' });
    }

    try {
        // 1. Pasamos el mensaje por el Motor Heurístico
        const reporteAnalisis = analyzerService.evaluarMensaje(contenido);

        // 2. Guardar el mensaje en Oracle obteniendo su ID al instante
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

        // 3. Guardar el resultado del análisis en la tabla 'analisis'
        const sqlAnalisis = `
            INSERT INTO analisis (fecha_analisis, mensaje_id_mensaje, nivel_riesgo_id_nivel, resultado_analisis_id_resultado)
            VALUES (SYSTIMESTAMP, :mensaje_id, :nivel_riesgo, :resultado_id)
        `;

        await execute(sqlAnalisis, {
            mensaje_id: idMensajeInsertado,
            nivel_riesgo: reporteAnalisis.idNivelRiesgo,
            resultado_id: reporteAnalisis.idResultado
        });

        // 4. Mapear textos para que el Frontend los entienda fácil
        const etiquetasRiesgo = { 1: 'Bajo', 2: 'Medio', 3: 'Alto' };
        const etiquetasResultado = { 1: '✅ Mensaje Seguro', 2: '⚠️ Mensaje Sospechoso', 3: '🚨 Phishing / Fraude Detectado' };

        // 5. Devolver el reporte detallado
        res.status(201).json({
            mensaje: 'Análisis completado',
            reporte: {
                id_mensaje: idMensajeInsertado,
                texto_analizado: contenido,
                nivel_riesgo: etiquetasRiesgo[reporteAnalisis.idNivelRiesgo],
                resultado: etiquetasResultado[reporteAnalisis.idResultado],
                score_peligro: reporteAnalisis.puntajeTotal,
                motivos: reporteAnalisis.detalles
            }
        });

    } catch (error) {
        console.error('Error al analizar mensaje:', error);
        res.status(500).json({ error: 'Error interno al procesar el mensaje.' });
    }
};