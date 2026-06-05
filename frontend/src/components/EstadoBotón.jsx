export function StateButton({ 
  state = 'idle',
  onClick, 
  children, 
  fullWidth = true,
  variant = 'primary',
  disabled = false,
  className = ''
}) {
  const baseStyles = `
    font-black py-5 rounded-2xl transition-all duration-300 
    active:scale-95 tracking-widest uppercase text-lg
    disabled:opacity-60 disabled:cursor-not-allowed
  `;

  const variants = {
    primary: {
      idle: 'bg-blue-600 hover:bg-blue-500 text-white shadow-2xl active:scale-95',
      loading: 'bg-blue-700 text-white cursor-wait shadow-xl',
      success: 'bg-green-600 text-white shadow-xl shadow-green-500/30',
      error: 'bg-red-600 hover:bg-red-500 text-white shadow-2xl'
    },
    secondary: {
      idle: 'bg-gray-700 hover:bg-gray-600 text-white shadow-lg',
      loading: 'bg-gray-800 text-white cursor-wait',
      success: 'bg-green-700 text-white shadow-lg',
      error: 'bg-red-700 hover:bg-red-600 text-white'
    },
    danger: {
      idle: 'bg-red-600 hover:bg-red-500 text-white shadow-lg',
      loading: 'bg-red-700 text-white cursor-wait',
      success: 'bg-green-600 text-white shadow-lg',
      error: 'bg-red-800 hover:bg-red-700 text-white'
    }
  };

  const isDisabled = disabled || state === 'loading' || state === 'success';

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`
        ${baseStyles}
        ${fullWidth ? 'w-full' : ''}
        ${variants[variant][state]}
        ${className}
      `}
      aria-busy={state === 'loading'}
      aria-label={
        state === 'loading' ? 'Procesando...' : 
        state === 'success' ? '¡Completado!' : 
        'Botón de acción'
      }
    >
      <span className="flex items-center justify-center gap-2">
        {state === 'loading' && (
          <svg 
            className="animate-spin h-5 w-5" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="2" 
              fill="none" 
              opacity="0.25" 
            />
            <path 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" 
            />
          </svg>
        )}

        {state === 'success' && (
          <svg 
            className="h-5 w-5 animate-bounce" 
            fill="currentColor" 
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path 
              fillRule="evenodd" 
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
              clipRule="evenodd" 
            />
          </svg>
        )}

        {state === 'error' && (
          <svg 
            className="h-5 w-5" 
            fill="currentColor" 
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path 
              fillRule="evenodd" 
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
              clipRule="evenodd" 
            />
          </svg>
        )}

        {children}
      </span>
    </button>
  );
}
