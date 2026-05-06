// --- NÚCLEO DE DOMINGUITO (Tus funciones originales, sin cambios de nombre) ---
window.Dominguito = {
    serverUrl: "https://dominguito-san-juan.vercel.app/api/chat", 
    db: (typeof firebase !== "undefined") ? firebase.database() : null,

    // TU FUNCIÓN ORIGINAL
    toggleInput: function() {
        const box = document.getElementById('dominguito-input-box');
        const input = document.getElementById('dominguito-texto');
        if(!box) return;
        box.style.display = (box.style.display === 'none') ? 'block' : 'none';
        if(box.style.display === 'block') input.focus();
    },

    // TU FUNCIÓN ORIGINAL
    escuchar: function() {
        console.log("Escuchando...");
        const container = document.getElementById('dominguito-container');
        const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!Speech) return alert("Navegador no compatible.");

        const rec = new Speech();
        rec.lang = 'es-AR';
        container.classList.add('dominguito-escuchando');
        
        rec.start();
        rec.onresult = (e) => this.procesarConIA(e.results[0][0].transcript);
        rec.onend = () => container.classList.remove('dominguito-escuchando');
        rec.onerror = () => container.classList.remove('dominguito-escuchando');
    },

    procesarConIA: async function(mensaje) {
        if(!mensaje) return;
        this.hablar("Procesando...");
        try {
            const res = await fetch(this.serverUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: mensaje })
            });
            const data = await res.json();
            
            if (data.accion && data.ruta && this.db) {
                const ref = this.db.ref(data.ruta);
                data.metodo === 'set' ? await ref.set(data.payload) : await ref.push(data.payload);
            }
            this.hablar(data.respuesta || "Listo");
        } catch (e) {
            console.error("Error Dominguito:", e);
            this.hablar("Error de conexión.");
        }
    },

    hablar: function(texto) {
        const s = new SpeechSynthesisUtterance(texto);
        s.lang = 'es-AR';
        window.speechSynthesis.speak(s);
    }
};

// --- EL PARCHE PARA EL CELULAR (Sin tocar las funciones de arriba) ---
const visualDom = document.getElementById("dominguito-visual");
let timerCelular;

if (visualDom) {
    // Para el Celular: Si mantiene apretado, llama a TU función escuchar()
    visualDom.addEventListener("touchstart", (e) => {
        timerCelular = setTimeout(() => {
            window.Dominguito.escuchar(); 
        }, 700); // 700ms manteniendo el dedo
    }, {passive: true});

    visualDom.addEventListener("touchend", () => {
        clearTimeout(timerCelular);
    });

    // El clic normal sigue abriendo tu teclado
    visualDom.onclick = () => window.Dominguito.toggleInput();
    
    // El doble clic sigue funcionando en PC
    visualDom.ondblclick = () => window.Dominguito.escuchar();
}
