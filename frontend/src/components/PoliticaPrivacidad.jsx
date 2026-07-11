import React from 'react';

const PoliticaPrivacidad = ({ setTabActiva }) => {
    return (
        <div className="flex-1 w-full px-5 pt-8 pb-32 animate-fade-in font-sans bg-gray-950 overflow-y-auto">
            {/* BOTÓN VOLVER */}
            <button 
                onClick={() => setTabActiva('perfil')} 
                className="text-gray-500 hover:text-white transition-colors font-bold mb-6 flex items-center text-sm active:scale-95"
            >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg> 
                Volver a Perfil
            </button>
            
            {/* TÍTULO */}
            <h2 className="text-3xl font-black text-white mb-6 uppercase tracking-tight">
                Política de <br /> <span className="text-blue-500">Privacidad</span>
            </h2>
            
            {/* DOCUMENTO LEGAL */}
            <div className="space-y-6 text-sm text-gray-300 bg-gray-900/80 backdrop-blur-md p-6 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full"></div>
                
                <section className="relative z-10 border-b border-white/5 pb-4">
                    <h3 className="text-blue-400 font-black uppercase tracking-widest text-[10px] mb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        1. Responsables del Tratamiento
                    </h3>
                    <p className="leading-relaxed text-gray-400">
                        La recolección y el procesamiento técnico de la información son gestionados de forma directa y exclusiva por el equipo de desarrollo de Alerta Digital, liderado por los ingenieros <strong className="text-white">Tomás Fuentes</strong> y <strong className="text-white">Gabriel Tello</strong>.
                    </p>
                </section>

                <section className="relative z-10 border-b border-white/5 pb-4">
                    <h3 className="text-blue-400 font-black uppercase tracking-widest text-[10px] mb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        2. Principio de Proporcionalidad (Ley 21.719)
                    </h3>
                    <p className="leading-relaxed text-gray-400">
                        Nuestra aplicación procesa sus SMS <strong className="text-white">únicamente en la memoria RAM</strong> del dispositivo durante el análisis heurístico. No realizamos almacenamiento permanente ni venta de datos a terceros. El contenido es destruido inmediatamente tras emitirse la calificación de riesgo.
                    </p>
                </section>

                <section className="relative z-10 border-b border-white/5 pb-4">
                    <h3 className="text-blue-400 font-black uppercase tracking-widest text-[10px] mb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        3. Derechos ARCO-P
                    </h3>
                    <p className="leading-relaxed text-gray-400">
                        Usted mantiene el control total. Puede revocar el permiso de análisis en cualquier momento (Derecho de Oposición) desde el interruptor en su Perfil o solicitar la eliminación de su cuenta y registros (Derecho de Supresión).
                    </p>
                </section>

                <section className="relative z-10">
                    <h3 className="text-blue-400 font-black uppercase tracking-widest text-[10px] mb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        4. Contacto Legal
                    </h3>
                    <p className="leading-relaxed text-gray-400">
                        Para consultas legales, revocaciones o solicitudes de portabilidad, puede tomar contacto directo a través de: <br />
                        <a href="mailto:soporte@alertadigital.cl" className="text-blue-500 underline font-bold mt-2 inline-block">gab.tello@duocuc.cl</a>
                    </p>
                </section>
            </div>
        </div>
    );
};

export default PoliticaPrivacidad;