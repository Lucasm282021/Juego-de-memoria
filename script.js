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

// Modal de usuario
const userModal = document.getElementById('userModal');
const userForm = document.getElementById('userForm');
const userNameInput = document.getElementById('userName');
const userEmailInput = document.getElementById('userEmail');

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
    // Obtener nombre y correo del usuario
    let user = JSON.parse(localStorage.getItem('memoryGameUser') || '{}');
    // Validar datos
    let nombre = typeof user.nombre === 'string' && user.nombre.trim() ? user.nombre.trim() : 'Desconocido';
    let correo = typeof user.correo === 'string' && user.correo.trim() ? user.correo.trim() : '-';
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

    // Obtener tiempo de juego desde localStorage o usar 30s por defecto
    let tiempoJuego = parseInt(localStorage.getItem('memoryGameTime')) || 30;
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
    }, tiempoJuego * 1000);
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
        tablaTiempos.innerHTML = '<tr><td colspan="3">No hay tiempos registrados.</td></tr>';
    } else {
        tiempos.forEach((t, i) => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${i+1}</td><td>${t.nombre || 'Desconocido'}</td><td>${t.tiempo}</td>`;
            tablaTiempos.appendChild(row);
        });
    }
    tablaTiemposModal.style.display = 'flex';
});

cerrarTablaTiempos.addEventListener('click', () => {
    tablaTiemposModal.style.display = 'none';
});
// Mostrar modal al hacer click en "Nuevo Juego"
startButton.addEventListener('click', () => {
    userModal.style.display = 'flex';
    userNameInput.value = '';
    userEmailInput.value = '';
    userNameInput.focus();
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

// Validar y aceptar datos del usuario
userForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const nombre = userNameInput.value.trim();
    const correo = userEmailInput.value.trim();
    if (!nombre || !correo || !correo.match(/^\S+@\S+\.\S+$/)) {
        alert('Por favor ingresa un nombre y un correo electrónico válido.');
        return;
    }
    localStorage.setItem('memoryGameUser', JSON.stringify({ nombre, correo }));
    userModal.style.display = 'none';
    // Iniciar el juego
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
// === INICIO ===
updateVisitCount();
loadCounters();
initGame();

