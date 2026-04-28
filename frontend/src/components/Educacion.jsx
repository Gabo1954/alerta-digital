import { useState, useEffect } from 'react';

const Educacion = ({ usuario, isPremium, setTabActiva }) => {
    const [expandido, setExpandido] = useState(null);
    const [leidos, setLeidos] = useState([]);
    const [isSpeaking, setIsSpeaking] = useState(false);

    // Generamos una clave única por usuario para que el progreso sea individual
    const STORAGE_KEY = usuario?.correo ? `progreso_${usuario.correo}` : 'progresoEducacion';

    useEffect(() => {
        const progresoGuardado = localStorage.getItem(STORAGE_KEY);
        if (progresoGuardado) setLeidos(JSON.parse(progresoGuardado));
        
        return () => window.speechSynthesis.cancel();
    }, [STORAGE_KEY]);

    const toggleExpandir = (id) => {
        if (expandido === id) {
            setExpandido(null);
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        } else {
            setExpandido(id);
        }
    };

    const hablar = (texto, id) => {
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            if (expandido === id && isSpeaking) return;
        }

        const enunciado = new SpeechSynthesisUtterance(texto);
        enunciado.lang = 'es-CL';
        enunciado.rate = 0.9;
        
        enunciado.onstart = () => setIsSpeaking(true);
        enunciado.onend = () => setIsSpeaking(false);
        
        window.speechSynthesis.speak(enunciado);
    };

    const marcarComoLeido = (id, e) => {
        e.stopPropagation();
        if (!leidos.includes(id)) {
            const nuevoProgreso = [...leidos, id];
            setLeidos(nuevoProgreso);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevoProgreso));
        }
    };

    // --- BASE DE DATOS EDUCATIVA EXPANDIDA ---
    const lecciones = [
        { 
            id: 1, 
            titulo: 'Phishing: El Gancho del Miedo', 
            resumen: 'Suplantación de identidad por correo o web.', 
            vulnerabilidad: 'Miedo y Autoridad',
            detalle: 'El atacante envía un correo falso idéntico al de tu banco o Netflix. Te asustan con cuentas suspendidas o deudas inexistentes.',
            profundo: 'El miedo bloquea el juicio crítico. Al entrar en pánico, el usuario entrega sus credenciales en una web clonada sin notar que la URL es falsa.',
            prevencion: 'Verifica siempre el remitente. Los bancos nunca te pedirán claves por correos que contengan enlaces directos a formularios de inicio de sesión.',
            icon: '🎣',
            color: 'text-red-400',
            bgGlow: 'hover:shadow-[0_0_20px_rgba(248,113,113,0.15)]'
        },
        { 
            id: 2, 
            titulo: 'Smishing: Trampa en tu Bolsillo', 
            resumen: 'Mensajes de texto (SMS) fraudulentos.', 
            vulnerabilidad: 'Urgencia y Curiosidad',
            detalle: 'SMS de "CorreosChile" o "Aduanas" indicando que un paquete está retenido y debes pagar una pequeña tasa para liberarlo.',
            profundo: 'La cercanía del celular baja nuestras defensas. Al ser un monto pequeño, el cerebro lo justifica como un trámite real, entregando los datos de la tarjeta.',
            prevencion: 'No abras links de números desconocidos. Las instituciones oficiales no usan acortadores tipo bit.ly para cobros de impuestos.',
            icon: '📱',
            color: 'text-orange-400',
            bgGlow: 'hover:shadow-[0_0_20px_rgba(251,146,60,0.15)]'
        },
        { 
            id: 3, 
            titulo: 'Vishing: La Voz del Engaño', 
            resumen: 'Estafas mediante llamadas telefónicas.', 
            vulnerabilidad: 'Presión y Rapidez',
            detalle: 'Un "ejecutivo de seguridad" te llama diciendo que hay una compra sospechosa en curso y necesita que le dictes un código que te llegará al celular.',
            profundo: 'La voz humana genera confianza. El estafador te mantiene en línea para que no tengas tiempo de pensar o llamar al banco realmente.',
            prevencion: 'Cuelga de inmediato. Los códigos que llegan por SMS dicen claramente "NO COMPARTIR". Ningún ejecutivo real te los pedirá.',
            icon: '📞',
            color: 'text-blue-400',
            bgGlow: 'hover:shadow-[0_0_20px_rgba(96,165,250,0.15)]'
        },
        { 
            id: 4, 
            titulo: 'Quishing: El QR Malicioso', 
            resumen: 'Ataques mediante códigos QR falsos.', 
            vulnerabilidad: 'Curiosidad Tecnológica',
            detalle: 'Pegan QRs falsos sobre los reales en restaurantes o paraderos. Al escanearlo, descargas un archivo infectado o vas a una web de phishing.',
            profundo: 'Confiamos ciegamente en los códigos QR. No podemos leer la URL antes de que el navegador la abra, lo que facilita el acceso a sitios maliciosos.',
            prevencion: 'Usa escáneres que muestren la URL antes de entrar. Si el QR parece un sticker pegado sobre otro, no lo escanees.',
            icon: '🔳',
            color: 'text-green-400',
            bgGlow: 'hover:shadow-[0_0_20px_rgba(74,222,128,0.15)]'
        },
        { 
            id: 5, 
            titulo: 'SIM Swapping: Secuestro de Línea', 
            resumen: 'Clonación de tu número telefónico.', 
            vulnerabilidad: 'Fallas de Validación',
            detalle: 'El atacante engaña a la operadora para transferir tu número a un chip que él controla. Así, recibe tus códigos de verificación bancarios.',
            profundo: 'Una vez que controlan tu SIM, pueden restablecer tus contraseñas de correo y banco usando la recuperación por SMS.',
            prevencion: 'Si tu celular se queda "Sin Servicio" de forma repentina, contacta a tu operadora. Usa apps de autenticación (Google Authenticator) en vez de SMS.',
            icon: '🔓',
            color: 'text-purple-400',
            bgGlow: 'hover:shadow-[0_0_20px_rgba(192,132,252,0.15)]'
        },
        { 
            id: 6, 
            titulo: 'Ingeniería Social: El Falso Premio', 
            resumen: 'Manipulación mediante recompensas.', 
            vulnerabilidad: 'Ambición y Gratificación',
            detalle: 'Ganas un concurso en el que no participaste. Solo debes pagar el "seguro de envío" del premio para recibirlo.',
            profundo: 'La dopamina del premio ignora las alertas. Los atacantes crean una ilusión de beneficio que nubla el sentido común del usuario.',
            prevencion: 'Si es demasiado bueno para ser verdad, es una estafa. Nadie regala productos costosos sin un concurso oficial verificable.',
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
                <p className="text-gray-400 text-sm font-medium mt-4 leading-relaxed">Educación inclusiva para proteger el eslabón más débil: el ser humano.</p>
            </header>

            {/* Progreso */}
            <section className="bg-gray-900/80 p-5 rounded-3xl border border-white/10 mb-8 shadow-xl">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Nivel de Sabiduría</span>
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
                            className={`group rounded-3xl border transition-all duration-500 cursor-pointer overflow-hidden ${isExp ? 'bg-gray-800/90 border-blue-500/40 shadow-2xl' : `bg-gray-900 border-white/5 ${item.bgGlow}`}`}
                        >
                            <div className="p-5 sm:p-6">
                                <div className="flex items-start gap-4">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner shrink-0 transition-all duration-500 ${isExp ? 'scale-110 bg-blue-600/20' : 'bg-gray-800'} ${isRead && !isExp ? 'grayscale opacity-50' : ''}`}>
                                        {item.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h3 className={`text-base font-black leading-tight truncate transition-colors ${isRead && !isExp ? 'text-gray-500' : 'text-white'}`}>
                                                {item.titulo}
                                            </h3>
                                            {isRead && <span className="text-green-500 text-[9px] font-black uppercase tracking-widest bg-green-500/10 px-2 py-0.5 rounded-md">Completado</span>}
                                        </div>
                                        <p className="text-gray-500 text-[10px] font-bold uppercase mt-1 mb-1.5">
                                            Afecta: <span className={item.color}>{item.vulnerabilidad}</span>
                                        </p>
                                        <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{item.resumen}</p>
                                    </div>
                                </div>

                                <div className={`grid transition-all duration-500 ease-in-out ${isExp ? 'grid-rows-[1fr] opacity-100 mt-6' : 'grid-rows-[0fr] opacity-0'}`}>
                                    <div className="overflow-hidden">
                                        <div className="pt-5 border-t border-gray-700/50 space-y-5">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); hablar(`Lección: ${item.titulo}. El engaño consiste en: ${item.detalle}. ¿Cómo prevenirlo? ${item.prevencion}`, item.id); }}
                                                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${isSpeaking && expandido === item.id ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                                            >
                                                {isSpeaking && expandido === item.id ? 'Detener Audio' : '🔊 Escuchar Lección'}
                                            </button>

                                            <div>
                                                <h4 className="text-blue-400 text-[9px] font-black uppercase tracking-widest mb-1">El Método</h4>
                                                <p className="text-gray-300 text-sm">{item.detalle}</p>
                                            </div>

                                            <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
                                                <h4 className="text-purple-400 text-[9px] font-black uppercase tracking-widest mb-1">Psicología</h4>
                                                <p className="text-gray-400 text-sm italic">"{item.profundo}"</p>
                                            </div>

                                            <div className="bg-green-500/10 p-4 rounded-2xl border border-green-500/20">
                                                <h4 className="text-green-400 text-[9px] font-black uppercase tracking-widest mb-1">Tu Escudo</h4>
                                                <p className="text-gray-200 text-sm">{item.prevencion}</p>
                                            </div>

                                            {!isRead && (
                                                <button 
                                                    onClick={(e) => marcarComoLeido(item.id, e)}
                                                    className="w-full bg-blue-600 text-white font-black py-4 rounded-xl text-xs uppercase shadow-lg active:scale-95"
                                                >
                                                    Marcar como Aprendido
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
        </div>
    );
};

export default Educacion;