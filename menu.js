document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos del DOM ---
    const userModal = document.getElementById('userModal');
    const userForm = document.getElementById('userForm');
    const userNameInput = document.getElementById('userName');
    const userEmailInput = document.getElementById('userEmail');
    const userEmailSection = document.getElementById('userEmailSection');
    const startGameLink = document.getElementById('startGameLink');
    const adminPasswordSection = document.getElementById('adminPasswordSection');
    const adminPasswordInput = document.getElementById('adminPassword');
    const submitButton = document.getElementById('submitButton');
    const closeUserModal = document.getElementById('closeUserModal');
    const themeToggleButton = document.getElementById('themeToggleButton');
    const musicToggleButton = document.getElementById('musicToggleButton');

    const tablaTiemposModal = document.getElementById('tablaTiemposModal');
    const tablaButton = document.getElementById('tablaButton'); // Corregido de showTimesButton a tablaButton
    const cerrarTablaTiempos = document.getElementById('cerrarTablaTiempos');
    const tablaTiemposBody = document.querySelector('#tablaTiempos tbody');
    const visitCountEl = document.getElementById('visitCount');
    const winCountEl = document.getElementById('winCount');

    const instructionsModal = document.getElementById('instructionsModal');
    const instructionsButton = document.getElementById('instructionsButton');
    const cerrarInstructions = document.getElementById('cerrarInstructions');

    // --- Cargar Contadores ---
    function loadCounters() {
        visitCountEl.textContent = localStorage.getItem('memoryGameVisits') || 0;
        winCountEl.textContent = localStorage.getItem('memoryGameWins') || 0;
    }

    // --- Lógica de Música ---
    function updateMusicButtonState() {
        const musicState = localStorage.getItem('memoryGameMusic') || 'on'; // Default a 'on'
        if (musicState === 'on') {
            musicToggleButton.textContent = '🎵';
            musicToggleButton.classList.remove('off');
            musicToggleButton.setAttribute('aria-label', 'Desactivar música');
        } else {
            musicToggleButton.textContent = '🔇';
            musicToggleButton.classList.add('off');
            musicToggleButton.setAttribute('aria-label', 'Activar música');
        }
    }

    musicToggleButton.addEventListener('click', () => {
        let musicState = localStorage.getItem('memoryGameMusic') || 'on';
        musicState = musicState === 'on' ? 'off' : 'on';
        localStorage.setItem('memoryGameMusic', musicState);
        updateMusicButtonState();
    });

    // --- Lógica de Tema (Claro/Oscuro) ---
    function applyTheme(theme) {
        document.body.classList.toggle('light-mode', theme === 'light');
        localStorage.setItem('memoryGameTheme', theme);
        updateThemeButtonState(theme);
    }

    function updateThemeButtonState(theme) {
        if (theme === 'light') {
            themeToggleButton.textContent = '☀️';
            themeToggleButton.setAttribute('aria-label', 'Activar modo oscuro');
        } else {
            themeToggleButton.textContent = '🌙';
            themeToggleButton.setAttribute('aria-label', 'Activar modo claro');
        }
    }

    themeToggleButton.addEventListener('click', () => {
        const currentTheme = localStorage.getItem('memoryGameTheme') || 'dark'; // Default a 'dark'
        applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });

    // --- Lógica de Datos de Usuario ---

    // Mostrar/ocultar campo de contraseña para admin
    userNameInput.addEventListener('input', () => {
        if (userNameInput.value.trim().toLowerCase() === 'admin') {
            adminPasswordSection.style.maxHeight = '60px'; // Altura suficiente para el input
            userEmailSection.style.maxHeight = '0';
            userEmailInput.required = false; // No requerir email para admin
            submitButton.textContent = 'Acceder';
        } else {
            adminPasswordSection.style.maxHeight = '0';
            userEmailSection.style.maxHeight = '60px';
            userEmailInput.required = true; // Requerir email para jugadores
            submitButton.textContent = 'Empezar a Jugar';
        }
    });

    // Al hacer clic en "Nuevo Juego"
    startGameLink.addEventListener('click', (event) => {
        // Siempre previene la navegación para mostrar el modal primero
        event.preventDefault();
        userModal.style.display = 'flex';
        userNameInput.value = 'jugador'; // Valor por defecto
        userEmailInput.required = true; // Asegurarse de que el email sea requerido por defecto
        userEmailSection.style.maxHeight = '60px'; // Mostrar campo de email por defecto
        userEmailInput.value = ''; // Limpiar correo
        adminPasswordInput.value = ''; // Limpiar contraseña
        adminPasswordSection.style.maxHeight = '0'; // Ocultar campo
        submitButton.textContent = 'Empezar a Jugar';
        userNameInput.focus();
    });

    // Desactivar la validación nativa del navegador para manejarla manualmente
    userForm.setAttribute('novalidate', true);

    // Al enviar el formulario de datos de usuario
    userForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const nombre = userNameInput.value.trim().toLowerCase();

        // Flujo especial para el administrador
        if (nombre === 'admin') {
            const password = adminPasswordInput.value;
            if (password === '31381993') {
                window.location.href = 'admin/admin.html';
            } else {
                alert('Contraseña incorrecta.');
                adminPasswordInput.focus();
            }
            return;
        }

        // Flujo normal para jugadores
        const email = userEmailInput.value.trim();
        if (!userNameInput.value.trim() || !email || !email.match(/^\S+@\S+\.\S+$/)) {
            alert('Por favor, ingresa un nombre y un correo electrónico válido.');
            return;
        }

        const userData = {
            // Guardamos el nombre original, no en minúsculas
            nombre: userNameInput.value.trim(),
            correo: email,
        };
        localStorage.setItem('memoryGameUser', JSON.stringify(userData));
        userModal.style.display = 'none'; // Corregido
        // Ahora que los datos están guardados, redirige a la página del juego
        window.location.href = startGameLink.href;
    });

    closeUserModal.addEventListener('click', () => userModal.style.display = 'none');

    // --- Lógica de Instrucciones ---
    instructionsButton.addEventListener('click', () => {
        fetch('instrucciones.md')
            .then(response => response.text())
            .then(text => {
                // Convertir Markdown simple a HTML
                let html = text
                    .replace(/^### (.*$)/gim, '<h4>$1</h4>')
                    .replace(/^# (.*$)/gim, '<h2>$1</h2>')
                    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
                    .replace(/^\* (.*$)/gim, '<ul><li>$1</li></ul>')
                    .replace(/^\d+\. (.*$)/gim, '<ol><li>$1</li></ol>')
                    .replace(/<\/ul>\n<ul>/gim, '')
                    .replace(/<\/ol>\n<ol>/gim, '');

                document.getElementById('instructionsContent').innerHTML = html;
                instructionsModal.style.display = 'flex';
            })
            .catch(error => {
                console.error('Error al cargar las instrucciones:', error);
                alert('No se pudieron cargar las instrucciones.');
            });
    });

    cerrarInstructions.addEventListener('click', () => instructionsModal.style.display = 'none');

    // --- Lógica de Tabla de Tiempos ---

    function obtenerTiemposGanadores() {
        return JSON.parse(localStorage.getItem('memoryGameTiempos')) || [];
    }

    function mostrarTablaTiempos() {
        const tiempos = obtenerTiemposGanadores();
        const parseTime = (str) => {
            // Corregido para el formato MM:SS.CC
            if (!str || !str.includes(':') || !str.includes('.')) return -1;
            const [min, secAndHundredths] = str.split(':');
            const [sec, hundredths] = secAndHundredths.split('.');
            return (parseInt(min) * 60 * 1000) + (parseInt(sec) * 1000) + (parseInt(hundredths) * 10);
        };
        const formatTime = (ms) => {
            const totalSeconds = Math.max(0, Math.floor(ms / 1000));
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            const hundredths = Math.floor((ms % 1000) / 10);
            return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(hundredths).padStart(2, '0')}`;
        }
        const tiemposOrdenados = tiempos
            .filter(t => t.tiempo)
            .sort((a, b) => parseTime(b.tiempo) - parseTime(a.tiempo)) // Orden descendente: más tiempo restante es mejor
            .slice(0, 10);

        tablaTiemposBody.innerHTML = ''; // Limpiar tabla anterior

        if (tiemposOrdenados.length === 0) {
            tablaTiemposBody.innerHTML = '<tr><td colspan="3" style="text-align:center;">No hay tiempos registrados.</td></tr>';
        } else {
            tiemposOrdenados.forEach((record, index) => {
                let medalla = '';
                if (index === 0) medalla = '🥇';
                else if (index === 1) medalla = '🥈';
                else if (index === 2) medalla = '🥉';

                // Calcular y formatear el tiempo que tardó el jugador
                const tiempoJuego = parseInt(localStorage.getItem('memoryGameTime')) || 30;
                const tiempoRestanteMs = parseTime(record.tiempo);
                const tiempoTomadoMs = (tiempoJuego * 1000) - tiempoRestanteMs;
                const tiempoMostrado = formatTime(tiempoTomadoMs);

                const row = `
                    <tr>
                        <td>${medalla || index + 1}</td>
                        <td>${record.nombre || 'Desconocido'}</td>
                        <td>${tiempoMostrado || 'N/A'}</td>
                    </tr>
                `;
                tablaTiemposBody.innerHTML += row;
            });
        }
        tablaTiemposModal.style.display = 'flex'; // Corregido
    }

    tablaButton.addEventListener('click', () => {
        mostrarTablaTiempos();
    });
    cerrarTablaTiempos.addEventListener('click', () => {
        tablaTiemposModal.style.display = 'none'; // Corregido
    });

    // Inicializar estado del botón de música al cargar la página
    // Aplicar tema al cargar la página
    const initialTheme = localStorage.getItem('memoryGameTheme') || 'dark';
    applyTheme(initialTheme);
    updateMusicButtonState();
    // Cargar contadores al iniciar
    loadCounters();
});