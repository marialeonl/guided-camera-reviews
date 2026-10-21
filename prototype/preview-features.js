/* Preview screen · portfolio version.
   - side panel becomes a plain-language list of the automatic adjustments the preview applies to the video
   - descriptions in English, no internal product name */
(function () {
  var ES = window.PROTO_LANG === 'es';
  var FEATURES = ES ? {
    'Auto Audio Enhancement': { title: 'Mejora automática de audio', meta: 'Automático', body: 'Reduce el ruido de fondo y equilibra la voz y el volumen, sin pasos extra para el comprador.' },
    'Estabilización y encuadre automático de video': { title: 'Estabilización y encuadre', meta: 'Automático', body: 'Suaviza las imágenes temblorosas y ajusta el encuadre para que el producto siga siendo el foco.' },
    'Auto Trim': { title: 'Recorte automático', meta: 'Automático', body: 'Encuentra los momentos muertos al inicio o al final de un video, como silencio, un lente tapado o el teléfono apoyado, y los recorta. El contenido relevante nunca se modifica.' }
  } : {
    'Auto Audio Enhancement': { meta: 'Automatic', body: 'Reduces background noise and evens out the voice and volume, with no extra step for the buyer.' },
    'Estabilización y encuadre automático de video': { title: 'Stabilisation and framing', meta: 'Automatic', body: 'Smooths out shaky footage and adjusts the framing so the product stays the focus.' },
    'Auto Trim': { title: 'Auto trim', meta: 'Automatic', body: 'Finds dead moments at the start or end of a video, like silence, a covered lens or setting the phone down, and trims them. Relevant content is never changed.' }
  };

  function keyboard() {
    // iOS-style labels on the text editor keyboard
    var num = document.querySelector('.tx-fake-keyboard [data-action="numeric"]'); if (num) num.textContent = '123';
    var tm = document.querySelector('.prev-trim-statusbar > span'); if (tm) tm.textContent = '12:30';
    var done = document.querySelector('.tx-fake-keyboard [data-action="enter"]'); if (done) { done.textContent = ES ? 'Listo' : 'Done'; done.setAttribute('aria-label', ES ? 'Listo' : 'Done'); }
  }
  function clean() {
    keyboard();
    var sb = document.querySelector('.proto-sidebar');
    if (!sb) return;
    var cards = Array.prototype.slice.call(sb.querySelectorAll('.proto-feature'));
    cards.forEach(function (card) {
      var head = card.querySelector('.proto-feature-header span, .proto-feature-header-static span');
      var name = head ? head.textContent.trim() : '';
      var f = FEATURES[name];
      if (!f) { card.remove(); return; } // MVP/End game links, voice variants, music: not part of the shipped preview
      if (head) head.textContent = f.title || name;
      var meta = card.querySelector('.proto-feature-meta'); if (meta) meta.textContent = f.meta;
      var desc = card.querySelector('.proto-feature-description'); if (desc) desc.textContent = f.body;
      var link = card.querySelector('.proto-feature-library-link'); if (link) link.remove();
      var toggleRow = card.querySelector('.music-feature-toggle-row'); if (toggleRow) toggleRow.remove();
    });
    if (!sb.querySelector('.proto-sidebar-intro')) {
      var intro = document.createElement('p');
      intro.className = 'proto-sidebar-intro';
      intro.textContent = ES ? 'Ajustes automáticos del video' : 'Automatic video adjustments';
      sb.insertBefore(intro, sb.firstChild);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', clean); else clean();
})();
