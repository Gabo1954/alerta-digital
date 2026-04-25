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

    const MAX_CHARS = 500;

    const analizarTextoAPI = async () => {
        if (!mensaje.trim()) return;
        setLoading(true); setFeedbackDado(false); setError('');
        try {
            const respuesta = await api.post('/mensajes/analizar', { contenido: mensaje });
            setTimeout(() => {
                setResultado(respuesta.data.reporte);
                setLoading(false);
            }, 800);
        } catch (err) {
            setError('Error de conexión con el motor de IA.');
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
                <button onClick={() => { setResultado(null); setImagenPreview(null); setMensaje(''); }} className="flex items-center text-gray-500 font-black mb-8 hover:text-white transition-all active:scale-95 bg-gray-900 px-4 py-2 rounded-full border border-white/5">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg> NUEVO ANÁLISIS
                </button>

                <div className="flex flex-col items-center mb-10">
                    <div className={`w-28 h-28 rounded-full flex items-center justify-center mb-5 shadow-[0_0_40px_rgba(0,0,0,0.5)] ${esPeligroso ? 'bg-red-500/10 text-red-500 ring-4 ring-red-500/30' : 'bg-green-500/10 text-green-500 ring-4 ring-green-500/30'}`}>
                        {esPeligroso ? <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg> : <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <h2 className={`text-4xl font-black uppercase text-center tracking-tighter ${esPeligroso ? 'text-red-500' : 'text-green-500'}`}>{resultado.resultado}</h2>
                    <div className="bg-gray-900 px-4 py-2 rounded-xl mt-4 border border-white/5 shadow-inner">
                        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Peligro: <span className="text-white text-base">{resultado.score_peligro}/100</span></p>
                    </div>
                </div>

                <div className="bg-gray-900/50 rounded-[2rem] p-6 border border-white/5 mb-8 shadow-xl">
                    <h3 className="text-white font-black mb-4 uppercase text-[10px] tracking-widest opacity-50">Análisis Heurístico</h3>
                    <ul className="space-y-3">
                        {resultado.motivos.map((m, i) => (
                            <li key={i} className="flex gap-3 text-gray-300 text-sm items-start font-medium">
                                <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${esPeligroso ? 'bg-red-500' : 'bg-green-500'}`}></span> {m}
                            </li>
                        ))}
                    </ul>
                </div>

                {tipoAnalisis === 'texto' && !feedbackDado && (
                    <div className="text-center bg-blue-900/10 border border-blue-500/20 p-5 rounded-[2rem] animate-fade-in">
                        <p className="text-blue-300 text-xs font-black mb-4 uppercase tracking-wider">¿El reporte es correcto?</p>
                        <div className="flex gap-3">
                            <button onClick={() => manejarFeedbackAPI(true)} className="flex-1 bg-red-500/20 text-red-400 border border-red-500/30 py-4 rounded-xl font-black active:scale-95 transition-all text-sm">SÍ, ESTAFA</button>
                            <button onClick={() => manejarFeedbackAPI(false)} className="flex-1 bg-green-500/20 text-green-400 border border-green-500/30 py-4 rounded-xl font-black active:scale-95 transition-all text-sm">NO, SEGURO</button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="p-6 flex flex-col min-h-full">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-3xl font-black text-white leading-none">Protección <br/><span className="text-blue-500 underline decoration-4 underline-offset-4">Heurística</span></h2>
                </div>
                <button onClick={() => setTabActiva('historial')} className="bg-gray-900 border border-white/10 text-gray-300 p-3 rounded-2xl active:scale-90 transition-all shadow-md">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </button>
            </div>

            <div className="bg-gray-900/80 p-1.5 rounded-2xl flex mb-6 border border-white/5 shadow-inner">
                <button onClick={() => setTipoAnalisis('texto')} className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${tipoAnalisis === 'texto' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-gray-500 hover:text-gray-300'}`}>Texto</button>
                <button onClick={() => setTipoAnalisis('imagen')} className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${tipoAnalisis === 'imagen' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-gray-500 hover:text-gray-300'}`}>Imagen (PRO)</button>
            </div>

            {tipoAnalisis === 'texto' ? (
                <div className="flex-1 flex flex-col animate-fade-in">
                    <div className="relative">
                        <textarea 
                            className="w-full bg-gray-900/50 border border-white/10 text-white rounded-[2rem] p-6 min-h-48 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-gray-600 text-lg leading-relaxed shadow-inner pr-12" 
                            placeholder="Pega un correo o SMS dudoso aquí..." 
                            value={mensaje} 
                            maxLength={MAX_CHARS}
                            onChange={(e) => setMensaje(e.target.value)}
                        ></textarea>
                        {mensaje && (
                            <button onClick={() => setMensaje('')} className="absolute top-4 right-4 text-gray-500 hover:text-white bg-black/50 p-2 rounded-full">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        )}
                    </div>
                    <div className="text-right mt-2 text-xs font-bold text-gray-600">
                        {mensaje.length}/{MAX_CHARS}
                    </div>
                    
                    {error && <p className="text-red-400 text-center mt-2 text-sm font-bold bg-red-500/10 p-2 rounded-lg border border-red-500/20">{error}</p>}

                    <button onClick={analizarTextoAPI} disabled={loading || !mensaje.trim()} className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl mt-auto mb-4 shadow-xl shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50 text-lg tracking-wide flex justify-center items-center gap-2">
                        {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : 'ESCANEAR RIESGO'}
                    </button>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center animate-fade-in pb-8">
                    {!isPremium ? (
                        <div className="text-center p-8 bg-linear-to-b from-gray-900 to-black rounded-[3rem] border border-yellow-500/20 w-full shadow-2xl">
                            <div className="w-20 h-20 bg-yellow-500/10 text-yellow-500 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-yellow-500/10 rotate-3">
                                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/></svg>
                            </div>
                            <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Escáner Visual</h3>
                            <p className="text-gray-400 text-sm mb-8 leading-relaxed">Sube capturas de pantalla. Nuestra IA detectará logos falsos y suplantación bancaria.</p>
                            <button onClick={() => setTabActiva('pro')} className="w-full bg-linear-to-r from-yellow-400 to-yellow-600 text-black font-black py-4 rounded-2xl shadow-xl shadow-yellow-500/20 active:scale-95 transition-all">DESBLOQUEAR VIP</button>
                        </div>
                    ) : (
                        <div className="w-full flex flex-col h-full">
                            <input type="file" ref={fileInputRef} className="hidden" onChange={manejarSubidaImagen} />
                            {!imagenPreview ? (
                                <div onClick={() => fileInputRef.current.click()} className="border-2 border-dashed border-gray-700 hover:border-blue-500 bg-gray-900/30 transition-colors rounded-[3rem] p-20 flex-1 flex flex-col items-center justify-center cursor-pointer mb-4">
                                    <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs text-center">Toque para subir captura</p>
                                </div>
                            ) : (
                                <div className="relative rounded-[3rem] overflow-hidden mb-6 flex-1 flex items-center justify-center bg-black border border-white/10 shadow-2xl">
                                    <img src={imagenPreview} alt="Preview" className={`max-h-full max-w-full object-contain transition-all ${escaneando ? 'opacity-40 blur-sm grayscale' : 'opacity-100'}`} />
                                    {escaneando && (
                                        <>
                                            <div className="absolute top-0 left-0 w-full h-1 bg-yellow-400 shadow-[0_0_30px_rgba(250,204,21,1)] animate-scan"></div>
                                            <p className="absolute text-yellow-400 font-black tracking-widest animate-pulse">ANALIZANDO PIXELES...</p>
                                        </>
                                    )}
                                </div>
                            )}
                            <button onClick={analizarImagenVIP} disabled={escaneando || !imagenPreview} className={`w-full font-black py-5 rounded-2xl mt-auto active:scale-95 transition-all text-lg tracking-wide ${escaneando || !imagenPreview ? 'bg-gray-900 text-gray-700' : 'bg-linear-to-r from-yellow-500 to-yellow-600 text-black shadow-xl shadow-yellow-500/20'}`}>
                                {escaneando ? 'ESPERE...' : 'ESCANEAR IMAGEN'}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Analizador;