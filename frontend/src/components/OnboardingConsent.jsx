import React, { useState, useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';

const OnboardingConsent = ({ onConsentido }) => {
    const [cargando, setCargando] = useState(true);
    const [mostrarModal, setMostrarModal] = useState(false);

    useEffect(() => {
        verificarConsentimiento();
    }, []);

    const verificarConsentimiento = async () => {
        // Consultamos la base de datos nativa del teléfono
        const { value } = await Preferences.get({ key: 'consentimiento_sms' });
        
        if (value === null) {
            // Es la primera vez que abre la app, mostramos el modal
            setMostrarModal(true);
        } else {
            // Ya decidió antes, lo dejamos pasar al panel
            onConsentido();
        }
        setCargando(false);
    };

    const manejarAceptacion = async () => {
        // Guardamos 'true' en las SharedPreferences de Android
        await Preferences.set({ key: 'consentimiento_sms', value: 'true' });
        setMostrarModal(false);
        onConsentido();
    };

    const manejarRechazo = async () => {
        // Guardamos 'false'. El SmsReceiver leerá esto y se bloqueará.
        await Preferences.set({ key: 'consentimiento_sms', value: 'false' });
        setMostrarModal(false);
        onConsentido();
    };

    if (cargando || !mostrarModal) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fade-in font-sans">
            <div className="bg-gray-900 border border-blue-500/30 rounded-[2rem] p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
                {/* Efecto visual de fondo */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full"></div>

                <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500 mx-auto mb-6 border border-blue-500/20">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
                
                <h3 className="text-2xl font-black text-white text-center mb-4 uppercase tracking-tight">Privacidad y Protección</h3>
                
                <div className="space-y-4 mb-8">
                    <p className="text-gray-300 text-center text-sm leading-relaxed">
                        Alerta Digital utiliza Inteligencia Artificial para analizar el texto de tus SMS entrantes y detectar posibles fraudes bancarios o enlaces maliciosos.
                    </p>
                    <div className="bg-blue-500/10 border-l-4 border-blue-500 p-4 rounded-r-xl">
                        <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-1">Tu privacidad es ley</p>
                        <p className="text-gray-400 text-[11px] leading-relaxed">
                            De acuerdo a la Ley 21.719, los mensajes se evalúan temporalmente en memoria y <strong>nunca se almacenan</strong> ni se comparten con terceros.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={manejarAceptacion}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl transition-all shadow-lg active:scale-95 uppercase tracking-widest text-sm"
                    >
                        Aceptar y Activar Protección
                    </button>
                    <button
                        onClick={manejarRechazo}
                        className="w-full bg-transparent hover:bg-gray-800 text-gray-500 font-bold py-4 rounded-2xl transition-all border border-gray-800 active:scale-95 text-xs"
                    >
                        Continuar sin protección
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OnboardingConsent;