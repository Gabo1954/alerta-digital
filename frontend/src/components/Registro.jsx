import { useState } from 'react';
import api from '../services/api';

const Registro = ({ onRegistroSuccess, irALogin }) => {
    const [form, setForm] = useState({ 
        nombre: '', 
        celular: '', 
        correo: '', 
        password: '' 
    });
    
    const [codigoPais, setCodigoPais] = useState('+56');
    const [confirmarPassword, setConfirmarPassword] = useState('');
    
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);
    const [aceptaTerminos, setAceptaTerminos] = useState(false);
    const [verModal, setVerModal] = useState(false);

    const manejarInput = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const manejarRegistro = async (e) => {
        e.preventDefault();
        setError('');
        
        // 1. Validación de Términos Legales
        if (!aceptaTerminos) {
            setError('Para registrarse, debe leer y aceptar las políticas de privacidad bajo la Ley 21.719.');
            return;
        }

        // 2. Validar campos obligatorios
        if (!form.nombre.trim() || !form.celular.trim() || !form.correo.trim() || !form.password) {
            setError('Por favor, completa todos los campos del formulario.');
            return;
        }

        // 3. Validar contraseñas
        if (form.password !== confirmarPassword) {
            setError('Las contraseñas ingresadas no coinciden.');
            return;
        }

        setCargando(true);

        try {
            const celularCompleto = `${codigoPais}${form.celular.trim()}`;
            
            // Envío de payload estructurado para el controlador de autenticación de Oracle Cloud
            const respuesta = await api.post('/auth/registro', {
                nombre: form.nombre.trim(),
                ap_paterno: 'Pendiente', // Valores de compatibilidad con el esquema de la BD
                ap_materno: 'Pendiente',
                fecha_nacimiento: '2000-01-01', 
                correo: form.correo.trim().toLowerCase(),
                celular: celularCompleto,
                password: form.password
            });

            if (respuesta.data && respuesta.data.token) {
                localStorage.setItem('token', respuesta.data.token);
                localStorage.setItem('usuario', JSON.stringify(respuesta.data.usuario));
                onRegistroSuccess(respuesta.data.usuario);
            }
        } catch (err) {
            console.error('[REGISTRO ERROR]', err);
            setError(err.response?.data?.error || 'Error interno del servidor al procesar el registro.');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="flex-1 w-full px-6 py-8 flex flex-col justify-center bg-gray-950 font-sans overflow-y-auto">
            
            {/* ENCABEZADO */}
            <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase">
                    Crear <span className="text-blue-500">Cuenta</span>
                </h2>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">
                    Únete al Escudo Heurístico
                </p>
            </div>

            {/* ALERTA DE ERROR */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold p-4 rounded-2xl mb-5 text-center animate-pulse">
                    ⚠️ {error}
                </div>
            )}

            {/* FORMULARIO */}
            <form onSubmit={manejarRegistro} className="space-y-4">
                <div>
                    <input 
                        type="text" 
                        name="nombre"
                        className="w-full bg-black/40 border border-gray-800 text-white rounded-2xl px-5 py-4 focus:border-blue-500 outline-none text-sm transition-colors" 
                        placeholder="Nombre Completo" 
                        value={form.nombre}
                        onChange={manejarInput}
                        required 
                        disabled={cargando}
                    />
                </div>

                <div className="flex gap-2">
                    <select 
                        value={codigoPais} 
                        onChange={(e) => setCodigoPais(e.target.value)}
                        className="bg-black/40 border border-gray-800 text-gray-400 rounded-2xl px-3 py-4 text-sm outline-none focus:border-blue-500"
                        disabled={cargando}
                    >
                        <option value="+56">🇨🇱 +56</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+34">🇪🇸 +34</option>
                    </select>
                    <input 
                        type="tel" 
                        name="celular"
                        className="flex-1 bg-black/40 border border-gray-800 text-white rounded-2xl px-5 py-4 focus:border-blue-500 outline-none text-sm transition-colors" 
                        placeholder="Número de Celular" 
                        value={form.celular}
                        onChange={manejarInput}
                        required 
                        disabled={cargando}
                    />
                </div>

                <div>
                    <input 
                        type="email" 
                        name="correo"
                        className="w-full bg-black/40 border border-gray-800 text-white rounded-2xl px-5 py-4 focus:border-blue-500 outline-none text-sm transition-colors" 
                        placeholder="Correo electrónico" 
                        value={form.correo}
                        onChange={manejarInput}
                        required 
                        disabled={cargando}
                    />
                </div>

                <div>
                    <input 
                        type="password" 
                        name="password"
                        className="w-full bg-black/40 border border-gray-800 text-white rounded-2xl px-5 py-4 focus:border-blue-500 outline-none text-sm transition-colors" 
                        placeholder="Contraseña" 
                        value={form.password}
                        onChange={manejarInput}
                        required 
                        disabled={cargando}
                    />
                </div>

                <div>
                    <input 
                        type="password" 
                        className="w-full bg-black/40 border border-gray-800 text-white rounded-2xl px-5 py-4 focus:border-blue-500 outline-none text-sm transition-colors" 
                        placeholder="Confirmar Contraseña" 
                        value={confirmarPassword}
                        onChange={(e) => setConfirmarPassword(e.target.value)}
                        required 
                        disabled={cargando}
                    />
                </div>

                {/* CASILLA DE VERIFICACIÓN DE TÉRMINOS */}
                <div className="flex items-center gap-3 py-2 px-1 select-none">
                    <input 
                        type="checkbox" 
                        id="terminos" 
                        checked={aceptaTerminos}
                        onChange={(e) => setAceptaTerminos(e.target.checked)}
                        className="w-5 h-5 accent-blue-600 bg-black border-gray-800 rounded-md focus:ring-0"
                        disabled={cargando}
                    />
                    <label htmlFor="terminos" className="text-xs text-gray-400 leading-normal">
                        Acepto las{' '}
                        <button 
                            type="button" 
                            onClick={() => setVerModal(true)} 
                            className="text-blue-500 hover:underline font-bold"
                        >
                            Políticas de Privacidad (Ley 21.719)
                        </button>
                    </label>
                </div>

                {/* BOTÓN SUBMIT */}
                <button 
                    type="submit" 
                    disabled={cargando}
                    className="w-full font-black py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_25px_rgba(37,99,235,0.3)] transition-all active:scale-[0.97] uppercase tracking-widest text-sm disabled:opacity-40"
                >
                    {cargando ? 'Procesando Registro...' : 'REGISTRARME'}
                </button>
            </form>

            {/* BOTÓN IR A LOGIN */}
            <div className="mt-8 text-center">
                <p className="text-gray-500 text-xs font-medium">
                    ¿Ya tienes una cuenta activa?{' '}
                    <button 
                        onClick={irALogin} 
                        className="text-blue-400 font-bold hover:underline ml-1"
                        disabled={cargando}
                    >
                        Inicia Sesión
                    </button>
                </p>
            </div>

            {/* ======================================================= */}
            {/* MODAL LEGAL: ADAPTADO A LA NUEVA LEY CHILENA 21.719       */}
            {/* ======================================================= */}
            {verModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
                    <div className="bg-gray-950 border border-white/10 rounded-[2.5rem] p-6 max-w-md w-full max-h-[80vh] flex flex-col shadow-2xl relative">
                        
                        <header className="mb-4 text-center shrink-0">
                            <h3 className="text-lg font-black text-white uppercase tracking-tight">Política de Tratamiento de Datos</h3>
                            <p className="text-blue-500 text-[10px] font-black uppercase tracking-widest mt-1">Conformidad Ley Nº 21.719</p>
                        </header>

                        <div className="flex-1 overflow-y-auto pr-1 space-y-5 text-gray-400 text-xs custom-scrollbar leading-relaxed">
                            <section className="border-b border-white/5 pb-3">
                                <h4 className="text-white font-black uppercase tracking-wider text-[11px] mb-1">1. Responsables del Tratamiento</h4>
                                <p>
                                    La recolección y el procesamiento técnico de la información son gestionados de forma directa y exclusiva por el equipo de desarrollo de Alerta Digital, liderado por los ingenieros del proyecto Tomás Fuentes y Gabriel Tello.
                                </p>
                            </section>

                            <section className="border-b border-white/5 pb-3">
                                <h4 className="text-white font-black uppercase tracking-wider text-[11px] mb-1">2. Consentimiento y Finalidad (Art. 12)</h4>
                                <p>
                                    Al validar esta casilla, usted otorga su consentimiento libre, explícito e informado para que la aplicación acceda de manera automatizada a los mensajes SMS recibidos en su dispositivo. El fin exclusivo de este tratamiento es realizar un análisis heurístico preventivo mediante modelos de Inteligencia Artificial para alertar sobre potenciales estafas (*smishing*).
                                </p>
                            </section>

                            <section className="border-b border-white/5 pb-3">
                                <h4 className="text-white font-black uppercase tracking-wider text-[11px] mb-1">3. Principio de Proporcionalidad y Destrucción</h4>
                                <p>
                                    En estricto cumplimiento del principio de proporcionalidad, el contenido de texto de sus mensajes SMS es procesado de forma efímera en la memoria RAM de nuestros servidores seguros y es **destruido inmediatamente** tras emitirse la calificación de riesgo. Ningún texto de SMS es almacenado de forma persistente en bases de datos.
                                </p>
                            </section>

                            <section className="border-b border-white/5 pb-3">
                                <h4 className="text-white font-black uppercase tracking-wider text-[11px] mb-1">4. Ejercicio de Derechos ARCO-P</h4>
                                <p>
                                    Bajo el marco normativo nacional, usted posee el control completo de su información. Puede ejercer su **Derecho de Oposición** en cualquier momento desactivando el análisis en los ajustes de su Perfil. Asimismo, cuenta con el **Derecho de Supresión**, pudiendo solicitar la eliminación total de su registro; dicha solicitud congelará la cuenta en un periodo de gracia legal de 30 días antes del borrado físico definitivo en nuestros motores Oracle Cloud.
                                </p>
                            </section>

                            <section>
                                <h4 className="text-white font-black uppercase tracking-wider text-[11px] mb-1">5. Seguridad y Contacto</h4>
                                <p>
                                    Garantizamos el secreto técnico y la seguridad mediante cifrado SSL/TLS en tránsito. Ante dudas, revocaciones o solicitudes de portabilidad, puede tomar contacto directo a través del canal oficial: <a href="mailto:soporte@alertadigital.cl" className="text-blue-400 underline font-bold">gab.tello@duocuc.cl</a>.
                                </p>
                            </section>
                        </div>

                        <button 
                            onClick={() => { setAceptaTerminos(true); setVerModal(false); }}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl mt-6 shadow-xl active:scale-95 transition-all text-xs uppercase tracking-widest shrink-0"
                        >
                            Aceptar y Continuar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Registro;