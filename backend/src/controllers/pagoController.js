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
        
        // 1. Apuntamos a tu Backend, enviando el ID del usuario como parámetro
        // Asegúrate de que esta URL coincida con tu ruta en Render
        const returnUrl = `https://alerta-digital.onrender.com/api/pagos/retorno?id=${idUsuario}`; 

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
    // 2. Transbank envía la respuesta. Extraemos el token y el ID del usuario
    const token_ws = req.query.token_ws || req.body.token_ws;
    const idUsuario = req.query.id; 

    // Si el usuario canceló el pago, Transbank no envía token_ws
    if (!token_ws) {
        return res.redirect('alertadigital://pago-resultado?status=cancelado');
    }

    try {
        const response = await webpay.commit(token_ws);

        if (response.response_code === 0 && response.status === 'AUTHORIZED') {
            
            const sql = `UPDATE usuario SET es_vip = 1 WHERE id_usuario = :id_user`;
            
            try {
                await execute(sql, { id_user: idUsuario }, { autoCommit: true });
                console.log(`[Oracle] Usuario ${idUsuario} actualizado a VIP.`);
            } catch (dbError) {
                console.error('Error DB Oracle al subir a VIP:', dbError);
            }

            // 3. MAGIA NATIVA: Redirigimos al esquema Android para cerrar Chrome
            return res.redirect('alertadigital://pago-resultado?status=success');

        } else {
            console.warn(`[Webpay] Pago no autorizado. Status: ${response.status}`);
            return res.redirect('alertadigital://pago-resultado?status=rechazado');
        }
    } catch (error) {
        console.error('Error crítico en Webpay Commit:', error);
        return res.redirect('alertadigital://pago-resultado?status=error');
    }
};