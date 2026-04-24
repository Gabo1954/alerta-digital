// backend/src/services/analyzerService.js

// 1. Función para extraer URLs de un texto
const extraerURLs = (texto) => {
    // Expresión regular para encontrar enlaces http o https
    const regexURL = /(https?:\/\/[^\s]+)/g;
    return texto.match(regexURL) || [];
};

// 2. Función para evaluar el riesgo de una URL
const analizarURL = (url) => {
    let puntaje = 0;
    let banderasRojas = [];

    // Patrón 1: Uso de IP en lugar de un dominio oficial (ej: http://192.168.1.1/login)
    const regexIP = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
    if (regexIP.test(url)) {
        puntaje += 40;
        banderasRojas.push("Usa una dirección IP en lugar de un nombre de dominio.");
    }

    // Patrón 2: Dominios de nivel superior (TLDs) sospechosos o baratos
    const tldSospechosos = ['.xyz', '.top', '.club', '.tk', '.biz', '.online'];
    if (tldSospechosos.some(tld => url.includes(tld))) {
        puntaje += 30;
        banderasRojas.push("Usa una extensión de dominio comúnmente asociada a estafas.");
    }

    // Patrón 3: Typosquatting o palabras trampa en la URL
    const palabrasTrampa = ['login', 'update', 'secure', 'verify', 'banco', 'cuenta', 'free', 'premio'];
    if (palabrasTrampa.some(palabra => url.toLowerCase().includes(palabra))) {
        puntaje += 20;
        banderasRojas.push("La URL intenta imitar una página de inicio de sesión o seguridad.");
    }

    return { puntaje, banderasRojas };
};

// 3. Función Principal que orquesta la evaluación
const evaluarMensaje = (texto) => {
    let puntajeTotal = 0;
    let alertas = [];
    let textoLimpiado = texto.toLowerCase();

    // A. Analizar las URLs encontradas
    const urlsEncontradas = extraerURLs(textoLimpiado);
    if (urlsEncontradas.length > 0) {
        urlsEncontradas.forEach(url => {
            const analisisURL = analizarURL(url);
            puntajeTotal += analisisURL.puntaje;
            alertas = [...alertas, ...analisisURL.banderasRojas];
        });
    }

    // B. Análisis Semántico del Texto
    const palabrasUrgencia = ['urgente', 'inmediato', 'bloqueada', 'suspendida', 'expira', '24 horas', 'advertencia'];
    const palabrasFinanzas = ['banco', 'clave', 'contraseña', 'tarjeta', 'pago', 'transferencia', 'bono', 'ganador'];

    const tieneUrgencia = palabrasUrgencia.some(p => textoLimpiado.includes(p));
    const tieneFinanzas = palabrasFinanzas.some(p => textoLimpiado.includes(p));

    if (tieneUrgencia) {
        puntajeTotal += 20;
        alertas.push("El mensaje genera un falso sentido de urgencia o pánico.");
    }

    if (tieneFinanzas) {
        puntajeTotal += 25;
        alertas.push("El mensaje solicita información financiera o promete un premio.");
    }

    // C. El patrón definitivo de Phishing (Urgencia + Dinero/Claves + Enlace)
    if (tieneUrgencia && tieneFinanzas && urlsEncontradas.length > 0) {
        puntajeTotal += 40; // Multiplicador de riesgo
        alertas.push("⚠️ PATRÓN CLÁSICO DE PHISHING DETECTADO.");
    }

    // D. Clasificación Final basada en el Puntaje (0 a 100+)
    let idNivelRiesgo = 1; // 1: Bajo
    let idResultado = 1;   // 1: Seguro

    if (puntajeTotal >= 70) {
        idNivelRiesgo = 3; // 3: Alto
        idResultado = 3;   // 3: Fraude
    } else if (puntajeTotal >= 30) {
        idNivelRiesgo = 2; // 2: Medio
        idResultado = 2;   // 2: Sospechoso
    }

    return {
        idNivelRiesgo,
        idResultado,
        puntajeTotal,
        detalles: [...new Set(alertas)] // Eliminamos alertas duplicadas
    };
};

module.exports = { evaluarMensaje };