import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import api from '../services/api';

const Login = ({ onLoginSuccess, irARegistro }) => { 
    // Estados normales
    const [correo, setCorreo] = useState('');
    const [password, setPassword] = useState('');
    const [mostrarPass, setMostrarPass] = useState(false);
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    // NUEVOS: Estados para recuperar contraseña
    const [vistaRecuperar, setVistaRecuperar] = useState(false);
    const [mensaje, setMensaje] = useState('');

    const manejarSubmit = async (e) => {
        e.preventDefault();
        setError(''); 
        setCargando(true);
        try {
            const respuesta = await api.post('/auth/login', { correo, password });
            completarAuth(respuesta.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Correo o contraseña incorrectos.');
        } finally { 
            setCargando(false); 
        }
    };

    // NUEVO: Función para enviar el correo de recuperación
    const manejarRecuperacion = async (e) => {
        e.preventDefault();
        setError('');
        setMensaje('');
        setCargando(true);
        try {
            const respuesta = await api.post('/auth/recuperar-password', { correo });
            setMensaje(respuesta.data.mensaje || 'Se ha enviado un correo con las instrucciones.');
        } catch (err) {
            setError(err.response?.data?.error || 'Error al solicitar la recuperación.');
        } finally {
            setCargando(false);
        }
    };

    const respuestaGoogleSuccess = async (credentialResponse) => {
        setError('');
        setCargando(true);
        try {
            const respuesta = await api.post('/auth/google-login', { 
                token: credentialResponse.credential 
            });
            completarAuth(respuesta.data);
        } catch (err) {
            setError('Error al autenticar con Google. Intente nuevamente.');
        } finally { 
            setCargando(false); 
        }
    };

    const completarAuth = (data) => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        
        if (data.usuario.es_vip === true) {
            localStorage.setItem('isPro', 'true');
        } else {
            localStorage.removeItem('isPro');
        }

        onLoginSuccess(data.usuario);
    };

    return (
        <div className="min-h-[100dvh] flex items-center justify-center bg-black p-4 font-sans relative overflow-hidden">
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="bg-gray-900/80 backdrop-blur-xl p-8 sm:p-10 rounded-[3rem] shadow-2xl w-full max-w-md border border-white/5 relative z-10 animate-fade-in-up">
                
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-blue-500/10 text-blue-500 rounded-3xl flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(59,130,246,0.3)] border border-blue-500/20 rotate-3">
                        🛡️
                    </div>
                </div>

                <div className="text-center mb-8">
                    <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Alerta Digital</h2>
                    <p className="text-gray-400 text-sm font-medium">
                        {vistaRecuperar ? 'Recupera tu acceso.' : 'Protección inteligente en tus manos.'}
                    </p>
                </div>
                
                {error && (
                    <div className="bg-red-500/10 border-l-4 border-red-500 text-red-400 px-4 py-3 rounded-xl mb-6 text-xs font-bold animate-fade-in flex items-center gap-2">
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        {error}
                    </div>
                )}

                {/* NUEVO: Mensaje de éxito al recuperar */}
                {mensaje && (
                    <div className="bg-green-500/10 border-l-4 border-green-500 text-green-400 px-4 py-3 rounded-xl mb-6 text-xs font-bold animate-fade-in">
                        {mensaje}
                    </div>
                )}

                {/* CONDICIONAL: Mostrar Login o Recuperar dependiendo del estado */}
                {!vistaRecuperar ? (
                    <>
                        <form onSubmit={manejarSubmit} className="space-y-4">
                            <input type="email" className="w-full bg-black/50 border border-gray-700 text-white rounded-2xl px-5 py-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm" placeholder="Correo electrónico" value={correo} onChange={(e) => setCorreo(e.target.value)} required disabled={cargando} />
                            
                            <div className="relative">
                                <input type={mostrarPass ? "text" : "password"} className="w-full bg-black/50 border border-gray-700 text-white rounded-2xl px-5 py-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={cargando} />
                                <button type="button" onClick={() => setMostrarPass(!mostrarPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white p-1 transition-colors">
                                    {mostrarPass ? 'Ocultar' : 'Ver'}
                                </button>
                            </div>

                            <button type="submit" disabled={cargando} className="w-full font-black py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all active:scale-95 uppercase tracking-wider flex justify-center items-center gap-2 mt-2">
                                {cargando ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : 'INGRESAR'}
                            </button>
                        </form>

                        {/* NUEVO: Botón para ir a Recuperar */}
                        <div className="mt-4 text-center">
                            <button type="button" onClick={() => { setVistaRecuperar(true); setError(''); setMensaje(''); }} className="text-gray-400 text-sm font-medium hover:text-white transition-colors">
                                ¿Olvidaste tu contraseña?
                            </button>
                        </div>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-700"></span></div>
                            <div className="relative flex justify-center text-xs uppercase font-bold tracking-widest">
                                <span className="bg-gray-900 px-3 text-gray-500">O ingresa rápido con</span>
                            </div>
                        </div>

                        <div className="flex justify-center hover:scale-105 transition-transform active:scale-95">
                            <GoogleLogin onSuccess={respuestaGoogleSuccess} onError={() => setError('Fallo con Google')} theme="filled_black" shape="pill" size="large" text="continue_with" />
                        </div>

                        <div className="mt-8 text-center border-t border-gray-800 pt-6">
                            <p className="text-gray-400 text-sm font-medium">
                                ¿No tienes cuenta? <button type="button" onClick={irARegistro} className="text-blue-400 font-bold hover:text-blue-300 transition-colors">Regístrate gratis</button>
                            </p>
                        </div>
                    </>
                ) : (
                    /* NUEVO: Formulario de Recuperación */
                    <form onSubmit={manejarRecuperacion} className="space-y-4 animate-fade-in">
                        <p className="text-gray-300 text-sm text-center mb-4">Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.</p>
                        
                        <input type="email" className="w-full bg-black/50 border border-gray-700 text-white rounded-2xl px-5 py-4 focus:border-blue-500 outline-none text-sm" placeholder="Correo electrónico" value={correo} onChange={(e) => setCorreo(e.target.value)} required disabled={cargando} />
                        
                        <button type="submit" disabled={cargando} className="w-full font-black py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all active:scale-95 uppercase mt-2">
                            {cargando ? 'Enviando...' : 'ENVIAR CORREO'}
                        </button>
                        
                        <div className="mt-4 text-center">
                            <button type="button" onClick={() => { setVistaRecuperar(false); setError(''); setMensaje(''); }} className="text-gray-400 text-sm font-medium hover:text-white transition-colors">
                                ← Volver al Login
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Login;