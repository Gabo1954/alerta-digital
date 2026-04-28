import { useState, useEffect } from 'react';
import api from '../services/api';

const Historial = ({ setTabActiva }) => {
    const [historial, setHistorial] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [filtro, setFiltro] = useState('');
    
    // NUEVO ESTADO: Para el mensaje seleccionado
    const [mensajeDetalle, setMensajeDetalle] = useState(null);

    useEffect(() => {
        const obtenerHistorialReal = async () => {
            setCargando(true);
            try {
                const { data } = await api.get('/mensajes/historial');
                setHistorial(data.historial || []);
            } catch (err) {
                setError(err.response?.data?.error || 'Verifica tu conexión.');
            } finally { setCargando(false); }
        };
        obtenerHistorialReal();
    }, []);

    const volverAlInicio = () => {
        if (setTabActiva) setTabActiva('inicio');
    };

    // Funciones lógicas clonadas del Analizador para regenerar el Feedback
    const generarRazonesContextuales = (texto, esPeligroso) => {
        const txt = (texto || '').toLowerCase();
        let razones = [];
        if (esPeligroso) {
            if (txt.includes('http') || txt.includes('www')) razones.push("Contiene un enlace web no verificado.");
            if (txt.includes('urgente') || txt.includes('bloqueada')) razones.push("Utiliza palabras de alerta y urgencia extrema.");
            if (txt.includes('banco') || txt.includes('tarjeta')) razones.push("Menciona temas financieros, típico en suplantación.");
            if (razones.length === 0) razones.push("Patrón de redacción detectado en listas negras de phishing.");
        } else {
            if (!txt.includes('http')) razones.push("No contiene enlaces peligrosos ni redirecciones.");
            razones.push("El lenguaje parece ser una comunicación normal y segura.");
        }
        return razones.slice(0, 3);
    };

    // ==========================================
    // VISTA DE DETALLE DEL MENSAJE
    // ==========================================
    if (mensajeDetalle) {
        const esPeligroso = mensajeDetalle.riesgo === 'Alto' || mensajeDetalle.riesgo === 'Medio';
        const razones = generarRazonesContextuales(mensajeDetalle.texto, esPeligroso);

        return (
            <div className="flex-1 w-full px-4 sm:px-6 pt-10 pb-32 animate-fade-in-up overflow-y-auto no-scrollbar">
                <button onClick={() => setMensajeDetalle(null)} className="flex items-center text-gray-400 font-bold mb-8 hover:text-white transition-all bg-gray-800 px-4 py-2 rounded-xl border border-gray-700 w-fit active:scale-95">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg> Volver a la lista
                </button>

                <div className="flex flex-col items-center mb-8">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 shadow-xl ${esPeligroso ? 'bg-red-500/10 text-red-500 border-2 border-red-500/50' : 'bg-green-500/10 text-green-500 border-2 border-green-500/50'}`}>
                        {esPeligroso ? <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg> : <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <h2 className={`text-2xl font-black uppercase text-center ${esPeligroso ? 'text-red-500' : 'text-green-500'}`}>
                        {esPeligroso ? 'Riesgo Detectado' : 'Mensaje Seguro'}
                    </h2>
                    <p className="text-gray-400 text-xs font-bold mt-2 tracking-widest">{mensajeDetalle.fecha}</p>
                </div>

                <div className="bg-gray-900 rounded-[2rem] p-6 border border-gray-700 shadow-xl">
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">Mensaje Escaneado:</p>
                    <p className="text-white text-sm font-medium italic bg-black/50 p-4 rounded-xl mb-6 border border-white/5">"{mensajeDetalle.texto}"</p>
                    
                    <p className="text-white text-sm font-medium mb-3">
                        Feedback de la IA en su momento:
                    </p>
                    <div className="space-y-3 bg-black/30 p-4 rounded-xl border border-gray-800">
                        {razones.map((m, i) => (
                            <div key={i} className="flex gap-3 items-start">
                                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${esPeligroso ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                <p className="text-gray-300 text-sm leading-relaxed">{m}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // ==========================================
    // VISTA DE LISTA (HISTORIAL)
    // ==========================================
    const datosFiltrados = historial.filter(item => (item.texto || '').toLowerCase().includes(filtro.toLowerCase()));

    return (
        <div className="flex-1 w-full px-4 sm:px-6 pt-10 pb-32 animate-fade-in flex flex-col h-full overflow-hidden">
            <div className="mb-6 shrink-0">
                <button onClick={volverAlInicio} className="text-gray-500 hover:text-white transition-colors mb-4 flex items-center text-sm font-bold">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg> Volver al Escáner
                </button>

                <h2 className="text-3xl font-black text-white leading-tight mb-5">Mi <br/><span className="text-blue-500 underline decoration-4 underline-offset-4">Historial</span></h2>
                
                <div className="relative">
                    <svg className="w-5 h-5 absolute left-4 top-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input 
                        type="text" 
                        placeholder="Buscar en análisis previos..." 
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white text-sm outline-none focus:border-blue-500 transition-colors shadow-inner"
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar rounded-xl">
                {cargando ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-28 rounded-2xl bg-gray-800/50 animate-pulse border border-white/5"></div>)}
                    </div>
                ) : datosFiltrados.length === 0 ? (
                    <div className="text-center py-16 bg-gray-900/30 rounded-[2rem] border border-white/5 border-dashed">
                        <span className="text-5xl block mb-4 opacity-50">🗂️</span>
                        <p className="text-gray-400 font-bold text-sm">Aún no hay registros aquí.</p>
                    </div>
                ) : (
                    <div className="space-y-3 pb-4">
                        {datosFiltrados.map((item, index) => {
                            const esPeligroso = item.riesgo === 'Alto' || item.riesgo === 'Medio';
                            return (
                                <div 
                                    key={item.id} 
                                    onClick={() => setMensajeDetalle(item)}
                                    className="bg-gray-900 hover:bg-gray-800 cursor-pointer rounded-2xl p-5 border border-white/5 shadow-sm transition-all active:scale-[0.98] group"
                                >
                                    <div className="flex justify-between items-center mb-3 border-b border-gray-800 pb-2">
                                        <span className="text-[10px] text-gray-500 font-black uppercase tracking-wider">{item.fecha}</span>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${esPeligroso ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                                {item.riesgo}
                                            </span>
                                            <svg className="w-4 h-4 text-gray-600 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                        </div>
                                    </div>
                                    <p className="text-gray-300 text-sm line-clamp-2 font-medium italic">"{item.texto}"</p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Historial;