const logos = [
    'Del_Click.png', 'Del_Click.png',
    'Ransomware.png', 'Ransomware.png',
    'ISFDyT26.png', 'ISFDyT26.png',
    'Phishing.png', 'Phishing.png',
    'LogoDS.png', 'LogoDS.png',
    'LogoDS.png', 'LogoDS.png',
    'LogoDS.png', 'LogoDS.png',
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
let millisecondsElapsed = 0;
let loseTimeout = null;

const gameBoard = document.getElementById('gameBoard');
const visitCountEl = document.getElementById('visitCount');
const winCountEl = document.getElementById('winCount');
const timeCounterEl = document.getElementById('timeCounter');
const resetButton = document.getElementById('resetButton');
const startButton = document.getElementById('startButton');
const loseSound = new Audio('sound/negative_beeps-6008.mp3'); // Reemplazá con la ruta real
const winSound = new Audio('sound/win.mp3'); // Reemplazá con la ruta real

// === CONTADORES ===
function updateVisitCount() {
    let visits = localStorage.getItem('memoryGameVisits') || 0;
    visits++;
    localStorage.setItem('memoryGameVisits', visits);
    visitCountEl.textContent = visits;
}

// === TIEMPOS DE GANADORES ===
function guardarTiempoGanador(tiempo) {
    let tiempos = JSON.parse(localStorage.getItem('memoryGameTiempos')) || [];
    tiempos.push(tiempo);
    localStorage.setItem('memoryGameTiempos', JSON.stringify(tiempos));
}

function obtenerTiemposGanadores() {
    return JSON.parse(localStorage.getItem('memoryGameTiempos')) || [];
}

function updateWinCount() {
    let wins = localStorage.getItem('memoryGameWins') || 0;
    wins++;
    localStorage.setItem('memoryGameWins', wins);
    winCountEl.textContent = wins;
}

function loadCounters() {
    visitCountEl.textContent = localStorage.getItem('memoryGameVisits') || 0;
    winCountEl.textContent = localStorage.getItem('memoryGameWins') || 0;
}

// === TEMPORIZADOR ===
function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = ms % 1000;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(milliseconds).padStart(3, '0')}`;
}

function startTimer() {
    clearInterval(timerInterval);
    clearTimeout(loseTimeout);
    millisecondsElapsed = 0;
    timeCounterEl.textContent = formatTime(millisecondsElapsed);

    timerInterval = setInterval(() => {
        millisecondsElapsed += 10;
        timeCounterEl.textContent = formatTime(millisecondsElapsed);
    }, 10);

    // Si pasan 30 segundos, el jugador pierde
    loseTimeout = setTimeout(() => {
        stopTimer();
        gameStarted = false;
        // Detener audio al perder
        if (gameAudio) {
            gameAudio.pause();
            gameAudio.currentTime = 0;
        }
        // Reproducir sonido de derrota
        loseSound.currentTime = 0;
        loseSound.play();
        alert('¡Tiempo agotado! Has perdido el juego.');
        initGame();
    }, 30000); // 60000 ms = 60 segundos
}

function stopTimer() {
    clearInterval(timerInterval);
    clearTimeout(loseTimeout);
}

function resetTimer() {
    stopTimer();
    millisecondsElapsed = 0;
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
            <div class="memory-card__front">?</div>
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
            const tiempoFinal = formatTime(millisecondsElapsed);
            guardarTiempoGanador(tiempoFinal);
            alert(`¡Victoria! Has emparejado todos los logos.\nTiempo logrado: ${tiempoFinal}`);
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
const tablaButton = document.getElementById('tablaButton');
const tablaTiemposModal = document.getElementById('tablaTiemposModal');
const cerrarTablaTiempos = document.getElementById('cerrarTablaTiempos');
const tablaTiempos = document.getElementById('tablaTiempos').getElementsByTagName('tbody')[0];

tablaButton.addEventListener('click', () => {
    // Mostrar la tabla modal
    const tiempos = obtenerTiemposGanadores();
    tablaTiempos.innerHTML = '';
    if (tiempos.length === 0) {
        tablaTiempos.innerHTML = '<tr><td colspan="2">No hay tiempos registrados.</td></tr>';
    } else {
        tiempos.forEach((t, i) => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${i+1}</td><td>${t}</td>`;
            tablaTiempos.appendChild(row);
        });
    }
    tablaTiemposModal.style.display = 'flex';
});

cerrarTablaTiempos.addEventListener('click', () => {
    tablaTiemposModal.style.display = 'none';
});
startButton.addEventListener('click', () => {
    resetTimer();
    startTimer();
    gameStarted = true;
    initGame();

    // Reproducir audio al iniciar el juego
    if (gameAudio) {
        gameAudio.pause();
        gameAudio.currentTime = 0;
    }
    gameAudio = new Audio('sound/cort_infantilanimada_dm-248977.mp3');
    gameAudio.loop = true;
    gameAudio.play();
});

resetButton.addEventListener('click', () => {
    resetTimer();
    gameStarted = false;
    initGame();
    // Detener audio al reiniciar
    if (gameAudio) {
        gameAudio.pause();
        gameAudio.currentTime = 0;
    }
});

// === INICIO ===

// === LOGIN CON QR ===
const loginModal = document.getElementById('loginModal');
const qrCanvas = document.getElementById('qrCanvas');
const codigoForm = document.getElementById('codigoForm');
const codigoInput = document.getElementById('codigoInput');
const loginMsg = document.getElementById('loginMsg');

function mostrarQR() {
    // Generar QR con la URL del formulario
    const url = window.location.origin + window.location.pathname.replace('index.html','login.html');
    const qr = new QRious({
        element: qrCanvas,
        value: url,
        size: 180
    });
}

function loginHabilitado() {
    return localStorage.getItem('memoryGameLoginToken') && localStorage.getItem('memoryGameUser');
}

function habilitarJuego() {
    loginModal.style.display = 'none';
    updateVisitCount();
    loadCounters();
    initGame();
    // Habilitar botones
    startButton.disabled = false;
    resetButton.disabled = false;
    tablaButton.disabled = false;
}

function deshabilitarJuego() {
    loginModal.style.display = 'flex';
    startButton.disabled = true;
    resetButton.disabled = true;
    tablaButton.disabled = true;
}

if(loginHabilitado()) {
    habilitarJuego();
} else {
    deshabilitarJuego();
    mostrarQR();
}

codigoForm.onsubmit = function(e) {
    e.preventDefault();
    const tokenIngresado = codigoInput.value.trim();
    const user = JSON.parse(localStorage.getItem('memoryGameUser') || '{}');
    if(tokenIngresado && user.token === tokenIngresado) {
        habilitarJuego();
        loginMsg.textContent = '¡Acceso concedido!';
    } else {
        loginMsg.textContent = 'Código incorrecto.';
    }
};
