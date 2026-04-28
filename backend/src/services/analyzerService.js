const { execute } = require('../config/db');

// Palabras que no aportan valor semántico
const STOP_WORDS = new Set(['para', 'como', 'este', 'esta', 'estos', 'estas', 'pero', 'todo', 'toda', 'hace', 'solo', 'tienes', 'tiene', 'desde', 'sobre']);
const MAX_WEIGHT = 100.0; 

class AnalyzerService {
    tokenize(text) {
        return text.toLowerCase()
            .replace(/[^\w\s]/gi, '') 
            .split(/\s+/)
            .filter(word => word.length > 3 && !STOP_WORDS.has(word));
    }

    async getDictionary() {
        const sql = `SELECT palabra, peso_spam, peso_safe FROM ia_diccionario`;
        const result = await execute(sql, {});
        const weights = { spam: {}, safe: {} };
        
        result.rows.forEach(row => {
            const pal = row.PALABRA || row.palabra;
            weights.spam[pal] = row.PESO_SPAM || row.peso_spam;
            weights.safe[pal] = row.PESO_SAFE || row.peso_safe;
        });
        return weights;
    }

    determinarCategoria(contenido) {
        const txt = contenido.toLowerCase();
        if (/(const |let |var |function|=>|require|import|select .* from)/i.test(txt)) return 'Fragmento de Código / Datos Técnicos';
        if (/(https?:\/\/[^\s]+|www\.[^\s]+)/i.test(txt)) return 'Mensaje con Enlace Externo';
        return 'Comunicación Estándar';
    }

    async evaluarMensaje(contenido) {
        const categoria = this.determinarCategoria(contenido);
        const weights = await this.getDictionary();
        const words = this.tokenize(contenido);
        
        let spamScore = 0;
        let safeScore = 0;
        let detalles = [];

        words.forEach(word => {
            if (weights.spam[word]) {
                spamScore += weights.spam[word];
                detalles.push(`Patrón de riesgo: "${word}"`);
            }
            if (weights.safe[word]) safeScore += weights.safe[word];
        });

        const totalScore = spamScore + safeScore;
        let puntajeBase = totalScore === 0 ? 0 : Math.round((spamScore / totalScore) * 100);

        // --- LÓGICA DE DETECCIÓN DE ENLACES ---
        if (/(https?:\/\/[^\s]+|www\.[^\s]+)/gi.test(contenido)) {
            puntajeBase = Math.min(puntajeBase + 30, 100);
            detalles.push("Contiene enlaces (URLs) que requieren verificación manual.");
        }

        // --- DETECCIÓN DE URGENCIA (Combo Phishing) ---
        if (/(urgente|bloque|ahora|inmediato|cuenta|banco|verificar|clave)/i.test(contenido)) {
            if (contenido.includes('http')) {
                puntajeBase = Math.min(puntajeBase + 25, 100);
                detalles.push("Detectada combinación crítica: Enlace + Lenguaje de urgencia.");
            }
        }

        let idNivelRiesgo = 1, idResultado = 1;
        if (puntajeBase > 60) { idNivelRiesgo = 3; idResultado = 3; } 
        else if (puntajeBase > 30) { idNivelRiesgo = 2; idResultado = 2; }

        return { 
            puntajeTotal: puntajeBase, 
            idNivelRiesgo, 
            idResultado, 
            categoria, 
            detalles: [...new Set(detalles)] 
        };
    }

    async entrenarModelo(contenido, esFraude) {
        const words = this.tokenize(contenido);
        const weights = await this.getDictionary();
        let tokensActualizados = 0;

        for (const word of words) {
            tokensActualizados++;
            let nuevoSpam = weights.spam[word] || 0;
            let nuevoSafe = weights.safe[word] || 0;

            if (esFraude) {
                // Aprendizaje agresivo para corregir errores rápido
                nuevoSpam = Math.min(nuevoSpam + 5.0, MAX_WEIGHT);
                nuevoSafe = Math.max(0, nuevoSafe - 2.5);
            } else {
                nuevoSafe = Math.min(nuevoSafe + 5.0, MAX_WEIGHT);
                nuevoSpam = Math.max(0, nuevoSpam - 2.5);
            }

            const sqlMerge = `
                MERGE INTO ia_diccionario d
                USING (SELECT :palabra AS pal FROM dual) src
                ON (d.palabra = src.pal)
                WHEN MATCHED THEN UPDATE SET d.peso_spam = :spam, d.peso_safe = :safe
                WHEN NOT MATCHED THEN INSERT (palabra, peso_spam, peso_safe) VALUES (:palabra, :spam, :safe)
            `;
            await execute(sqlMerge, { palabra: word, spam: nuevoSpam, safe: nuevoSafe });
        }
        return { message: `Aprendizaje completado. ${tokensActualizados} patrones re-calibrados.` };
    }
}
module.exports = new AnalyzerService();