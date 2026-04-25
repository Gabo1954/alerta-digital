import { useState, useEffect } from 'react';
import api from '../services/api';

const Historial = () => {
    const [historial, setHistorial] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [filtro, setFiltro] = useState('');

    useEffect(() => {
        const obtenerHistorial = async () => {
            try {
                const { data } = await api.get('/mensajes/historial');
                setHistorial(data.historial || []);
            } catch (err) {
                console.error("Error API, usando Mocks");
                setHistorial([
                    { id: 1, fecha: 'Hoy, 14:30', texto: 'Estimado cliente, su tarjeta ha sido bloqueada. Ingrese a http://banco.cl', riesgo: 'Alto' },
                    { id: 2, fecha: 'Ayer, 09:15', texto: 'Hola Gabriel, te confirmo la reunión de mañana.', riesgo: 'Bajo' },
                    { id: 3, fecha: '12 May, 10:00', texto: 'Felicidades, ganaste un iPhone 15. Reclama tu premio aquí.', riesgo: 'Alto' }
                ]);
            } finally {
                setCargando(false);
            }
        };
        obtenerHistorial();
    }, []);

    const datosFiltrados = historial.filter(item => item.texto.toLowerCase().includes(filtro.toLowerCase()));

    return (
        <div className="p-6 animate-fade-in flex flex-col h-full">
            <div className="mb-6">
                <h2 className="text-3xl font-black text-white leading-none mb-4">Mi <span className="text-blue-500 underline decoration-4 underline-offset-4">Historial</span></h2>
                <input 
                    type="text" 
                    placeholder="Buscar en análisis previos..." 
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500 transition-colors"
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                />
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
                {cargando ? (
                    <div className="space-y-4">
                        {[1,2,3].map(i => (
                            <div key={i} className="h-24 rounded-2xl skeleton border border-white/5"></div>
                        ))}
                    </div>
                ) : datosFiltrados.length === 0 ? (
                    <div className="text-center py-20 bg-gray-900/30 rounded-[2rem] border border-white/5 border-dashed">
                        <span className="text-5xl block mb-4 opacity-50">🔍</span>
                        <p className="text-gray-500 font-bold">No hay registros que coincidan.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {datosFiltrados.map((item, index) => (
                            <div key={item.id} className="bg-gray-900/80 backdrop-blur-md rounded-2xl p-5 border border-white/5 shadow-lg animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{item.fecha}</span>
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${item.riesgo === 'Alto' ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-green-500/20 text-green-500 border border-green-500/30'}`}>
                                        {item.riesgo} RIESGO
                                    </span>
                                </div>
                                <p className="text-gray-300 text-sm line-clamp-3 font-medium">"{item.texto}"</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Historial;