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
            <h2 className="text-2xl font-extrabold text-white mb-2">Academia Antifraude</h2>
            <p className="text-gray-400 mb-6 text-sm">Aprende a identificar las tácticas de los estafadores.</p>

            <h3 className="text-gray-500 font-bold uppercase text-xs tracking-wider mb-3">Módulo Básico (Gratis)</h3>
            <div className="space-y-4 mb-8">
                {basicos.map((item) => (
                    <div key={item.id} onClick={() => toggleExpandir(item.id)} className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-5 cursor-pointer animate-fade-in-up">
                        <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0 ${item.bg}`}>{item.icon}</div>
                            <div className="flex-1">
                                <h3 className="font-extrabold text-white text-lg">{item.titulo}</h3>
                                <p className="text-gray-400 text-sm mb-2">{item.resumen}</p>
                                <button className="text-blue-400 font-bold text-sm">
                                    {expandido === item.id ? 'Ocultar' : 'Leer más'} 
                                </button>
                            </div>
                        </div>
                        {expandido === item.id && (
                            <div className="pt-4 mt-4 border-t border-gray-700 animate-fade-in text-gray-300 text-sm">
                                {item.detalle}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <h3 className="text-yellow-600 font-bold uppercase text-xs tracking-wider mb-3 flex items-center gap-2">
                Módulo Avanzado <span className="bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded text-[10px]">PRO</span>
            </h3>
            
            <div className="space-y-4">
                {/* Curso PRO Bloqueado */}
                <div onClick={() => !isPremium && setTabActiva('pro')} className={`bg-gray-800 rounded-2xl border border-gray-700 p-5 flex items-center justify-between ${!isPremium && 'opacity-60 cursor-pointer hover:bg-gray-700/50'}`}>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-xl">🧠</div>
                        <div>
                            <h3 className="font-extrabold text-white text-md">Psicología del Estafador</h3>
                            <p className="text-gray-400 text-xs">Duración: 15 mins</p>
                        </div>
                    </div>
                    {!isPremium ? <span className="text-gray-500">🔒</span> : <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-bold">Ver</button>}
                </div>

                <div onClick={() => !isPremium && setTabActiva('pro')} className={`bg-gray-800 rounded-2xl border border-gray-700 p-5 flex items-center justify-between ${!isPremium && 'opacity-60 cursor-pointer hover:bg-gray-700/50'}`}>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-xl">📱</div>
                        <div>
                            <h3 className="font-extrabold text-white text-md">Simulador de WhatsApp</h3>
                            <p className="text-gray-400 text-xs">Juego Interactivo</p>
                        </div>
                    </div>
                    {!isPremium ? <span className="text-gray-500">🔒</span> : <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-bold">Jugar</button>}
                </div>
            </div>
        </div>
    );
};

export default Educacion;