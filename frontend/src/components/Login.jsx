import { useState } from 'react';
import api from '../services/api';

const Login = ({ onLoginSuccess, irARegistro }) => { 
    const [correo, setCorreo] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    const manejarSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setCargando(true);
        try {
            const respuesta = await api.post('/auth/login', { correo, password });
            localStorage.setItem('token', respuesta.data.token);
            localStorage.setItem('usuario', JSON.stringify(respuesta.data.usuario));
            onLoginSuccess(respuesta.data.usuario);
        } catch (err) {
            setError(err.response?.data?.error || 'Credenciales inválidas. Intente nuevamente.');
        } finally {
            setCargando(false);
        }
    };

    const loginConGoogle = () => {
        // En producción aquí se redirige a la API de Google
        alert("Simulando redirección a Google OAuth...");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-950 via-gray-900 to-blue-950 p-4 animate-fade-in">
            <div className="bg-gray-900/80 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-white/5 ring-1 ring-white/10">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/20 rotate-3">
                        <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944z" clipRule="evenodd" /></svg>
                    </div>
                    <h2 className="text-3xl font-black text-white tracking-tight">Alerta Digital</h2>
                    <p className="text-gray-400 text-sm mt-1">Protección inteligente para ciudadanos.</p>
                </div>
                
                <form onSubmit={manejarSubmit} className="space-y-4">
                    <div className="relative group">
                        <input type="email" className="w-full bg-black/40 border border-gray-700/50 text-white rounded-2xl px-5 py-4 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-gray-600" placeholder="Correo electrónico" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
                    </div>
                    <div className="relative group">
                        <input type="password" className="w-full bg-black/40 border border-gray-700/50 text-white rounded-2xl px-5 py-4 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-gray-600" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    
                    {error && <p className="text-red-400 text-xs font-bold text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">{error}</p>}
                    
                    <button type="submit" disabled={cargando} className="w-full font-black py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50">
                        {cargando ? 'VALIDANDO...' : 'ENTRAR'}
                    </button>
                </form>

                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-800"></span></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-gray-900 px-3 text-gray-500 font-bold">O continuar con</span></div>
                </div>

                <div className="flex gap-3">
                    <button onClick={loginConGoogle} className="flex-1 flex items-center justify-center gap-2 bg-white text-black font-bold py-3 rounded-2xl hover:bg-gray-100 transition-all active:scale-95 text-sm">
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" /> Google
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 bg-gray-800 text-white font-bold py-3 rounded-2xl hover:bg-gray-700 transition-all active:scale-95 text-sm">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 0C4.477 0 0 4.477 0 10c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.341-3.369-1.341-.454-1.152-1.11-1.459-1.11-1.459-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0110 4.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.92.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.48C17.137 18.163 20 14.418 20 10c0-5.523-4.477-10-10-10z"/></svg> GitHub
                    </button>
                </div>

                <p className="mt-8 text-center text-gray-400 text-sm">
                    ¿Nuevo aquí? <button onClick={irARegistro} className="text-blue-400 font-black hover:text-blue-300">Crea tu cuenta</button>
                </p>
            </div>
        </div>
    );
};

export default Login;