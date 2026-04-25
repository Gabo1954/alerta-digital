import { useEffect, useState } from 'react';
import api from '../services/api';

const PagoResultado = () => {
    const [estado, setEstado] = useState('validando');
    const [detalleError, setDetalleError] = useState('');
    const [countdown, setCountdown] = useState(4);

    useEffect(() => {
        const validarTransaccion = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('token_ws');

            if (!token) {
                setEstado('error');
                setDetalleError('No se recibió el token de confirmación.');
                return;
            }

            try {
                const { data } = await api.post('/pagos/confirmar', { token_ws: token });
                if (data.autorizado) {
                    localStorage.setItem('isPro', 'true');
                    setEstado('exito');
                    iniciarAutoRedirect();
                } else {
                    setEstado('error');
                    setDetalleError(data.mensaje || 'Pago rechazado por el banco.');
                }
            } catch (err) {
                setEstado('error');
                setDetalleError('Fallo de comunicación con Alerta Digital.');
            }
        };

        validarTransaccion();
    }, []);

    const iniciarAutoRedirect = () => {
        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    window.location.href = '/';
                }
                return prev - 1;
            });
        }, 1000);
    };

    return (
        <div className="h-[100dvh] bg-black flex items-center justify-center p-6 text-center font-sans">
            <div className="bg-gray-900/80 backdrop-blur-xl p-10 rounded-[3rem] border border-white/5 shadow-2xl max-w-sm w-full">
                
                {estado === 'validando' && (
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="h-16 w-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                        <p className="text-white font-black text-xl">Validando pago...</p>
                        <p className="text-gray-500 text-sm mt-2 font-bold uppercase tracking-widest">Conexión Segura</p>
                    </div>
                )}

                {estado === 'exito' && (
                    <div className="animate-fade-in flex flex-col items-center">
                        <div className="w-24 h-24 bg-green-500/10 rounded-[2rem] flex items-center justify-center text-green-500 text-5xl mb-6 shadow-[0_0_50px_rgba(34,197,94,0.2)]">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h2 className="text-white text-3xl font-black mb-3 tracking-tight">¡PAGO EXITOSO!</h2>
                        <p className="text-gray-400 mb-8 text-sm font-medium">Tu suscripción VIP ya está activa.</p>
                        <button onClick={() => window.location.href = '/'} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg active:scale-95 transition-all">
                            COMENZAR ({countdown}s)
                        </button>
                    </div>
                )}

                {estado === 'error' && (
                    <div className="animate-fade-in flex flex-col items-center">
                        <div className="w-24 h-24 bg-red-500/10 rounded-[2rem] flex items-center justify-center text-red-500 text-5xl mb-6 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </div>
                        <h2 className="text-white text-3xl font-black mb-3 tracking-tight">PAGO FALLIDO</h2>
                        <p className="text-red-400 mb-8 text-xs font-bold uppercase tracking-widest leading-relaxed">{detalleError}</p>
                        <button onClick={() => window.location.href = '/'} className="w-full bg-gray-800 text-white py-4 rounded-2xl font-black active:scale-95 transition-all border border-white/10">
                            REINTENTAR
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PagoResultado;