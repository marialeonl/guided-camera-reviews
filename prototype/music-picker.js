/* ═══════════════════════════════════════════════════════════════════════
   music-picker.js — Selector de música compartido (Smart camera & preview)
   ═══════════════════════════════════════════════════════════════════════
   Componente único reutilizado por camara-video-guiado.html (grabación,
   sin canción inicial) y camara-preview.html (previsualización, con la
   canción ya elegida). Ninguna de las dos páginas define su propia copia
   del bottom sheet: ambas cargan este archivo y lo montan con
   MusicPicker.init({ container, initialSongId, onUse }).

   - container:      el .phone (o nodo) donde inyectar el overlay.
   - initialSongId:  musicId ya elegido (precarga la selección al abrir)
                      o null/undefined si todavía no hay ninguno.
   - onUse(song):     callback al tocar una fila — sin CTA de confirmación,
                      tocar YA selecciona (ver useSong). Cada página decide
                      cómo reflejarlo en SU propia pill y cómo persistirlo
                      (el estado de su propia pantalla).

   API pública: MusicPicker.init(options), .open(), .close(), .getSelected().
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var STYLE_ID = "music-picker-styles";
  var STYLE_CSS = '/* ══════════════════════════════════════════════════════════════════\n   SELECTOR DE MÚSICA — bottom sheet para cambiar la canción de la pill\n   "Música seleccionada" (adaptado de camera-add-music.html).\n   Se conserva el prefijo tmusic-* (namespaced, sin colisión con el\n   resto del archivo), pero la paleta TikTok y los botones se llevan\n   a los tokens Andes de este proyecto (var(--andes-color-accent),\n   var(--andes-font), radios var(--andes-radius-*), mismo lenguaje que\n   .prev-btn-fill). Vive como overlay absoluto dentro de .prev-phone,\n   con pointer-events:none cuando está cerrado para no bloquear el\n   resto de la UI. ══════════════════════════════════════════════════ */\n.tmusic-root, .tmusic-root * { box-sizing: border-box; }\n.tmusic-root {\n  --tmusic-accent: var(--andes-color-accent);\n  --tmusic-accent-hover: var(--andes-color-accent-hover);\n  --tmusic-highlight: var(--andes-color-success);\n  --tmusic-surface: #1c1c1e;\n  --tmusic-surface-2: #2c2c2e;\n  --tmusic-surface-3: #3a3a3c;\n  --tmusic-border: rgba(255,255,255,0.08);\n  --tmusic-text-dim: rgba(255,255,255,0.6);\n  --tmusic-text-faint: rgba(255,255,255,0.38);\n  --tmusic-soundbar-h: 62px;\n  font-family: var(--andes-font);\n  color: #fff;\n  position: absolute;\n  inset: 0;\n  z-index: 30;\n  pointer-events: none;\n  -webkit-user-select: none;\n  user-select: none;\n}\n.tmusic-root.tmusic-sheet-open { pointer-events: auto; }\n\n.tmusic-sheet-scrim {\n  position: absolute;\n  inset: 0;\n  background: rgba(0,0,0,0);\n  pointer-events: none;\n  transition: background .28s ease;\n}\n.tmusic-root.tmusic-sheet-open .tmusic-sheet-scrim {\n  background: rgba(0,0,0,0.55);\n  pointer-events: auto;\n}\n\n.tmusic-sheet {\n  position: absolute;\n  left: 0; right: 0; bottom: 0;\n  height: 86%;\n  background: var(--tmusic-surface);\n  border-radius: 16px 16px 0 0;\n  display: flex;\n  flex-direction: column;\n  transform: translateY(100%);\n  transition: transform .34s cubic-bezier(.32,.72,0,1);\n  box-shadow: 0 -8px 30px rgba(0,0,0,0.4);\n}\n.tmusic-root.tmusic-sheet-open .tmusic-sheet { transform: translateY(0%); }\n\n.tmusic-sheet-grabber {\n  width: 36px; height: 4px;\n  background: rgba(255,255,255,0.25);\n  border-radius: 999px;\n  margin: 8px auto 4px;\n  flex-shrink: 0;\n}\n\n.tmusic-sheet-header {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 6px 14px 10px;\n  flex-shrink: 0;\n  border-bottom: 1px solid var(--tmusic-border);\n}\n.tmusic-sheet-header .tmusic-title {\n  flex: 1;\n  text-align: center;\n  font-size: 16px;\n  font-weight: 600;\n}\n.tmusic-header-btn {\n  width: 30px; height: 30px;\n  display: flex; align-items: center; justify-content: center;\n  background: transparent;\n  border: none;\n  color: #fff;\n  cursor: pointer;\n  flex-shrink: 0;\n}\n.tmusic-header-btn svg { width: 20px; height: 20px; }\n\n.tmusic-search-wrap { padding: 10px 14px 4px; flex-shrink: 0; display: none; }\n.tmusic-root.tmusic-search-active .tmusic-search-wrap { display: block; }\n.tmusic-root.tmusic-search-active .tmusic-tabs { display: none; }\n.tmusic-search-bar {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  background: var(--tmusic-surface-2);\n  border-radius: var(--andes-radius-m);\n  padding: 8px 10px;\n}\n.tmusic-search-bar svg { width: 16px; height: 16px; color: var(--tmusic-text-dim); flex-shrink: 0; }\n.tmusic-search-input {\n  flex: 1;\n  background: transparent;\n  border: none;\n  outline: none;\n  color: #fff;\n  font-family: var(--andes-font);\n  font-size: 14px;\n  min-width: 0;\n}\n.tmusic-search-input::placeholder { color: var(--tmusic-text-faint); }\n.tmusic-search-cancel {\n  background: none; border: none; color: #fff; font-family: var(--andes-font);\n  font-size: 14px; font-weight: 600; cursor: pointer; padding: 4px 2px;\n  flex-shrink: 0; display: none;\n}\n.tmusic-root.tmusic-search-active .tmusic-search-cancel { display: inline-block; }\n\n.tmusic-search-suggestions { display: flex; flex-wrap: wrap; gap: 8px; padding: 12px 0 4px; }\n.tmusic-chip {\n  padding: 7px 14px;\n  background: var(--tmusic-surface-2);\n  border-radius: 999px;\n  font-family: var(--andes-font);\n  font-size: 13px;\n  color: var(--tmusic-text-dim);\n  cursor: pointer;\n  border: none;\n}\n.tmusic-search-section-label {\n  font-family: var(--andes-font);\n  font-size: 13px;\n  font-weight: 600;\n  color: var(--tmusic-text-dim);\n  padding: 10px 0 2px;\n}\n\n.tmusic-tabs {\n  display: flex;\n  gap: 22px;\n  padding: 12px 16px 0;\n  flex-shrink: 0;\n  overflow-x: auto;\n  scrollbar-width: none;\n}\n.tmusic-tabs::-webkit-scrollbar { display: none; }\n.tmusic-tab {\n  background: none;\n  border: none;\n  color: var(--tmusic-text-faint);\n  font-family: var(--andes-font);\n  font-size: 14px;\n  font-weight: 600;\n  padding: 0 0 10px;\n  white-space: nowrap;\n  cursor: pointer;\n  border-bottom: 2px solid transparent;\n  flex-shrink: 0;\n}\n.tmusic-tab.tmusic-active {\n  color: #fff;\n  border-bottom-color: var(--tmusic-accent);\n}\n\n.tmusic-list-wrap { flex: 1; overflow-y: auto; padding: 4px 14px calc(24px + var(--tmusic-soundbar-h)); }\n.tmusic-list-wrap::-webkit-scrollbar { width: 0; }\n\n.tmusic-row {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  padding: 9px 4px;\n  border-radius: 10px;\n  cursor: pointer;\n  transition: background .15s ease;\n}\n.tmusic-row:active { background: var(--tmusic-surface-2); }\n.tmusic-row.tmusic-row-selected { background: rgba(52,131,250,0.12); }\n\n.tmusic-cover {\n  position: relative;\n  width: 46px; height: 46px;\n  border-radius: var(--andes-radius-l);\n  flex-shrink: 0;\n  display: flex; align-items: center; justify-content: center;\n  overflow: hidden;\n  color: rgba(255,255,255,0.85);\n}\n.tmusic-cover svg { width: 18px; height: 18px; }\n.tmusic-cover-play {\n  position: absolute;\n  inset: 0;\n  background: rgba(0,0,0,0.38);\n  display: flex; align-items: center; justify-content: center;\n  opacity: 0;\n  transition: opacity .15s ease;\n}\n.tmusic-row-selected .tmusic-cover-play { opacity: 1; }\n.tmusic-cover-play svg { width: 16px; height: 16px; color: #fff; }\n.tmusic-row-selected .tmusic-cover::after {\n  content: "";\n  position: absolute;\n  inset: 0;\n  border-radius: var(--andes-radius-l);\n  box-shadow: 0 0 0 2px var(--tmusic-accent) inset;\n}\n\n.tmusic-row-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }\n.tmusic-row-title {\n  font-family: var(--andes-font);\n  font-size: 14px; font-weight: 600; color: #fff;\n  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;\n}\n.tmusic-row-meta {\n  font-family: var(--andes-font);\n  font-size: 12.5px;\n  color: var(--tmusic-text-dim);\n  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;\n  display: flex; align-items: center; gap: 5px;\n}\n.tmusic-row-meta .tmusic-dot::before { content: "·"; }\n\n.tmusic-row-badge {\n  font-family: var(--andes-font);\n  font-size: 10.5px;\n  font-weight: 700;\n  color: var(--tmusic-highlight);\n  border: 1px solid var(--tmusic-highlight);\n  border-radius: 4px;\n  padding: 1px 5px;\n  flex-shrink: 0;\n}\n\n.tmusic-row-action {\n  width: 30px; height: 30px;\n  border-radius: 50%;\n  border: none;\n  background: var(--tmusic-surface-2);\n  color: #fff;\n  display: flex; align-items: center; justify-content: center;\n  flex-shrink: 0;\n  cursor: pointer;\n}\n.tmusic-row-action svg { width: 14px; height: 14px; }\n.tmusic-row-selected .tmusic-row-action { background: var(--tmusic-accent); }\n\n.tmusic-section-label {\n  font-family: var(--andes-font);\n  font-size: 13px; font-weight: 700; color: #fff;\n  padding: 12px 4px 8px;\n}\n\n.tmusic-skeleton-row { display: flex; align-items: center; gap: 12px; padding: 9px 4px; }\n.tmusic-skel {\n  background: linear-gradient(90deg, var(--tmusic-surface-2) 25%, var(--tmusic-surface-3) 37%, var(--tmusic-surface-2) 63%);\n  background-size: 400% 100%;\n  animation: tmusic-shimmer 1.4s ease infinite;\n  border-radius: 6px;\n}\n@keyframes tmusic-shimmer { 0% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }\n.tmusic-skel-cover { width: 46px; height: 46px; border-radius: var(--andes-radius-l); flex-shrink: 0; }\n.tmusic-skel-lines { flex: 1; display: flex; flex-direction: column; gap: 6px; }\n.tmusic-skel-line { height: 10px; border-radius: 4px; }\n\n.tmusic-empty {\n  display: none;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  gap: 10px;\n  padding: 60px 30px;\n  color: var(--tmusic-text-faint);\n  text-align: center;\n  font-family: var(--andes-font);\n  font-size: 13px;\n}\n.tmusic-empty svg { width: 40px; height: 40px; opacity: .3; }\n.tmusic-root.tmusic-state-empty .tmusic-list-content { display: none; }\n.tmusic-root.tmusic-state-empty .tmusic-empty { display: flex; }\n\n/* Barra fija de sonido — silenciar audio original / música, y acceso al\n   panel de volumen. Vive siempre pegada al fondo del sheet (ver\n   --tmusic-soundbar-h, usado también por .tmusic-list-wrap para no\n   superponerse con ella). */\n.tmusic-soundbar {\n  position: absolute;\n  left: 0; right: 0; bottom: 0;\n  height: var(--tmusic-soundbar-h);\n  display: flex;\n  align-items: stretch;\n  border-top: 1px solid var(--tmusic-border);\n  background: var(--tmusic-surface);\n  padding-bottom: env(safe-area-inset-bottom, 0px);\n  flex-shrink: 0;\n  z-index: 2;\n}\n.tmusic-soundbar-btn {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  gap: 4px;\n  background: none;\n  border: none;\n  color: #fff;\n  cursor: pointer;\n  padding: 6px 4px;\n}\n.tmusic-soundbar-icon {\n  position: relative;\n  width: 22px; height: 22px;\n  display: flex; align-items: center; justify-content: center;\n}\n.tmusic-soundbar-icon svg { width: 20px; height: 20px; }\n.tmusic-soundbar-label {\n  font-family: var(--andes-font);\n  font-size: 11px;\n  font-weight: 600;\n  color: var(--tmusic-text-dim);\n  white-space: nowrap;\n}\n.tmusic-soundbar-btn.is-muted .tmusic-soundbar-icon { color: var(--tmusic-text-faint); }\n.tmusic-soundbar-btn.is-muted .tmusic-soundbar-icon::after {\n  content: "";\n  position: absolute;\n  left: -2px; right: -2px; top: 50%;\n  height: 2px;\n  background: var(--andes-color-error);\n  transform: rotate(-45deg);\n  border-radius: 999px;\n}\n.tmusic-soundbar-btn.is-muted .tmusic-soundbar-label { color: var(--tmusic-text-faint); }\n\n/* Panel de volumen — sub-pantalla que reemplaza el listado/tabs mientras\n   está abierta (se dispara desde el botón "Volumen" de la soundbar),\n   con los sliders de sonido original y música, y "Listo" para volver. */\n.tmusic-volume-panel {\n  position: absolute;\n  left: 0; right: 0; top: 0; bottom: 0;\n  background: var(--tmusic-surface);\n  display: flex;\n  flex-direction: column;\n  padding: 6px 18px calc(24px + env(safe-area-inset-bottom, 0px));\n  transform: translateY(100%);\n  transition: transform .3s cubic-bezier(.32,.72,0,1);\n  z-index: 5;\n}\n.tmusic-root.tmusic-volume-open .tmusic-volume-panel { transform: translateY(0); }\n.tmusic-volume-panel-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 14px 0 26px;\n  flex-shrink: 0;\n}\n.tmusic-volume-panel-title {\n  font-family: var(--andes-font);\n  font-size: 16px;\n  font-weight: 600;\n  color: #fff;\n}\n.tmusic-volume-done-btn {\n  background: none;\n  border: none;\n  color: var(--tmusic-accent);\n  font-family: var(--andes-font);\n  font-size: 15px;\n  font-weight: 600;\n  cursor: pointer;\n  padding: 4px 2px;\n}\n.tmusic-volume-row {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  margin-bottom: 6px;\n}\n.tmusic-volume-row-icon {\n  width: 18px; height: 18px;\n  display: flex; align-items: center; justify-content: center;\n  color: #fff;\n  flex-shrink: 0;\n}\n.tmusic-volume-row-icon svg { width: 16px; height: 16px; }\n.tmusic-volume-row.is-muted .tmusic-volume-row-icon,\n.tmusic-volume-row.is-muted .tmusic-volume-row-label { color: var(--tmusic-text-faint); }\n.tmusic-volume-row-label {\n  font-family: var(--andes-font);\n  font-size: 14px;\n  font-weight: 600;\n  color: #fff;\n}\n.tmusic-slider {\n  -webkit-appearance: none;\n  appearance: none;\n  width: 100%;\n  height: 4px;\n  border-radius: 999px;\n  background: var(--tmusic-surface-3);\n  outline: none;\n  margin: 4px 0 26px;\n  cursor: pointer;\n}\n.tmusic-slider::-webkit-slider-thumb {\n  -webkit-appearance: none;\n  width: 18px; height: 18px;\n  border-radius: 50%;\n  background: #fff;\n  box-shadow: 0 1px 3px rgba(0,0,0,.5);\n  cursor: pointer;\n}\n.tmusic-slider::-moz-range-thumb {\n  width: 18px; height: 18px;\n  border: none;\n  border-radius: 50%;\n  background: #fff;\n  box-shadow: 0 1px 3px rgba(0,0,0,.5);\n  cursor: pointer;\n}\n.tmusic-slider::-moz-range-track { height: 4px; border-radius: 999px; background: transparent; }\n\n.tmusic-toast {\n  position: absolute;\n  left: 50%;\n  top: 90px;\n  transform: translate(-50%, -10px);\n  background: rgba(20,20,20,0.92);\n  color: #fff;\n  font-family: var(--andes-font);\n  font-size: 13px;\n  font-weight: 600;\n  padding: 10px 16px;\n  border-radius: var(--andes-radius-m);\n  z-index: 40;\n  opacity: 0;\n  pointer-events: none;\n  transition: opacity .25s ease, transform .25s ease;\n  display: flex; align-items: center; gap: 8px;\n  white-space: nowrap;\n}\n.tmusic-toast svg { width: 16px; height: 16px; color: var(--andes-color-success); }\n.tmusic-toast.tmusic-toast-show { opacity: 1; transform: translate(-50%, 0); }\n\n.tmusic-hidden { display: none !important; }\n'

  var TEMPLATE_HTML = `  <div class="tmusic-root" id="tmusicRoot">
    <div class="tmusic-sheet-scrim" id="tmusicScrim"></div>

    <div class="tmusic-sheet" data-tmusic-screen="sheet" role="dialog" aria-modal="true" aria-label="Agregar música">
      <div class="tmusic-sheet-grabber"></div>

      <div class="tmusic-sheet-header">
        <button class="tmusic-header-btn" id="tmusicBackBtn" type="button" aria-label="Volver">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div class="tmusic-title">Sonidos</div>
        <button class="tmusic-header-btn" id="tmusicSearchToggleBtn" type="button" aria-label="Buscar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </button>
      </div>

      <!-- Buscador -->
      <div class="tmusic-search-wrap">
        <div class="tmusic-search-bar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input class="tmusic-search-input" id="tmusicSearchInput" type="text" placeholder="Buscar sonidos" autocomplete="off">
          <button class="tmusic-search-cancel" id="tmusicSearchCancelBtn" type="button">Cancelar</button>
        </div>
        <div id="tmusicSuggestionsBlock">
          <div class="tmusic-search-section-label">Búsquedas sugeridas</div>
          <div class="tmusic-search-suggestions" id="tmusicSuggestions"></div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tmusic-tabs" id="tmusicTabs"></div>

      <!-- Listado -->
      <div class="tmusic-list-wrap" id="tmusicListWrap">
        <div id="tmusicSkeleton"></div>
        <div class="tmusic-list-content" id="tmusicListContent"></div>
        <div class="tmusic-empty" id="tmusicEmpty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <span>No encontramos sonidos para tu búsqueda.<br>Probá con otras palabras.</span>
        </div>
      </div>

      <!-- Barra de sonido: silenciar el audio original del video, silenciar
           la música elegida y abrir el panel de volumen. Vive siempre
           pegada al fondo del sheet (ver --tmusic-soundbar-h). -->
      <div class="tmusic-soundbar" id="tmusicSoundbar">
        <button type="button" class="tmusic-soundbar-btn" id="tmusicOriginalToggleBtn" aria-pressed="true" aria-label="Silenciar sonido">
          <span class="tmusic-soundbar-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg></span>
          <span class="tmusic-soundbar-label">Sonido original</span>
        </button>
        <button type="button" class="tmusic-soundbar-btn" id="tmusicMusicToggleBtn" aria-pressed="true" aria-label="Silenciar música">
          <span class="tmusic-soundbar-icon"><i class="ti ti-volume" style="font-size:20px;line-height:1" aria-hidden="true"></i></span>
          <span class="tmusic-soundbar-label">Música</span>
        </button>
        <button type="button" class="tmusic-soundbar-btn" id="tmusicVolumeBtn" aria-label="Ajustar volumen">
          <span class="tmusic-soundbar-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="4 9 8 9 13 4 13 20 8 15 4 15 4 9" fill="currentColor" stroke="none"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M19 6a9 9 0 0 1 0 12"/></svg></span>
          <span class="tmusic-soundbar-label">Volumen</span>
        </button>
      </div>

      <!-- Panel de volumen: sub-pantalla que reemplaza el listado mientras
           está abierta (ver tmusic-volume-open), con los dos sliders y
           "Listo" para volver a la lista. -->
      <div class="tmusic-volume-panel" id="tmusicVolumePanel">
        <div class="tmusic-volume-panel-header">
          <span class="tmusic-volume-panel-title">Volumen</span>
          <button type="button" class="tmusic-volume-done-btn" id="tmusicVolumeDoneBtn">Listo</button>
        </div>
        <div class="tmusic-volume-row" id="tmusicOriginalVolumeRow">
          <span class="tmusic-volume-row-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg></span>
          <span class="tmusic-volume-row-label">Sonido original</span>
        </div>
        <input type="range" class="tmusic-slider" id="tmusicOriginalVolumeSlider" min="0" max="100" value="100" aria-label="Volumen del sonido">
        <div class="tmusic-volume-row" id="tmusicMusicVolumeRow">
          <span class="tmusic-volume-row-icon"><i class="ti ti-volume" style="font-size:16px;line-height:1" aria-hidden="true"></i></span>
          <span class="tmusic-volume-row-label">Música</span>
        </div>
        <input type="range" class="tmusic-slider" id="tmusicMusicVolumeSlider" min="0" max="100" value="100" aria-label="Volumen de la música">
      </div>
    </div>

    <!-- Toast de confirmación -->
    <div class="tmusic-toast" id="tmusicToast">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
      <span id="tmusicToastText">Sonido agregado</span>
    </div>
  </div>
`;

  // ---- Mock data (compartida por ambas páginas: mismo musicId siempre
  //      resuelve a la misma canción, sin importar desde dónde se eligió) ----
  var CATEGORIES = [
    { id: "recommend", label: "Recomendados" },
    { id: "trending",  label: "Tendencias" },
    { id: "favorites", label: "Favoritos" },
    { id: "playlists", label: "Playlists" },
    { id: "original",  label: "Sonidos originales" }
  ];

  var GRADIENTS = [
    "linear-gradient(135deg,#3483FA,#1F4E9E)",
    "linear-gradient(135deg,#00A650,#0a6b34)",
    "linear-gradient(135deg,#7c4dff,#2a1e63)",
    "linear-gradient(135deg,#ff9a3c,#7a3d00)",
    "linear-gradient(135deg,#3ddc97,#0e5c3f)",
    "linear-gradient(135deg,#ffd166,#7a5c00)",
    "linear-gradient(135deg,#5b8def,#1c2c56)",
    "linear-gradient(135deg,#ff6392,#5c1030)"
  ];

  function song(id, name, author, duration, badge, catIds, audioSrc) {
    return { musicId: id, musicName: name, authorName: author, duration: duration, badge: badge || null, cats: catIds, gradient: GRADIENTS[id % GRADIENTS.length], audioSrc: audioSrc || null };
  }

  var ALL_SONGS = [
    song(1, "Midnight Drive", "Nova Sound",       "0:32", "Tendencia", ["recommend","trending"]),
    song(2, "Golden Hour",    "Lyra & Wave",      "0:45", null,        ["recommend"]),
    song(3, "Sunset Groove",  "DJ Kairo",         "0:28", "En alza",   ["recommend","trending"]),
    song(4, "Paper Hearts",   "Mabel Rivers",     "0:38", null,        ["recommend","favorites"]),
    song(5, "Electric Skies", "Nova Sound",       "0:41", null,        ["trending"]),
    song(6, "Slow Burn",      "The Alright",      "0:35", "Nuevo",     ["recommend"]),
    song(7, "City Lights",    "Kaia Moon",        "0:52", null,        ["favorites"]),
    song(8, "Bittersweet",    "Ari Lane",         "0:30", null,        ["favorites","playlists"]),
    song(9, "Beneath My Name","Ari Lane",         "0:36", null,        ["favorites"]),
    song(10,"Studio Session", "Reo & Frnds",      "0:47", null,        ["playlists"]),
    song(11,"Neon Rain",      "Vesper",           "0:33", "Tendencia", ["trending","playlists"]),
    song(12,"Quiet Static",   "Nova Sound",       "0:39", null,        ["recommend","favorites"]),
    song(13,"Cinematic Inspiration", "Sigma Music Art", "2:44", "Nuevo", ["recommend","trending"], "sigmamusicart-cinematic-inspirational-epic-music-388289.webm"),
    song(14,"Top Flow", "Corporate Uplifting", "2:34", "Nuevo", ["recommend","trending"], "top-flow-corporate-upbeat-uplifting-motivational-success-400871.webm")
  ];

  var SUGGESTED_QUERIES = ["viral", "pop", "chill lo-fi", "hip hop", "acústico", "trending ahora"];

  // ---- State ----
  var state = {
    activeCategory: "recommend",
    searchActive: false,
    searchQuery: "",
    selectedId: null,
    previewingId: null,
    loading: false,
    root: null,
    mounted: false,
    bound: false,
    // Sonido: independiente de qué canción esté elegida (silenciar/ajustar
    // volumen no cambia ni borra la selección). originalMuted/originalVolume
    // representan el audio propio del video; musicMuted/musicVolume, la
    // música elegida en este mismo picker.
    originalMuted: false,
    musicMuted: false,
    originalVolume: 100,
    musicVolume: 100,
    volumeOpen: false
  };

  var onUseCallback = null;
  var onCloseCallback = null;
  var onPreviewChangeCallback = null;
  var onOriginalSoundChangeCallback = null;
  var onMusicMuteChangeCallback = null;
  var onOriginalVolumeChangeCallback = null;
  var onMusicVolumeChangeCallback = null;

  function notifyPreviewChange() {
    if (typeof onPreviewChangeCallback === "function") {
      onPreviewChangeCallback(findSong(state.selectedId), state.previewingId === state.selectedId);
    }
  }

  var el = {};
  function qs(root, sel) { return root.querySelector(sel); }

  function cacheRefs(root) {
    el.root = root;
    el.scrim = qs(root, "#tmusicScrim");
    el.backBtn = qs(root, "#tmusicBackBtn");
    el.searchToggleBtn = qs(root, "#tmusicSearchToggleBtn");
    el.searchCancelBtn = qs(root, "#tmusicSearchCancelBtn");
    el.searchInput = qs(root, "#tmusicSearchInput");
    el.suggestions = qs(root, "#tmusicSuggestions");
    el.tabs = qs(root, "#tmusicTabs");
    el.listWrap = qs(root, "#tmusicListWrap");
    el.skeleton = qs(root, "#tmusicSkeleton");
    el.listContent = qs(root, "#tmusicListContent");
    el.empty = qs(root, "#tmusicEmpty");
    el.soundbar = qs(root, "#tmusicSoundbar");
    el.originalToggleBtn = qs(root, "#tmusicOriginalToggleBtn");
    el.musicToggleBtn = qs(root, "#tmusicMusicToggleBtn");
    el.volumeBtn = qs(root, "#tmusicVolumeBtn");
    el.volumePanel = qs(root, "#tmusicVolumePanel");
    el.volumeDoneBtn = qs(root, "#tmusicVolumeDoneBtn");
    el.originalVolumeRow = qs(root, "#tmusicOriginalVolumeRow");
    el.musicVolumeRow = qs(root, "#tmusicMusicVolumeRow");
    el.originalVolumeSlider = qs(root, "#tmusicOriginalVolumeSlider");
    el.musicVolumeSlider = qs(root, "#tmusicMusicVolumeSlider");
    el.toast = qs(root, "#tmusicToast");
    el.toastText = qs(root, "#tmusicToastText");
  }

  var ICON_NOTE = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>';
  var ICON_PLAY = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
  var ICON_PAUSE = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>';
  var ICON_CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';
  var ICON_PLUS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>';

  function renderTabs() {
    el.tabs.innerHTML = "";
    CATEGORIES.forEach(function (cat) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tmusic-tab" + (cat.id === state.activeCategory ? " tmusic-active" : "");
      btn.textContent = cat.label;
      btn.setAttribute("data-cat", cat.id);
      btn.addEventListener("click", function () { selectCategory(cat.id); });
      el.tabs.appendChild(btn);
    });
  }

  function selectCategory(catId) {
    state.activeCategory = catId;
    renderTabs();
    loadList();
  }

  function getFilteredSongs() {
    if (state.searchActive && state.searchQuery.trim() !== "") {
      var q = state.searchQuery.trim().toLowerCase();
      return ALL_SONGS.filter(function (s) {
        return s.musicName.toLowerCase().indexOf(q) !== -1 || s.authorName.toLowerCase().indexOf(q) !== -1;
      });
    }
    return ALL_SONGS.filter(function (s) { return s.cats.indexOf(state.activeCategory) !== -1; });
  }

  function renderSkeleton() {
    var rows = "";
    for (var i = 0; i < 6; i++) {
      rows += '<div class="tmusic-skeleton-row">' +
        '<div class="tmusic-skel tmusic-skel-cover"></div>' +
        '<div class="tmusic-skel-lines">' +
          '<div class="tmusic-skel tmusic-skel-line" style="width:60%"></div>' +
          '<div class="tmusic-skel tmusic-skel-line" style="width:38%"></div>' +
        '</div></div>';
    }
    el.skeleton.innerHTML = rows;
  }

  function loadList() {
    state.loading = true;
    el.root.classList.remove("tmusic-state-empty");
    el.listContent.innerHTML = "";
    renderSkeleton();
    el.skeleton.style.display = "block";
    el.listContent.style.display = "none";

    window.setTimeout(function () {
      state.loading = false;
      el.skeleton.style.display = "none";
      el.listContent.style.display = "block";
      renderList();
    }, 380);
  }

  function renderList() {
    var songs = getFilteredSongs();
    el.listContent.innerHTML = "";

    if (songs.length === 0) {
      el.root.classList.add("tmusic-state-empty");
      return;
    }
    el.root.classList.remove("tmusic-state-empty");

    if (!state.searchActive) {
      var label = document.createElement("div");
      label.className = "tmusic-section-label";
      var catObj = CATEGORIES.filter(function (c) { return c.id === state.activeCategory; })[0];
      label.textContent = catObj ? catObj.label : "";
      el.listContent.appendChild(label);
    }

    songs.forEach(function (s) {
      el.listContent.appendChild(buildRow(s));
    });
  }

  function buildRow(s) {
    var row = document.createElement("div");
    row.className = "tmusic-row" + (state.selectedId === s.musicId ? " tmusic-row-selected" : "");
    row.setAttribute("data-music-id", s.musicId);

    var cover = document.createElement("div");
    cover.className = "tmusic-cover";
    cover.style.background = s.gradient;
    cover.innerHTML = ICON_NOTE + '<div class="tmusic-cover-play">' + (state.previewingId === s.musicId ? ICON_PAUSE : ICON_PLAY) + '</div>';

    var body = document.createElement("div");
    body.className = "tmusic-row-body";
    var title = document.createElement("div");
    title.className = "tmusic-row-title";
    title.textContent = s.musicName;
    var meta = document.createElement("div");
    meta.className = "tmusic-row-meta";
    meta.innerHTML = '<span>' + s.authorName + '</span><span class="tmusic-dot"></span><span>' + s.duration + '</span>';
    body.appendChild(title);
    body.appendChild(meta);

    var right = document.createElement("div");
    right.style.display = "flex";
    right.style.alignItems = "center";
    right.style.gap = "8px";
    right.style.flexShrink = "0";

    if (s.badge) {
      var badge = document.createElement("span");
      badge.className = "tmusic-row-badge";
      badge.textContent = s.badge;
      right.appendChild(badge);
    }

    var action = document.createElement("button");
    action.className = "tmusic-row-action";
    action.type = "button";
    action.setAttribute("aria-label", "Seleccionar sonido");
    action.innerHTML = state.selectedId === s.musicId ? ICON_CHECK : ICON_PLUS;
    action.addEventListener("click", function (ev) {
      ev.stopPropagation();
      useSong(s.musicId);
    });
    right.appendChild(action);

    row.appendChild(cover);
    row.appendChild(body);
    row.appendChild(right);

    row.addEventListener("click", function () { useSong(s.musicId); });

    return row;
  }

  function findSong(id) {
    for (var i = 0; i < ALL_SONGS.length; i++) { if (ALL_SONGS[i].musicId === id) return ALL_SONGS[i]; }
    return null;
  }

  /* Al tocar una fila (o su botón +) queda elegida al instante — sin CTA de
     confirmación (ver referencia de TikTok: tocar YA selecciona). Si la
     fila tocada es la que ya estaba elegida, en cambio solo pausa/retoma
     su preescucha (togglePreview) sin volver a disparar onUse/el toast.
     No toca ninguna pill directamente — delega en onUseCallback, que cada
     página define en su propio init() para reflejar el resultado en SU
     pill (prev-sound-pill / cam-sound-pill) y persistirlo como corresponda
     a esa pantalla. Así una sola implementación sirve para "ya había
     canción" (preview) y "todavía no hay ninguna" (cámara). */
  function useSong(id) {
    if (state.selectedId === id) { togglePreview(); return; }
    var s = findSong(id);
    if (!s) return;
    state.selectedId = id;
    state.previewingId = id;
    renderList();
    notifyPreviewChange();
    showToast("Sonido agregado");
    if (typeof onUseCallback === "function") onUseCallback(s);
  }

  function togglePreview() {
    if (!state.selectedId) return;
    state.previewingId = (state.previewingId === state.selectedId) ? null : state.selectedId;
    renderList();
    notifyPreviewChange();
  }

  /* Silenciar sonido original / música y ajustar volumen — independiente
     de useSong: no tocan state.selectedId ni cambian la canción elegida,
     solo el estado de audio de la soundbar fija del fondo del sheet (ver
     .tmusic-soundbar). */
  function renderSoundbar() {
    el.originalToggleBtn.classList.toggle("is-muted", state.originalMuted);
    el.originalToggleBtn.setAttribute("aria-pressed", String(!state.originalMuted));
    el.musicToggleBtn.classList.toggle("is-muted", state.musicMuted);
    el.musicToggleBtn.setAttribute("aria-pressed", String(!state.musicMuted));
    if (el.originalVolumeRow) el.originalVolumeRow.classList.toggle("is-muted", state.originalMuted);
    if (el.musicVolumeRow) el.musicVolumeRow.classList.toggle("is-muted", state.musicMuted);
  }

  function fillSlider(slider, value) {
    if (!slider) return;
    var pct = Math.max(0, Math.min(100, value));
    slider.value = pct;
    slider.style.background = "linear-gradient(to right, var(--tmusic-accent) 0%, var(--tmusic-accent) " + pct + "%, var(--tmusic-surface-3) " + pct + "%, var(--tmusic-surface-3) 100%)";
  }

  function toggleOriginalMute() {
    state.originalMuted = !state.originalMuted;
    renderSoundbar();
    if (typeof onOriginalSoundChangeCallback === "function") onOriginalSoundChangeCallback(state.originalMuted);
  }

  function toggleMusicMute() {
    state.musicMuted = !state.musicMuted;
    renderSoundbar();
    if (typeof onMusicMuteChangeCallback === "function") onMusicMuteChangeCallback(state.musicMuted);
  }

  function openVolumePanel() {
    state.volumeOpen = true;
    el.root.classList.add("tmusic-volume-open");
  }

  function closeVolumePanel() {
    state.volumeOpen = false;
    el.root.classList.remove("tmusic-volume-open");
  }

  function setOriginalVolume(value) {
    state.originalVolume = value;
    fillSlider(el.originalVolumeSlider, value);
    if (typeof onOriginalVolumeChangeCallback === "function") onOriginalVolumeChangeCallback(value / 100);
  }

  function setMusicVolume(value) {
    state.musicVolume = value;
    fillSlider(el.musicVolumeSlider, value);
    if (typeof onMusicVolumeChangeCallback === "function") onMusicVolumeChangeCallback(value / 100);
  }

  function renderSuggestions() {
    el.suggestions.innerHTML = "";
    SUGGESTED_QUERIES.forEach(function (q) {
      var chip = document.createElement("button");
      chip.type = "button";
      chip.className = "tmusic-chip";
      chip.textContent = q;
      chip.addEventListener("click", function () {
        el.searchInput.value = q;
        state.searchQuery = q;
        renderList();
      });
      el.suggestions.appendChild(chip);
    });
  }

  function openSheet() {
    el.root.classList.add("tmusic-sheet-open");
  }

  function closeSheet() {
    el.root.classList.remove("tmusic-sheet-open", "tmusic-search-active");
    closeVolumePanel();
    // OJO: acá NO se toca previewingId ni se llama notifyPreviewChange().
    // Antes esto ponía previewingId=null y avisaba "no está sonando" al
    // cerrar por cualquier vía — como useSong ya confirma la selección al
    // tocar (ver comentario ahí, no hay CTA de por medio), eso apagaba la
    // canción recién elegida apenas se cerraba el sheet. Si el usuario la
    // pausó a propósito con togglePreview antes de cerrar, previewingId ya
    // quedó en null desde ahí y sigue sonando pausada, como corresponde.
    el.searchInput.value = "";
    state.searchQuery = "";
    // Único punto de salida del sheet (scrim y "Volver" son las dos vías,
    // ver bindEvents) — onClose deja que el host reaccione a "se cerró"
    // sin importar por qué vía, opcional para no romper páginas que no lo
    // pasan (ver options.onClose en init()).
    if (typeof onCloseCallback === "function") onCloseCallback();
  }

  function activateSearch() {
    state.searchActive = true;
    el.root.classList.add("tmusic-search-active");
    renderSuggestions();
    window.setTimeout(function () { el.searchInput.focus(); }, 50);
  }

  function deactivateSearch() {
    state.searchActive = false;
    state.searchQuery = "";
    el.searchInput.value = "";
    el.root.classList.remove("tmusic-search-active");
    renderList();
  }

  function showToast(msg) {
    el.toastText.textContent = msg;
    el.toast.classList.add("tmusic-toast-show");
    window.setTimeout(function () { el.toast.classList.remove("tmusic-toast-show"); }, 1600);
  }

  function bindEvents() {
    if (state.bound) return;
    el.scrim.addEventListener("click", closeSheet);
    el.backBtn.addEventListener("click", function () {
      if (state.searchActive) { deactivateSearch(); return; }
      closeSheet();
    });

    el.searchToggleBtn.addEventListener("click", activateSearch);
    el.searchCancelBtn.addEventListener("click", deactivateSearch);

    el.searchInput.addEventListener("input", function (e) {
      state.searchQuery = e.target.value;
      renderList();
    });

    el.originalToggleBtn.addEventListener("click", toggleOriginalMute);
    el.musicToggleBtn.addEventListener("click", toggleMusicMute);
    el.volumeBtn.addEventListener("click", openVolumePanel);
    el.volumeDoneBtn.addEventListener("click", closeVolumePanel);
    el.originalVolumeSlider.addEventListener("input", function (e) { setOriginalVolume(Number(e.target.value)); });
    el.musicVolumeSlider.addEventListener("input", function (e) { setMusicVolume(Number(e.target.value)); });

    state.bound = true;
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var styleEl = document.createElement("style");
    styleEl.id = STYLE_ID;
    styleEl.textContent = STYLE_CSS;
    document.head.appendChild(styleEl);
  }

  /* Inyecta el markup (scrim + sheet + toast) dentro de `container` una
     única vez. Si ya existe #tmusicRoot en el documento (por ejemplo, si
     init() se llama más de una vez en la misma página), lo reutiliza en
     vez de duplicarlo. */
  function mount(container) {
    var existing = document.getElementById("tmusicRoot");
    if (existing) { cacheRefs(existing); return existing; }

    ensureStyle();
    var target = container || document.body;
    target.insertAdjacentHTML("beforeend", TEMPLATE_HTML);
    var root = document.getElementById("tmusicRoot");
    cacheRefs(root);
    renderTabs();
    bindEvents();
    renderSoundbar();
    fillSlider(el.originalVolumeSlider, state.originalVolume);
    fillSlider(el.musicVolumeSlider, state.musicVolume);
    state.mounted = true;
    return root;
  }

  /* API pública ------------------------------------------------------- */
  var MusicPicker = {
    /* options.container:     nodo donde montar el overlay (ej. .prev-phone
                               o .cam-phone). Se ignora si ya está montado.
       options.initialSongId: musicId a preseleccionar (o null/undefined
                               si todavía no hay ninguna canción elegida).
       options.onUse:         function(song) — se llama al tocar una fila
                               (sin CTA de confirmación: tocar YA selecciona,
                               ver useSong).
       options.onPreviewChange: function(song, isPlaying) — se llama al
                                iniciar o pausar la preescucha.
       options.onClose:       function() — opcional, se llama al cerrarse
                               el sheet por cualquier vía (scrim o "Volver").
                               No lo usa camara-video-guiado.html (queda
                               undefined ahí, closeSheet lo ignora).
       options.onOriginalSoundChange: function(muted) — se llama al tocar
                               "Sonido original" en la soundbar (silenciar/
                               reactivar el audio propio del video).
       options.onMusicMuteChange:     function(muted) — ídem para "Sonido"
                               (silenciar/reactivar la música elegida, sin
                               borrar la selección).
       options.onOriginalVolumeChange: function(volume0to1) — se llama al
                               mover el slider de "Sonido original" dentro
                               del panel de Volumen.
       options.onMusicVolumeChange:    function(volume0to1) — ídem para el
                               slider de "Sonido" (música). Las cuatro son
                               opcionales y, si se pasan, se invocan también
                               una vez al final de init() para que el host
                               sincronice su audio con el estado inicial. */
    init: function (options) {
      options = options || {};
      mount(options.container);
      onUseCallback = typeof options.onUse === "function" ? options.onUse : null;
      onCloseCallback = typeof options.onClose === "function" ? options.onClose : null;
      onPreviewChangeCallback = typeof options.onPreviewChange === "function" ? options.onPreviewChange : null;
      onOriginalSoundChangeCallback = typeof options.onOriginalSoundChange === "function" ? options.onOriginalSoundChange : null;
      onMusicMuteChangeCallback = typeof options.onMusicMuteChange === "function" ? options.onMusicMuteChange : null;
      onOriginalVolumeChangeCallback = typeof options.onOriginalVolumeChange === "function" ? options.onOriginalVolumeChange : null;
      onMusicVolumeChangeCallback = typeof options.onMusicVolumeChange === "function" ? options.onMusicVolumeChange : null;

      // La fila ya se resalta sola en renderList() cuando abre el sheet
      // (compara contra state.selectedId), no hace falta una selectbar
      // aparte para reflejar la preselección inicial.
      state.selectedId = options.initialSongId || null;
      state.previewingId = null;

      // Sincroniza al host con el estado de audio actual (persiste entre
      // re-inits, ver resetMusicPickerSelection en camara-preview.html: no
      // se resetea acá porque silenciar/ajustar volumen es independiente
      // de qué canción esté elegida).
      if (onOriginalSoundChangeCallback) onOriginalSoundChangeCallback(state.originalMuted);
      if (onMusicMuteChangeCallback) onMusicMuteChangeCallback(state.musicMuted);
      if (onOriginalVolumeChangeCallback) onOriginalVolumeChangeCallback(state.originalVolume / 100);
      if (onMusicVolumeChangeCallback) onMusicVolumeChangeCallback(state.musicVolume / 100);

      return MusicPicker;
    },
    open: function () {
      openSheet();
      loadList();
    },
    close: closeSheet,
    getSelected: function () { return findSong(state.selectedId); }
  };

  window.MusicPicker = MusicPicker;
})();
