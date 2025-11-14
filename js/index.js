// Configuración de la API
const API_KEY = "AIzaSyBzO8F5ZxflHGzqiut-00_OBGibp-0XYBw"; // Reemplaza con tu API key de Google
//const MODEL = "gemini-2.5-flash"; // o "gemini-1.5-pro"
//const MODEL = "gemini-2.5-flash";
//const MODEL = "gemini-2.5-flash-lite";
const MODEL = "gemini-2.0-flash";


// Lista de temas
const temas = [
    "historia de Nintendo y sus consolas más icónicas",
    "saga The Legend of Zelda y su cronología",
    "evolución de los gráficos en videojuegos desde 8-bits hasta ray tracing",
    "diferencias entre géneros: RPG, FPS, MOBA, Battle Royale",
    "motores gráficos: Unity, Unreal Engine, Godot",
    "consolas de la generación actual: PS5, Xbox Series X, Nintendo Switch",
    "historia de los videojuegos arcade de los 80s",
    "saga Mario Bros y sus spin-offs",
    "Pokémon: generaciones y mecánicas de combate",
    "e-sports y juegos competitivos: League of Legends, Valorant, CS:GO",
    "realidad virtual en videojuegos: PSVR, Oculus, HTC Vive",
    "juegos indie famosos: Undertale, Hollow Knight, Celeste",
    "FromSoftware y los Souls-like: Dark Souls, Elden Ring, Bloodborne",
    "saga Final Fantasy y su impacto en los JRPG",
    "Minecraft y su influencia en los juegos de construcción",
    "Fortnite y el modelo free-to-play",
    "saga Grand Theft Auto y los juegos de mundo abierto",
    "The Witcher 3 y los RPG occidentales",
    "juegos roguelike y roguelite: diferencias y ejemplos",
    "streaming de videojuegos: Twitch, YouTube Gaming",
    "controversias en la industria: loot boxes, microtransacciones",
    "remakes y remasters: diferencias y ejemplos famosos",
    "juegos retro más valiosos para coleccionistas",
    "banda sonora en videojuegos: compositores famosos",
    "speedrunning y técnicas para completar juegos rápido",
    "easter eggs famosos en videojuegos",
    "saga Metal Gear Solid y Hideo Kojima",
    "juegos de terror: Resident Evil, Silent Hill, Amnesia",
    "plataformas de distribución digital: Steam, Epic Games Store",
    "crossplay entre diferentes plataformas"
];

// Variables para almacenar el estado actual
let preguntaActual = null;

// Función para obtener contadores de localStorage
function obtenerContadores() {
    return {
        correctas: parseInt(localStorage.getItem('correctas') || '0'),
        incorrectas: parseInt(localStorage.getItem('incorrectas') || '0')
    };
}

// Función para guardar contadores en localStorage
function guardarContadores(correctas, incorrectas) {
    localStorage.setItem('correctas', correctas.toString());
    localStorage.setItem('incorrectas', incorrectas.toString());
}

// Función para mostrar contadores en la página
function desplegarContadores() {
    const contadores = obtenerContadores();
    document.getElementById('correctas').textContent = contadores.correctas;
    document.getElementById('incorrectas').textContent = contadores.incorrectas;
}

// Función para actualizar contador
function actualizarContador(esCorrecto) {
    const contadores = obtenerContadores();
    
    if (esCorrecto) {
        contadores.correctas++;
    } else {
        contadores.incorrectas++;
    }
    
    guardarContadores(contadores.correctas, contadores.incorrectas);
    desplegarContadores();
}

// Función para obtener pregunta de la API
async function respuestaAPI() {
    const temaAleatorio = temas[Math.floor(Math.random() * temas.length)];
    
    const prompt = `Eres un experto en videojuegos. Genera una pregunta de opción múltiple sobre el siguiente tema: "${temaAleatorio}". 
    
    La pregunta debe ser interesante, no muy difícil pero tampoco muy fácil, y estar relacionada con cultura gamer, historia de videojuegos, mecánicas, sagas famosas o la industria.
    
    Proporciona cuatro opciones de respuesta (a, b, c, d) y señala cuál es la correcta. Incluye una explicación clara y educativa.
    
    Genera la pregunta en formato JSON EXACTO como los siguientes ejemplos. Tu respuesta debe contener ÚNICAMENTE el objeto JSON, sin texto adicional antes o después:
    
    Ejemplo 1:
    {
      "question": "¿En qué año se lanzó la primera consola PlayStation?",
      "options": [
        "a) 1992",
        "b) 1994",
        "c) 1996",
        "d) 1998"
      ],
      "correct_answer": "b) 1994",
      "explanation": "La PlayStation original fue lanzada por Sony en Japón el 3 de diciembre de 1994, marcando la entrada de Sony en el mercado de las consolas y revolucionando la industria con el uso de CDs en lugar de cartuchos."
    }
    
    Ejemplo 2:
    {
      "question": "¿Cuál es el nombre del protagonista de la saga The Witcher?",
      "options": [
        "a) Geralt de Rivia",
        "b) Vesemir",
        "c) Eskel",
        "d) Lambert"
      ],
      "correct_answer": "a) Geralt de Rivia",
      "explanation": "Geralt de Rivia es el protagonista principal de la saga The Witcher, creada por el autor polaco Andrzej Sapkowski. Es un cazador de monstruos profesional conocido como 'El Lobo Blanco' debido a su cabello blanco."
    }`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.25,
                    responseMimeType: "application/json"
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error HTTP ${response.status}: ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        console.log("Respuesta transformada a json:", data);

        const textResult = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        const textResultTrimmed = textResult.trim();
        const firstBraceIndex = textResultTrimmed.indexOf('{');
        const lastBraceIndex = textResultTrimmed.lastIndexOf('}');
        const jsonString = textResultTrimmed.substring(firstBraceIndex, lastBraceIndex + 1);

        if (jsonString) {
            const questionData = JSON.parse(jsonString);
            console.log(questionData);
            return questionData;
        } else {
            console.log("No se pudo extraer el texto de la respuesta.");
            return null;
        }

    } catch (error) {
        console.error("Hubo un error en la petición:", error);
        document.getElementById('question').className = 'text-danger';
        document.getElementById('question').textContent = 'Error al cargar la pregunta. Por favor, revisa la clave API o la consola.';
        return null;
    }
}
// Función para desplegar la pregunta en la página
function desplegarPregunta(datosPregunta) {
    preguntaActual = datosPregunta;
    
    // Mostrar la pregunta
    const questionElement = document.getElementById('question');
    questionElement.className = 'fs-5 fw-bold';
    questionElement.style.color = '#ffffff';
    questionElement.textContent = datosPregunta.question;
    
    // Mostrar las opciones
    const optionsContainer = document.getElementById('options');
    optionsContainer.innerHTML = '';
    
    datosPregunta.options.forEach((opcion) => {
        const button = document.createElement('button');
        button.className = 'btn btn-outline-primary btn-lg';
        button.innerHTML = `<span>${opcion}</span>`;
        button.onclick = () => verificarRespuesta(opcion);
        optionsContainer.appendChild(button);
    });
}


// Función para verificar la respuesta
function verificarRespuesta(respuestaSeleccionada) {
    const esCorrecto = respuestaSeleccionada === preguntaActual.correct_answer;
    
    // Deshabilitar todos los botones
    const botones = document.querySelectorAll('#options button');
    botones.forEach(boton => {
        boton.disabled = true;
        
        // Colorear la respuesta correcta e incorrecta
        if (boton.textContent === preguntaActual.correct_answer) {
            boton.className = 'btn btn-success btn-lg';
        } else if (boton.textContent === respuestaSeleccionada && !esCorrecto) {
            boton.className = 'btn btn-danger btn-lg';
        }
    });
    
    // Actualizar contador
    actualizarContador(esCorrecto);
    
    // Mostrar explicación
    const explanationDiv = document.createElement('div');
    explanationDiv.className = `alert ${esCorrecto ? 'alert-success' : 'alert-warning'} mt-3`;
    explanationDiv.innerHTML = `
        <strong>${esCorrecto ? '¡Correcto! ✓' : 'Incorrecto ✗'}</strong><br>
        ${preguntaActual.explanation}
    `;
    document.getElementById('question-container').appendChild(explanationDiv);
    
    // Botón para siguiente pregunta
    const nextButton = document.createElement('button');
    nextButton.className = 'btn btn-primary btn-lg mt-3';
    nextButton.textContent = 'Siguiente pregunta →';
    nextButton.onclick = cargarPregunta;
    document.getElementById('question-container').appendChild(nextButton);
}

// Función para cargar una nueva pregunta
async function cargarPregunta() {
    // Limpiar contenedor de pregunta
    document.getElementById('question-container').innerHTML = `
        <p id="question" class="fs-5 text-warning">Cargando pregunta de Gemini...</p>
        <div id="options" class="d-grid gap-2"></div>
    `;
    
    const datosPregunta = await respuestaAPI();
    console.log(datosPregunta);

    if (datosPregunta) {
        desplegarPregunta(datosPregunta);
    }
}

// Función para reiniciar contadores
function reiniciarContadores() {
    if (confirm('¿Estás seguro de que quieres reiniciar los contadores?')) {
        guardarContadores(0, 0);
        desplegarContadores();
    }
}

// Cargar contadores y la primera pregunta al iniciar
window.onload = () => {
    console.log("Página cargada y función inicial ejecutada.");
    desplegarContadores();
    cargarPregunta();
};