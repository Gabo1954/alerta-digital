import { useState, useEffect } from 'react';
import Login from './components/Login';
import Registro from './components/Registro';
import Analizador from './components/Analizador';
import Contactos from './components/Contactos';
import Educacion from './components/Educacion';
import Suscripcion from './components/Suscripcion';
import PagoResultado from './components/PagoResultado';

function App() {
  const [usuario, setUsuario] = useState(null);
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
    localStorage.clear();
    setUsuario(null);
    setIsPremium(false);
    window.location.href = '/';
  };

  if (path === '/pago-resultado') return <PagoResultado />;

  if (!usuario) {
    return vistaAuth === 'login' 
      ? <Login onLoginSuccess={setUsuario} irARegistro={() => setVistaAuth('registro')} />
      : <Registro onRegistroSuccess={setUsuario} irALogin={() => setVistaAuth('login')} />;
  }

  return (
    <div className="min-h-screen bg-black flex justify-center selection:bg-blue-500 selection:text-white">
      <div className="w-full max-w-md bg-gray-950 min-h-screen relative shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col border-x border-white/5">
        
        <header className="bg-gray-950/80 backdrop-blur-xl p-5 flex justify-between items-center border-b border-white/5 sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isPremium ? 'bg-yellow-500' : 'bg-blue-600'} shadow-lg`}>
              <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/></svg>
            </div>
            <h1 className="text-xl font-black text-white tracking-tighter uppercase italic">Alerta Digital</h1>
          </div>
          <button onClick={salir} className="text-gray-600 hover:text-red-500 transition-colors p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto pb-32 animate-fade-in relative scroll-smooth">
          {isPremium && <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[200%] h-96 bg-yellow-500/5 blur-[120px] pointer-events-none"></div>}
          
          {tabActiva === 'inicio' && <Analizador isPremium={isPremium} setTabActiva={setTabActiva} />}
          {tabActiva === 'aprender' && <Educacion isPremium={isPremium} setTabActiva={setTabActiva} />}
          {tabActiva === 'ayuda' && <Contactos />}
          {tabActiva === 'pro' && <Suscripcion isPremium={isPremium} setIsPremium={setIsPremium} setTabActiva={setTabActiva} />}
        </main>

        <nav className="bg-gray-950/90 backdrop-blur-2xl border-t border-white/5 absolute bottom-0 w-full flex justify-around p-4 z-50 ring-1 ring-white/5">
          <NavBtn id="inicio" label="IA" icon="🛡️" active={tabActiva} set={setTabActiva} />
          <NavBtn id="aprender" label="Academia" icon="📚" active={tabActiva} set={setTabActiva} />
          <NavBtn id="ayuda" label="Ayuda" icon="🚨" active={tabActiva} set={setTabActiva} />
          <NavBtn id="pro" label={isPremium ? "VIP" : "PRO"} icon="⭐" active={tabActiva} set={setTabActiva} gold={isPremium} />
        </nav>
      </div>
    </div>
  );
}

const NavBtn = ({ id, label, icon, active, set, gold }) => (
  <button onClick={() => set(id)} className={`flex flex-col items-center gap-1 transition-all active:scale-75 ${active === id ? (gold ? 'text-yellow-500' : 'text-blue-500') : 'text-gray-600'}`}>
    <span className="text-2xl">{icon}</span>
    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    {active === id && <div className={`w-1 h-1 rounded-full mt-1 ${gold ? 'bg-yellow-500 shadow-[0_0_5px_yellow]' : 'bg-blue-500 shadow-[0_0_5px_blue]'}`}></div>}
  </button>
);

export default App;