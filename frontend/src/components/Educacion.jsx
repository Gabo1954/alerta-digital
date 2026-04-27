import { useState } from 'react';

const Educacion = ({ isPremium, setTabActiva }) => {
    const [expandido, setExpandido] = useState(null);

    const toggleExpandir = (id) => setExpandido(expandido === id ? null : id);

    const basicos = [
        { id: 1, titulo: '¿Qué es el "Phishing"?', resumen: 'Trampas por correo o SMS.', detalle: 'Los ciberdelincuentes se hacen pasar por instituciones reales (bancos, Netflix). Te envían un mensaje alarmante con un enlace falso para robar tus claves.', color: 'text-red-500', bg: 'bg-red-500/20', icon: '🚨' },
        { id: 2, titulo: 'Concursos Falsos', resumen: 'Demasiado bueno para ser verdad.', detalle: 'Mensajes como "Ganaste un iPhone". Para cobrar, te pedirán pagar un "costo de envío". Es una estafa, ignóralo.', color: 'text-yellow-500', bg: 'bg-yellow-500/20', icon: '🎁' },
    ];

    return (
        <div className="p-6 min-h-full">
            <h2 className="text-4xl font-black text-white leading-tight tracking-tight">
                Academia <br />
                <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]">
                    Antifraude
                </span>
            </h2>
            <p className="text-gray-400 mb-8 text-sm font-medium mt-4">Aprende a identificar las tácticas de los estafadores.</p>

            <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 font-bold uppercase text-xs tracking-wider">Nivel 1: Conceptos</h3>
                <span className="text-[10px] bg-blue-500/20 text-blue-400 font-bold px-2 py-0.5 rounded-full">0/2 Completos</span>
            </div>

            <div className="space-y-4 mb-10">
                {basicos.map((item) => (
                    <div key={item.id} onClick={() => toggleExpandir(item.id)} className="bg-gray-800 rounded-2xl shadow-lg border border-white/5 p-5 cursor-pointer transition-all active:scale-95 animate-fade-in-up">
                        <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-[1rem] flex items-center justify-center text-2xl shrink-0 ${item.bg}`}>{item.icon}</div>
                            <div className="flex-1">
                                <h3 className="font-black text-white text-lg leading-tight">{item.titulo}</h3>
                                <p className="text-gray-400 text-xs mt-1 mb-2 font-medium">{item.resumen}</p>
                                <div className="h-1.5 w-full bg-gray-900 rounded-full overflow-hidden"><div className="h-full bg-gray-700 w-0"></div></div>
                            </div>
                        </div>
                        {expandido === item.id && (
                            <div className="pt-4 mt-4 border-t border-gray-700 animate-fade-in text-gray-300 text-sm leading-relaxed">
                                {item.detalle}
                                <button className="mt-3 w-full bg-gray-700 text-white font-bold py-2 rounded-xl text-xs uppercase">Marcar como leído</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-between mb-4">
                <h3 className="text-yellow-600 font-bold uppercase text-xs tracking-wider flex items-center gap-2">Nivel 2: Avanzado</h3>
                <span className="bg-linear-to-r from-yellow-500 to-yellow-600 text-black px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest shadow-lg shadow-yellow-500/20">PRO</span>
            </div>

            <div className="space-y-4">
                <div onClick={() => !isPremium && setTabActiva('pro')} className={`bg-gray-900 rounded-2xl border border-white/5 p-5 flex items-center justify-between transition-all ${!isPremium ? 'opacity-50 grayscale cursor-pointer active:scale-95' : 'hover:bg-gray-800 cursor-pointer shadow-lg'}`}>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-[1rem] bg-purple-500/20 flex items-center justify-center text-2xl">🧠</div>
                        <div>
                            <h3 className="font-black text-white text-md">Mente del Estafador</h3>
                            <p className="text-gray-400 text-xs font-bold mt-0.5">Video Interactivo</p>
                        </div>
                    </div>
                    {!isPremium ? <span className="text-gray-600 text-xl">🔒</span> : <span className="text-blue-500 font-black text-xl">›</span>}
                </div>

                <div onClick={() => !isPremium && setTabActiva('pro')} className={`bg-gray-900 rounded-2xl border border-white/5 p-5 flex items-center justify-between transition-all ${!isPremium ? 'opacity-50 grayscale cursor-pointer active:scale-95' : 'hover:bg-gray-800 cursor-pointer shadow-lg'}`}>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-[1rem] bg-green-500/20 flex items-center justify-center text-2xl">📱</div>
                        <div>
                            <h3 className="font-black text-white text-md">Simulador Phishing</h3>
                            <p className="text-gray-400 text-xs font-bold mt-0.5">Test de Riesgo</p>
                        </div>
                    </div>
                    {!isPremium ? <span className="text-gray-600 text-xl">🔒</span> : <span className="text-blue-500 font-black text-xl">›</span>}
                </div>
            </div>
        </div>
    );
};

export default Educacion;