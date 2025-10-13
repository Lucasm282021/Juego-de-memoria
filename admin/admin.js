document.addEventListener('DOMContentLoaded', () => {
    // === ELEMENTOS DOM ===
    const statusMsg = document.getElementById('statusMsg');
    const visitsCount = document.getElementById('visitsCount');
    const winsCount = document.getElementById('winsCount');
    const tablaBody = document.querySelector('#tablaParticipantes tbody');
    const gameTimeInput = document.getElementById('gameTime');
    const alertTimeInput = document.getElementById('alertTime');
    const saveChangesBtn = document.getElementById('saveChangesBtn');
    const passwordConfirmModal = document.getElementById('passwordConfirmModal');
    const passwordConfirmForm = document.getElementById('passwordConfirmForm');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const closePasswordModal = document.getElementById('closePasswordModal');
    const imageManagementGrid = document.getElementById('imageManagementGrid');
    const imageUploader = document.getElementById('imageUploader');

    // === FUNCIONES AUXILIARES ===
    function showStatus(message, type = 'success') {
        statusMsg.textContent = message;
        statusMsg.className = `admin-panel__status status--${type}`;
        setTimeout(() => {
            statusMsg.textContent = '';
            statusMsg.className = 'admin-panel__status';
        }, 3000);
    }

    function updateCounters() {
        visitsCount.textContent = localStorage.getItem('memoryGameVisits') || 0;
        winsCount.textContent = localStorage.getItem('memoryGameWins') || 0;
    }

    function loadInitialGameTime() {
        if (localStorage.getItem('memoryGameTime')) {
            gameTimeInput.value = localStorage.getItem('memoryGameTime');
        }
        if (localStorage.getItem('memoryGameAlertTime')) {
            alertTimeInput.value = localStorage.getItem('memoryGameAlertTime');
        }
    }

    // === LÓGICA DE LA TABLA ===
    function mostrarTablaParticipantes() {
        tablaBody.innerHTML = '';
        const tiempos = JSON.parse(localStorage.getItem('memoryGameTiempos')) || [];

        const parseTime = (str) => {
            if (!str || !str.includes(':') || !str.includes('.')) return -1;
            const [min, secAndHundredths] = str.split(':');
            const [sec, hundredths] = secAndHundredths.split('.');
            return (parseInt(min) * 60 * 1000) + (parseInt(sec) * 1000) + (parseInt(hundredths) * 10);
        };

        const tiemposOrdenados = tiempos
            .filter(t => t.tiempo)
            .sort((a, b) => parseTime(b.tiempo) - parseTime(a.tiempo)); // Orden descendente

        if (tiemposOrdenados.length === 0) {
            tablaBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay datos de participantes.</td></tr>';
            return;
        }

        tiemposOrdenados.forEach(({ nombre, correo, tiempo }, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${nombre || 'Desconocido'}</td>
                <td>${correo || '-'}</td>
                <td>${tiempo || 'N/A'}</td>
                <td>Ganador</td>
            `;
            tablaBody.appendChild(row);
        });
    }

    // === LÓGICA DE IMÁGENES ===
    function mostrarImagenesJuego() {
        imageManagementGrid.innerHTML = '';
        const defaultImages = [
            'Del_Click.png', 'Ransomware.png', 'ISFDyT26.png', 'Phishing.png',
            'LogoDS.png', 'Scareware.png', 'Spyware.png', 'Spoofing.png'
        ];
        const images = JSON.parse(localStorage.getItem('memoryGameImages')) || defaultImages;

        images.forEach((imageName, index) => {
            const imageCard = document.createElement('div');
            imageCard.className = 'image-card';
            imageCard.innerHTML = `
                <img src="../logos/${imageName}" alt="${imageName}" class="image-card__preview">
                <input type="text" value="${imageName}" class="image-card__input" data-index="${index}" readonly>
                <button class="image-card__change-btn" data-index="${index}">Cambiar</button>
            `;
            imageManagementGrid.appendChild(imageCard);
        });

        // Si era la primera vez, guardar las imágenes por defecto
        if (!localStorage.getItem('memoryGameImages')) {
            localStorage.setItem('memoryGameImages', JSON.stringify(images));
        }
    }

    // --- LÓGICA DE CAMBIO DE IMAGEN ---
    let activeImageInput = null;
    let activeImagePreview = null;

    imageManagementGrid.addEventListener('click', (e) => {
        if (e.target.classList.contains('image-card__change-btn')) {
            const index = e.target.dataset.index;
            activeImageInput = document.querySelector(`.image-card__input[data-index="${index}"]`);
            activeImagePreview = e.target.closest('.image-card').querySelector('.image-card__preview');
            imageUploader.click(); // Abre el explorador de archivos
        }
    });

    imageUploader.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && activeImageInput && activeImagePreview) {
            activeImageInput.value = file.name;
            activeImagePreview.src = URL.createObjectURL(file);
        }
    });

    // === EVENT LISTENERS ===
    document.getElementById('returnGame').addEventListener('click', () => {
        window.location.href = '../index.html';
    });

    document.getElementById('resetVisits').addEventListener('click', () => {
        localStorage.setItem('memoryGameVisits', 0);
        showStatus('Contador de visitas reseteado.');
        updateCounters();
    });

    document.getElementById('resetWins').addEventListener('click', () => {
        localStorage.setItem('memoryGameWins', 0);
        showStatus('Contador de victorias reseteado.');
        updateCounters();
    });

    document.getElementById('resetAll').addEventListener('click', () => {
        localStorage.setItem('memoryGameVisits', 0);
        localStorage.setItem('memoryGameWins', 0);
        showStatus('Todos los contadores han sido reseteados.');
        updateCounters();
    });

    document.getElementById('deleteTable').addEventListener('click', () => {
        if (confirm('¿Estás seguro de que quieres borrar toda la tabla de tiempos? Esta acción no se puede deshacer.')) {
            localStorage.removeItem('memoryGameTiempos');
            showStatus('Tabla de participantes borrada.', 'success');
            mostrarTablaParticipantes();
        }
    });

    // --- LÓGICA DE GUARDAR CAMBIOS ---
    function applyChanges() {
        // Guardar tiempo de juego
        let tiempo = parseInt(gameTimeInput.value);
        if (isNaN(tiempo) || tiempo < 10 || tiempo > 300) {
            showStatus('El tiempo debe estar entre 10 y 300 segundos.', 'error');
            return;
        }
        localStorage.setItem('memoryGameTime', tiempo);

        // Guardar tiempo de alerta
        let tiempoAlerta = parseInt(alertTimeInput.value);
        if (isNaN(tiempoAlerta) || tiempoAlerta < 1 || tiempoAlerta > 60) {
            showStatus('El tiempo de alerta debe estar entre 1 y 60 segundos.', 'error');
            return;
        }
        localStorage.setItem('memoryGameAlertTime', tiempoAlerta);

        // Guardar nombres de imágenes
        const imageInputs = document.querySelectorAll('.image-card__input');
        const newImages = [];
        imageInputs.forEach(input => {
            newImages.push(input.value);
        });
        localStorage.setItem('memoryGameImages', JSON.stringify(newImages));

        showStatus('Cambios guardados correctamente.', 'success');
        mostrarImagenesJuego(); // Refrescar la vista de imágenes
    }

    saveChangesBtn.addEventListener('click', () => {
        // Abre el modal de confirmación
        passwordConfirmModal.style.display = 'flex';
        confirmPasswordInput.value = '';
        confirmPasswordInput.focus();
    });

    passwordConfirmForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (confirmPasswordInput.value === '31381993') {
            applyChanges();
            passwordConfirmModal.style.display = 'none';
        } else {
            showStatus('Contraseña incorrecta.', 'error');
        }
    });

    document.getElementById('exportExcel').addEventListener('click', () => {
        const tiempos = JSON.parse(localStorage.getItem('memoryGameTiempos')) || [];
        if (tiempos.length === 0) {
            showStatus('No hay datos para exportar.', 'error');
            return;
        }

        let csv = 'Posicion,Nombre,Correo,Tiempo\n';
        tiempos.forEach((t, index) => {
            csv += `${index + 1},"${t.nombre || 'Desconocido'}","${t.correo || '-'}","${t.tiempo}"\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'resultados_memoria.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showStatus('Archivo CSV exportado correctamente.', 'success');
    });

    // Actualizar la página si los datos cambian en otra pestaña
    window.addEventListener('storage', (e) => {
        if (e.key === 'memoryGameTiempos' || e.key === 'memoryGameVisits' || e.key === 'memoryGameWins') {
            updateCounters();
            mostrarTablaParticipantes();
        }
    });

    // Cerrar modal de contraseña
    closePasswordModal.addEventListener('click', () => {
        passwordConfirmModal.style.display = 'none';
    });
    window.addEventListener('click', (event) => {
        if (event.target == passwordConfirmModal) passwordConfirmModal.style.display = 'none';
    });

    // === INICIALIZACIÓN ===
    function applyTheme() {
        const theme = localStorage.getItem('memoryGameTheme') || 'dark';
        document.body.classList.toggle('light-mode', theme === 'light');
    }

    applyTheme();
    updateCounters();
    mostrarTablaParticipantes();
    mostrarImagenesJuego();
    loadInitialGameTime();
});
