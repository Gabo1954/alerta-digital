import { useState } from 'react';
import api from '../services/api';

const Suscripcion = ({ isPremium, setTabActiva }) => {
    const [cargando, setCargando] = useState(false);

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
            alert('No se pudo iniciar la conexión segura con Transbank.');
            setCargando(false);
        }
    };

    // --- VISTA: USUARIO YA ES VIP ---
    if (isPremium) {
        return (
            <div className="p-6 flex flex-col items-center justify-center animate-fade-in pt-12">
                <div className="relative w-full max-w-sm bg-linear-to-br from-yellow-400 via-yellow-600 to-yellow-800 p-1 rounded-3xl shadow-[0_0_50px_rgba(250,204,21,0.3)] mb-8">
                    <div className="bg-gray-950 p-8 rounded-[1.35rem] h-full relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/20 blur-3xl"></div>
                        
                        <div className="flex justify-between items-start mb-8">
                            <div className="w-12 h-12 bg-yellow-500/10 text-yellow-500 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            </div>
                            <span className="text-yellow-500 font-black tracking-widest text-xs border border-yellow-500/30 px-3 py-1 rounded-full uppercase">Activa</span>
                        </div>
                        <h2 className="text-3xl font-black text-white mb-1">Cuenta PRO</h2>
                        <p className="text-gray-400 text-sm">Protección total desbloqueada.</p>
                    </div>
                </div>

                <div className="w-full bg-gray-900/50 border border-white/5 rounded-3xl p-6 text-left space-y-4">
                    <h3 className="text-white font-bold text-sm uppercase tracking-widest opacity-50 mb-2">Tus Beneficios Actuales</h3>
                    <p className="text-gray-300 text-sm flex items-center gap-3"><span className="text-green-500 text-xl">✓</span> Escáner visual de Imágenes</p>
                    <p className="text-gray-300 text-sm flex items-center gap-3"><span className="text-green-500 text-xl">✓</span> Historial ilimitado de análisis</p>
                    <p className="text-gray-300 text-sm flex items-center gap-3"><span className="text-green-500 text-xl">✓</span> Academia Avanzada</p>
                </div>
            </div>
        );
    }

    // --- VISTA: OFERTA DE PLANES (BÁSICO VS PRO) ---
    return (
        <div className="p-5 flex flex-col justify-center animate-fade-in pt-8">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-white leading-none">Mejora tu <br/><span className="text-yellow-500 underline decoration-4 underline-offset-4">Seguridad</span></h2>
                <p className="text-gray-400 text-sm mt-4">Compara los planes y elige la máxima protección.</p>
            </div>

            {/* TABLA COMPARATIVA RESPONSIVA */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                {/* Columna Plan Básico */}
                <div className="bg-gray-800/40 p-4 rounded-3xl border border-white/5 flex flex-col">
                    <h4 className="text-gray-400 font-black text-xs uppercase tracking-widest mb-4 text-center">Básico</h4>
                    <ul className="space-y-4 flex-1">
                        <li className="flex items-start gap-2 text-xs text-gray-300">
                            <span className="text-blue-500 shrink-0">✓</span> Analizador de Texto
                        </li>
                        <li className="flex items-start gap-2 text-xs text-gray-300">
                            <span className="text-blue-500 shrink-0">✓</span> Academia Gratis
                        </li>
                        <li className="flex items-start gap-2 text-xs text-gray-600">
                            <span className="text-gray-700 shrink-0">✕</span> Escáner de Imágenes
                        </li>
                        <li className="flex items-start gap-2 text-xs text-gray-600">
                            <span className="text-gray-700 shrink-0">✕</span> Historial Guardado
                        </li>
                    </ul>
                    <div className="mt-4 pt-4 border-t border-white/5 text-center">
                        <span className="text-gray-400 font-bold text-sm">Gratis</span>
                    </div>
                </div>

                {/* Columna Plan PRO (Destacada) */}
                <div className="bg-linear-to-b from-yellow-500/20 to-gray-900 p-4 rounded-3xl border border-yellow-500/40 shadow-[0_0_30px_rgba(250,204,21,0.1)] relative flex flex-col">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase shadow-lg shadow-yellow-500/30">VIP</div>
                    <h4 className="text-yellow-500 font-black text-xs uppercase tracking-widest mb-4 text-center mt-1">PRO</h4>
                    <ul className="space-y-4 flex-1">
                        <li className="flex items-start gap-2 text-xs text-white">
                            <span className="text-yellow-500 shrink-0">✓</span> Analizador de Texto
                        </li>
                        <li className="flex items-start gap-2 text-xs text-white">
                            <span className="text-yellow-500 shrink-0">✓</span> Academia Completa
                        </li>
                        <li className="flex items-start gap-2 text-xs text-white font-bold">
                            <span className="text-yellow-500 shrink-0">✓</span> Escáner de Imágenes
                        </li>
                        <li className="flex items-start gap-2 text-xs text-white font-bold">
                            <span className="text-yellow-500 shrink-0">✓</span> Historial Guardado
                        </li>
                    </ul>
                    <div className="mt-4 pt-4 border-t border-yellow-500/20 text-center">
                        <span className="text-yellow-500 font-black text-lg">$2.990</span><span className="text-gray-400 text-[10px]">/mes</span>
                    </div>
                </div>
            </div>

            {/* BOTÓN DE PAGO Y LOGO WEBPAY INTEGRADO (Solución imagen rota) */}
            <div className="bg-gray-900/80 backdrop-blur-xl rounded-[2rem] border border-white/5 p-6 shadow-2xl relative overflow-hidden">
                <button 
                    onClick={iniciarPagoWebpay}
                    disabled={cargando}
                    className="w-full bg-linear-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-black py-4 rounded-2xl transition-all flex justify-center items-center gap-3 shadow-xl shadow-yellow-500/20 active:scale-95"
                >
                    {cargando ? (
                        <span className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full"></span>
                    ) : (
                        <>CONTRATAR AHORA</>
                    )}
                </button>

                <div className="flex flex-col items-center gap-2 mt-5">
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest text-center">Pago 100% seguro procesado por</p>
                    
                    {/* SVG y Texto de Webpay (No se romperá nunca) */}
                    <div className="flex items-center gap-2 opacity-60 grayscale hover:grayscale-0 transition-all">
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span className="font-black text-lg tracking-tighter italic">Webpay Plus</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Suscripcion;