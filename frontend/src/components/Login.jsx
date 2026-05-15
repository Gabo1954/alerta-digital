import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import api from '../services/api';

const Login = ({ onLoginSuccess, irARegistro }) => { 
    const [correo, setCorreo] = useState('');
    const [password, setPassword] = useState('');
    const [mostrarPass, setMostrarPass] = useState(false);
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

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
        
        // SOLUCIÓN SINCRONIZACIÓN VIP: Si la BD dice que es VIP, lo forzamos en localStorage
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
                    <p className="text-gray-400 text-sm font-medium">Protección inteligente en tus manos.</p>
                </div>
                
                {error && (
                    <div className="bg-red-500/10 border-l-4 border-red-500 text-red-400 px-4 py-3 rounded-xl mb-6 text-xs font-bold animate-fade-in flex items-center gap-2">
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        {error}
                    </div>
                )}
                
                <form onSubmit={manejarSubmit} className="space-y-4">
                    <input type="email" className="w-full bg-black/50 border border-gray-700 text-white rounded-2xl px-5 py-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm" placeholder="Correo electrónico" value={correo} onChange={(e) => setCorreo(e.target.value)} required disabled={cargando} />
                    
                    <div className="relative">
                        <input type={mostrarPass ? "text" : "password"} className="w-full bg-black/50 border border-gray-700 text-white rounded-2xl px-5 py-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={cargando} />
                        <button type="button" onClick={() => setMostrarPass(!mostrarPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white p-1 transition-colors">
                            {mostrarPass ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            )}
                        </button>
                    </div>

                    <button type="submit" disabled={cargando} className="w-full font-black py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all active:scale-95 uppercase tracking-wider flex justify-center items-center gap-2 disabled:opacity-50 mt-2">
                        {cargando ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : 'INGRESAR'}
                    </button>
                </form>

                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-700"></span></div>
                    <div className="relative flex justify-center text-xs uppercase font-bold tracking-widest">
                        <span className="bg-gray-900 px-3 text-gray-500">O ingresa rápido con</span>
                    </div>
                </div>

                <div className="flex justify-center hover:scale-105 transition-transform active:scale-95">
                    <GoogleLogin
                        onSuccess={respuestaGoogleSuccess}
                        onError={() => setError('El inicio de sesión con Google fue cancelado o falló.')}
                        theme="filled_black"
                        shape="pill"
                        size="large"
                        text="continue_with"
                    />
                </div>

                <div className="mt-8 text-center border-t border-gray-800 pt-6">
                    <p className="text-gray-400 text-sm font-medium">
                        ¿No tienes cuenta? <button type="button" onClick={irARegistro} className="text-blue-400 font-bold hover:text-blue-300 transition-colors">Regístrate gratis</button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;