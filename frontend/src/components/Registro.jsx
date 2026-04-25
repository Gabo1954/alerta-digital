import { useState } from 'react';
import api from '../services/api';

const Registro = ({ onRegistroSuccess, irALogin }) => {
    const [form, setForm] = useState({ nombre: '', correo: '', password: '' });
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    const manejarRegistro = async (e) => {
        e.preventDefault();
        setError(''); setCargando(true);
        try {
            const respuesta = await api.post('/auth/registro', form);
            localStorage.setItem('token', respuesta.data.token);
            localStorage.setItem('usuario', JSON.stringify(respuesta.data.usuario));
            onRegistroSuccess(respuesta.data.usuario);
        } catch (err) {
            setError(err.response?.data?.error || 'Error al crear la cuenta. Intente de nuevo.');
        } finally { setCargando(false); }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-900 to-gray-800 p-4 font-sans">
            <div className="bg-gray-800 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-gray-700/50">
                <div className="mb-8">
                    <button onClick={irALogin} className="text-gray-500 hover:text-white transition-colors mb-4 flex items-center text-sm font-bold">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg> Volver
                    </button>
                    <h2 className="text-3xl font-black text-white">Crear Cuenta</h2>
                    <p className="text-gray-400 text-sm mt-1">Únete a la comunidad de Alerta Digital.</p>
                </div>

                {error && <div className="bg-red-500/10 border-l-4 border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6 text-xs font-bold animate-fade-in">{error}</div>}
                
                <form onSubmit={manejarRegistro} className="space-y-5">
                    <input type="text" className="w-full bg-gray-900/50 border border-gray-600 text-white rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition-all" placeholder="Nombre completo" onChange={(e) => setForm({...form, nombre: e.target.value})} required />
                    <input type="email" className="w-full bg-gray-900/50 border border-gray-600 text-white rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition-all" placeholder="correo@ejemplo.cl" onChange={(e) => setForm({...form, correo: e.target.value})} required />
                    
                    <div>
                        <input type="password" className="w-full bg-gray-900/50 border border-gray-600 text-white rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition-all" placeholder="Contraseña (Mínimo 6 caracteres)" onChange={(e) => setForm({...form, password: e.target.value})} required />
                        {form.password.length > 0 && form.password.length < 6 && <p className="text-red-400 text-[10px] mt-1 ml-2 font-bold">Faltan {6 - form.password.length} caracteres</p>}
                    </div>

                    <button type="submit" disabled={cargando || form.password.length < 6} className="w-full font-black py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 active:scale-95 transition-all uppercase disabled:opacity-50 mt-4 flex justify-center items-center gap-2">
                        {cargando ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : 'UNIRME AHORA'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Registro;