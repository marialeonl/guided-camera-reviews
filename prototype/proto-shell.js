/* Adds the title + short description at the top of the prototype's side panel. */
(function () {
  var ES = window.PROTO_LANG === 'es';
  var SCREENS = ES
    ? { 'review-form': 'Formulario de opinión', 'camara-video-guiado': 'Cámara guiada', 'camara-preview': 'Vista previa del video' }
    : { 'review-form': 'Review form', 'camara-video-guiado': 'Guided camera', 'camara-preview': 'Video preview' };
  var COPY = ES
    ? { eyebrow: 'Prototipo interactivo', h1: 'Cámara guiada<br>para <span class="grad-text">opiniones en video</span>',
        p1: 'Un comprador opina sobre un producto que compró grabando un video corto.',
        p2: 'Objetivo: grabar un video corto que muestre bien el producto, una toma guiada a la vez.', btn: 'Leer el caso de estudio' }
    : { eyebrow: 'Interactive prototype', h1: 'Guided camera<br>for <span class="grad-text">video reviews</span>',
        p1: 'A buyer reviews a product they bought by recording a short video.',
        p2: 'Goal: record a short video that shows the product clearly, one guided shot at a time.', btn: 'Read the case study' };
  function setup() {
    var sb = document.querySelector('.proto-sidebar');
    if (!sb || sb.querySelector('.proto-intro')) return;
    var page = (location.pathname.split('/').pop() || '').replace('.html', '');
    var box = document.createElement('div');
    box.className = 'proto-intro';
    box.innerHTML =
      '<p class="eyebrow">' + COPY.eyebrow + (SCREENS[page] ? ' · ' + SCREENS[page] : '') + '</p>' +
      '<h1>' + COPY.h1 + '</h1>' +
      '<p>' + COPY.p1 + '</p>' +
      '<p><b>' + COPY.p2 + '</b></p>' +
      '<a class="proto-case-btn" href="../case-study/reviews.html">' + COPY.btn + '<span aria-hidden="true"></span></a>';
    sb.insertBefore(box, sb.firstChild);
    sb.style.display = 'flex';
  }
  /* Camera and preview: the icon buttons show their names (to the left of each icon) for 10 s when the screen opens */
  function showToolLabels() {
    var page = (location.pathname.split('/').pop() || '').replace('.html', '');
    if (page !== 'camara-video-guiado' && page !== 'camara-preview') return;
    document.body.classList.add('show-tool-labels');
    setTimeout(function () { document.body.classList.remove('show-tool-labels'); }, 10200);
  }
  window.addEventListener('load', function () { setTimeout(showToolLabels, 400); });
  function boot() { setup(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else window.addEventListener('load', boot);
})();
