// backend/src/controllers/mensajeController.js
const { execute } = require('../config/db');
const oracledb = require('oracledb');
const analyzerService = require('../services/analyzerService');

exports.analizarMensaje = async (req, res) => {
    const { contenido } = req.body;
    const idUsuario = req.usuario.id; 

    if (!contenido) {
        return res.status(400).json({ error: 'Debes enviar el contenido del mensaje a analizar.' });
    }

    try {
        // 1. Pasamos el mensaje por el Motor Heurístico (IA)
        const reporteAnalisis = analyzerService.evaluarMensaje(contenido);

        // 2. Guardar el mensaje en Oracle
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

        // 3. Guardar el resultado en Oracle
        const sqlAnalisis = `
            INSERT INTO analisis (fecha_analisis, mensaje_id_mensaje, nivel_riesgo_id_nivel, resultado_analisis_id_resultado)
            VALUES (SYSTIMESTAMP, :mensaje_id, :nivel_riesgo, :resultado_id)
        `;
        await execute(sqlAnalisis, {
            mensaje_id: idMensajeInsertado,
            nivel_riesgo: reporteAnalisis.idNivelRiesgo,
            resultado_id: reporteAnalisis.idResultado
        });

        // 4. Mapear para Frontend
        const etiquetasRiesgo = { 1: 'Bajo', 2: 'Medio', 3: 'Alto' };
        const etiquetasResultado = { 1: '✅ Mensaje Seguro', 2: '⚠️ Mensaje Sospechoso', 3: '🚨 Phishing Detectado' };

        // 5. Devolver reporte
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

exports.feedbackMensaje = async (req, res) => {
    const { contenido, esFraude } = req.body;

    if (!contenido || typeof esFraude === 'undefined') {
        return res.status(400).json({ error: 'Faltan datos para el entrenamiento del modelo.' });
    }

    try {
        // Ejecutamos la función de reentrenamiento en nuestro cerebro IA
        const resultadoEntrenamiento = analyzerService.entrenarModelo(contenido, esFraude);
        
        console.log(`IA Actualizada: Usuario reportó texto como ${esFraude ? 'FRAUDE' : 'SEGURO'}`);
        
        res.status(200).json({ 
            mensaje: 'Feedback procesado exitosamente.',
            estado: resultadoEntrenamiento.message
        });
    } catch (error) {
        console.error('Error interno al entrenar el modelo ML:', error);
        res.status(500).json({ error: 'Error interno en el motor de aprendizaje.' });
    }
};
