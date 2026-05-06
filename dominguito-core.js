window.Dominguito = { 
    serverUrl: "https://dominguito-san-juan.vercel.app/v1/chat/completions",
    db: (typeof firebase !== "undefined") ? firebase.database() : null,

    // 1. NUEVA FUNCIÓN PARA VINCULAR EL CELULAR
    iniciar: function() {
        const visual = document.getElementById('dominguito-visual');
        if (!visual) return;

        let tiempoPresionado;

        // Detectar toque largo en celular
        visual.addEventListener('touchstart', (e) => {
            tiempoPresionado = setTimeout(() => {
                this.escuchar(); 
            }, 600); // Si mantiene el dedo 0.6 segundos, activa micro
        }, {passive: true});

        visual.addEventListener('touchend', () => {
            clearTimeout(tiempoPresionado);
        });

        // Click simple para el teclado (PC y Celular)
        visual.onclick = () => {
            const box = document.getElementById('dominguito-input-box');
            if(box) box.style.display = (box.style.display === 'none') ? 'block' : 'none';
        };
        
        // Doble click para PC
        visual.ondblclick = () => this.escuchar();
    },

    procesarConIA: async function(mensaje, archivo = null) {
        if (!mensaje) return;
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

            const data = await response.json();
            
            if (data.accion && data.ruta && this.db) {
                await this.ejecutarAccion(data.ruta, data.payload, data.metodo === 'set');
            }

            const respuestaTexto = data.choices ? data.choices[0].message.content : (data.respuesta || "Listo");
            this.hablar(respuestaTexto);
            
        } catch (e) {
            this.hablar("Error de conexión.");
        }
    },

    ejecutarAccion: async function(ruta, datos, esSet = false) {
        try {
            const ref = this.db.ref(ruta);
            if (esSet) { await ref.set(datos); } else { await ref.push(datos); }
        } catch (error) {
            console.error("Error DB:", error);
        }
    },

    escuchar: function() {
        const visual = document.getElementById('dominguito-visual');
        const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!Rec) return alert("Navegador no compatible.");
        
        const recognition = new Rec();
        recognition.lang = 'es-AR'; 
        
        // Efecto visual de escucha
        if (visual) { 
            visual.style.border = "5px solid #2ecc71"; 
            visual.style.boxShadow = "0 0 15px #2ecc71";
        }
        
        recognition.start();
        
        recognition.onresult = (e) => {
            this.procesarConIA(e.results[0][0].transcript);
        };

        recognition.onend = () => {
            if (visual) { 
                visual.style.border = "4px solid #1a2a6c";
                visual.style.boxShadow = "none";
            }
        };
    },

    hablar: function(texto) {
        const s = new SpeechSynthesisUtterance(texto);
        s.lang = 'es-AR';
        window.speechSynthesis.speak(s);
    }
};

// 2. ACTIVAR AL CARGAR LA PÁGINA
setTimeout(() => window.Dominguito.iniciar(), 1000);
