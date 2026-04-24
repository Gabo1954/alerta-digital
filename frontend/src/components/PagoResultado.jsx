import { useEffect, useState } from 'react';
import api from '../services/api';

const PagoResultado = () => {
    const [estado, setEstado] = useState('validando');
    const [detalleError, setDetalleError] = useState('');

    useEffect(() => {
        const validarTransaccion = async () => {
            // 1. Capturar el token que Transbank envía por la URL
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('token_ws');

            if (!token) {
                setEstado('error');
                setDetalleError('No se recibió el token de confirmación de Transbank.');
                return;
            }

            try {
                // 2. Enviar el token al backend para el "Commit" final
                const { data } = await api.post('/pagos/confirmar', { token_ws: token });

                if (data.autorizado) {
                    // 3. Si el banco autorizó, guardamos el estado VIP localmente
                    localStorage.setItem('isPro', 'true');
                    setEstado('exito');
                } else {
                    setEstado('error');
                    setDetalleError(data.mensaje || 'La transacción fue rechazada por el banco.');
                }
            } catch (err) {
                console.error("Error confirmando pago:", err);
                setEstado('error');
                setDetalleError('Fallo de comunicación con el servidor de Alerta Digital.');
            }
        };

        validarTransaccion();
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6 text-center font-sans">
            <div className="bg-gray-800 p-10 rounded-3xl border border-gray-700 shadow-2xl max-sm:w-full max-w-sm">
                
                {estado === 'validando' && (
                    <div className="animate-pulse">
                        <div className="h-14 w-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                        <p className="text-white font-bold text-lg">Validando pago...</p>
                        <p className="text-gray-400 text-sm mt-2">Conectando con Transbank</p>
                    </div>
                )}

                {estado === 'exito' && (
                    <div className="animate-fade-in">
                        <div className="text-green-500 text-7xl mb-6">✅</div>
                        <h2 className="text-white text-2xl font-black mb-3">¡PAGO EXITOSO!</h2>
                        <p className="text-gray-400 mb-8 text-sm">Tu suscripción VIP ya está activa. Disfruta de la protección avanzada.</p>
                        <button 
                            onClick={() => window.location.href = '/'} 
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-600/30 transition-all active:scale-95"
                        >
                            COMENZAR
                        </button>
                    </div>
                )}

                {estado === 'error' && (
                    <div className="animate-fade-in">
                        <div className="text-red-500 text-7xl mb-6">❌</div>
                        <h2 className="text-white text-2xl font-black mb-3">PAGO FALLIDO</h2>
                        <p className="text-red-400 mb-8 text-xs font-bold uppercase tracking-widest leading-relaxed">
                            {detalleError}
                        </p>
                        <button 
                            onClick={() => window.location.href = '/'} 
                            className="w-full bg-gray-700 hover:bg-gray-600 text-white py-4 rounded-2xl font-black transition-all active:scale-95 shadow-lg"
                        >
                            REINTENTAR
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PagoResultado;