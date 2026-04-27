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

    // Función que se ejecuta cuando Google responde con éxito
    const respuestaGoogleSuccess = async (credentialResponse) => {
        setError('');
        setCargando(true);
        try {
            // Enviamos el token de Google a tu backend (Node.js) para validarlo y crear sesión
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
        onLoginSuccess(data.usuario);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-900 to-gray-800 p-4 font-sans">
            <div className="bg-gray-800 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-gray-700/50">
                
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-black text-white mb-2">🛡️</h2>
                    <h2 className="text-4xl font-black text-white mb-2">Alerta Digital</h2>
                    <p className="text-gray-400 text-sm">Protección inteligente en un solo clic.</p>
                </div>
                
                {error && (
                    <div className="bg-red-500/10 border-l-4 border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6 text-xs font-bold animate-fade-in">
                        {error}
                    </div>
                )}
                
                <form onSubmit={manejarSubmit} className="space-y-5">
                    <input 
                        type="email" 
                        className="w-full bg-gray-900/50 border border-gray-600 text-white rounded-2xl px-5 py-4 focus:border-blue-500 outline-none transition-all" 
                        placeholder="Correo electrónico" 
                        value={correo} 
                        onChange={(e) => setCorreo(e.target.value)} 
                        required 
                        disabled={cargando} 
                    />
                    
                    <div className="relative">
                        <input 
                            type={mostrarPass ? "text" : "password"} 
                            className="w-full bg-gray-900/50 border border-gray-600 text-white rounded-2xl px-5 py-4 focus:border-blue-500 outline-none transition-all" 
                            placeholder="Contraseña" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            disabled={cargando} 
                        />
                        <button 
                            type="button" 
                            onClick={() => setMostrarPass(!mostrarPass)} 
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1 transition-colors"
                        >
                            {mostrarPass ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            )}
                        </button>
                    </div>

                    <button 
                        type="submit" 
                        disabled={cargando} 
                        className="w-full font-black py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all active:scale-95 uppercase tracking-wider flex justify-center items-center gap-2 disabled:opacity-50"
                    >
                        {cargando ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : 'INGRESAR'}
                    </button>
                </form>

                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-700"></span></div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-gray-800 px-3 text-gray-500 font-bold">O usa tu cuenta</span>
                    </div>
                </div>

                {/* BOTÓN OFICIAL DE GOOGLE */}
                <div className="flex justify-center">
                    <GoogleLogin
                        onSuccess={respuestaGoogleSuccess}
                        onError={() => setError('El inicio de sesión con Google fue cancelado o falló.')}
                        theme="filled_blue"
                        shape="pill"
                        size="large"
                        text="continue_with"
                    />
                </div>

                <div className="mt-8 text-center border-t border-gray-700 pt-6">
                    <p className="text-gray-400 text-sm">
                        ¿No tienes cuenta? <button type="button" onClick={irARegistro} className="text-blue-400 font-bold hover:underline">Regístrate gratis</button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;