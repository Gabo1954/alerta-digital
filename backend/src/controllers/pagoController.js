const { WebpayPlus, Options, Environment } = require('transbank-sdk');
const { execute } = require('../config/db');

const COMMERCE_CODE = '597055555532';
const API_KEY = '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C';

const webpay = new WebpayPlus.Transaction(new Options(
    COMMERCE_CODE, 
    API_KEY, 
    Environment.Integration
));

exports.crearSesionPago = async (req, res) => {
    try {
        const idUsuario = req.usuario.id;
        const buyOrder = `ORD-${idUsuario}-${Date.now()}`;
        const sessionId = `SES-${idUsuario}`;
        const amount = 2990;
        
        const returnUrl = 'http://localhost:5173/pago-resultado'; 

        const response = await webpay.create(buyOrder, sessionId, amount, returnUrl);
        
        console.log(`[Webpay] Sesión Creada para User ${idUsuario}: ${response.token}`);

        res.status(200).json({ 
            token: response.token,
            url: response.url 
        });
    } catch (error) {
        console.error('Error Webpay Create:', error);
        res.status(500).json({ error: 'No se pudo establecer conexión con Transbank.' });
    }
};

exports.confirmarPago = async (req, res) => {
    const { token_ws } = req.body;
    const idUsuario = req.usuario.id;

    if (!token_ws) {
        return res.status(400).json({ error: 'Token de pago no recibido.' });
    }

    try {
        const response = await webpay.commit(token_ws);

        if (response.response_code === 0 && response.status === 'AUTHORIZED') {
            
            // LA SOLUCIÓN DB: Forzamos el autoCommit a true en esta consulta específica
            const sql = `UPDATE usuario SET es_vip = 1 WHERE id_usuario = :id_user`;
            
            try {
                await execute(sql, { id_user: idUsuario }, { autoCommit: true });
                console.log(`[Oracle] Usuario ${idUsuario} actualizado a VIP de forma permanente.`);
            } catch (dbError) {
                console.error('Error DB Oracle al subir a VIP:', dbError);
            }

            return res.status(200).json({ 
                autorizado: true, 
                mensaje: "Transacción aprobada con éxito.",
                detalles: response 
            });
        } else {
            console.warn(`[Webpay] Pago no autorizado. Status: ${response.status}`);
            return res.status(401).json({ 
                autorizado: false, 
                mensaje: "La transacción fue rechazada o anulada por el usuario.",
                codigo: response.response_code
            });
        }
    } catch (error) {
        console.error('Error crítico en Webpay Commit:', error);
        res.status(500).json({ 
            error: 'Fallo interno al validar el pago con el servidor bancario.' 
        });
    }
};