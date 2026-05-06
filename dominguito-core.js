/**
 * DOMINGUITO CORE V1.0
 * Sistema de inteligencia centralizada para Clínica SAEI
 */
// 1. CONFIGURACIÓN DE FIREBASE (Asegurate que esté arriba)
const firebaseConfig = {
  apiKey: "AIzaSyAugXXx_b_wKFByhDbLZslk2HA_UTzrzd8",
  authDomain: "clinicaintegral-5c488.firebaseapp.com",
  databaseURL: "https://clinicaintegral-5c488-default-rtdb.firebaseio.com",
  projectId: "clinicaintegral-5c488",
  storageBucket: "clinicaintegral-5c488.firebasestorage.app",
  messagingSenderId: "184090967634",
  appId: "1:184090967634:web:09715937b33ea48288698b"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// 2. OBJETO DOMINGUITO (Corregido el error del token ':')
window.Dominguito = { 
    serverUrl: "https://dominguito-san-juan.vercel.app/v1/chat/completions",
    db: firebase.database(),

    procesarConIA: async function(mensaje, archivo = null) {
        if (!this.serverUrl) return console.error("URL de servidor no definida");
        this.hablar("Procesando, Cristian...");
        
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
            this.hablar("Error de conexión con el servidor.");
        }
    },

    ejecutarAccion: async function(ruta, datos, esSet = false) {
        try {
            const ref = this.db.ref(ruta);
            if (esSet) { await ref.set(datos); } else { await ref.push(datos); }
            console.log("Dominguito: Acción exitosa en " + ruta);
        } catch (error) {
            console.error("Error de escritura en Firebase:", error);
        }
    },

    escuchar: function() {
        const visual = document.getElementById('dominguito-visual');
        const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!Rec) return alert("Tu navegador no soporta comandos de voz.");
        const recognition = new Rec();
        recognition.lang = 'es-AR'; 
        if (visual) { visual.style.transform = "scale(1.2)"; visual.style.borderColor = "#2ecc71"; }
        recognition.start();
        recognition.onresult = (e) => {
            if (visual) { visual.style.transform = "scale(1)"; visual.style.borderColor = "#f1c40f"; }
            this.procesarConIA(e.results[0][0].transcript);
        };
        recognition.onerror = () => { if (visual) { visual.style.transform = "scale(1)"; visual.style.borderColor = "#f1c40f"; } };
    },

    hablar: function(texto) {
        const s = new SpeechSynthesisUtterance(texto);
        s.lang = 'es-AR';
        window.speechSynthesis.speak(s);
    }
};
