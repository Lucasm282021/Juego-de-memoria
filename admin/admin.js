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

// Borrar tabla de participantes
document.getElementById('deleteTable').onclick = function() {
  localStorage.removeItem('memoryGameTiempos');
  showStatus('Tabla de participantes borrada.', 'success');
  mostrarTablaParticipantes();
};

// Exportar tabla a Excel manualmente
document.getElementById('exportExcel').onclick = exportarExcel;

// Guardar tiempo de juego
const gameTimeInput = document.getElementById('gameTime');
const saveGameTimeBtn = document.getElementById('saveGameTime');
// Cargar tiempo guardado al iniciar
if(localStorage.getItem('memoryGameTime')) {
  gameTimeInput.value = localStorage.getItem('memoryGameTime');
}
saveGameTimeBtn.onclick = function() {
  let tiempo = parseInt(gameTimeInput.value);
  if(isNaN(tiempo) || tiempo < 10 || tiempo > 300) {
    showStatus('El tiempo debe estar entre 10 y 300 segundos.', 'error');
    return;
  }
  localStorage.setItem('memoryGameTime', tiempo);
  showStatus('Tiempo de juego actualizado a ' + tiempo + ' segundos.', 'success');
};

// Exportar tabla a Excel
function exportarExcel() {
  const tiempos = JSON.parse(localStorage.getItem('memoryGameTiempos')) || [];
  let csv = 'Nombre,Correo,Tiempo,Ganador\n';
  tiempos.forEach((t) => {
    csv += `${t.nombre || 'Desconocido'},${t.correo || '-'},${t.tiempo},Ganador\n`;
  });
  // Descargar archivo
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'resultados_memoria.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showStatus('Archivo Excel exportado correctamente.', 'success');
}

// Generar archivo Excel automáticamente al iniciar
// La exportación solo se realiza al presionar el botón Exportar Excel
// Actualizar la página admin cada vez que se inicia un nuevo juego
window.addEventListener('storage', function(e) {
  if (e.key === 'memoryGameTiempos') {
    location.reload();
  }
});

// === MOSTRAR TABLA DE PARTICIPANTES ===
function mostrarTablaParticipantes() {
  tablaBody.innerHTML = '';
  const tiempos = JSON.parse(localStorage.getItem('memoryGameTiempos')) || [];
  const user = JSON.parse(localStorage.getItem('memoryGameUser') || '{}');

  tiempos.forEach(({ nombre, correo, tiempo }) => {
    tablaBody.innerHTML += `
      <tr>
        <td>${nombre || 'Desconocido'}</td>
        <td>${correo || '-'}</td>
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
