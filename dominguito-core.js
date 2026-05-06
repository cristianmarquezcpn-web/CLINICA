/**
 * DOMINGUITO CORE V1.0
 * Sistema de inteligencia centralizada para Clínica SAEI
 */

window.Dominguito = {
    // 1. CONFIGURACIÓN DE CONEXIÓN
    // Quitamos 'const' y usamos la URL que ya está online
    serverUrl: "https://dominguito-san-juan.vercel.app/api/chat", 
    db: firebase.database(),

    // 2. PROCESAMIENTO CON IA (VERCEL + DEEPSEEK)
    procesarConIA: async function(mensaje, archivo = null) {
        this.hablar("Procesando, Cristian...");
        try {
            const response = await fetch(this.serverUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    messages: [{ role: "user", content: mensaje }], // Formato que espera tu Python
                    file: archivo 
                })
            });
            const data = await response.json();
            
            // Si la IA decide ejecutar una acción en tu Firebase
            if (data.accion && data.ruta) {
                await this.ejecutarAccion(data.ruta, data.payload, data.metodo === 'set');
            }

            // DeepSeek suele responder en data.choices[0].message.content
            const respuestaTexto = data.choices ? data.choices[0].message.content : data.respuesta;
            this.hablar(respuestaTexto || "Ya está listo.");
            
        } catch (e) {
            console.error("Error en conexión Vercel:", e);
            this.hablar("Hubo un error al conectar con mi cerebro en el servidor.");
        }
    },

    // 3. EJECUTOR MAESTRO DE FIREBASE
    ejecutarAccion: async function(ruta, datos, esSet = false) {
        try {
            const ref = this.db.ref(ruta);
            if (esSet) {
                await ref.set(datos);
            } else {
                await ref.push(datos);
            }
            console.log("Dominguito: Acción exitosa en " + ruta);
        } catch (error) {
            console.error("Error de escritura en Firebase:", error);
        }
    },

    // 4. INTERFAZ DE VOZ
    escuchar: function() {
        const visual = document.getElementById('dominguito-visual');
        const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!Rec) return alert("Tu navegador no soporta comandos de voz.");

        const recognition = new Rec();
        recognition.lang = 'es-AR'; 
        
        if (visual) {
            visual.style.transform = "scale(1.2)";
            visual.style.borderColor = "#2ecc71";
        }

        recognition.start();

        recognition.onresult = (e) => {
            if (visual) {
                visual.style.transform = "scale(1)";
                visual.style.borderColor = "#f1c40f";
            }
            const comando = e.results[0][0].transcript;
            this.procesarConIA(comando);
        };

        recognition.onerror = () => {
            if (visual) {
                visual.style.transform = "scale(1)";
                visual.style.borderColor = "#f1c40f";
            }
        };
    },

    hablar: function(texto) {
        const s = new SpeechSynthesisUtterance(texto);
        s.lang = 'es-AR';
        window.speechSynthesis.speak(s);
    }
};
