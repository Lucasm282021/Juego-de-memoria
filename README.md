# Juego de Memoria

Un clásico juego de memoria desarrollado con HTML, CSS y JavaScript puro. El objetivo es encontrar todos los pares de cartas iguales antes de que se agote el tiempo. El proyecto está modularizado y cuenta con un panel de administración para configurar diferentes aspectos del juego.

## Características

### Menú Principal
- **Inicio de Juego**: Solicita el nombre y correo del jugador para personalizar la experiencia.
- **Acceso de Administrador**: Ingresando "admin" como nombre de usuario, se puede acceder al panel de administración con una contraseña.
- **Tabla de Tiempos**: Muestra un ranking con los 10 mejores tiempos.
- **Instrucciones**: Un modal explica las reglas del juego.
- **Control de Música**: Permite activar o desactivar la música del juego, guardando la preferencia.
- **Estadísticas**: Muestra el total de visitas y victorias.

### Juego
- **Tablero Dinámico**: Un tablero de 4x4 con 8 pares de imágenes.
- **Cronómetro Regresivo**: El tiempo disminuye, añadiendo un desafío. El cronómetro cambia a color rojo y emite un sonido de "tic-tac" en los últimos 5 segundos.
- **Modales de Resultado**: Muestra un mensaje de victoria o derrota al finalizar la partida, redirigiendo al menú principal.
- **Sonidos**: Música de fondo, sonidos de victoria, derrota y alerta de tiempo.

### Panel de Administración (`/admin/admin.html`)
- **Acceso Protegido**: Se accede con la contraseña `31381993`.
- **Gestión de Contadores**: Permite resetear las visitas y victorias.
- **Gestión de Tiempos**: Permite borrar toda la tabla de clasificación.
- **Exportación**: Exporta la tabla de tiempos a un archivo `.csv`.
- **Configuración del Juego**:
    - **Tiempo**: Permite ajustar la duración de la partida (en segundos).
    - **Imágenes**: Permite cambiar las 8 imágenes utilizadas en las cartas a través de un explorador de archivos.
- **Confirmación de Cambios**: Todas las modificaciones importantes requieren una confirmación con la contraseña del administrador.

## Instalación y Uso

1.  Clona o descarga este repositorio en tu máquina local.
2.  Abre el archivo `index.html` en tu navegador web preferido.
3.  ¡Listo para jugar!

Para acceder al panel de administración:
1.  Haz clic en "Nuevo Juego".
2.  En el campo "Nombre del Jugador", escribe `admin`.
3.  Ingresa la contraseña `31381993` en el campo que aparecerá.
4.  Haz clic en "Acceder".

## Cómo Jugar

1.  **Inicia un Nuevo Juego:** Desde el menú principal, ingresa tus datos y haz clic en "Empezar a Jugar".
2.  **Voltea las Cartas:** Haz clic en una carta para revelar la imagen que oculta.
3.  **Busca el Par:** Haz clic en una segunda carta.
    - Si las imágenes coinciden, ¡has encontrado un par! Las cartas permanecerán boca arriba.
    - Si no coinciden, las cartas se volverán a voltear. ¡Intenta recordar dónde estaba cada imagen!
4.  **Gana el Juego:** Encuentra todos los pares antes de que el cronómetro llegue a cero. Tu puntuación se basará en el tiempo que te sobre.

## Tecnologías Utilizadas

- **HTML5**
- **CSS3** (Variables, Grid Layout, Flexbox, Animaciones)
- **JavaScript (ES6+)** (Manipulación del DOM, `localStorage`, `fetch` API)

## Autor

- **Montero Lucas Damián**

---