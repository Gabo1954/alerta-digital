import { useState, useEffect } from 'react';
import Login from './components/Login';
import Registro from './components/Registro';
import Analizador from './components/Analizador';
import Historial from './components/Historial';
import Contactos from './components/Contactos';
import Educacion from './components/Educacion';
import Suscripcion from './components/Suscripcion';
import PagoResultado from './components/PagoResultado';
import Perfil from './components/Perfil';

function App() {
  const [usuario, setUsuario] = useState(null);
  // Estados: 'inicio', 'historial', 'aprender', 'ayuda', 'pro', 'perfil'
  const [tabActiva, setTabActiva] = useState('inicio'); 
  const [isPremium, setIsPremium] = useState(false); 
  const [vistaAuth, setVistaAuth] = useState('login');

  const path = window.location.pathname;

  useEffect(() => {
    const guardado = localStorage.getItem('usuario');
    const proStatus = localStorage.getItem('isPro');
    if (guardado) setUsuario(JSON.parse(guardado));
    if (proStatus === 'true') setIsPremium(true);
  }, []);

  const salir = () => {
    if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        localStorage.clear();
        setUsuario(null);
        setIsPremium(false);
        window.location.href = '/';
    }
  };

  if (path === '/pago-resultado') return <PagoResultado />;

  if (!usuario) {
    return vistaAuth === 'login' 
      ? <Login onLoginSuccess={setUsuario} irARegistro={() => setVistaAuth('registro')} />
      : <Registro onRegistroSuccess={setUsuario} irALogin={() => setVistaAuth('login')} />;
  }

  return (
    <div className="h-dvh w-full bg-black flex justify-center selection:bg-blue-500 selection:text-white">
      <div className="w-full max-w-md bg-gray-950 h-full relative flex flex-col overflow-hidden shadow-2xl">
        
        {/* HEADER NATIVO REFACTORIZADO */}
        <header className="pt-safe bg-gray-950/90 backdrop-blur-2xl border-b border-white/5 z-50 shrink-0 w-full">
          <div className="px-5 pt-3 pb-4 flex justify-between items-center w-full">

            {/* Logo y Textos (Redirige a Inicio) */}
            <button
              onClick={() => setTabActiva('inicio')}
              className="flex items-center gap-3 text-left transition-all hover:opacity-80 active:scale-95 outline-none"
              title="Ir a Análisis Inteligente"
            >
              <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center ${isPremium ? 'bg-linear-to-tr from-yellow-400 to-yellow-600 animate-pulse' : 'bg-linear-to-tr from-blue-500 to-blue-700'} shadow-lg shrink-0`}>
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-black text-white tracking-tighter leading-none">Alerta Digital</h1>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{isPremium ? 'Cuenta VIP' : 'Plan Básico'}</p>
              </div>
            </button>

            {/* Grupo de Botones de Usuario (Perfil + Salir) */}
            <div className="flex items-center gap-3">
              {/* Avatar del usuario (Redirige al Perfil) */}
              <button 
                onClick={() => setTabActiva('perfil')} 
                className={`w-9 h-9 flex items-center justify-center rounded-full border transition-all active:scale-90 overflow-hidden font-black text-xs ${tabActiva === 'perfil' ? 'bg-blue-500 text-white border-blue-400' : 'bg-white/5 text-gray-400 border-white/10'}`}
              >
                {usuario.nombre?.charAt(0).toUpperCase()}
              </button>

              {/* Botón Salir */}
              <button 
                onClick={salir} 
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all active:scale-90 shrink-0 border border-white/5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>

          </div>
        </header>

        {/* CONTENEDOR DE VISTAS */}
        <main className="flex-1 overflow-y-auto no-scrollbar pb-28 pt-2 relative scroll-smooth bg-gray-950">
          {isPremium && <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-yellow-500/5 blur-[120px] pointer-events-none"></div>}
          
          {tabActiva === 'inicio' && <Analizador isPremium={isPremium} setTabActiva={setTabActiva} />}
          {tabActiva === 'historial' && <Historial setTabActiva={setTabActiva} />}
          {tabActiva === 'aprender' && <Educacion isPremium={isPremium} setTabActiva={setTabActiva} />}
          {tabActiva === 'ayuda' && <Contactos />}
          {tabActiva === 'pro' && <Suscripcion isPremium={isPremium} setIsPremium={setIsPremium} setTabActiva={setTabActiva} />}
          {tabActiva === 'perfil' && <Perfil usuario={usuario} isPremium={isPremium} setTabActiva={setTabActiva} onLogout={salir} />}
        </main>

        {/* BOTTOM NAVIGATION */}
        <nav className="bg-gray-950/95 backdrop-blur-2xl border-t border-white/5 absolute bottom-0 w-full flex justify-around px-2 pt-3 pb-safe z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          <NavBtn id="inicio" label="Escáner" icon="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" active={tabActiva} set={setTabActiva} />
          <NavBtn id="aprender" label="Aprender" icon="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" active={tabActiva} set={setTabActiva} />
          <NavBtn id="perfil" label="Cuenta" icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" active={tabActiva} set={setTabActiva} />
          <NavBtn id="pro" label={isPremium ? "VIP" : "PRO"} icon="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" active={tabActiva} set={setTabActiva} gold={isPremium} />
        </nav>
      </div>
    </div>
  );
}

const NavBtn = ({ id, label, icon, active, set, gold }) => (
  <button onClick={() => set(id)} className={`flex flex-col items-center justify-center w-16 mb-2 transition-all active:scale-75 ${active === id ? (gold ? 'text-yellow-400' : 'text-blue-500') : 'text-gray-500'}`}>
    <svg className={`w-7 h-7 mb-1 transition-transform ${active === id ? 'scale-110 drop-shadow-[0_0_8px_currentColor]' : ''}`} fill={active === id ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active === id ? 0 : 2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
    </svg>
    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

export default App;