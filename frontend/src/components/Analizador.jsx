import { useState, useRef } from 'react';
import api from '../services/api';

const Analizador = ({ isPremium, setTabActiva }) => {
    const [tipoAnalisis, setTipoAnalisis] = useState('texto'); 
    const [mensaje, setMensaje] = useState('');
    const [loading, setLoading] = useState(false);
    const [resultado, setResultado] = useState(null);
    const [feedbackDado, setFeedbackDado] = useState(false);
    const [error, setError] = useState('');
    
    const [imagenPreview, setImagenPreview] = useState(null);
    const [escaneando, setEscaneando] = useState(false);
    const fileInputRef = useRef(null);

    const analizarTextoAPI = async () => {
        if (!mensaje.trim()) return;
        setLoading(true); setFeedbackDado(false); setError('');
        try {
            // Simulamos un delay de red para que se vea la animación
            const respuesta = await api.post('/mensajes/analizar', { contenido: mensaje });
            setTimeout(() => {
                setResultado(respuesta.data.reporte);
                setLoading(false);
            }, 1000);
        } catch (err) {
            setError('Error de comunicación. Intente más tarde.');
            setLoading(false);
        }
    };

    const manejarFeedbackAPI = async (esFraude) => {
        try {
            await api.post('/mensajes/feedback', { contenido: resultado.texto_analizado, esFraude: esFraude });
            setFeedbackDado(true);
        } catch (error) { console.error(error); }
    };

    const manejarSubidaImagen = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImagenPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    if (resultado) {
        const esPeligroso = resultado.nivel_riesgo === 'Alto' || resultado.nivel_riesgo === 'Medio';
        return (
            <div className="p-6 animate-fade-in-up">
                <button onClick={() => { setResultado(null); setImagenPreview(null); setMensaje(''); }} className="flex items-center text-gray-500 font-black mb-8 hover:text-white transition-all">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg> VOLVER
                </button>

                <div className="flex flex-col items-center mb-10">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-5 shadow-2xl ${esPeligroso ? 'bg-red-500/20 text-red-500 ring-2 ring-red-500/50' : 'bg-green-500/20 text-green-500 ring-2 ring-green-500/50'}`}>
                        {esPeligroso ? <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg> : <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <h2 className={`text-3xl font-black uppercase text-center ${esPeligroso ? 'text-red-500' : 'text-green-500'}`}>{resultado.resultado}</h2>
                    <p className="text-gray-400 font-bold mt-2">Score de Amenaza: <span className="text-white font-mono">{resultado.score_peligro}/100</span></p>
                </div>

                <div className="bg-gray-800/40 backdrop-blur-md rounded-3xl p-6 border border-white/5 mb-8">
                    <h3 className="text-white font-black mb-4 uppercase text-xs tracking-widest opacity-50">Reporte Técnico</h3>
                    <ul className="space-y-3">
                        {resultado.motivos.map((m, i) => (
                            <li key={i} className="flex gap-3 text-gray-300 text-sm items-start">
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0"></span> {m}
                            </li>
                        ))}
                    </ul>
                </div>

                {tipoAnalisis === 'texto' && !feedbackDado && (
                    <div className="text-center">
                        <p className="text-gray-500 text-xs font-black mb-4 uppercase tracking-tighter">¿La IA acertó?</p>
                        <div className="flex gap-3">
                            <button onClick={() => manejarFeedbackAPI(true)} className="flex-1 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 py-4 rounded-2xl font-black transition-all">SÍ, ES FRAUDE</button>
                            <button onClick={() => manejarFeedbackAPI(false)} className="flex-1 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white border border-green-500/20 py-4 rounded-2xl font-black transition-all">NO, ES SEGURO</button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="p-6 flex flex-col min-h-full">
            <div className="bg-gray-800/50 p-1 rounded-2xl flex mb-8 border border-white/5">
                <button onClick={() => setTipoAnalisis('texto')} className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${tipoAnalisis === 'texto' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>Texto</button>
                <button onClick={() => setTipoAnalisis('imagen')} className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${tipoAnalisis === 'imagen' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>Imagen (PRO)</button>
            </div>

            {tipoAnalisis === 'texto' ? (
                <div className="flex-1 flex flex-col animate-fade-in">
                    <h2 className="text-3xl font-black text-white mb-2 leading-none">Protección <span className="text-blue-500 underline decoration-4 underline-offset-4">Heurística</span></h2>
                    <p className="text-gray-500 text-sm mb-8 font-medium">Analiza patrones de Phishing en tiempo real.</p>
                    <textarea className="w-full bg-black/40 border border-gray-700/50 text-white rounded-3xl p-6 min-h-40 outline-none focus:border-blue-500 transition-all placeholder:text-gray-700" placeholder="Pega el mensaje sospechoso aquí..." value={mensaje} onChange={(e) => setMensaje(e.target.value)}></textarea>
                    
                    <button onClick={analizarTextoAPI} disabled={loading || !mensaje.trim()} className="w-full bg-blue-600 text-white font-black py-5 rounded-3xl mt-10 shadow-2xl shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50">
                        {loading ? 'PROCESANDO...' : 'INICIAR ANÁLISIS'}
                    </button>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center animate-fade-in">
                    {!isPremium ? (
                        <div className="text-center p-8 bg-linear-to-b from-gray-800/50 to-transparent rounded-[3rem] border border-white/5">
                            <div className="w-20 h-20 bg-yellow-500/10 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20"><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" /></svg>
                            </div>
                            <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Escáner de Imagen</h3>
                            <p className="text-gray-400 text-sm mb-8">Detecta estafas en capturas de pantalla de bancos o redes sociales.</p>
                            <button onClick={() => setTabActiva('pro')} className="w-full bg-linear-to-r from-yellow-500 to-yellow-600 text-black font-black py-4 rounded-2xl shadow-lg shadow-yellow-500/20 active:scale-95 transition-all">MEJORAR A PRO</button>
                        </div>
                    ) : (
                        <div className="w-full">
                            <input type="file" ref={fileInputRef} className="hidden" onChange={manejarSubidaImagen} />
                            <div onClick={() => fileInputRef.current.click()} className="border-2 border-dashed border-gray-700 hover:border-blue-500 transition-colors rounded-[3rem] p-20 text-center cursor-pointer">
                                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Subir captura sospechosa</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Analizador;