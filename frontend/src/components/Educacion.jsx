import { useState, useEffect } from 'react';

const Educacion = ({ usuario }) => {
    const [expandido, setExpandido] = useState(null);
    const [leidos, setLeidos] = useState([]);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [mostrarTest, setMostrarTest] = useState(false);
    const [respuestasTest, setRespuestasTest] = useState({});
    const [resultadoTest, setResultadoTest] = useState(null);

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

    // --- BANCO DE PREGUNTAS DEL TEST (2 POR CADA TEMA) ---
    const preguntas = [
        // PHISHING (2)
        {
            id: 1,
            pregunta: '¿Cuál es el factor psicológico principal en el Phishing?',
            opciones: [
                { texto: 'El miedo y la autoridad', correcta: true },
                { texto: 'La curiosidad del usuario', correcta: false },
                { texto: 'La falta de conexión a internet', correcta: false },
                { texto: 'El precio alto de los productos', correcta: false }
            ]
        },
        {
            id: 2,
            pregunta: '¿Cuál es la principal característica de un correo de phishing?',
            opciones: [
                { texto: 'Siempre viene de direcciones que reconoces', correcta: false },
                { texto: 'Te pide ingresar contraseña en un enlace dentro del correo', correcta: true },
                { texto: 'Contiene videos en movimiento', correcta: false },
                { texto: 'Siempre solicita dinero inmediato', correcta: false }
            ]
        },
        // SMISHING (2)
        {
            id: 3,
            pregunta: '¿A través de qué canal se realiza el Smishing?',
            opciones: [
                { texto: 'Redes Sociales', correcta: false },
                { texto: 'Correo Electrónico', correcta: false },
                { texto: 'Mensajes de Texto (SMS)', correcta: true },
                { texto: 'Llamadas telefónicas', correcta: false }
            ]
        },
        {
            id: 4,
            pregunta: '¿Cuál es una señal de alerta en un SMS fraudulento?',
            opciones: [
                { texto: 'Viene de tu banco con errores de ortografía y enlaces acortados', correcta: true },
                { texto: 'El mensaje es muy largo', correcta: false },
                { texto: 'Usa palabras en inglés', correcta: false },
                { texto: 'Llega a las 8 de la mañana', correcta: false }
            ]
        },
        // VISHING (2)
        {
            id: 5,
            pregunta: '¿Por qué el Vishing es efectivo?',
            opciones: [
                { texto: 'Porque el atacante usa equipos costosos', correcta: false },
                { texto: 'Porque la voz humana genera confianza y mantiene presión', correcta: true },
                { texto: 'Porque el usuario no tiene acceso a información', correcta: false },
                { texto: 'Porque es imposible rastrear llamadas', correcta: false }
            ]
        },
        {
            id: 6,
            pregunta: '¿Qué debes hacer si un "ejecutivo bancario" te pide un código que recibiste por SMS?',
            opciones: [
                { texto: 'Dárselo de inmediato para validar tu cuenta', correcta: false },
                { texto: 'Cuelga y llama directamente al banco con el número de atrás de tu tarjeta', correcta: true },
                { texto: 'Pedirle que espere mientras lo buscas', correcta: false },
                { texto: 'Compartirlo solo si reconoces su número', correcta: false }
            ]
        },
        // QUISHING (2)
        {
            id: 7,
            pregunta: '¿Cómo se llama el ataque mediante códigos QR falsos?',
            opciones: [
                { texto: 'Phishing', correcta: false },
                { texto: 'Vishing', correcta: false },
                { texto: 'Quishing', correcta: true },
                { texto: 'Smishing', correcta: false }
            ]
        },
        {
            id: 8,
            pregunta: '¿Qué característica tienen los códigos QR maliciosos?',
            opciones: [
                { texto: 'Siempre están defectuosos o borrosos', correcta: false },
                { texto: 'Pueden ser stickers pegados sobre códigos reales', correcta: true },
                { texto: 'Contienen colores anormales', correcta: false },
                { texto: 'Llevan un símbolo de advertencia', correcta: false }
            ]
        },
        // SIM SWAPPING (2)
        {
            id: 9,
            pregunta: '¿Qué es el SIM Swapping?',
            opciones: [
                { texto: 'Cambiar el nombre de tu línea telefónica', correcta: false },
                { texto: 'Clonación de tu número telefónico transfiriéndolo a otro chip', correcta: true },
                { texto: 'Desactivar temporalmente tu servicio de datos', correcta: false },
                { texto: 'Cambiar tu operadora telefónica', correcta: false }
            ]
        },
        {
            id: 10,
            pregunta: '¿Cuál es la mejor defensa contra el SIM Swapping?',
            opciones: [
                { texto: 'Usar solo SMS para la autenticación', correcta: false },
                { texto: 'Usar aplicaciones de autenticación en vez de SMS', correcta: true },
                { texto: 'Cambiar tu número de teléfono mensualmente', correcta: false },
                { texto: 'No usar tu número en redes sociales', correcta: false }
            ]
        },
        // INGENIERÍA SOCIAL (2)
        {
            id: 11,
            pregunta: '¿Cuál es la principal manipulación de la Ingeniería Social?',
            opciones: [
                { texto: 'El ofrecimiento de premios o beneficios falsos', correcta: true },
                { texto: 'El uso de equipos de rastreo', correcta: false },
                { texto: 'La interferencia de wifi', correcta: false },
                { texto: 'El bloqueo de aplicaciones', correcta: false }
            ]
        },
        {
            id: 12,
            pregunta: '¿Cómo identificar un premio falso en una estafa por Ingeniería Social?',
            opciones: [
                { texto: 'Participaste en un concurso verificable y te piden dinero por impuestos', correcta: false },
                { texto: 'Ganas un premio en un concurso que NUNCA realizaste', correcta: true },
                { texto: 'El premio es muy pequeño', correcta: false },
                { texto: 'Te contactan por email en lugar de teléfono', correcta: false }
            ]
        }
    ];

    const progreso = Math.round((leidos.length / lecciones.length) * 100) || 0;

    const manejarRespuestaTest = (preguntaId, opcionIndex) => {
        setRespuestasTest(prev => ({
            ...prev,
            [preguntaId]: opcionIndex
        }));
    };

    const enviarTest = () => {
        let aciertos = 0;
        preguntas.forEach(pregunta => {
            const respuesta = respuestasTest[pregunta.id];
            if (respuesta !== undefined && pregunta.opciones[respuesta].correcta) {
                aciertos++;
            }
        });
        const porcentaje = Math.round((aciertos / preguntas.length) * 100);
        setResultadoTest({ aciertos, total: preguntas.length, porcentaje });
    };

    const reiniciarTest = () => {
        setRespuestasTest({});
        setResultadoTest(null);
        setMostrarTest(false);
    };

    return (
        <div className="flex-1 w-full overflow-y-auto no-scrollbar px-4 sm:px-6 pt-6 pb-32 animate-fade-in font-sans">
            {/* VISTA DEL TEST */}
            {mostrarTest ? (
                <div className="animate-fade-in-up">
                    <button 
                        onClick={() => setMostrarTest(false)}
                        className="text-gray-500 hover:text-white transition-colors mb-6 flex items-center text-sm font-bold active:scale-95"
                    >
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg> Volver a Lecciones
                    </button>

                    <header className="mb-8">
                        <h2 className="text-4xl font-black text-white leading-tight tracking-tight">
                            Prueba tu{' '}
                            <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                                Conocimiento
                            </span>
                        </h2>
                        <p className="text-gray-400 text-sm font-medium mt-4">Resuelve {preguntas.length} preguntas para validar lo aprendido</p>
                    </header>

                    {!resultadoTest ? (
                        <div className="space-y-6">
                            {preguntas.map((pregunta, index) => (
                                <div key={pregunta.id} className="bg-gray-900 border border-white/5 rounded-3xl p-6 shadow-lg">
                                    <div className="flex gap-3 mb-5">
                                        <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                                            {index + 1}
                                        </div>
                                        <h3 className="text-white font-bold text-sm leading-relaxed flex-1">{pregunta.pregunta}</h3>
                                    </div>
                                    <div className="space-y-2 ml-11">
                                        {pregunta.opciones.map((opcion, opcionIndex) => (
                                            <button
                                                key={opcionIndex}
                                                onClick={() => manejarRespuestaTest(pregunta.id, opcionIndex)}
                                                className={`w-full p-4 rounded-xl border-2 text-left transition-all font-medium text-sm ${
                                                    respuestasTest[pregunta.id] === opcionIndex
                                                        ? 'border-purple-500 bg-purple-500/10 text-white'
                                                        : 'border-white/10 bg-gray-800/50 text-gray-300 hover:border-purple-500/30'
                                                }`}
                                            >
                                                <span className="flex items-center gap-3">
                                                    <span className={`w-5 h-5 border-2 flex items-center justify-center transition-all ${
                                                        respuestasTest[pregunta.id] === opcionIndex
                                                            ? 'border-purple-500 bg-purple-500'
                                                            : 'border-gray-500'
                                                    }`}>
                                                        {respuestasTest[pregunta.id] === opcionIndex && (
                                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                        )}
                                                    </span>
                                                    {opcion.texto}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={enviarTest}
                                disabled={Object.keys(respuestasTest).length < preguntas.length}
                                className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black py-5 rounded-2xl text-sm uppercase tracking-widest shadow-lg active:scale-95 transition-all mt-6"
                            >
                                {Object.keys(respuestasTest).length < preguntas.length
                                    ? `Completa las ${preguntas.length - Object.keys(respuestasTest).length} preguntas faltantes`
                                    : 'ENVIAR RESPUESTAS'}
                            </button>
                        </div>
                    ) : (
                        <div className="animate-fade-in">
                            <div className="flex flex-col items-center mb-8 relative text-center">
                                <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 shadow-2xl relative z-10 transition-transform duration-500 hover:scale-110 ${
                                    resultadoTest.porcentaje >= 70 
                                        ? 'bg-green-500/10 text-green-500 border-4 border-green-500/50 shadow-green-500/20' 
                                        : resultadoTest.porcentaje >= 50
                                        ? 'bg-yellow-500/10 text-yellow-500 border-4 border-yellow-500/50 shadow-yellow-500/20'
                                        : 'bg-red-500/10 text-red-500 border-4 border-red-500/50 shadow-red-500/20'
                                }`}>
                                    {resultadoTest.porcentaje >= 70 ? '✅' : resultadoTest.porcentaje >= 50 ? '⚠️' : '❌'}
                                </div>
                                <h2 className={`text-5xl font-black tracking-tight mb-2 ${
                                    resultadoTest.porcentaje >= 70 
                                        ? 'text-green-500' 
                                        : resultadoTest.porcentaje >= 50
                                        ? 'text-yellow-500'
                                        : 'text-red-500'
                                }`}>
                                    {resultadoTest.porcentaje}%
                                </h2>
                                <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-4">
                                    {resultadoTest.aciertos} de {resultadoTest.total} respuestas correctas
                                </p>
                                <div className="flex gap-2">
                                    {resultadoTest.porcentaje >= 70 && <span className="bg-green-500/10 text-green-400 text-[10px] font-black px-3 py-1 rounded-lg border border-green-500/20 uppercase tracking-widest">¡Excelente!</span>}
                                    {resultadoTest.porcentaje >= 50 && resultadoTest.porcentaje < 70 && <span className="bg-yellow-500/10 text-yellow-400 text-[10px] font-black px-3 py-1 rounded-lg border border-yellow-500/20 uppercase tracking-widest">Buen esfuerzo</span>}
                                    {resultadoTest.porcentaje < 50 && <span className="bg-red-500/10 text-red-400 text-[10px] font-black px-3 py-1 rounded-lg border border-red-500/20 uppercase tracking-widest">Repasa las lecciones</span>}
                                </div>
                            </div>

                            <div className="bg-gray-900/60 backdrop-blur-md rounded-[2.5rem] p-6 border border-white/10 mb-8 shadow-xl">
                                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-4">Desempeño:</p>
                                <div className="space-y-3">
                                    {preguntas.map((pregunta) => {
                                        const respuesta = respuestasTest[pregunta.id];
                                        const esCorrecto = respuesta !== undefined && pregunta.opciones[respuesta].correcta;
                                        return (
                                            <div key={pregunta.id} className={`flex items-start gap-3 p-3 rounded-xl border ${
                                                esCorrecto
                                                    ? 'bg-green-500/10 border-green-500/20'
                                                    : 'bg-red-500/10 border-red-500/20'
                                            }`}>
                                                <div className={`mt-1 shrink-0 ${esCorrecto ? 'text-green-500' : 'text-red-500'}`}>
                                                    {esCorrecto ? '✓' : '✗'}
                                                </div>
                                                <div>
                                                    <p className={`text-sm font-medium ${esCorrecto ? 'text-green-400' : 'text-red-400'}`}>
                                                        {pregunta.pregunta}
                                                    </p>
                                                    {!esCorrecto && (
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            Respuesta correcta: <span className="text-green-400">{pregunta.opciones.find(o => o.correcta).texto}</span>
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <button
                                onClick={reiniciarTest}
                                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black py-5 rounded-2xl text-sm uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                            >
                                INTENTAR DE NUEVO
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <>
                    {/* VISTA DE LECCIONES */}
                    <header className="mb-8">
                        <h2 className="flex flex-col text-4xl font-black tracking-tighter text-white uppercase leading-none select-none">
                            <span>Academia</span>
                            <span className="text-3xl font-extralight tracking-normal normal-case italic bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent block mt-1 py-1 pl-0.5">
                                Digital
                            </span>
                        </h2>
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

                    {progreso >= 100 && (
                        <button
                            onClick={() => setMostrarTest(true)}
                            className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-black py-5 rounded-2xl text-sm uppercase tracking-widest shadow-lg active:scale-95 transition-all mb-8 flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            PRUEBA TU CONOCIMIENTO
                        </button>
                    )}

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
                </>
            )}
        </div>
    );
};

export default Educacion;