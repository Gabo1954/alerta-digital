import { useState, useEffect } from 'react';
import api from '../services/api';

const RestablecerPassword = () => {
    const [token, setToken] = useState('');
    const [form, setForm] = useState({ password: '', confirmarPassword: '' });
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [cargando, setCargando] = useState(false);

    // Extraer el token de la URL cuando carga la página
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const urlToken = urlParams.get('token');
        if (urlToken) {
            setToken(urlToken);
        } else {
            setError('No se encontró un token de seguridad válido en el enlace.');
        }
    }, []);

    const manejarSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMensaje('');

        if (!token) {
            setError('Enlace inválido. Vuelve a solicitar el correo de recuperación.');
            return;
        }

        if (form.password !== form.confirmarPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        // Validación de Contraseña Segura 
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(form.password)) {
            setError('La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.');
            return;
        }

        setCargando(true);

        try {
            const respuesta = await api.post('/auth/restablecer-password', { 
                token: token, 
                nuevaPassword: form.password 
            });
            setMensaje(respuesta.data.mensaje);
            setForm({ password: '', confirmarPassword: '' }); // Limpiar
        } catch (err) {
            setError(err.response?.data?.error || 'Error al actualizar la contraseña.');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="min-h-[100dvh] flex items-center justify-center bg-black p-4 font-sans relative overflow-hidden">
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="bg-gray-900/80 backdrop-blur-xl p-8 sm:p-10 rounded-[3rem] shadow-2xl w-full max-w-md border border-white/5 relative z-10 animate-fade-in-up">
                
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-blue-500/10 text-blue-500 rounded-3xl flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(59,130,246,0.3)] border border-blue-500/20 rotate-3">
                        🔐
                    </div>
                </div>

                <div className="text-center mb-8">
                    <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Nueva Contraseña</h2>
                    <p className="text-gray-400 text-sm font-medium">Configura tus nuevas credenciales de acceso.</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border-l-4 border-red-500 text-red-400 px-4 py-3 rounded-xl mb-6 text-xs font-bold animate-fade-in flex items-center gap-2">
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        {error}
                    </div>
                )}

                {mensaje ? (
                    <div className="text-center animate-fade-in">
                        <div className="bg-green-500/10 border-l-4 border-green-500 text-green-400 px-4 py-4 rounded-xl mb-6 text-sm font-bold flex flex-col items-center gap-3">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            {mensaje}
                        </div>
                        <button 
                            onClick={() => window.location.href = '/'} // Redirige a la página principal/login
                            className="w-full font-black py-4 rounded-2xl bg-gray-800 hover:bg-gray-700 text-white transition-all active:scale-95 uppercase tracking-wider text-xs"
                        >
                            Volver al Inicio de Sesión
                        </button>
                    </div>
                ) : (
                    <form onSubmit={manejarSubmit} className="space-y-4">
                        <input 
                            type="password" 
                            className="w-full bg-black/50 border border-gray-700 text-white rounded-2xl px-5 py-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm" 
                            placeholder="Nueva contraseña" 
                            value={form.password} 
                            onChange={(e) => setForm({ ...form, password: e.target.value })} 
                            required 
                            disabled={cargando || !token} 
                        />
                        <input 
                            type="password" 
                            className="w-full bg-black/50 border border-gray-700 text-white rounded-2xl px-5 py-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm" 
                            placeholder="Confirmar contraseña" 
                            value={form.confirmarPassword} 
                            onChange={(e) => setForm({ ...form, confirmarPassword: e.target.value })} 
                            required 
                            disabled={cargando || !token} 
                        />

                        <button 
                            type="submit" 
                            disabled={cargando || !token} 
                            className="w-full font-black py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all active:scale-95 uppercase tracking-wider flex justify-center items-center gap-2 disabled:opacity-50 mt-4"
                        >
                            {cargando ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : 'ACTUALIZAR CONTRASEÑA'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default RestablecerPassword;