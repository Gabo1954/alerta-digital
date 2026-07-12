import React, { useState, useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';
import { registerPlugin, Capacitor } from '@capacitor/core';

// Criterio de Aceptación: Conectamos el plugin de Java con React
const OverlayPermission = registerPlugin('OverlayPermission');

const Perfil = ({ usuario, isPremium, setTabActiva, onLogout }) => {
    const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [smsActivo, setSmsActivo] = useState(true);
    
    // Estado del permiso de superposición
    const [tienePermisoBurbuja, setTienePermisoBurbuja] = useState(true);

    const inicial = usuario?.nombre ? usuario.nombre.charAt(0).toUpperCase() : 'U';
    const nombreCompleto = `${usuario?.nombre || 'Usuario'}`;

    useEffect(() => {
        const inicializarAjustes = async () => {
            const { value } = await Preferences.get({ key: 'consentimiento_sms' });
            setSmsActivo(value !== 'false');

            if (Capacitor.getPlatform() === 'android') {
                const res = await OverlayPermission.checkPermission();
                setTienePermisoBurbuja(res.granted);
            }
        };
        inicializarAjustes();
    }, []);

    const toggleSms = async () => {
        const nuevoEstado = !smsActivo;
        setSmsActivo(nuevoEstado);
        await Preferences.set({ key: 'consentimiento_sms', value: nuevoEstado.toString() });
        alert(nuevoEstado ? "✅ Protección activada." : "🚨 Protección desactivada.");
    };

    const solicitarPermisoBurbuja = async () => {
        if (Capacitor.getPlatform() === 'android') {
            await OverlayPermission.requestPermission();
            setTimeout(async () => {
                const res = await OverlayPermission.checkPermission();
                setTienePermisoBurbuja(res.granted);
                if (res.granted) alert("Permiso concedido. Las burbujas de alerta están activadas.");
            }, 1000);
        } else {
            alert("Las burbujas flotantes solo están disponibles en dispositivos Android nativos.");
        }
    };

    const handleEliminarCuenta = async () => {
        setIsDeleting(true);
        try {
            const token = localStorage.getItem('token'); 
            const response = await fetch('https://alerta-digital.onrender.com/api/usuarios/eliminar-cuenta', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                alert(data.mensaje); 
                onLogout();
            } else { alert(data.error || "No se pudo procesar la solicitud."); }
        } catch (error) {
            alert("Error de conexión con el servidor. Intente más tarde.");
        } finally {
            setIsDeleting(false);
            setMostrarModalEliminar(false);
        }
    };

    return (
        <div className="flex-1 w-full px-5 pt-6 pb-20 animate-fade-in-up font-sans relative overflow-y-auto custom-scrollbar">

            <header className="mb-8 flex flex-col items-center text-center">
                <h2 className="flex flex-col text-4xl font-black tracking-tighter text-white uppercase leading-none select-none items-center">
                    <span>Centro de</span>
                    <span className="text-3xl font-extralight tracking-normal normal-case italic bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent block mt-1 py-1">Seguridad</span>
                </h2>
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">ID: {usuario?.id || 'LOCAL-USER'}</p>
            </header>

            <div className={`relative overflow-hidden rounded-[2.5rem] border p-8 mb-8 shadow-2xl transition-all duration-500 ${isPremium ? 'bg-gradient-to-br from-gray-900 via-gray-950 to-black border-yellow-500/30' : 'bg-gray-900/50 border-white/5'}`}>
                {isPremium && <div className="absolute -top-20 -right-20 w-64 h-64 bg-yellow-500/10 blur-[80px] rounded-full"></div>}
                <div className="relative z-10 flex flex-col items-center">
                    <div className="relative mb-5">
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl font-black text-white shadow-2xl border-4 border-gray-900 ${isPremium ? 'bg-linear-to-tr from-yellow-600 to-yellow-400' : 'bg-blue-600'}`}>{inicial}</div>
                        {isPremium && <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-black text-[9px] font-black px-2.5 py-1 rounded-full border-2 border-gray-900 shadow-lg animate-bounce">VIP</div>}
                    </div>
                    <h3 className="text-2xl font-black text-white text-center tracking-tight">{nombreCompleto}</h3>
                    <p className="text-gray-400 text-sm mb-6 font-medium">{usuario?.correo}</p>
                    <div className={`px-5 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-[0.2em] shadow-inner ${isPremium ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-500' : 'bg-blue-500/10 border-blue-500/40 text-blue-400'}`}>
                        {isPremium ? 'Escudo PRO Activo' : 'Protección Básica'}
                    </div>
                </div>
            </div>

            <div className="mb-8">
                <h3 className="text-gray-500 font-black uppercase tracking-widest text-xs mb-3 pl-2">Privacidad y Accesos</h3>
                <div className="bg-gray-900 p-5 rounded-3xl border border-white/5 flex flex-col gap-5 shadow-lg">
                    
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-white font-bold text-sm">Análisis de SMS</p>
                            <p className="text-gray-500 text-[10px] uppercase tracking-widest mt-1">Protección en segundo plano</p>
                        </div>
                        <button onClick={toggleSms} className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ease-in-out relative ${smsActivo ? 'bg-blue-600' : 'bg-gray-700'}`}>
                            <div className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 ease-in-out ${smsActivo ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    <div className="flex justify-between items-center border-t border-white/5 pt-4">
                        <div>
                            <p className="text-white font-bold text-sm">Burbuja de Alerta</p>
                            <p className="text-gray-500 text-[10px] uppercase tracking-widest mt-1">Mostrar sobre otras apps</p>
                        </div>
                        {tienePermisoBurbuja ? (
                            <span className="text-green-500 text-[10px] font-black uppercase bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20">ACTIVO</span>
                        ) : (
                            <button onClick={solicitarPermisoBurbuja} className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl transition-all shadow-md active:scale-95">Permitir</button>
                        )}
                    </div>

                    <button onClick={() => setTabActiva('politica')} className="flex justify-between items-center border-t border-white/5 pt-4 group text-left">
                        <div>
                            <p className="text-gray-300 font-bold text-sm group-hover:text-blue-400 transition-colors">Política de Privacidad</p>
                            <p className="text-gray-600 text-[10px] uppercase tracking-widest mt-1">Responsables y derechos legales</p>
                        </div>
                        <svg className="w-5 h-5 text-gray-600 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>

            <div className="space-y-4 mb-6">
                <button onClick={onLogout} className="w-full bg-gray-800 hover:bg-gray-700 text-white font-black py-5 rounded-[2rem] transition-all duration-300 shadow-lg flex justify-center items-center gap-3 text-sm active:scale-95 uppercase tracking-widest">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    Cerrar Sesión
                </button>

                <button onClick={() => setMostrarModalEliminar(true)} className="w-full bg-transparent hover:bg-red-500/10 text-red-500 font-black py-4 rounded-[2rem] transition-all duration-300 border border-red-500/20 shadow-sm flex justify-center items-center gap-3 text-[11px] active:scale-95 uppercase tracking-widest">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    Eliminar mi cuenta y datos
                </button>
            </div>

            {mostrarModalEliminar && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-gray-900 border border-red-500/30 rounded-[2rem] p-6 max-w-sm w-full shadow-2xl">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <h3 className="text-xl font-black text-white text-center mb-2">¿Eliminar Cuenta?</h3>
                        <p className="text-gray-400 text-center text-sm mb-6 leading-relaxed">
                            Al confirmar, tu cuenta será desactivada y entrará en un <strong className="text-white">período de gracia de 30 días</strong>. Si no vuelves a iniciar sesión, tus datos se borrarán permanentemente.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button onClick={handleEliminarCuenta} disabled={isDeleting} className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white font-bold py-3.5 rounded-2xl transition-all flex justify-center items-center gap-2">
                                {isDeleting ? <span className="animate-pulse">Procesando...</span> : "Sí, desactivar cuenta"}
                            </button>
                            <button onClick={() => setMostrarModalEliminar(false)} disabled={isDeleting} className="w-full bg-transparent hover:bg-gray-800 text-gray-300 font-bold py-3.5 rounded-2xl transition-all border border-gray-700">
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Perfil;