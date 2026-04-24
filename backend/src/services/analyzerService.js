const fs = require('fs');
const path = require('path');

// Archivo donde la IA guardará su conocimiento
const WEIGHTS_FILE = path.join(__dirname, 'ml_weights.json');

class AnalyzerService {
    constructor() {
        this.weights = this.loadWeights();
    }

    loadWeights() {
        if (fs.existsSync(WEIGHTS_FILE)) {
            try {
                return JSON.parse(fs.readFileSync(WEIGHTS_FILE, 'utf8'));
            } catch (e) {
                console.error("Error leyendo ml_weights.json, cargando defaults.");
            }
        }
        return {
            spam: { 'urgente': 5, 'bloqueada': 5, 'premio': 5, 'ganador': 5, 'contraseña': 4, 'actualizar': 3, 'cuenta': 2, 'verificar': 3, 'banco': 3 },
            safe: { 'hola': 2, 'mañana': 2, 'reunión': 2, 'gracias': 2, 'ok': 1, 'saludos': 2, 'universidad': 2, 'duoc': 3 }
        };
    }

    saveWeights() {
        fs.writeFileSync(WEIGHTS_FILE, JSON.stringify(this.weights, null, 2), 'utf8');
    }

    tokenize(text) {
        return text.toLowerCase().replace(/[^\w\s\.\:\/]/gi, '').split(/\s+/);
    }

    evaluarMensaje(contenido) {
        const words = this.tokenize(contenido);
        let spamScore = 0;
        let safeScore = 0;
        let detalles = [];

        words.forEach(word => {
            if (this.weights.spam[word]) {
                spamScore += this.weights.spam[word];
                detalles.push(`Palabra riesgosa detectada: "${word}"`);
            }
            if (this.weights.safe[word]) {
                safeScore += this.weights.safe[word];
            }
        });

        const totalScore = spamScore + safeScore;
        let puntajeTotal = totalScore === 0 ? 0 : Math.round((spamScore / totalScore) * 100);

        if (contenido.includes('http://') || contenido.includes('https://') || contenido.includes('www.')) {
            puntajeTotal += 20;
            detalles.push("El mensaje contiene un enlace externo.");
        }

        puntajeTotal = Math.min(puntajeTotal, 100);

        let idNivelRiesgo = 1;
        let idResultado = 1;

        if (puntajeTotal > 65) {
            idNivelRiesgo = 3;
            idResultado = 3;
        } else if (puntajeTotal > 30) {
            idNivelRiesgo = 2;
            idResultado = 2;
        }

        return {
            puntajeTotal,
            idNivelRiesgo,
            idResultado,
            detalles: [...new Set(detalles)]
        };
    }

    // --- FUNCIÓN DE APRENDIZAJE CONTINUO ---
    entrenarModelo(contenido, esFraude) {
        const words = this.tokenize(contenido);
        let palabrasAfectadas = 0;
        
        words.forEach(word => {
            if (word.length <= 3) return; // Ignoramos palabras muy cortas
            palabrasAfectadas++;
            
            if (esFraude) {
                this.weights.spam[word] = (this.weights.spam[word] || 0) + 1.5; // Sube peso spam
                if (this.weights.safe[word]) this.weights.safe[word] = Math.max(0, this.weights.safe[word] - 1);
            } else {
                this.weights.safe[word] = (this.weights.safe[word] || 0) + 1.5; // Sube peso seguro
                if (this.weights.spam[word]) this.weights.spam[word] = Math.max(0, this.weights.spam[word] - 1);
            }
        });

        this.saveWeights();
        return { message: `Modelo actualizado con ${palabrasAfectadas} tokens.` };
    }
}

module.exports = new AnalyzerService();