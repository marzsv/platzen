# Platzen

Modo enfoque para Platzi. Extensión de Chrome que oculta el sidebar de comentarios en las páginas de clase y expande el reproductor de video al ancho completo.

> El nombre combina **Platzi** + **zen** — menos ruido, más foco en la clase.

## Características

- Oculta el sidebar de comentarios en `platzi.com/cursos/.../*`.
- Colapsa el grid de la página para que el video ocupe todo el ancho disponible (≈+67% en pantallas grandes).
- Tres formas de alternar el estado:
  - Popup de la extensión (con switch).
  - Atajo de teclado `Alt+Shift+H`.
  - Botón flotante en la esquina inferior derecha de cada clase.
- Preferencia persistida en `chrome.storage.sync` (se sincroniza entre dispositivos con la misma cuenta de Chrome).
- Sin flicker: el sidebar se oculta desde `document_start` por CSS; el script solo lo revela si el usuario lo desactivó.

## Instalación (modo desarrollador)

1. Abre `chrome://extensions/`.
2. Activa "Modo de desarrollador" (esquina superior derecha).
3. Clic en "Cargar descomprimida" y selecciona la carpeta del proyecto.
4. Recarga cualquier página de clase de Platzi.

## Uso

- Por defecto el sidebar queda oculto al instalar.
- Para mostrarlo, usa el toggle del popup, el atajo `Alt+Shift+H` o el botón flotante.
- El estado del botón cambia de ícono según oculto/visible.
- Si el atajo aparece como "sin asignar", configúralo en `chrome://extensions/shortcuts`.

## Estructura

```
manifest.json        Manifest V3, content script + popup + service worker
content.js           Lee storage, alterna .psh-show en <html>, monta el botón flotante
background.js        Service worker que maneja el atajo de teclado
hide-comments.css    Oculta el sidebar y colapsa el grid de la clase
popup.html           UI del popup (header, switches, footer con atajo)
popup.js             Lógica del popup, sincronización con storage
icons/               Íconos 16/32/48/128 px
```

## Cómo funciona

La página de clase de Platzi usa un CSS grid de dos columnas:

```css
.page_Classes___xxx {
  grid-template-columns: minmax(0, 6fr) minmax(0, 4fr);
  grid-template-areas: "info info" "main tabs";
}
```

El sidebar es la columna `tabs`. La extensión hace dos cosas:

1. `display: none` sobre la columna `tabs`.
2. Reescribe `grid-template-columns` y `grid-template-areas` para colapsar el grid a una sola columna, de modo que `main` (el reproductor) se expanda.

Los selectores usan `[class*="page_Classes__tabs__"]` (prefijo) en vez de los nombres con hash de CSS Modules, para sobrevivir a rebuilds donde el hash cambia.

## Limitaciones conocidas

- Si Platzi cambia el nombre del módulo CSS (de `page_Classes` a otro) en algún rebuild grande, los selectores dejarán de coincidir y habrá que actualizar `hide-comments.css`.
- El atajo `Alt+Shift+H` puede chocar con otra extensión; en ese caso, Chrome lo deja sin asignar y hay que configurarlo manualmente.
- Solo está testeado en clases tipo video. Otros tipos de material (lecturas, quiz) no se ven afectados ni se garantiza nada.

## Desarrollo

No requiere build step ni dependencias: es HTML/CSS/JS plano. Edita los archivos directamente y recarga la extensión desde `chrome://extensions/` (botón ↻ sobre la card).

Para regenerar los íconos hay un script de PIL al estilo `_make_icons.py` que se borró del repo (puedes reescribirlo si necesitas variantes nuevas).

## Licencia

Sin licencia explícita. Esta extensión no está afiliada con Platzi; modifica el DOM solo en el lado del cliente y no envía datos a ningún servidor.
