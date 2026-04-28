import React from 'react';

const Perfil = ({ usuario, isPremium, setTabActiva, onLogout }) => {
    const inicial = usuario?.nombre ? usuario.nombre.charAt(0).toUpperCase() : 'U';
    const nombreCompleto = `${usuario?.nombre || 'Usuario'} ${usuario?.ap_paterno || ''}`;

    return (
        <div className="flex-1 w-full px-5 pt-6 pb-20 animate-fade-in-up font-sans">
            
            {/* ENCABEZADO */}
            <header className="mb-8">
                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 leading-tight tracking-tighter">
                    Centro de <br/>
                    <span className="text-blue-500 bg-none">Seguridad</span>
                </h2>
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">ID: {usuario?.id || 'LOCAL-USER'}</p>
            </header>

            {/* TARJETA DE IDENTIDAD */}
            <div className={`relative overflow-hidden rounded-[2.5rem] border p-8 mb-8 shadow-2xl transition-all duration-500 ${
                isPremium 
                ? 'bg-gradient-to-br from-gray-900 via-gray-950 to-black border-yellow-500/30' 
                : 'bg-gray-900/50 border-white/5'
            }`}>
                {isPremium && <div className="absolute -top-20 -right-20 w-64 h-64 bg-yellow-500/10 blur-[80px] rounded-full"></div>}
                
                <div className="relative z-10 flex flex-col items-center">
                    <div className="relative mb-5">
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl font-black text-white shadow-2xl border-4 border-gray-900 ${
                            isPremium ? 'bg-linear-to-tr from-yellow-600 to-yellow-400' : 'bg-blue-600'
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

                    <div className={`px-5 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-[0.2em] shadow-inner ${
                        isPremium ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-500' : 'bg-blue-500/10 border-blue-500/40 text-blue-400'
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

            {/* CERRAR SESIÓN */}
            <button 
                onClick={onLogout} 
                className="w-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-black py-5 rounded-[2rem] transition-all duration-300 border border-red-500/20 shadow-lg flex justify-center items-center gap-3 text-sm active:scale-95 uppercase tracking-widest"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                Desconectar Cuenta
            </button>
        </div>
    );
};

export default Perfil;