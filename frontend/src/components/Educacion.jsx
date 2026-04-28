import { useState, useEffect } from 'react';

const Educacion = ({ isPremium, setTabActiva }) => {
    const [expandido, setExpandido] = useState(null);
    const [leidos, setLeidos] = useState([]);
    const [isSpeaking, setIsSpeaking] = useState(false);

    // Cargar progreso guardado al iniciar
    useEffect(() => {
        const progresoGuardado = localStorage.getItem('progresoEducacion');
        if (progresoGuardado) setLeidos(JSON.parse(progresoGuardado));
        
        // Limpiar la voz si el usuario cambia de pestaña
        return () => window.speechSynthesis.cancel();
    }, []);

    // --- LA SOLUCIÓN AL ERROR ESTÁ AQUÍ ---
    const toggleExpandir = (id) => {
        if (expandido === id) {
            setExpandido(null);
            // Si cierra la tarjeta, apagamos la voz por buena UX
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        } else {
            setExpandido(id);
        }
    };

    // --- ACCESIBILIDAD: MOTOR DE VOZ ---
    const hablar = (texto, id) => {
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            if (expandido === id && isSpeaking) return; // Toggle play/pause
        }

        const enunciado = new SpeechSynthesisUtterance(texto);
        enunciado.lang = 'es-CL'; // Acento chileno/latino
        enunciado.rate = 0.9; // Velocidad cómoda
        
        enunciado.onstart = () => setIsSpeaking(true);
        enunciado.onend = () => setIsSpeaking(false);
        
        window.speechSynthesis.speak(enunciado);
    };

    const marcarComoLeido = (id, e) => {
        e.stopPropagation(); // Evita que el clic cierre la tarjeta
        if (!leidos.includes(id)) {
            const nuevoProgreso = [...leidos, id];
            setLeidos(nuevoProgreso);
            localStorage.setItem('progresoEducacion', JSON.stringify(nuevoProgreso));
        }
    };

    // --- BASE DE DATOS EDUCATIVA ---
    const lecciones = [
        { 
            id: 1, 
            titulo: 'Phishing: El Gancho del Miedo', 
            resumen: 'Suplantación de identidad por correo o web.', 
            vulnerabilidad: 'Miedo y Autoridad',
            detalle: 'El atacante envía un correo falso idéntico al de tu banco, Netflix o SII. Te dicen que tu cuenta fue suspendida o que tienes una deuda urgente.',
            profundo: 'El cerebro entra en "Modo Pánico" ante una amenaza. Esto bloquea tu juicio crítico. El enlace te lleva a una web clonada que roba tu clave mientras crees solucionar el problema.',
            prevencion: 'Nunca entres desde links en correos alarmantes. Escribe tú mismo la dirección oficial en el navegador.',
            icon: '🎣',
            color: 'text-red-400',
            bgGlow: 'hover:shadow-[0_0_20px_rgba(248,113,113,0.15)]'
        },
        { 
            id: 2, 
            titulo: 'Smishing: Trampa en tu Bolsillo', 
            resumen: 'Mensajes de texto (SMS) fraudulentos.', 
            vulnerabilidad: 'Urgencia y Curiosidad',
            detalle: 'Recibes un SMS de CorreosChile o aduanas diciendo que tienes un paquete retenido y debes pagar $1.500 en un enlace para liberarlo.',
            profundo: 'Vivimos esperando compras online. El mensaje llega al celular, un dispositivo "privado", lo que baja nuestras defensas psicológicas.',
            prevencion: 'Desconfía de links acortados en SMS (bit.ly). Las aduanas no cobran por SMS con enlaces directos a pasarelas de pago no oficiales.',
            icon: '📱',
            color: 'text-orange-400',
            bgGlow: 'hover:shadow-[0_0_20px_rgba(251,146,60,0.15)]'
        },
        { 
            id: 3, 
            titulo: 'Ingeniería Social: El Falso Premio', 
            resumen: 'Manipulación mediante recompensas.', 
            vulnerabilidad: 'Ambición y Gratificación',
            detalle: 'Te contactan por WhatsApp o redes diciendo que ganaste un sorteo, un teléfono de alta gama o un bono estatal.',
            profundo: 'Usan la dopamina. Al creer que ganamos algo, el cerebro ignora las señales de alerta. Te pedirán "validar datos" o transferir un "costo de envío".',
            prevencion: 'Si es demasiado bueno para ser verdad, es estafa. Nadie regala cosas de alto valor pidiendo dinero o claves a cambio.',
            icon: '🎁',
            color: 'text-yellow-400',
            bgGlow: 'hover:shadow-[0_0_20px_rgba(250,204,21,0.15)]'
        }
    ];

    const progreso = Math.round((leidos.length / lecciones.length) * 100) || 0;

    return (
        <div className="flex-1 w-full overflow-y-auto no-scrollbar px-4 sm:px-6 pt-6 pb-32 animate-fade-in font-sans">
            <header className="mb-8">
                <h2 className="text-3xl font-black text-white leading-tight">Academia <br/><span className="text-blue-500 underline decoration-4 underline-offset-4">Antifraude</span></h2>
                <p className="text-gray-400 text-sm font-medium mt-4 leading-relaxed">Educación inclusiva para proteger el eslabón más débil de la ciberseguridad: el ser humano.</p>
            </header>

            {/* Barra de Progreso Inclusiva */}
            <section className="bg-gray-900/80 p-5 rounded-3xl border border-white/10 mb-8 shadow-xl">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-400 text-xs font-black uppercase tracking-widest">Nivel de Conocimiento</span>
                    <span className="text-blue-400 font-black text-sm">{progreso}%</span>
                </div>
                <div className="h-3 w-full bg-gray-800 rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-gradient-to-r from-blue-600 to-purple-500 transition-all duration-1000 ease-out" style={{ width: `${progreso}%` }}></div>
                </div>
            </section>

            <div className="space-y-5">
                {lecciones.map((item) => {
                    const isExp = expandido === item.id;
                    const isRead = leidos.includes(item.id);
                    
                    return (
                        <article 
                            key={item.id} 
                            onClick={() => toggleExpandir(item.id)}
                            className={`group rounded-3xl border transition-all duration-500 cursor-pointer overflow-hidden ${isExp ? 'bg-gray-800/90 border-blue-500/40 shadow-[0_0_30px_rgba(59,130,246,0.15)]' : `bg-gray-900 border-white/5 ${item.bgGlow}`}`}
                        >
                            <div className="p-5 sm:p-6">
                                <div className="flex items-start gap-4 sm:gap-5">
                                    <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner shrink-0 transition-all duration-500 ${isExp ? 'scale-110 bg-blue-600/20 rotate-3' : 'bg-gray-800'} ${isRead && !isExp ? 'grayscale opacity-50' : ''}`}>
                                        {item.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className={`text-base sm:text-lg font-black leading-tight truncate pr-2 transition-colors ${isRead && !isExp ? 'text-gray-500' : 'text-white'}`}>
                                                {item.titulo}
                                            </h3>
                                            {isRead && <span className="text-green-500 text-[10px] font-black uppercase tracking-widest bg-green-500/10 px-2 py-1 rounded-md shrink-0">Visto</span>}
                                        </div>
                                        <p className="text-gray-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-1.5 truncate">
                                            Afecta: <span className={item.color}>{item.vulnerabilidad}</span>
                                        </p>
                                        <p className="text-gray-400 text-xs sm:text-sm leading-relaxed line-clamp-2">{item.resumen}</p>
                                    </div>
                                </div>

                                {/* ÁREA EXPANDIBLE */}
                                <div className={`grid transition-all duration-500 ease-in-out ${isExp ? 'grid-rows-[1fr] opacity-100 mt-6' : 'grid-rows-[0fr] opacity-0'}`}>
                                    <div className="overflow-hidden">
                                        <div className="pt-5 border-t border-gray-700/50 space-y-5">
                                            
                                            {/* BOTÓN DE VOZ (Accesibilidad) */}
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); hablar(`Lección: ${item.titulo}. Explicación: ${item.detalle}. Psicología: ${item.profundo}. Prevención: ${item.prevencion}`, item.id); }}
                                                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${isSpeaking && expandido === item.id ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700'}`}
                                            >
                                                {isSpeaking && expandido === item.id ? (
                                                    <><svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg> Detener Audio</>
                                                ) : (
                                                    <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg> Escuchar Lección</>
                                                )}
                                            </button>

                                            <div>
                                                <h4 className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-1.5">El engaño</h4>
                                                <p className="text-gray-300 text-sm leading-relaxed">{item.detalle}</p>
                                            </div>

                                            <div className="bg-black/40 p-4 rounded-2xl border border-gray-800/50">
                                                <h4 className="text-purple-400 text-[10px] font-black uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                                                    Psicología del Ataque
                                                </h4>
                                                <p className="text-gray-400 text-sm leading-relaxed italic">{item.profundo}</p>
                                            </div>

                                            <div className="bg-green-500/10 p-4 rounded-2xl border border-green-500/20 shadow-inner">
                                                <h4 className="text-green-400 text-[10px] font-black uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                                    ¿Cómo prevenirlo?
                                                </h4>
                                                <p className="text-gray-200 text-sm leading-relaxed">{item.prevencion}</p>
                                            </div>

                                            {!isRead && (
                                                <button 
                                                    onClick={(e) => marcarComoLeido(item.id, e)}
                                                    className="w-full bg-white hover:bg-gray-200 text-black font-black py-4 rounded-xl text-xs uppercase tracking-widest active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] mt-2"
                                                >
                                                    Entendido, Marcar Progreso
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>

            {/* SECCIÓN VIP */}
            <footer className="mt-10">
                <h3 className="text-yellow-500 font-black uppercase text-xs tracking-widest mb-4 flex items-center gap-2 px-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    Contenido VIP
                </h3>
                <div onClick={() => !isPremium && setTabActiva('pro')} className={`bg-gradient-to-br from-gray-900 to-black p-5 sm:p-6 rounded-[2.5rem] border border-yellow-500/30 flex items-center justify-between group cursor-pointer transition-all ${!isPremium ? 'opacity-80' : 'hover:border-yellow-500 hover:shadow-[0_0_30px_rgba(234,179,8,0.15)]'}`}>
                    <div className="flex items-center gap-4 sm:gap-5">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-yellow-500/10 rounded-2xl flex items-center justify-center text-2xl border border-yellow-500/20">🛡️</div>
                        <div>
                            <h4 className="text-white font-black text-sm sm:text-base">Simulador de Ataque</h4>
                            <p className="text-gray-500 text-xs font-medium mt-0.5">Pon a prueba tus reflejos en vivo.</p>
                        </div>
                    </div>
                    {!isPremium && <span className="bg-yellow-500 text-black text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg">PRO</span>}
                </div>
            </footer>
        </div>
    );
};

export default Educacion;