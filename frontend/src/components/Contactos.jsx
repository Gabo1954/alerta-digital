const Contactos = () => {
    return (
        <div className="p-6 min-h-full">
            <h2 className="text-2xl font-extrabold text-white mb-6">
                Contactos de Emergencia
            </h2>

            <div className="bg-red-500/10 border-l-4 border-red-500 p-4 rounded-r-xl mb-6 shadow-sm animate-fade-in-up">
                <p className="text-red-400 font-medium text-sm leading-relaxed">
                    Si fuiste víctima de una estafa o entregaste tus datos bancarios, comunícate de inmediato:
                </p>
            </div>

            <div className="space-y-4">
                {/* Tarjeta PDI */}
                <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-5 animate-fade-in-up delay-100">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        </div>
                        <div>
                            <h3 className="font-extrabold text-white text-lg">PDI (Cibercrimen)</h3>
                            <p className="text-gray-400 text-sm">Denuncias de fraudes digitales</p>
                        </div>
                    </div>
                    <a href="tel:134" className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 shadow-lg transition-all active:scale-[0.98]">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        Llamar al 134
                    </a>
                </div>

                {/* Tarjeta Carabineros */}
                <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-5 animate-fade-in-up delay-200">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center shrink-0">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                        </div>
                        <div>
                            <h3 className="font-extrabold text-white text-lg">Carabineros</h3>
                            <p className="text-gray-400 text-sm">Asistencia policial inmediata</p>
                        </div>
                    </div>
                    <a href="tel:133" className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 shadow-lg transition-all active:scale-[0.98]">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        Llamar al 133
                    </a>
                </div>

                {/* Tarjeta Denuncia Seguro */}
                <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-5 animate-fade-in-up delay-300">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        </div>
                        <div>
                            <h3 className="font-extrabold text-white text-lg">Denuncia Seguro</h3>
                            <p className="text-gray-400 text-sm">Denuncia anónima</p>
                        </div>
                    </div>
                    <a href="tel:*4242" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 shadow-lg transition-all active:scale-[0.98]">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        Llamar al *4242
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Contactos;