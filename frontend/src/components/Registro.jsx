import { useState } from 'react';
import api from '../services/api';

const Registro = ({ onRegistroSuccess, irALogin }) => {
    const [form, setForm] = useState({ nombre: '', correo: '', password: '' });
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    const manejarRegistro = async (e) => {
        e.preventDefault();
        setError('');
        setCargando(true);
        try {
            const respuesta = await api.post('/auth/registro', form);
            localStorage.setItem('token', respuesta.data.token);
            localStorage.setItem('usuario', JSON.stringify(respuesta.data.usuario));
            onRegistroSuccess(respuesta.data.usuario);
        } catch (err) {
            setError(err.response?.data?.error || 'Error al crear la cuenta.');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-900 to-gray-800 p-4 font-sans">
            <div className="bg-gray-800 p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-md border border-gray-700/50">
                <h2 className="text-3xl font-black text-white mb-6 text-center">Crear Cuenta</h2>
                {error && <div className="bg-red-500/10 border-l-4 border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6 text-xs font-bold">{error}</div>}
                <form onSubmit={manejarRegistro} className="space-y-5">
                    <input type="text" className="w-full bg-gray-900/50 border border-gray-600 text-white rounded-xl px-4 py-3 outline-none" placeholder="Nombre completo" onChange={(e) => setForm({...form, nombre: e.target.value})} required />
                    <input type="email" className="w-full bg-gray-900/50 border border-gray-600 text-white rounded-xl px-4 py-3 outline-none" placeholder="correo@ejemplo.cl" onChange={(e) => setForm({...form, correo: e.target.value})} required />
                    <input type="password" className="w-full bg-gray-900/50 border border-gray-600 text-white rounded-xl px-4 py-3 outline-none" placeholder="Mínimo 6 caracteres" onChange={(e) => setForm({...form, password: e.target.value})} required />
                    <button type="submit" disabled={cargando} className="w-full font-black py-4 rounded-xl bg-blue-600 text-white shadow-lg active:scale-95 transition-all uppercase">Unirme ahora</button>
                </form>
                <div className="mt-8 text-center border-t border-gray-700 pt-6">
                    <p className="text-gray-400 text-sm">¿Ya eres parte? <button onClick={irALogin} className="text-blue-400 font-bold hover:underline">Inicia sesión</button></p>
                </div>
            </div>
        </div>
    );
};

export default Registro;