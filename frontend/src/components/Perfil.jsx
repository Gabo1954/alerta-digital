import React, { useState } from 'react';

const Perfil = ({ usuario, isPremium, setTabActiva, onLogout }) => {
    const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const inicial = usuario?.nombre ? usuario.nombre.charAt(0).toUpperCase() : 'U';
    const nombreCompleto = `${usuario?.nombre || 'Usuario'} ${usuario?.ap_paterno || ''}`;

    const handleEliminarCuenta = async () => {
        setIsDeleting(true);
        try {
            const token = localStorage.getItem('token'); // Asegúrate de que así guardas tu token
            
            // Reemplaza la URL base si usas una variable de entorno como import.meta.env.VITE_API_URL
            const response = await fetch('https://alerta-digital.onrender.com/api/usuarios/eliminar-cuenta', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                // Notificamos al usuario y lo desconectamos
                alert(data.mensaje); 
                onLogout();
            } else {
                alert(data.error || "No se pudo procesar la solicitud.");
            }
        } catch (error) {
            console.error("Error al eliminar cuenta:", error);
            alert("Error de conexión con el servidor. Intente más tarde.");
        } finally {
            setIsDeleting(false);
            setMostrarModalEliminar(false);
        }
    };

    return (
        <div className="flex-1 w-full px-5 pt-6 pb-20 animate-fade-in-up font-sans relative">

            {/* ENCABEZADO */}
            <header className="mb-8 flex flex-col items-center text-center">
                <h2 className="flex flex-col text-4xl font-black tracking-tighter text-white uppercase leading-none select-none items-center">
                    <span>Centro de</span>
                    <span className="text-3xl font-extralight tracking-normal normal-case italic bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent block mt-1 py-1">
                        Seguridad
                    </span>
                </h2>
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
                    ID: {usuario?.id || 'LOCAL-USER'}
                </p>
            </header>

            {/* TARJETA DE IDENTIDAD */}
            <div className={`relative overflow-hidden rounded-[2.5rem] border p-8 mb-8 shadow-2xl transition-all duration-500 ${isPremium
                ? 'bg-gradient-to-br from-gray-900 via-gray-950 to-black border-yellow-500/30'
                : 'bg-gray-900/50 border-white/5'
                }`}>
                {isPremium && <div className="absolute -top-20 -right-20 w-64 h-64 bg-yellow-500/10 blur-[80px] rounded-full"></div>}

                <div className="relative z-10 flex flex-col items-center">
                    <div className="relative mb-5">
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl font-black text-white shadow-2xl border-4 border-gray-900 ${isPremium ? 'bg-linear-to-tr from-yellow-600 to-yellow-400' : 'bg-blue-600'
                            }`}>
                            {inicial}
                        </div>
                        {isPremium && (
                            <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-black text-[9px] font-black px-2.5 py-1 rounded-full border-2 border-gray-900 shadow-lg animate-bounce">
                                VIP
                            </div>
                        )}
                    </div>

                    <h3 className="text-2xl font-black text-white text-center tracking-tight">{nombreCompleto}</h3>
                    <p className="text-gray-400 text-sm mb-6 font-medium">{usuario?.correo}</p>

                    <div className={`px-5 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-[0.2em] shadow-inner ${isPremium ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-500' : 'bg-blue-500/10 border-blue-500/40 text-blue-400'
                        }`}>
                        {isPremium ? 'Escudo PRO Activo' : 'Protección Básica'}
                    </div>
                </div>
            </div>

            {/* OPCIONES DE SEGURIDAD */}
            <div className="space-y-4 mb-10">
                <button onClick={() => setTabActiva('historial')} className="w-full bg-gray-900 hover:bg-gray-800 p-5 rounded-3xl border border-white/5 flex items-center justify-between transition-all active:scale-[0.98] group">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-sm">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                        </div>
                        <span className="text-white font-bold text-sm">Historial de Escaneos</span>
                    </div>
                    <svg className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>

                <div className="bg-gray-900/40 p-5 rounded-3xl border border-dashed border-white/10 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-emerald-500">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        <span className="text-[10px] font-black uppercase tracking-widest">Privacidad SSL</span>
                    </div>
                    <p className="text-gray-500 text-[11px] font-medium leading-relaxed italic">
                        Tus mensajes analizados se procesan bajo encriptación bancaria y son eliminados tras 30 días.
                    </p>
                </div>
            </div>

            {/* ZONA DE PELIGRO Y DESCONEXIÓN */}
            <div className="space-y-4">
                <button
                    onClick={onLogout}
                    className="w-full bg-gray-800 hover:bg-gray-700 text-white font-black py-5 rounded-[2rem] transition-all duration-300 shadow-lg flex justify-center items-center gap-3 text-sm active:scale-95 uppercase tracking-widest"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    Cerrar Sesión
                </button>

                <button
                    onClick={() => setMostrarModalEliminar(true)}
                    className="w-full bg-transparent hover:bg-red-500/10 text-red-500 font-black py-4 rounded-[2rem] transition-all duration-300 border border-red-500/20 shadow-sm flex justify-center items-center gap-3 text-[11px] active:scale-95 uppercase tracking-widest"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    Eliminar mi cuenta y datos
                </button>
            </div>

            {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
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
                            <button
                                onClick={handleEliminarCuenta}
                                disabled={isDeleting}
                                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white font-bold py-3.5 rounded-2xl transition-all flex justify-center items-center gap-2"
                            >
                                {isDeleting ? (
                                    <span className="animate-pulse">Procesando...</span>
                                ) : (
                                    "Sí, desactivar cuenta"
                                )}
                            </button>
                            <button
                                onClick={() => setMostrarModalEliminar(false)}
                                disabled={isDeleting}
                                className="w-full bg-transparent hover:bg-gray-800 text-gray-300 font-bold py-3.5 rounded-2xl transition-all border border-gray-700"
                            >
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