// === ELEMENTOS DOM ===
const statusMsg = document.getElementById('statusMsg');
const visitsCount = document.getElementById('visitsCount');
const winsCount = document.getElementById('winsCount');
const tablaBody = document.querySelector('#tablaParticipantes tbody');

// === ACTUALIZAR CONTADORES ===
function updateCounters() {
  visitsCount.textContent = localStorage.getItem('memoryGameVisits') || 0;
  winsCount.textContent = localStorage.getItem('memoryGameWins') || 0;
}

// === MOSTRAR MENSAJE DE ESTADO ===
function showStatus(message, type = 'success') {
  statusMsg.textContent = message;
  statusMsg.className = `status status--${type}`;
}

// === RESETEAR CONTADOR ===
function resetCounter(key, label) {
  localStorage.setItem(key, 0);
  showStatus(`Contador de ${label} reseteado.`);
  updateCounters();
}

// === RESETEAR TODO ===
function resetAllCounters() {
  ['memoryGameVisits', 'memoryGameWins'].forEach(key => localStorage.setItem(key, 0));
  showStatus('Todos los contadores han sido reseteados.');
  updateCounters();
}

// === EVENTOS ===
document.getElementById('resetVisits').onclick = () => resetCounter('memoryGameVisits', 'visitas');
document.getElementById('resetWins').onclick = () => resetCounter('memoryGameWins', 'victorias');
document.getElementById('resetAll').onclick = resetAllCounters;

// === MOSTRAR TABLA DE PARTICIPANTES ===
function mostrarTablaParticipantes() {
  tablaBody.innerHTML = '';
  const tiempos = JSON.parse(localStorage.getItem('memoryGameTiempos')) || [];
  const user = JSON.parse(localStorage.getItem('memoryGameUser') || '{}');

  tiempos.forEach(({ nombre, tiempo }) => {
    tablaBody.innerHTML += `
      <tr>
        <td>${nombre || 'Desconocido'}</td>
        <td>${user.correo || '-'}</td>
        <td>${tiempo}</td>
        <td>Ganador</td>
      </tr>`;
  });

  const noGanador = user.nombre && user.correo && !tiempos.some(t => t.nombre === user.nombre);
  if (noGanador) {
    tablaBody.innerHTML += `
      <tr>
        <td>${user.nombre}</td>
        <td>${user.correo}</td>
        <td>-</td>
        <td>No Ganador</td>
      </tr>`;
  }
}

// === INICIALIZACIÓN ===
updateCounters();
mostrarTablaParticipantes();
