import { useState } from 'react';
import { Preferences } from '@capacitor/preferences'; // <-- IMPORTACIÓN CAPACITOR
import api from '../services/api';

const CODIGOS_PAISES = [
    { code: '+56', country: 'Chile' },
    { code: '+54', country: 'Argentina' },
    { code: '+51', country: 'Perú' },
    { code: '+57', country: 'Colombia' },
    { code: '+52', country: 'México' },
    { code: '+1', country: 'EE.UU.' },
];

const Registro = ({ onRegistroSuccess, irALogin }) => {
    const [form, setForm] = useState({
        nombre: '', ap_paterno: '', ap_materno: '', fecha_nacimiento: '', celular: '', correo: '', password: '', confirmar_password: '' 
    });

    const [codigoPais, setCodigoPais] = useState('+56');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);
    const [aceptaTerminos, setAceptaTerminos] = useState(false);
    const [verModal, setVerModal] = useState(false);

    const validarFormulario = () => {
        if (!aceptaTerminos) return 'Para registrarse, debe aceptar las políticas de privacidad y protección de datos.';
        const regexLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
        if (!regexLetras.test(form.nombre)) return 'El nombre solo debe contener letras.';
        if (!regexLetras.test(form.ap_paterno)) return 'El apellido paterno solo debe contener letras.';
        if (!regexLetras.test(form.ap_materno)) return 'El apellido materno solo debe contener letras.';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.correo)) return 'Ingrese un correo electrónico válido.';
        const celularRegex = /^\d{7,12}$/;
        if (!celularRegex.test(form.celular)) return 'El número de celular no es válido.';
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(form.password)) return 'La contraseña debe tener al menos 8 caracteres, incluir una mayúscula y un número.';
        if (form.password !== form.confirmar_password) return 'Las contraseñas no coinciden. Por favor, verifíquelas.';
        if (!form.fecha_nacimiento) return 'La fecha de nacimiento es obligatoria.';
        
        const fechaNac = new Date(form.fecha_nacimiento);
        const hoy = new Date();
        let edad = hoy.getFullYear() - fechaNac.getFullYear();
        const mes = hoy.getMonth() - fechaNac.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) edad--;
        if (edad < 18) return 'Debes ser mayor de 18 años para utilizar esta plataforma.';

        return null;
    };

    const manejarRegistro = async (e) => {
        e.preventDefault();
        const errorValidacion = validarFormulario();
        if (errorValidacion) { setError(errorValidacion); return; }

        setError(''); setCargando(true);
        const datosAEnviar = { ...form };
        delete datosAEnviar.confirmar_password; 

        if (datosAEnviar.fecha_nacimiento) {
            const [anio, mes, dia] = datosAEnviar.fecha_nacimiento.split('-');
            datosAEnviar.fecha_nacimiento = `${dia}/${mes}/${anio}`;
        }
        datosAEnviar.celular = `${codigoPais}${form.celular}`;

        try {
            const respuesta = await api.post('/auth/registro', datosAEnviar);
            
            localStorage.setItem('token', respuesta.data.token);
            localStorage.setItem('usuario', JSON.stringify(respuesta.data.usuario));
            
            // --- SOLUCIÓN: PURGA DE ESTADO ANTIGUO ---
            localStorage.removeItem('isPro'); 

            // GUARDAR TOKEN PARA EL SERVICIO DE ANDROID
            await Preferences.set({ key: 'token_nativo', value: respuesta.data.token });

            onRegistroSuccess(respuesta.data.usuario);
        } catch (err) {
            setError(err.response?.data?.error || 'Error al crear la cuenta. Intente de nuevo.');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black p-4 font-sans relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-blue-900/10 to-black pointer-events-none"></div>

            <div className="bg-gray-900/80 backdrop-blur-xl p-8 sm:p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-white/5 max-h-[90vh] overflow-y-auto no-scrollbar relative z-10 animate-fade-in-up">
                <div className="mb-6">
                    <button onClick={irALogin} className="text-gray-500 hover:text-white transition-colors mb-4 flex items-center text-sm font-bold active:scale-95">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7m0 0l7-7m-7 7h18" /></svg> Volver
                    </button>
                    <h2 className="text-4xl font-black text-white leading-tight tracking-tight">
                        Registrar <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]">Cuenta</span>
                    </h2>
                    <p className="text-gray-400 text-xs mt-3 uppercase font-black tracking-widest opacity-60">Escudo Heurístico v4.0</p>
                </div>

                {error && <div className="bg-red-500/10 border-l-4 border-red-500 text-red-400 px-4 py-3 rounded-xl mb-6 text-[10px] font-black uppercase flex items-center gap-2">{error}</div>}

                <form onSubmit={manejarRegistro} className="space-y-4">
                    <input type="text" className="w-full bg-black/50 border border-gray-700 text-white rounded-2xl px-5 py-4 focus:border-blue-500 transition-all text-sm outline-none" placeholder="Nombre" onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />

                    <div className="grid grid-cols-2 gap-3">
                        <input type="text" className="w-full bg-black/50 border border-gray-700 text-white rounded-2xl px-5 py-4 focus:border-blue-500 transition-all text-sm outline-none" placeholder="Ap. Paterno" onChange={(e) => setForm({ ...form, ap_paterno: e.target.value })} required />
                        <input type="text" className="w-full bg-black/50 border border-gray-700 text-white rounded-2xl px-5 py-4 focus:border-blue-500 transition-all text-sm outline-none" placeholder="Ap. Materno" onChange={(e) => setForm({ ...form, ap_materno: e.target.value })} required />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <select className="col-span-1 bg-black/50 border border-gray-700 text-white rounded-2xl px-2 py-4 focus:border-blue-500 outline-none text-sm appearance-none cursor-pointer" value={codigoPais} onChange={(e) => setCodigoPais(e.target.value)}>
                            {CODIGOS_PAISES.map(p => (<option key={p.code} value={p.code} className="bg-gray-900">{p.code} ({p.country})</option>))}
                        </select>
                        <input type="tel" className="col-span-2 w-full bg-black/50 border border-gray-700 text-white rounded-2xl px-5 py-4 focus:border-blue-500 transition-all text-sm outline-none" placeholder="Celular" onChange={(e) => setForm({ ...form, celular: e.target.value })} required />
                    </div>

                    <div className="relative">
                        <label className="absolute -top-2 left-4 bg-gray-900 px-1 text-[9px] font-black text-blue-400 uppercase tracking-widest z-20">Nacimiento</label>
                        <input type="date" className="w-full bg-black/50 border border-gray-700 text-white rounded-2xl px-5 py-4 focus:border-blue-500 transition-all [color-scheme:dark] text-sm outline-none" onChange={(e) => setForm({ ...form, fecha_nacimiento: e.target.value })} required />
                    </div>

                    <input type="email" className="w-full bg-black/50 border border-gray-700 text-white rounded-2xl px-5 py-4 focus:border-blue-500 transition-all text-sm outline-none" placeholder="Correo electrónico" onChange={(e) => setForm({ ...form, correo: e.target.value })} required />

                    <div className="grid grid-cols-2 gap-3">
                        <input type="password" className="w-full bg-black/50 border border-gray-700 text-white rounded-2xl px-5 py-4 focus:border-blue-500 transition-all text-sm outline-none" placeholder="Contraseña" onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                        <input type="password" className="w-full bg-black/50 border border-gray-700 text-white rounded-2xl px-5 py-4 focus:border-blue-500 transition-all text-sm outline-none" placeholder="Confirmar" onChange={(e) => setForm({ ...form, confirmar_password: e.target.value })} required />
                    </div>

                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 mt-6">
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <div className="relative mt-1">
                                <input type="checkbox" checked={aceptaTerminos} onChange={(e) => setAceptaTerminos(e.target.checked)} className="peer h-5 w-5 appearance-none rounded-lg border-2 border-gray-600 bg-black/50 checked:bg-blue-600 checked:border-blue-500 transition-all cursor-pointer" />
                                <svg className="absolute top-1 left-1 w-3 h-3 text-white hidden peer-checked:block pointer-events-none" fill="none" stroke="currentColor" strokeWidth={4} viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <span className="text-[11px] text-gray-400 font-medium leading-relaxed select-none">
                                Acepto los <button type="button" onClick={() => setVerModal(true)} className="text-blue-400 font-black hover:underline underline-offset-2">Términos de Privacidad</button> conforme a la Ley 19.628 de protección de datos.
                            </span>
                        </label>
                    </div>

                    <button type="submit" disabled={cargando || !aceptaTerminos} className="w-full font-black py-5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white active:scale-95 transition-all uppercase tracking-widest text-xs disabled:opacity-30">
                        {cargando ? 'PROCESANDO...' : 'CREAR MI ESCUDO DIGITAL'}
                    </button>
                </form>
            </div>

            {verModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-fade-in">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setVerModal(false)}></div>
                    <div className="bg-gray-900 border border-white/10 w-full max-w-lg rounded-[2.5rem] p-8 relative z-10 shadow-2xl max-h-[80vh] overflow-hidden flex flex-col">
                        <header className="mb-6 flex justify-between items-center shrink-0 border-b border-white/5 pb-4">
                            <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2"><span className="w-2 h-6 bg-blue-500 rounded-full"></span> Integridad de Datos</h3>
                            <button onClick={() => setVerModal(false)} className="text-gray-500 hover:text-white p-2 bg-white/5 rounded-full transition-colors"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                        </header>
                        <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pr-2">
                            <section>
                                <h4 className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-2">1. Marco Legal Chileno (Ley 19.628)</h4>
                                <p className="text-gray-300 text-sm leading-relaxed">En cumplimiento con la **Ley N° 19.628 sobre Protección de la Vida Privada**, Alerta Digital informa que el tratamiento de sus datos personales se realizará con el único propósito de proveer seguridad heurística. No comercializamos su información.</p>
                            </section>
                            <section>
                                <h4 className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-2">2. Acceso Transparente a Mensajes</h4>
                                <p className="text-gray-300 text-sm leading-relaxed">El acceso a lectura de mensajes tiene como fin exclusivo agilizar el motor de análisis para detección de fraudes. No se utiliza para vigilancia.</p>
                            </section>
                            <section>
                                <h4 className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-2">3. Integridad y Seguridad (Ley 21.459)</h4>
                                <p className="text-gray-300 text-sm leading-relaxed">Garantizamos la integridad de su información mediante encriptación de grado bancario en servidores Oracle Cloud, cumpliendo la Ley de Delitos Informáticos.</p>
                            </section>
                            <section>
                                <h4 className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-2">4. Derecho de Cancelación</h4>
                                <p className="text-gray-300 text-sm leading-relaxed">Puede solicitar la eliminación definitiva de su cuenta en cualquier momento desde su perfil, ejerciendo sus derechos ARCO.</p>
                            </section>
                        </div>
                        <button onClick={() => { setAceptaTerminos(true); setVerModal(false); }} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl mt-8 shadow-lg active:scale-95 transition-all text-xs uppercase tracking-widest shrink-0">ACEPTAR Y CERRAR</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Registro;