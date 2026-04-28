import { useState, useMemo } from 'react';

const Contactos = () => {
    const [busqueda, setBusqueda] = useState('');
    const [filtroActivo, setFiltroActivo] = useState('Todos');

    // --- BASE DE DATOS EXHAUSTIVA DE INSTITUCIONES CHILENAS ---
    const todasLasInstituciones = [
        // EMERGENCIAS POLICIALES
        { nombre: "PDI Cibercrimen", tipo: "Emergencia", tel: "134", icon: "👮", info: "Denuncias de delitos informáticos" },
        { nombre: "Carabineros", tipo: "Emergencia", tel: "133", icon: "🚔", info: "Asistencia policial inmediata" },
        { nombre: "Denuncia Seguro", tipo: "Emergencia", tel: "*4242", icon: "🕵️", info: "Denuncia anónima estatal" },

        // BANCOS Y FINANZAS
        { nombre: "Banco Estado", tipo: "Bancos", tel: "6002007000", icon: "🏦", info: "Bloqueo y Emergencias" },
        { nombre: "Banco Santander", tipo: "Bancos", tel: "6003203000", icon: "🏦", info: "Fraudes 24/7" },
        { nombre: "Banco de Chile", tipo: "Bancos", tel: "6006373737", icon: "🏦", info: "Atención Clientes" },
        { nombre: "BCI / Mach", tipo: "Bancos", tel: "6006928000", icon: "🏦", info: "Emergencias Bancarias" },
        { nombre: "Scotiabank", tipo: "Bancos", tel: "6006001100", icon: "🏦", info: "Bloqueos y Fraudes" },
        { nombre: "Itaú", tipo: "Bancos", tel: "6006860888", icon: "🏦", info: "Mesa de Ayuda" },
        { nombre: "Banco Falabella", tipo: "Bancos", tel: "223906000", icon: "💳", info: "Bloqueo de Tarjetas" },
        { nombre: "Banco Ripley", tipo: "Bancos", tel: "800203220", icon: "💳", info: "Asistencia Fraudes" },
        { nombre: "Mercado Pago", tipo: "Bancos", tel: "6003604000", icon: "🤝", info: "Soporte de Cuenta" },
        { nombre: "Tenpo", tipo: "Bancos", tel: "6005001900", icon: "📱", info: "Atención Fraudes" },

        // RETAIL
        { nombre: "CMR Falabella", tipo: "Retail", tel: "6003906000", icon: "🛍️", info: "Bloqueo de Cuenta" },
        { nombre: "Tarjeta Cencosud", tipo: "Retail", tel: "6006000505", icon: "🛍️", info: "Servicios Financieros" },
        { nombre: "Tarjeta Lider BCI", tipo: "Retail", tel: "6006009191", icon: "🛍️", info: "Consultas de Seguridad" },
        { nombre: "Paris", tipo: "Retail", tel: "6004008000", icon: "👗", info: "Atención Usuarios" },
        { nombre: "Sodimac", tipo: "Retail", tel: "6006004020", icon: "🏠", info: "Mesa Central" },

        // SUPERMERCADOS
        { nombre: "Walmart (Lider)", tipo: "Super", tel: "6004009000", icon: "🛒", info: "Servicio al Cliente" },
        { nombre: "Jumbo / S. Isabel", tipo: "Super", tel: "6004003000", icon: "🛒", info: "Post-Venta" },
        { nombre: "Tottus", tipo: "Super", tel: "6003908900", icon: "🛒", info: "Centro de Ayuda" },
        { nombre: "Unimarc", tipo: "Super", tel: "6006000025", icon: "🛒", info: "Emergencias" },

        // SALUD Y FARMACIAS
        { nombre: "Cruz Verde", tipo: "Salud", tel: "800802800", icon: "💊", info: "Atención Nacional" },
        { nombre: "Farmacias Ahumada", tipo: "Salud", tel: "6002224000", icon: "💊", info: "Consultas y Fraudes" },
        { nombre: "Salcobrand", tipo: "Salud", tel: "6003606000", icon: "💊", info: "Servicio al Cliente" },
        { nombre: "Isapre Colmena", tipo: "Salud", tel: "6009009000", icon: "🏥", info: "Seguridad Social" },
        { nombre: "Caja Los Andes", tipo: "Salud", tel: "6005100000", icon: "📦", info: "Beneficios y Ayuda" },
        { nombre: "Caja Los Héroes", tipo: "Salud", tel: "6002229999", icon: "📦", info: "Prevención de Fraudes" },

        // SERVICIOS Y BENCINERAS
        { nombre: "Copec", tipo: "Servicios", tel: "800200354", icon: "⛽", info: "Emergencias App Muevo" },
        { nombre: "Shell (Enex)", tipo: "Servicios", tel: "223502000", icon: "⛽", info: "Servicio Clientes" },
        { nombre: "Enel", tipo: "Servicios", tel: "6006960000", icon: "⚡", info: "Emergencia Eléctrica" },
        { nombre: "Aguas Andinas", tipo: "Servicios", tel: "227312400", icon: "💧", info: "Urgencia Sanitaria" },
        { nombre: "VTR", tipo: "Servicios", tel: "6008009000", icon: "📶", info: "Bloqueo y Robo" },
        { nombre: "Claro", tipo: "Servicios", tel: "800171171", icon: "📶", info: "Emergencias Móviles" },
        { nombre: "ChileAtiende", tipo: "Servicios", tel: "101", icon: "🇨🇱", info: "Consultas Estatales" },

        // APPS Y DELIVERY
        { nombre: "Uber / Uber Eats", tipo: "Apps", tel: "800914441", icon: "🚗", info: "Soporte de Seguridad" },
        { nombre: "PedidosYa", tipo: "Apps", tel: "225827360", icon: "🛵", info: "Centro de Soporte" },
        { nombre: "Didi", tipo: "Apps", tel: "229388335", icon: "🚙", info: "Atención de Riesgos" },
        { nombre: "LATAM Airlines", tipo: "Apps", tel: "6005262000", icon: "✈️", info: "Emergencia Viajes" }
    ];

    const categoriasUI = [
        { id: "Todos", icon: "🌐" },
        { id: "Emergencia", icon: "🚨" },
        { id: "Bancos", icon: "🏦" },
        { id: "Retail", icon: "🛍️" },
        { id: "Super", icon: "🛒" },
        { id: "Salud", icon: "🏥" },
        { id: "Servicios", icon: "⚡" },
        { id: "Apps", icon: "📱" }
    ];

    // Lógica de filtrado doble optimizada
    const institucionesFiltradas = useMemo(() => {
        return todasLasInstituciones.filter(inst => {
            const coincideBusqueda = inst.nombre.toLowerCase().includes(busqueda.toLowerCase());
            const coincideChip = filtroActivo === 'Todos' || inst.tipo === filtroActivo;
            return coincideBusqueda && coincideChip;
        });
    }, [busqueda, filtroActivo]);

    return (
        <div className="flex-1 w-full overflow-y-auto no-scrollbar pb-40 animate-fade-in font-sans bg-gray-950 relative">
            
            {/* CABECERA (No sticky) */}
            <header className="mb-2 px-5 pt-8">
                <h2 className="text-3xl font-black text-white leading-tight tracking-tighter uppercase">
                    Central de <br/><span className="text-red-500 bg-none italic">Respuesta</span>
                </h2>
                <p className="text-gray-500 text-[11px] font-bold uppercase tracking-[0.2em] mt-3 opacity-80">Neutralización de Amenazas Digitales</p>
            </header>

            {/* ZONA DE CONTROLES STICKY (Se queda pegada al hacer scroll) */}
            <div className="sticky top-0 z-30 bg-gray-950/90 backdrop-blur-xl border-b border-white/5 pt-4 pb-4 shadow-xl">
                {/* BUSCADOR */}
                <div className="relative mb-4 px-5">
                    <div className="absolute inset-y-0 left-9 flex items-center text-gray-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <input 
                        type="text" 
                        placeholder="Buscar institución (ej: Tenpo, Uber...)" 
                        className="w-full bg-black border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white text-sm outline-none focus:border-red-500 transition-all shadow-inner placeholder:text-gray-600 font-medium"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                    {/* Botón para limpiar búsqueda */}
                    {busqueda && (
                        <button 
                            onClick={() => setBusqueda('')}
                            className="absolute inset-y-0 right-9 flex items-center text-gray-500 hover:text-red-400 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    )}
                </div>

                {/* FILTROS POR CHIPS CON ICONOS */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar px-5 pb-1">
                    {categoriasUI.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setFiltroActivo(cat.id)}
                            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                                filtroActivo === cat.id 
                                ? 'bg-red-600 border-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]' 
                                : 'bg-gray-900 border-white/5 text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                            }`}
                        >
                            <span className="text-sm">{cat.icon}</span>
                            {cat.id}
                        </button>
                    ))}
                </div>
            </div>

            <div className="px-4 sm:px-6 pt-6">
                {/* SECCIÓN PRIORITARIA: POLICÍA (SIEMPRE VISIBLE EN 'TODOS') */}
                {filtroActivo === 'Todos' && !busqueda && (
                    <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-[2rem] mb-8 shadow-2xl relative overflow-hidden animate-pulse">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-3xl rounded-full"></div>
                        <div className="flex items-center gap-2 mb-4 relative z-10">
                            <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,1)]"></span>
                            <h3 className="text-red-500 font-black text-[10px] uppercase tracking-[0.3em]">Ayuda Policial Crítica</h3>
                        </div>
                        
                        <div className="space-y-3 relative z-10">
                            <div className="bg-gray-900/80 rounded-2xl p-4 border border-white/5 flex items-center justify-between shadow-lg">
                                <div className="flex items-center gap-4">
                                    <div className="text-2xl">👮</div>
                                    <div>
                                        <p className="text-white font-black text-sm uppercase">PDI Cibercrimen</p>
                                        <p className="text-blue-400 text-[10px] font-black tracking-widest">FONO 134</p>
                                    </div>
                                </div>
                                <a href="tel:134" className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase transition-all shadow-xl active:scale-90 flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                                    Llamar
                                </a>
                            </div>
                        </div>
                    </div>
                )}

                {/* LISTADO DE RESULTADOS */}
                <div className="space-y-3">
                    {institucionesFiltradas.length > 0 ? (
                        institucionesFiltradas.map((inst, index) => (
                            <div 
                                key={index} 
                                className="bg-gray-900/40 border border-white/5 p-4 rounded-3xl flex items-center justify-between group hover:bg-gray-800 transition-all hover:border-red-500/30 shadow-sm"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="text-2xl w-12 h-12 flex items-center justify-center bg-black rounded-2xl group-hover:scale-110 transition-transform shadow-inner border border-white/5">{inst.icon}</div>
                                    <div>
                                        <p className="text-white font-black text-sm leading-tight group-hover:text-red-400 transition-colors">{inst.nombre}</p>
                                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">{inst.info}</p>
                                    </div>
                                </div>
                                <a 
                                    href={`tel:${inst.tel}`} 
                                    className={`p-3.5 rounded-[1.25rem] transition-all active:scale-90 shadow-lg border border-white/5 ${inst.tipo === 'Emergencia' ? 'bg-blue-600 text-white hover:bg-blue-500 hover:shadow-blue-500/20' : 'bg-gray-800 hover:bg-red-600 text-white hover:shadow-red-500/20'}`}
                                    title={`Llamar a ${inst.nombre}`}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                </a>
                            </div>
                        ))
                    ) : (
                        <div className="py-16 text-center animate-fade-in bg-gray-900/20 rounded-[2.5rem] border border-dashed border-white/10">
                            <div className="text-5xl mb-4 opacity-30">🔍</div>
                            <p className="text-gray-400 text-xs font-black uppercase tracking-widest leading-relaxed">No encontramos resultados para <br/> <span className="text-white">"{busqueda}"</span></p>
                            <button 
                                onClick={() => {setBusqueda(''); setFiltroActivo('Todos');}}
                                className="mt-4 text-blue-500 text-[10px] font-black uppercase tracking-widest bg-blue-500/10 px-4 py-2 rounded-full hover:bg-blue-500/20 transition-colors"
                            >
                                Limpiar Filtros
                            </button>
                        </div>
                    )}
                </div>

                {/* NOTA DE INTEGRIDAD LEGAL */}
                <footer className="mt-12 bg-linear-to-b from-transparent to-red-500/5 p-8 rounded-[3rem] border border-dashed border-red-500/10 text-center">
                    <div className="flex justify-center mb-4 text-red-500">
                        <svg className="w-8 h-8 opacity-40" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    </div>
                    <p className="text-gray-400 text-xs font-medium leading-relaxed italic px-2">
                        "Conforme a la **Ley N° 19.628**, Alerta Digital provee este directorio oficial de forma informativa para la seguridad de sus datos. No registramos ni almacenamos información sobre sus llamadas."
                    </p>
                    <p className="text-gray-600 text-[9px] font-black uppercase tracking-[0.2em] mt-6 opacity-40">Protocolo de Integridad v4.0.2 - Chile</p>
                </footer>
            </div>
        </div>
    );
};

export default Contactos;