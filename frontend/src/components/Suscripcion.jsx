import { useState, useEffect } from 'react';
import api from '../services/api';

const Suscripcion = ({ isPremium, setIsPremium, setTabActiva }) => {
    const [cargando, setCargando] = useState(false);

    // Detectar retorno desde el portal de Webpay
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const tokenWs = urlParams.get('token_ws');

        if (tokenWs) {
            finalizarPagoOficial(tokenWs);
        }
    }, []);

    const iniciarPagoWebpay = async () => {
        setCargando(true);
        try {
            const { data } = await api.post('/pagos/crear-sesion');
            
            // Creación de formulario dinámico para POST automático al portal de Transbank
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = data.url;

            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'token_ws';
            input.value = data.token;

            form.appendChild(input);
            document.body.appendChild(form);
            form.submit(); 
        } catch (err) {
            alert('No se pudo iniciar la conexión con el portal de pagos.');
            setCargando(false);
        }
    };

    const finalizarPagoOficial = async (token) => {
        try {
            const { data } = await api.post('/pagos/confirmar', { token_ws: token });
            if (data.autorizado) {
                setIsPremium(true);
                localStorage.setItem('isPro', 'true');
                alert('¡Pago exitoso! Bienvenido al nivel VIP.');
                setTabActiva('inicio');
            }
        } catch (err) {
            alert('La transacción no pudo ser autorizada.');
        }
    };

    if (isPremium) {
        return (
            <div className="p-8 text-center mt-10 animate-fade-in">
                <div className="w-20 h-20 bg-yellow-500/20 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-black text-white mb-2">Cuenta VIP Activa</h2>
                <p className="text-gray-400">Protección máxima e IA visual desbloqueadas.</p>
            </div>
        );
    }

    return (
        <div className="p-6 min-h-full flex flex-col justify-center animate-fade-in">
            <div className="bg-gray-800 rounded-3xl border-2 border-yellow-500/30 p-6 shadow-2xl">
                <h3 className="text-2xl font-bold text-white mb-1 tracking-tight">Plan VIP Digital</h3>
                <p className="text-3xl font-black text-yellow-500 mb-6">$2.990 <span className="text-xs text-gray-500 font-normal tracking-normal">CLP/mes</span></p>
                
                <button 
                    onClick={iniciarPagoWebpay}
                    disabled={cargando}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl transition-all flex justify-center items-center gap-2"
                >
                    {cargando ? (
                        <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                    ) : (
                        <>Pagar con Webpay Plus <span className="text-xs opacity-70">Oficial</span></>
                    )}
                </button>
                <div className="flex justify-center gap-4 mt-6 opacity-50 grayscale scale-75">
                    <img src="https://www.transbank.cl/public/img/logo-webpay-plus.png" alt="Webpay" className="h-8" />
                </div>
            </div>
        </div>
    );
};

export default Suscripcion;