/**
 * DOMINGUITO CORE V1.0
 * Sistema de inteligencia centralizada para Clínica SAEI
 */
// 1. CONFIGURACIÓN DE FIREBASE
// 2. NÚCLEO DE DOMINGUITO (Versión compatible)
window.Dominguito = { 
    serverUrl: "https://dominguito-san-juan.vercel.app/v1/chat/completions",
    // Usamos 'firebase.database()' directamente para no chocar con otras variables
    db: (typeof firebase !== "undefined") ? firebase.database() : null,

    procesarConIA: async function(mensaje, archivo = null) {
        if (!this.serverUrl) return console.error("URL de servidor no definida");
        this.hablar("Procesando pedido...");
        
        try {
            const response = await fetch(this.serverUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    messages: [{ role: "user", content: mensaje }],
                    file: archivo 
                })
            });

            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
            const data = await response.json();
            
            if (data.accion && data.ruta && this.db) {
                await this.ejecutarAccion(data.ruta, data.payload, data.metodo === 'set');
            }

            const respuestaTexto = data.choices ? data.choices[0].message.content : (data.respuesta || "Sin respuesta");
            this.hablar(respuestaTexto);
            
        } catch (e) {
            console.error("Error en Dominguito Core:", e);
            this.hablar("Error de conexión.");
        }
    },

    ejecutarAccion: async function(ruta, datos, esSet = false) {
        try {
            const ref = this.db.ref(ruta);
            if (esSet) { await ref.set(datos); } else { await ref.push(datos); }
            console.log("Acción exitosa en " + ruta);
        } catch (error) {
            console.error("Error en base de datos:", error);
        }
    },

    escuchar: function() {
        const visual = document.getElementById('dominguito-visual');
        const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!Rec) return alert("Navegador no compatible.");
        
        const recognition = new Rec();
        recognition.lang = 'es-AR'; 
        if (visual) { visual.style.transform = "scale(1.2)"; visual.style.borderColor = "#2ecc71"; }
        
        recognition.start();
        
        recognition.onresult = (e) => {
            if (visual) { visual.style.transform = "scale(1)"; visual.style.borderColor = "#f1c40f"; }
            this.procesarConIA(e.results[0][0].transcript);
        };
    },

    hablar: function(texto) {
        const s = new SpeechSynthesisUtterance(texto);
        s.lang = 'es-AR';
        window.speechSynthesis.speak(s);
    }
};
