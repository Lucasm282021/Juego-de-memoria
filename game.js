const logos = [
    'Del_Click.png', 'Del_Click.png',
    'Ransomware.png', 'Ransomware.png',
    'ISFDyT26.png', 'ISFDyT26.png',
    'Phishing.png', 'Phishing.png',
    'LogoDS.png', 'LogoDS.png',
    'Scareware.png', 'Scareware.png',
    'Spyware.png', 'Spyware.png',
    'Spoofing.png', 'Spoofing.png'
];

let gameAudio = null;
let shuffledLogos = [];
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matchedPairs = 0;
let gameStarted = false;

let timerInterval;
let millisecondsRemaining = 0;

const gameBoard = document.getElementById('gameBoard');
const timeCounterEl = document.getElementById('timeCounter');
const resetButton = document.getElementById('resetButton');
const loseSound = new Audio('sound/negative_beeps-6008.mp3'); // Reemplazá con la ruta real
const closeUserModal = document.getElementById('closeUserModal');
const tickSound = new Audio('sound/clock-tick.mp3'); // Asegúrate de tener este archivo de sonido
tickSound.loop = true;
const winSound = new Audio('sound/win.mp3'); // Reemplazá con la ruta real

// === CONTADORES ===
function updateVisitCount() {
    let visits = localStorage.getItem('memoryGameVisits') || 0;
    visits++;
    localStorage.setItem('memoryGameVisits', visits);
}

// === TIEMPOS DE GANADORES ===
function guardarTiempoGanador(tiempo) {
    let tiempos = JSON.parse(localStorage.getItem('memoryGameTiempos')) || [];
    // Obtener nombre y correo del usuario
    let user = JSON.parse(localStorage.getItem('memoryGameUser') || '{}');
    // Validar datos
    let nombre = typeof user.nombre === 'string' && user.nombre.trim() ? user.nombre.trim() : 'Desconocido';
    let correo = user.correo || '-'; // Usar el valor guardado o un guion
    let tiempoValido = typeof tiempo === 'string' && tiempo.trim() ? tiempo.trim() : '00:00:00';
    tiempos.push({ nombre, correo, tiempo: tiempoValido });
    localStorage.setItem('memoryGameTiempos', JSON.stringify(tiempos));
}

function obtenerTiemposGanadores() {
    return JSON.parse(localStorage.getItem('memoryGameTiempos')) || [];
}

function updateWinCount() {
    let wins = localStorage.getItem('memoryGameWins') || 0;
    wins++;
    localStorage.setItem('memoryGameWins', wins);
}

// === TEMPORIZADOR ===
function formatTime(ms) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const hundredths = Math.floor((ms % 1000) / 10);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(hundredths).padStart(2, '0')}`;
}

function startTimer() {
    clearInterval(timerInterval);
    tickSound.pause(); // Asegurarse de que el tic-tac esté detenido al inicio
    timeCounterEl.parentElement.classList.remove('low-time'); // Limpiar estado visual

    // Obtener tiempo de juego desde localStorage o usar 30s por defecto
    let tiempoJuego = parseInt(localStorage.getItem('memoryGameTime')) || 30;
    millisecondsRemaining = tiempoJuego * 1000;
    timeCounterEl.textContent = formatTime(millisecondsRemaining);

    let isTicking = false;
    timerInterval = setInterval(() => {
        millisecondsRemaining -= 10;
        timeCounterEl.textContent = formatTime(millisecondsRemaining);

        // Añadir clase y sonido cuando queden 5 segundos o menos
        if (millisecondsRemaining > 0 && millisecondsRemaining <= 5000) {
            timeCounterEl.parentElement.classList.add('low-time');
            if (!isTicking) {
                tickSound.play();
                isTicking = true;
            }
        }

        if (millisecondsRemaining <= 0) {
            stopTimer();
            gameStarted = false;
            // Detener audio al perder
            if (gameAudio) {
                gameAudio.pause();
                gameAudio.currentTime = 0;
            }
            // Detener sonido de tic-tac
            tickSound.pause();
            tickSound.currentTime = 0;
            // Reproducir sonido de derrota
            loseSound.currentTime = 0;
            loseSound.play();
            document.getElementById('loseModal').style.display = 'flex';
        }
    }, 10);
}

function stopTimer() {
    clearInterval(timerInterval);
    tickSound.pause();
    tickSound.currentTime = 0;
}

function resetTimer() {
    stopTimer();
    timeCounterEl.parentElement.classList.remove('low-time');
    tickSound.pause();
    let tiempoJuego = parseInt(localStorage.getItem('memoryGameTime')) || 30;
    millisecondsRemaining = tiempoJuego * 1000;
    timeCounterEl.textContent = '00:00:00';
}

// === INICIALIZACIÓN DEL JUEGO ===
function initGame() {
    gameBoard.innerHTML = '';
    shuffledLogos = logos.sort(() => 0.5 - Math.random());
    matchedPairs = 0;
    firstCard = null;
    secondCard = null;
    lockBoard = false;

    shuffledLogos.forEach((logoFile) => {
        const card = document.createElement('div');
        card.classList.add('memory-card'); // sin 'memory-card--flipped'
        card.innerHTML = `
        <div class="memory-card__inner">
            <div class="memory-card__front no-select">?</div>
            <div class="memory-card__back">
            <img src="logos/${logoFile}" alt="Logo" class="memory-card__image" />
            </div>
        </div>
        `;
        card.addEventListener('click', () => flipCard(card));
        gameBoard.appendChild(card);
    });
}

// === LÓGICA DE EMPAREJAMIENTO ===
function flipCard(card) {
    if (!gameStarted || lockBoard || card.classList.contains('memory-card--flipped')) return;

    card.classList.add('memory-card--flipped');

    if (!firstCard) {
        firstCard = card;
        return;
    }

    secondCard = card;

    const firstLogo = firstCard.querySelector('.memory-card__back img').getAttribute('src');
    const secondLogo = secondCard.querySelector('.memory-card__back img').getAttribute('src');

    if (firstLogo === secondLogo) {
        matchedPairs++;
        firstCard = null;
        secondCard = null;

        if (matchedPairs === logos.length / 2) {
        updateWinCount();
        stopTimer();
        // Detener audio al ganar
        if (gameAudio) {
            gameAudio.pause();
            gameAudio.currentTime = 0;
            // Reproducir sonido de victoria
            winSound.currentTime = 0;
            winSound.play();
        }
        setTimeout(() => {
            const tiempoFinal = formatTime(millisecondsRemaining); // Aunque se detiene, usamos el valor restante para calcular el tiempo
            guardarTiempoGanador(tiempoFinal);

            // Calcular el tiempo que tardó el jugador
            const tiempoJuego = parseInt(localStorage.getItem('memoryGameTime')) || 30;
            const tiempoTomadoMs = (tiempoJuego * 1000) - millisecondsRemaining;
            const tiempoTomadoFormateado = formatTime(tiempoTomadoMs);

            // Obtener ranking actualizado
            const tiempos = obtenerTiemposGanadores();
            const parseTime = (str) => {
                if (!str || !str.includes(':') || !str.includes('.')) return -1;
                const [min, secAndHundredths] = str.split(':');
                const [sec, hundredths] = secAndHundredths.split('.');
                return (parseInt(min) * 60 * 1000) + (parseInt(sec) * 1000) + (parseInt(hundredths) * 10);
            };

            const tiemposOrdenados = tiempos
                .filter(t => t.tiempo && t.tiempo.includes(':'))
                .sort((a, b) => parseTime(b.tiempo) - parseTime(a.tiempo)); // Orden descendente: más tiempo restante es mejor

            const user = JSON.parse(localStorage.getItem('memoryGameUser') || '{}');
            const posicion = tiemposOrdenados.findIndex(t => t.nombre === user.nombre) + 1;

            // Mostrar modal con datos
            const winModal = document.getElementById('winModal');
            const winMessage = document.getElementById('winMessage');
            winMessage.innerHTML = `
                Has emparejado todos los logos.<br>
                <span class="win-highlight win-highlight--tiempo">⏱️ Tu tiempo: ${tiempoTomadoFormateado}</span>
                <span class="win-highlight win-highlight--posicion">🏅 Posición en el ranking: ${posicion}</span>
                `;
                winModal.style.display = 'flex';
            }, 300);
        }
    } else {
        lockBoard = true;
        setTimeout(() => {
        firstCard.classList.remove('memory-card--flipped');
        secondCard.classList.remove('memory-card--flipped');
        firstCard = null;
        secondCard = null;
        lockBoard = false;
        }, 1000);
    }
}

// === EVENTOS ===
const aceptarButton = document.getElementById('AceptarButton');
const aceptarWinButton = document.getElementById('winAcceptButton');

aceptarButton.addEventListener('click', () => {
    // Detener audio al volver al menú
    if (gameAudio) {
        gameAudio.pause();
        gameAudio.currentTime = 0;
    }
    // Redirigir al menú principal
    window.location.href = 'index.html';
});


aceptarWinButton.addEventListener('click', () => {
    // Detener audio al volver al menú
    if (gameAudio) {
        gameAudio.pause();
        gameAudio.currentTime = 0;
    }
    // Redirigir al menú principal
    window.location.href = 'index.html';
});

resetButton.addEventListener('click', (e) => {
    // Detener audio al reiniciar
    if (gameAudio) {
        gameAudio.pause();
        gameAudio.currentTime = 0;
    }
    // No prevenimos la navegación por defecto del enlace (e.preventDefault())
});

function startGame() {
    updateVisitCount();
    initGame();
    startTimer();
    gameStarted = true;

    const musicState = localStorage.getItem('memoryGameMusic') || 'on';
    if (musicState === 'off') return; // No reproducir música si está desactivada

    if (gameAudio) {
        gameAudio.pause();
        gameAudio.currentTime = 0;
    }
    // Solo crea y reproduce el audio si no existe ya
    if (!gameAudio) {
        gameAudio = new Audio('sound/cort_infantilanimada_dm-248977.mp3');
        gameAudio.loop = true;
    }
    gameAudio.play().catch(error => console.log("La reproducción automática fue bloqueada por el navegador.", error));
}

// === INICIO ===
startGame();
