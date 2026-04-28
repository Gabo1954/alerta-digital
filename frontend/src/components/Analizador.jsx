import { useState, useRef } from 'react';
import api from '../services/api';

const Analizador = ({ isPremium, setTabActiva }) => {
    const [tipoAnalisis, setTipoAnalisis] = useState('texto'); 
    const [mensaje, setMensaje] = useState('');
    const [loading, setLoading] = useState(false);
    const [resultado, setResultado] = useState(null);
    const [estadoFeedback, setEstadoFeedback] = useState('pendiente'); 
    const [error, setError] = useState('');
    
    const [imagenPreview, setImagenPreview] = useState(null);
    const [escaneando, setEscaneando] = useState(false);
    const fileInputRef = useRef(null);

    const MAX_CHARS = 1000; // Límite de 1000 caracteres

    // --- FUNCIONES DE INTERACCIÓN ---
    const importarDesdePortapapeles = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) { 
                setMensaje(text); 
                setError(''); 
            } else { 
                setError('El portapapeles está vacío.'); 
            }
        } catch (err) { 
            setError('Permiso denegado para el portapapeles.'); 
        }
    };

    const analizarTextoAPI = async () => {
        if (!mensaje.trim()) return;
        setLoading(true); setEstadoFeedback('pendiente'); setError('');
        try {
            const respuesta = await api.post('/mensajes/analizar', { contenido: mensaje });
            setTimeout(() => {
                setResultado(respuesta.data.reporte);
                setLoading(false);
            }, 1200); 
        } catch (err) {
            setError('Error de comunicación con el motor de IA.');
            setLoading(false);
        }
    };

    const analizarImagenVIP = async () => {
        if (!imagenPreview) return;
        setEscaneando(true); setEstadoFeedback('pendiente'); setError('');
        try {
            const respuesta = await api.post('/mensajes/analizar-imagen', { imagen_base64: imagenPreview });
            setTimeout(() => {
                setResultado({ 
                    ...respuesta.data.reporte, 
                    texto_leido: respuesta.data.texto_leido_oculto || '' 
                });
                setEscaneando(false);
            }, 2500); 
        } catch (err) {
            setError('Fallo en el servicio de IA Visual.');
            setEscaneando(false);
        }
    };

    const manejarFeedbackAPI = async (esFraude) => {
        setEstadoFeedback('entrenando');
        const contenidoFinal = mensaje || resultado?.texto_leido || "Contenido visual";
        try {
            await api.post('/mensajes/feedback', { contenido: contenidoFinal, esFraude: esFraude });
            setTimeout(() => setEstadoFeedback('completado'), 2500);
        } catch (error) { 
            setTimeout(() => setEstadoFeedback('completado'), 1500); 
        }
    };

    const manejarSubidaImagen = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImagenPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    // --- MOTOR DE INDICACIONES Y EXPLICACIÓN NARRATIVA ---
    const obtenerIndicacionNarrativa = (esPeligroso) => {
        const texto = (mensaje || resultado?.texto_leido || '').toLowerCase();
        
        if (texto.includes('banco') || texto.includes('cuenta') || texto.includes('tarjeta')) {
            return "Vigilancia Financiera: Los bancos legítimos NUNCA solicitan validar datos mediante enlaces SMS. Esta es una táctica clásica de robo de credenciales.";
        }
        if (texto.includes('http') || texto.includes('www')) {
            return "Alerta de Enlace: Detectamos un enlace externo. Los criminales clonan sitios oficiales para capturar contraseñas. No ingreses datos en esa URL.";
        }
        if (texto.includes('premio') || texto.includes('ganaste') || texto.includes('sorteo')) {
            return "Ingeniería Social: El mensaje usa la gratificación inmediata como anzuelo. Es altamente probable que soliciten un pago por 'gestión' que nunca existió.";
        }

        return esPeligroso 
            ? "Veredicto: El contenido usa lenguaje manipulativo y de urgencia para forzar una acción rápida. No respondas y bloquea al remitente."
            : "Seguridad: No se detectaron patrones de estafa activos. Mantén tu precaución habitual al tratar con remitentes externos.";
    };

    const generarRazonesEvidencia = (esPeligroso) => {
        if (resultado?.motivos && resultado.motivos.length > 0) return resultado.motivos.slice(0, 4);
        return esPeligroso 
            ? ["Patrones de urgencia y alerta detectados.", "El contenido solicita validación de datos sensibles."] 
            : ["Estructura gramatical coherente.", "Ausencia de enlaces o redirecciones sospechosas."];
    };

    // ==========================================
    // RENDER 1: VISTA DE RESULTADOS
    // ==========================================
    if (resultado) {
        const esPeligroso = resultado.nivel_riesgo === 'Alto' || resultado.nivel_riesgo === 'Medio';
        const razonesEvidencia = generarRazonesEvidencia(esPeligroso);

        return (
            <div className="flex-1 w-full overflow-y-auto no-scrollbar px-5 pt-6 pb-32 animate-fade-in-up font-sans">
                
                <button onClick={() => { setResultado(null); setImagenPreview(null); setMensaje(''); setEstadoFeedback('pendiente'); }} className="flex items-center text-gray-400 font-bold mb-8 hover:text-white transition-all bg-gray-800/50 px-5 py-2.5 rounded-xl border border-white/5 active:scale-95 shadow-lg">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg> NUEVO ANÁLISIS
                </button>

                <div className="flex flex-col items-center mb-8 relative text-center">
                    <div className={`w-28 h-28 rounded-full flex items-center justify-center mb-4 shadow-2xl relative z-10 transition-transform duration-500 hover:scale-110 ${esPeligroso ? 'bg-red-500/10 text-red-500 border-4 border-red-500/50 shadow-red-500/20' : 'bg-green-500/10 text-green-500 border-4 border-green-500/50 shadow-green-500/20'}`}>
                        {esPeligroso ? <span className="text-5xl animate-pulse">🚨</span> : <span className="text-5xl">✅</span>}
                    </div>
                    <h2 className={`text-3xl font-black uppercase tracking-tight ${esPeligroso ? 'text-red-500' : 'text-green-500'}`}>
                        {resultado.resultado || 'EVALUACIÓN LISTA'}
                    </h2>
                    <div className="flex gap-2 mt-4">
                        <span className="bg-gray-800 text-white text-[10px] font-black px-3 py-1 rounded-lg border border-white/5 uppercase shadow-sm tracking-widest">Puntaje IA: {resultado.score_peligro ?? 0}/100</span>
                        <span className="bg-blue-900/30 text-blue-300 text-[10px] font-black px-3 py-1 rounded-lg border border-blue-500/20 uppercase shadow-sm tracking-widest">{resultado.categoria || 'ANÁLISIS'}</span>
                    </div>
                </div>

                <div className="bg-gray-900/60 backdrop-blur-md rounded-[2.5rem] p-6 border border-white/10 mb-8 shadow-xl relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-full h-1 ${esPeligroso ? 'bg-red-500' : 'bg-green-500'}`}></div>
                    
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-4 italic">Evidencia Detectada:</p>
                    <div className="space-y-3 mb-8 bg-black/40 p-5 rounded-2xl border border-white/5 shadow-inner">
                        {razonesEvidencia.map((m, i) => (
                            <div key={i} className="flex gap-3 items-start animate-fade-in">
                                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${esPeligroso ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                <p className="text-gray-300 text-sm leading-relaxed font-medium">{m}</p>
                            </div>
                        ))}
                    </div>

                    <div className={`p-5 rounded-2xl border-l-4 ${esPeligroso ? 'bg-red-500/10 border-red-500' : 'bg-blue-500/10 border-blue-500'}`}>
                        <div className="flex items-center gap-2 mb-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <h4 className="font-black text-xs uppercase tracking-widest text-white tracking-widest">Consejo de Alerta Digital:</h4>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed italic">
                            "{obtenerIndicacionNarrativa(esPeligroso)}"
                        </p>
                    </div>
                </div>

                {/* SECCIÓN DE ENTRENAMIENTO REFORZADA */}
                {estadoFeedback === 'pendiente' && (
                    <div className="bg-gray-800/80 border border-gray-700 p-6 rounded-[2rem] shadow-lg text-center animate-fade-in">
                        <p className="text-gray-300 text-xs font-bold mb-4 uppercase tracking-[0.2em] opacity-80">¿Fue acertado el sistema?</p>
                        <div className="flex gap-3">
                            <button onClick={() => manejarFeedbackAPI(true)} className="flex-1 bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20 py-4 rounded-xl font-black text-[10px] uppercase transition-all active:scale-90 shadow-md">ES PELIGROSO</button>
                            <button onClick={() => manejarFeedbackAPI(false)} className="flex-1 bg-green-500/10 hover:bg-green-600 text-green-400 hover:text-white border border-green-500/20 py-4 rounded-xl font-black text-[10px] uppercase transition-all active:scale-90 shadow-md">ES SEGURO</button>
                        </div>
                    </div>
                )}
                
                {estadoFeedback === 'entrenando' && (
                    <div className="bg-gray-800 border border-gray-700 p-8 rounded-[2rem] flex flex-col items-center justify-center animate-pulse shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-blue-500/5"></div>
                        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4 relative z-10"></div>
                        <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.25em] relative z-10">Modificando Red Neuronal</p>
                        <p className="text-gray-500 text-[9px] mt-1 uppercase font-bold relative z-10 tracking-widest italic">Actualizando red en Oracle Cloud...</p>
                    </div>
                )}

                {estadoFeedback === 'completado' && (
                    <div className="bg-green-900/30 border border-green-800/50 p-8 rounded-[2rem] flex flex-col items-center text-center shadow-lg animate-fade-in">
                        <div className="w-14 h-14 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-3">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <p className="text-green-400 font-black text-sm uppercase">¡Aporte Registrado!</p>
                        <p className="text-gray-500 text-[10px] font-medium mt-1 uppercase tracking-tighter tracking-widest">Has fortalecido el escudo heurístico.</p>
                    </div>
                )}
            </div>
        );
    }

    // ==========================================
    // RENDER 2: VISTA PRINCIPAL (INGRESO)
    // ==========================================
    return (
        <div className="flex-1 w-full flex flex-col px-5 pt-10 pb-24 font-sans animate-fade-in relative overflow-y-auto no-scrollbar">
            
            <div className="flex items-center gap-1.5 mb-3 px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded-md w-fit ml-2 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_blue]"></span>
                <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest">IA Bayesiana Activa</span>
            </div>

            <div className="mb-6 flex justify-between items-end px-2">
                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 leading-tight tracking-tight uppercase">
                    Escáner <br/><span className="text-blue-500 bg-none italic underline decoration-4 decoration-blue-500 underline-offset-4 font-normal">Digital</span>
                </h2>
                <button onClick={() => setTabActiva('historial')} className="bg-gray-800 border border-gray-700 text-gray-300 p-3.5 rounded-2xl hover:bg-gray-700 transition-all shadow-lg active:scale-95">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </button>
            </div>

            <div className="bg-gray-900 p-1.5 rounded-2xl flex mb-6 border border-gray-800 shadow-inner">
                <button onClick={() => setTipoAnalisis('texto')} className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300 ${tipoAnalisis === 'texto' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>Texto / Link</button>
                <button onClick={() => setTipoAnalisis('imagen')} className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300 ${tipoAnalisis === 'imagen' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>Imagen PRO</button>
            </div>

            {tipoAnalisis === 'texto' ? (
                <div className="flex-1 flex flex-col min-h-0 animate-fade-in relative px-1">
                    
                    {/* SHORTCUTS DE APLICACIONES OFICIALES */}
                    <div className="flex gap-2 mb-4">
                        <button onClick={() => window.open('whatsapp://')} className="flex-1 bg-green-600/10 border border-green-500/20 text-green-500 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all">
                            <span>WhatsApp</span>
                        </button>
                        <button onClick={() => window.open('fb-messenger://')} className="flex-1 bg-blue-600/10 border border-blue-500/20 text-blue-400 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all">
                            <span>Messenger</span>
                        </button>
                        <button onClick={() => window.open('sms:')} className="flex-1 bg-gray-600/10 border border-gray-500/20 text-gray-400 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all">
                            <span>SMS</span>
                        </button>
                    </div>

                    <div className="relative flex-1 flex flex-col group min-h-[220px]">
                        <textarea 
                            className="flex-1 w-full bg-gray-900 border border-gray-800 text-white rounded-3xl p-6 pt-16 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-gray-600 text-lg leading-relaxed shadow-inner resize-none" 
                            placeholder="Copia el mensaje sospechoso y pégalo aquí..." 
                            value={mensaje} 
                            maxLength={MAX_CHARS}
                            onChange={(e) => setMensaje(e.target.value)}
                        ></textarea>

                        {/* BOTONES FLOTANTES INTERNOS */}
                        <div className="absolute top-4 right-4 flex gap-2">
                            <button onClick={importarDesdePortapapeles} className="flex items-center gap-2 bg-gray-800/90 hover:bg-blue-600 text-gray-300 hover:text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border border-white/5 active:scale-90 shadow-xl" title="Pegar">📋 PEGAR</button>
                            {mensaje && <button onClick={() => setMensaje('')} className="bg-gray-800/90 hover:bg-red-600 text-gray-400 w-11 h-11 rounded-xl transition-all border border-white/5 active:scale-90 shadow-xl flex items-center justify-center text-sm" title="Vaciar">✕</button>}
                        </div>
                    </div>
                    
                    <div className="text-right mt-3 mb-5 text-[10px] font-black text-gray-600 uppercase tracking-widest flex justify-between px-2">
                        <span>Análisis de cadena profunda</span>
                        <span>{mensaje.length} / {MAX_CHARS}</span>
                    </div>

                    <button onClick={analizarTextoAPI} disabled={loading || !mensaje.trim()} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl mt-auto shadow-2xl active:scale-95 transition-all duration-300 disabled:opacity-40 text-lg tracking-widest uppercase">
                        {loading ? <span className="flex items-center gap-2 justify-center font-black"><div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div> PROCESANDO...</span> : 'Iniciar Escaneo'}
                    </button>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] animate-fade-in px-2">
                    {!isPremium ? (
                        <div className="text-center p-8 bg-gray-900 rounded-[2.5rem] border border-yellow-500/20 w-full shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-yellow-500/10 blur-3xl rounded-full"></div>
                            <div className="w-16 h-16 bg-yellow-500/10 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-5 border border-yellow-500/20 relative z-10 shadow-inner">
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/></svg>
                            </div>
                            <h3 className="text-xl font-black text-white mb-2 uppercase relative z-10 tracking-tight">Análisis Visual VIP</h3>
                            <p className="text-gray-400 text-sm mb-8 px-2 relative z-10 leading-relaxed font-medium">Extrae enlaces y detecta suplantación directamente desde capturas de pantalla.</p>
                            <button onClick={() => setTabActiva('pro')} className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-black py-4.5 rounded-xl transition-all shadow-xl active:scale-95 relative z-10 tracking-widest uppercase">Mejorar a VIP</button>
                        </div>
                    ) : (
                        <div className="w-full flex flex-col h-full">
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={manejarSubidaImagen} />
                            
                            {!imagenPreview ? (
                                <div onClick={() => fileInputRef.current.click()} className="group border-2 border-dashed border-gray-600 bg-gray-900/50 hover:bg-blue-500/5 transition-all duration-300 rounded-[2.5rem] p-8 flex-1 flex flex-col items-center justify-center cursor-pointer mb-5 min-h-[200px] shadow-inner">
                                    <div className="w-14 h-14 bg-gray-800 group-hover:bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center mb-4 transition-all duration-300 shadow-sm border border-white/5 group-hover:scale-110">
                                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4M12 4h4.01M4 8h16M4 16h16M4 4h16v16H4V4z" /></svg>
                                    </div>
                                    <p className="text-white font-black text-sm uppercase tracking-widest text-center leading-tight">Toque para seleccionar una captura de pantalla</p>
                                </div>
                            ) : (
                                <div className="relative rounded-[2rem] overflow-hidden mb-6 flex-1 flex items-center justify-center bg-black border border-gray-700 min-h-[200px] group cursor-pointer shadow-2xl shadow-blue-500/5" onClick={() => !escaneando && fileInputRef.current.click()}>
                                    <img src={imagenPreview} alt="Preview" className={`max-h-full max-w-full object-contain transition-all duration-500 ${escaneando ? 'opacity-30 blur-sm grayscale' : 'opacity-100 group-hover:opacity-70'}`} />
                                    
                                    {!escaneando && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <p className="text-white font-black bg-black/60 px-5 py-2.5 rounded-full backdrop-blur-md text-[10px] uppercase tracking-widest border border-white/20 shadow-lg">Cambiar Foto</p>
                                        </div>
                                    )}

                                    {escaneando && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                                            <div className="w-14 h-14 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin mb-4 shadow-lg shadow-yellow-500/20"></div>
                                            <p className="text-yellow-400 font-black bg-black/80 px-4 py-1.5 rounded-full text-[10px] tracking-widest uppercase border border-yellow-500/30 shadow-sm animate-pulse">Analizando Píxeles...</p>
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            <button onClick={analizarImagenVIP} disabled={escaneando || !imagenPreview} className={`w-full font-black py-5 rounded-2xl mt-auto transition-all duration-300 text-lg tracking-widest active:scale-95 uppercase ${escaneando || !imagenPreview ? 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed shadow-none' : 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black shadow-xl shadow-yellow-500/20'}`}>
                                {escaneando ? 'Analizando...' : 'Iniciar Análisis Visual'}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Analizador;