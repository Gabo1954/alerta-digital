import { useState, useEffect } from 'react';
import api from '../services/api';

const Historial = ({ setTabActiva }) => {
    const [historial, setHistorial] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [filtro, setFiltro] = useState('');
    const [filtroRiesgo, setFiltroRiesgo] = useState('');
    const [paginaActual, setPaginaActual] = useState(1);
    const ITEMS_POR_PAGINA = 10; // 10 escaneos por página
    const [animandoPagina, setAnimandoPagina] = useState(false);

    // ESTADO: Para el mensaje seleccionado
    const [mensajeDetalle, setMensajeDetalle] = useState(null);

    useEffect(() => {
        const obtenerHistorialReal = async () => {
            setCargando(true);
            try {
                const { data } = await api.get('/mensajes/historial');
                setHistorial(data.historial || []);
            } catch (err) {
                setError(err.response?.data?.error || 'Verifica tu conexión a internet.');
            } finally { setCargando(false); }
        };
        obtenerHistorialReal();
    }, []);

    const volverAlInicio = () => {
        if (setTabActiva) setTabActiva('inicio');
    };

    // Funciones lógicas sincronizadas con el Analizador para el Detalle
    const generarRazonesContextuales = (texto, esPeligroso) => {
        const txt = (texto || '').toLowerCase();
        let razones = [];
        
        if (esPeligroso) {
            if (txt.includes('http') || txt.includes('www')) razones.push("Alerta: Contiene un enlace web que dirige fuera de la plataforma.");
            if (txt.includes('urgente') || txt.includes('bloqueada') || txt.includes('inmediato')) razones.push("Patrón detectado: Lenguaje de manipulación y urgencia extrema.");
            if (txt.includes('banco') || txt.includes('tarjeta') || txt.includes('cuenta')) razones.push("Cuidado: Solicitud de datos o validación financiera anómala.");
            if (razones.length === 0) razones.push("Estructura de redacción coincidente con firmas de phishing conocidas.");
        } else {
            if (!txt.includes('http')) razones.push("Integridad: Ausencia de redirecciones web riesgosas.");
            razones.push("La estructura gramatical y el contexto aparentan ser legítimos.");
        }
        return razones.slice(0, 3);
    };

    // ==========================================
    // VISTA 1: DETALLE DEL MENSAJE
    // ==========================================
    if (mensajeDetalle) {
        const esPeligroso = mensajeDetalle.riesgo === 'Alto' || mensajeDetalle.riesgo === 'Medio';
        const razones = generarRazonesContextuales(mensajeDetalle.texto, esPeligroso);

        return (
            <div className="w-full px-5 pt-8 pb-32 animate-fade-in-up bg-gray-950 font-sans shrink-0">
                <button onClick={() => setMensajeDetalle(null)} className="flex items-center text-gray-400 font-bold mb-8 hover:text-white transition-all bg-gray-800/80 px-4 py-2 rounded-xl border border-white/5 active:scale-95 shadow-md">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg> Volver a la lista
                </button>

                <div className="flex flex-col items-center mb-8 relative text-center">
                    <div className={`w-28 h-28 rounded-full flex items-center justify-center mb-4 shadow-2xl relative z-10 transition-transform duration-500 hover:scale-110 ${esPeligroso ? 'bg-red-500/10 text-red-500 border-4 border-red-500/50 shadow-red-500/20' : 'bg-green-500/10 text-green-500 border-4 border-green-500/50 shadow-green-500/20'}`}>
                        {esPeligroso ? <svg className="w-12 h-12 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg> : <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <h2 className={`text-2xl font-black uppercase tracking-tight ${esPeligroso ? 'text-red-500' : 'text-green-500'}`}>
                        {esPeligroso ? 'Amenaza Detectada' : 'Mensaje Seguro'}
                    </h2>
                    <div className="flex gap-2 mt-4">
                        <span className="bg-gray-800 text-white text-[10px] font-black px-3 py-1 rounded-lg border border-white/5 uppercase tracking-widest">Nivel: {mensajeDetalle.riesgo}</span>
                        <span className="bg-blue-900/30 text-blue-300 text-[10px] font-black px-3 py-1 rounded-lg border border-blue-500/20 uppercase tracking-widest">{mensajeDetalle.fecha}</span>
                    </div>
                </div>

                <div className="bg-gray-900/60 backdrop-blur-md rounded-[2.5rem] p-6 border border-white/10 shadow-xl relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-full h-1 ${esPeligroso ? 'bg-red-500' : 'bg-green-500'}`}></div>
                    
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-3">Texto Original Analizado:</p>
                    <div className="bg-black/40 p-5 rounded-2xl border border-white/5 shadow-inner mb-8">
                        <p className="text-gray-300 text-sm font-medium italic leading-relaxed">"{mensajeDetalle.texto}"</p>
                    </div>
                    
                    <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Reporte Heurístico del Sistema:
                    </p>
                    <div className="space-y-4 bg-gray-800/50 p-5 rounded-2xl border border-gray-700/50">
                        {razones.map((m, i) => (
                            <div key={i} className="flex gap-3 items-start animate-fade-in">
                                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${esPeligroso ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                <p className="text-gray-300 text-sm leading-relaxed">{m}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // ==========================================
    // VISTA 2: LISTA DE HISTORIAL (Con Scroll Nativo)
    // ==========================================
    const datosFiltrados = historial.filter(item => {
        const coincideTexto = (item.texto || '').toLowerCase().includes(filtro.toLowerCase());
        const coincideRiesgo = filtroRiesgo === '' || item.riesgo === filtroRiesgo;
        return coincideTexto && coincideRiesgo;
    });

    // Paginación: solo 1 por página
    const totalPaginas = Math.max(1, Math.ceil(datosFiltrados.length / ITEMS_POR_PAGINA));
    const paginaSegura = Math.min(paginaActual, totalPaginas);
    const inicio = (paginaSegura - 1) * ITEMS_POR_PAGINA;
    const datosPaginados = datosFiltrados.slice(inicio, inicio + ITEMS_POR_PAGINA);

    const cambiarPagina = (nuevaPagina) => {
        if (nuevaPagina < 1 || nuevaPagina > totalPaginas || animandoPagina) return;
        setAnimandoPagina(true);
        setPaginaActual(nuevaPagina);
        setTimeout(() => setAnimandoPagina(false), 300);
    };

    return (
        <div className="w-full bg-gray-950 font-sans animate-fade-in shrink-0">
            
            {/* HEADER STICKY (Fijo en la parte superior) */}
            <div className="shrink-0 px-4 sm:px-6 pt-10 pb-4 bg-gray-950/90 backdrop-blur-xl border-b border-white/5 z-20 shadow-md">
                <button onClick={volverAlInicio} className="text-gray-500 hover:text-white transition-colors mb-6 flex items-center text-sm font-bold active:scale-95">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg> Volver al Escáner
                </button>

                <h2 className="flex flex-col text-4xl font-black tracking-tighter text-white uppercase leading-none select-none mb-5">
                    <span>Registro</span>
                    <span className="text-3xl font-extralight tracking-normal normal-case italic bg-gradient-to-r from-green-400 via-green-500 to-blue-400 bg-clip-text text-transparent block mt-1 py-1 pl-0.5">
                        Historial
                    </span>
                </h2>
                
                {/* BUSCADOR */}
                <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-500 text-gray-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar palabras o enlaces previos..."
                        className="w-full bg-gray-900 border border-white/5 rounded-2xl pl-12 pr-12 py-4 text-white text-sm outline-none focus:border-blue-500 transition-all shadow-inner placeholder:text-gray-600 font-medium"
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                    />
                    {filtro && (
                        <button
                            onClick={() => setFiltro('')}
                            className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-red-400 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    )}
                </div>

                {/* BOTONES DE FILTRO POR TIPO DE RIESGO */}
                <div className="flex gap-3 mt-5">
                    <button 
                        onClick={() => setFiltroRiesgo(filtroRiesgo === 'Bajo' ? '' : 'Bajo')}
                        className={`flex-1 px-4 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95 border uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 ${
                            filtroRiesgo === 'Bajo' 
                                ? 'bg-green-500/20 border-green-500/50 text-green-400 shadow-lg shadow-green-500/20' 
                                : 'bg-gray-800/50 border-gray-700/50 text-gray-400 hover:border-green-500/30 hover:text-green-400/70'
                        }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Bajo
                    </button>
                    <button 
                        onClick={() => setFiltroRiesgo(filtroRiesgo === 'Alto' ? '' : 'Alto')}
                        className={`flex-1 px-4 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95 border uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 ${
                            filtroRiesgo === 'Alto' 
                                ? 'bg-red-500/20 border-red-500/50 text-red-400 shadow-lg shadow-red-500/20' 
                                : 'bg-gray-800/50 border-gray-700/50 text-gray-400 hover:border-red-500/30 hover:text-red-400/70'
                        }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        Alto
                    </button>
                </div>
            </div>

            {/* CONTENEDOR DE LISTA */}
            <div className="px-4 sm:px-6 pt-4 pb-32">
                {cargando ? (
                    <div className="space-y-4 mt-2">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-28 rounded-3xl bg-gray-900/50 animate-pulse border border-white/5 shadow-sm"></div>
                        ))}
                    </div>
                ) : datosPaginados.length === 0 ? (
                    <div className="text-center py-20 bg-gray-900/30 rounded-[2.5rem] border border-white/5 border-dashed mt-6">
                        <div className="text-5xl block mb-4 opacity-30">🗂️</div>
                        <p className="text-gray-400 font-bold text-sm tracking-widest uppercase">
                            {filtro ? 'No hay coincidencias' : 'Historial Limpio'}
                        </p>
                    </div>
                ) : (
                    <>
                    {/* Indicador de página */}
                    {totalPaginas > 1 && (
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">
                                Escaneo {paginaSegura} de {totalPaginas}
                            </span>
                        </div>
                    )}
                    
                    <div className={`space-y-3 transition-all duration-300 ${animandoPagina ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                        {datosPaginados.map((item, index) => {
                            const esPeligroso = item.riesgo === 'Alto' || item.riesgo === 'Medio';
                            return (
                                <div 
                                    key={item.id} 
                                    onClick={() => setMensajeDetalle(item)}
                                    className="bg-gray-900/80 hover:bg-gray-800 cursor-pointer rounded-3xl p-5 border border-white/5 shadow-sm transition-all active:scale-[0.98] group"
                                    style={{ animationDelay: `${index * 50}ms` }} // Efecto cascada
                                >
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${esPeligroso ? 'bg-red-500' : 'bg-green-500'}`}></span>
                                            <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{item.fecha}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border ${esPeligroso ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                                                {item.riesgo}
                                            </span>
                                            <svg className="w-5 h-5 text-gray-600 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                        </div>
                                    </div>
                                    <p className="text-gray-300 text-sm line-clamp-2 font-medium italic leading-relaxed">"{item.texto}"</p>
                                </div>
                            );
                        })}
                    </div>

                    {/* PAGINACIÓN */}
                    {totalPaginas > 1 && (
                        <div className="flex items-center justify-center gap-3 mt-6 pb-8">
                            <button
                                onClick={() => cambiarPagina(paginaSegura - 1)}
                                disabled={paginaSegura <= 1}
                                className="bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-white p-3 rounded-2xl transition-all active:scale-90 border border-white/5"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                            </button>

                            {/* Números de página (solo mostrar un rango corto) */}
                            <div className="flex gap-1.5">
                                {Array.from({ length: Math.min(totalPaginas, 7) }, (_, i) => {
                                    let numPagina;
                                    if (totalPaginas <= 7) {
                                        numPagina = i + 1;
                                    } else {
                                        const mitad = Math.floor(7 / 2);
                                        if (paginaSegura <= mitad + 1) {
                                            numPagina = i + 1;
                                        } else if (paginaSegura >= totalPaginas - mitad) {
                                            numPagina = totalPaginas - 6 + i;
                                        } else {
                                            numPagina = paginaSegura - mitad + i;
                                        }
                                    }
                                    return (
                                        <button
                                            key={numPagina}
                                            onClick={() => cambiarPagina(numPagina)}
                                            disabled={animandoPagina}
                                            className={`w-10 h-10 rounded-xl font-black text-xs transition-all active:scale-90 border ${
                                                paginaSegura === numPagina
                                                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/30 scale-110'
                                                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-blue-500/50 hover:text-white'
                                            }`}
                                        >
                                            {numPagina}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => cambiarPagina(paginaSegura + 1)}
                                disabled={paginaSegura >= totalPaginas}
                                className="bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-white p-3 rounded-2xl transition-all active:scale-90 border border-white/5"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>
                    )}
                    </>
                )}
            </div>
            
        </div>
    );
};

export default Historial;