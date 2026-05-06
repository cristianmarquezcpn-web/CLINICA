/**
 * DOMINGUITO CORE V1.0
 * Sistema de inteligencia centralizada para Clínica SAEI
 */
// 1. CONFIGURACIÓN DE FIREBASE (EXTERNA)
const firebaseConfig = {
  apiKey: "AIzaSyAugXXx_b_wKFByhDbLZslk2HA_UTzrzd8",
  authDomain: "clinicaintegral-5c488.firebaseapp.com",
  databaseURL: "https://clinicaintegral-5c488-default-rtdb.firebaseio.com",
  projectId: "clinicaintegral-5c488",
  storageBucket: "clinicaintegral-5c488.firebasestorage.app",
  messagingSenderId: "184090967634",
  appId: "1:184090967634:web:09715937b33ea48288698b"
};

// Inicializar Firebase ANTES de Dominguito
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// 2. NÚCLEO DE DOMINGUITO
window.Dominguito = { // <--- ¡ESTA LLAVE ES LA QUE FALTABA!
    // 1. CONFIGURACIÓN DE CONEXIÓN
    serverUrl: "https://dominguito-san-juan.vercel.app/v1/chat/completions",
    db: firebase.database(),

    // 2. PROCESAMIENTO CON IA
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
}; // <--- Cierre del objeto
