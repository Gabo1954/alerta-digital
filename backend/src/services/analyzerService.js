const { execute } = require('../config/db');

// Filtro de palabras sin valor semántico
const STOP_WORDS = new Set(['para', 'como', 'este', 'esta', 'estos', 'estas', 'pero', 'todo', 'toda', 'hace', 'solo', 'tienes', 'tiene', 'desde', 'sobre']);
const MAX_WEIGHT = 50.0;

class AnalyzerService {
    
    tokenize(text) {
        return text.toLowerCase()
            .replace(/[^\w\s]/gi, '') 
            .split(/\s+/)
            .filter(word => word.length > 3 && !STOP_WORDS.has(word));
    }

    // 1. CARGA EL CEREBRO DIRECTO DESDE ORACLE
    async getDictionary() {
        const sql = `SELECT palabra, peso_spam, peso_safe FROM ia_diccionario`;
        const result = await execute(sql, {});
        
        const weights = { spam: {}, safe: {} };
        // Oracle devuelve los nombres de columnas en MAYÚSCULAS
        result.rows.forEach(row => {
            weights.spam[row.PALABRA] = row.PESO_SPAM;
            weights.safe[row.PALABRA] = row.PESO_SAFE;
        });
        return weights;
    }

    // 2. EVALUACIÓN HEURÍSTICA EN TIEMPO REAL
    async evaluarMensaje(contenido) {
        const weights = await this.getDictionary();
        const words = this.tokenize(contenido);
        let spamScore = 0;
        let safeScore = 0;
        let detalles = [];

        words.forEach(word => {
            if (weights.spam[word]) {
                spamScore += weights.spam[word];
                detalles.push(`Patrón de riesgo detectado: "${word}"`);
            }
            if (weights.safe[word]) {
                safeScore += weights.safe[word];
            }
        });

        const totalScore = spamScore + safeScore;
        let puntajeTotal = totalScore === 0 ? 0 : Math.round((spamScore / totalScore) * 100);

        // Penalización por URLs o IPs
        const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b)/gi;
        if (urlRegex.test(contenido)) {
            puntajeTotal += 25; 
            detalles.push("Contiene enlaces externos o IPs ocultas.");
        }

        puntajeTotal = Math.min(puntajeTotal, 100);

        let idNivelRiesgo = 1; // Bajo
        let idResultado = 1; // Seguro

        if (puntajeTotal > 65) {
            idNivelRiesgo = 3; // Alto
            idResultado = 3;   // Fraude
        } else if (puntajeTotal > 35) {
            idNivelRiesgo = 2; // Medio
            idResultado = 2;   // Sospechoso
        }

        return {
            puntajeTotal,
            idNivelRiesgo,
            idResultado,
            detalles: [...new Set(detalles)]
        };
    }

    // 3. APRENDIZAJE ACTIVO (ONLINE LEARNING) DIRECTO A ORACLE
    async entrenarModelo(contenido, esFraude) {
        const words = this.tokenize(contenido);
        const weights = await this.getDictionary();
        let palabrasAfectadas = 0;

        for (const word of words) {
            palabrasAfectadas++;
            
            let nuevoSpam = weights.spam[word] || 0;
            let nuevoSafe = weights.safe[word] || 0;

            if (esFraude) {
                nuevoSpam = Math.min(nuevoSpam + 1.5, MAX_WEIGHT);
                nuevoSafe = Math.max(0, nuevoSafe - 1.0);
            } else {
                nuevoSafe = Math.min(nuevoSafe + 1.5, MAX_WEIGHT);
                nuevoSpam = Math.max(0, nuevoSpam - 1.0);
            }

            // MERGE: El estándar SQL para Inteligencia Artificial que se actualiza
            const sqlMerge = `
                MERGE INTO ia_diccionario d
                USING (SELECT :palabra AS pal FROM dual) src
                ON (d.palabra = src.pal)
                WHEN MATCHED THEN
                    UPDATE SET d.peso_spam = :spam, d.peso_safe = :safe
                WHEN NOT MATCHED THEN
                    INSERT (palabra, peso_spam, peso_safe) VALUES (:palabra, :spam, :safe)
            `;

            await execute(sqlMerge, { 
                palabra: word, 
                spam: nuevoSpam, 
                safe: nuevoSafe 
            });
        }

        return { message: `Modelo reentrenado en Oracle. ${palabrasAfectadas} tokens ajustados.` };
    }
}

module.exports = new AnalyzerService();