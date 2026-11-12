// Lista de respuestas del oráculo
const answers = [
    "SÍ",
    "NO",
    "ES CLARO QUE SÍ",
    "NO CUENTES CON ELLO",
    "PREGUNTA MÁS TARDE",
    "EL FUTURO ES INCIERTO",
    "SIN DUDA",
    "MIS FUENTES DICEN NO",
    "POCO PROBABLE",
    "CONCENTRATE Y PREGUNTA DE NUEVO"
];

const magicBall = document.getElementById('magic-ball');
const answerText = document.getElementById('answer-text');
const triangle = document.getElementById('triangle');
const questionInput = document.getElementById('question-input');
const permissionBtn = document.getElementById('permission-btn');

let isShaking = false;

// Función principal para dar la respuesta
function getPrediction() {
    if (isShaking) return;
    
    // Validar si escribieron algo
    if (questionInput.value.trim() === "") {
        alert("¡Primero debes pensar y escribir tu pregunta!");
        return;
    }

    isShaking = true;
    
    // Desvanecer la respuesta anterior mientras se sacude
    triangle.style.opacity = '0';

    // Añadir la clase de animación de sacudida
    magicBall.classList.add('shake');

    setTimeout(() => {
        // Quitar animación de sacudida
        magicBall.classList.remove('shake');
        
        // Elegir respuesta aleatoria
        const randomIndex = Math.floor(Math.random() * answers.length);
        answerText.innerText = answers[randomIndex];
        
        // Animación de aparición de la respuesta mística
        triangle.style.opacity = '0.9';
        triangle.classList.remove('fade-in');
        void triangle.offsetWidth; // Truco para reiniciar la animación CSS
        triangle.classList.add('fade-in');
        
        isShaking = false;
    }, 500); // Dura los mismos 0.5s que el CSS
}

// Opción 1: Funciona al hacer clic sobre la bola
magicBall.addEventListener('click', getPrediction);

// Opción 2: Detectar el movimiento/sacudida del celular
let lastX = null, lastY = null, lastZ = null;
const SHAKE_THRESHOLD = 15; // Qué tan fuerte hay que sacudirlo (ajustable)

function handleMotion(event) {
    let acceleration = event.accelerationIncludingGravity;
    if (!acceleration) return;

    let x = acceleration.x;
    let y = acceleration.y;
    let z = acceleration.z;

    if (lastX !== null) {
        let deltaX = Math.abs(lastX - x);
        let deltaY = Math.abs(lastY - y);
        let deltaZ = Math.abs(lastZ - z);

        // Si el cambio de movimiento supera el límite, sacudimos la bola
        if ((deltaX > SHAKE_THRESHOLD && deltaY > SHAKE_THRESHOLD) || 
            (deltaX > SHAKE_THRESHOLD && deltaZ > SHAKE_THRESHOLD) || 
            (deltaY > SHAKE_THRESHOLD && deltaZ > SHAKE_THRESHOLD)) {
            getPrediction();
        }
    }

    lastX = x;
    lastY = y;
    lastZ = z;
}

// --- SECCIÓN DE PERMISOS (Obligatorio para iPhone/iOS modernos) ---
if (window.DeviceMotionEvent) {
    // iOS 13+ requiere pedir permiso explícito mediante un clic del usuario
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
        permissionBtn.style.display = 'inline-block';
        permissionBtn.addEventListener('click', () => {
            DeviceMotionEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        window.addEventListener('devicemotion', handleMotion);
                        permissionBtn.style.display = 'none';
                    } else {
                        alert("Permiso denegado. Aún puedes jugar haciendo clic en la bola.");
                        permissionBtn.style.display = 'none';
                    }
                })
                .catch(console.error);
        });
    } else {
        // En Android u otros navegadores no hace falta pedir permiso explícito
        window.addEventListener('devicemotion', handleMotion);
    }
} else {
    console.log("El sensor de movimiento no es compatible con este dispositivo.");
}

// --- SECCIÓN DE RECONOCIMIENTO DE VOZ ---
const micBtn = document.getElementById('mic-btn');

// Verificar si el navegador es compatible con el reconocimiento de voz
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    
    // Configuración del reconocimiento
    recognition.lang = 'es-ES'; // Configurado en español
    recognition.continuous = false; // Se detiene automáticamente cuando dejas de hablar
    recognition.interimResults = false; // Solo queremos el resultado final

    // Cuando el usuario hace clic en el micrófono
    micBtn.addEventListener('click', () => {
        if (micBtn.classList.contains('listening')) {
            recognition.stop();
        } else {
            // Limpiamos el input antes de escuchar de nuevo
            questionInput.value = "";
            questionInput.placeholder = "Escuchando tu voz...";
            recognition.start();
        }
    });

    // Evento: El micrófono empieza a escuchar
    recognition.onstart = () => {
        micBtn.classList.add('listening');
        micBtn.innerHTML = "🛑"; // Cambia el ícono a stop mientras escucha
    };

    // Evento: El micrófono se apaga
    recognition.onend = () => {
        micBtn.classList.remove('listening');
        micBtn.innerHTML = "🎤";
        if (questionInput.value === "") {
            questionInput.placeholder = "¿Aprobaré el examen?...";
        }
    };

    // Evento: Procesar lo que escuchó y escribirlo
    recognition.onresult = (event) => {
        const textResult = event.results[0][0].transcript;
        
        // Formatear un poco el texto (Primera letra mayúscula y signo de pregunta)
        let formattedText = textResult.charAt(0).toUpperCase() + textResult.slice(1);
        if (!formattedText.startsWith('¿')) formattedText = '¿' + formattedText;
        if (!formattedText.endsWith('?')) formattedText = formattedText + '?';

        // Insertar el texto en la casilla automáticamente
        questionInput.value = formattedText;
        
        // ¡Opcional! Si quieres que la bola responda AUTOMÁTICAMENTE justo al terminar de hablar,
        // puedes descomentar la siguiente línea:
        // getPrediction();
    };

    // Control de errores (por ejemplo, si el usuario no dice nada)
    recognition.onerror = (event) => {
        console.log("Error de reconocimiento de voz: ", event.error);
        micBtn.classList.remove('listening');
        micBtn.innerHTML = "🎤";
    };

} else {
    // Si el navegador no lo soporta (ej. navegadores muy viejos o algunos internos de apps)
    micBtn.style.display = 'none';
    console.log("El reconocimiento de voz no es compatible con este navegador.");
}