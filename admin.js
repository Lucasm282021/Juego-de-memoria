const statusMsg = document.getElementById('statusMsg');
const visitsCount = document.getElementById('visitsCount');
const winsCount = document.getElementById('winsCount');

function updateCounters() {
    visitsCount.textContent = localStorage.getItem('memoryGameVisits') || 0;
    winsCount.textContent = localStorage.getItem('memoryGameWins') || 0;
}

document.getElementById('resetVisits').onclick = () => {
    localStorage.setItem('memoryGameVisits', 0);
    statusMsg.textContent = 'Contador de visitas reseteado.';
    updateCounters();
};

document.getElementById('resetWins').onclick = () => {
    localStorage.setItem('memoryGameWins', 0);
    statusMsg.textContent = 'Contador de victorias reseteado.';
    updateCounters();
};

document.getElementById('resetAll').onclick = () => {
    localStorage.setItem('memoryGameVisits', 0);
    localStorage.setItem('memoryGameWins', 0);
    statusMsg.textContent = 'Todos los contadores han sido reseteados.';
    updateCounters();
};

document.getElementById('volverJuego').onclick = () => {
    localStorage.setItem('memoryGameWins', 0);
    statusMsg.textContent = 'Contador de victorias reseteado.';
    updateCounters();
    window.location.href = 'index.html'; // Redirección al index
};

// Inicializar valores al cargar
updateCounters();
