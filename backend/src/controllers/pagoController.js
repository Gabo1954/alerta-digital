const { WebpayPlus, Options, Environment } = require('transbank-sdk');
const { execute } = require('../config/db');

// CREDENCIALES OFICIALES DE INTEGRACIÓN (Documentación Transbank)
const COMMERCE_CODE = '597055555532';
const API_KEY = '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C';

// Configuración del objeto Webpay
const webpay = new WebpayPlus.Transaction(new Options(
    COMMERCE_CODE, 
    API_KEY, 
    Environment.Integration
));

// 1. Iniciar sesión en Transbank
exports.crearSesionPago = async (req, res) => {
    try {
        const idUsuario = req.usuario.id;
        const buyOrder = `ORD-${idUsuario}-${Date.now()}`;
        const sessionId = `SES-${idUsuario}`;
        const amount = 2990;
        
        // El puerto debe coincidir con tu frontend Vite
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

// 2. Confirmar transacción (Commit)
exports.confirmarPago = async (req, res) => {
    const { token_ws } = req.body;
    const idUsuario = req.usuario.id;

    if (!token_ws) {
        return res.status(400).json({ error: 'Token de pago no recibido.' });
    }

    try {
        // Llamada al SDK para confirmar el pago
        const response = await webpay.commit(token_ws);

        /**
         * Según la documentación oficial:
         * response_code === 0 significa Aprobado.
         * status === 'AUTHORIZED' confirma la autorización bancaria.
         */
        if (response.response_code === 0 && response.status === 'AUTHORIZED') {
            
            // ACTUALIZACIÓN EN ORACLE (Cumpliendo arquitectura MVC)
            const sql = `UPDATE usuario SET es_vip = 1 WHERE id_usuario = :id_user`;
            
            try {
                await execute(sql, { id_user: idUsuario });
                console.log(`[Oracle] Usuario ${idUsuario} actualizado a VIP.`);
            } catch (dbError) {
                console.error('Error DB Oracle al subir a VIP:', dbError);
                // No devolvemos error al cliente aquí porque el pago SÍ se cobró
            }

            return res.status(200).json({ 
                autorizado: true, 
                mensaje: "Transacción aprobada con éxito.",
                detalles: response 
            });
        } else {
            // El usuario canceló o el banco rechazó
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