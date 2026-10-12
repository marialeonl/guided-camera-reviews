/* Adds the title + short description at the top of the prototype's side panel. */
(function () {
  var SCREENS = { 'review-form': 'Review form', 'camara-video-guiado': 'Guided camera', 'camara-preview': 'Video preview' };
  function setup() {
    var sb = document.querySelector('.proto-sidebar');
    if (!sb || sb.querySelector('.proto-intro')) return;
    var page = (location.pathname.split('/').pop() || '').replace('.html', '');
    var box = document.createElement('div');
    box.className = 'proto-intro';
    box.innerHTML =
      '<p class="eyebrow">Interactive prototype' + (SCREENS[page] ? ' · ' + SCREENS[page] : '') + '</p>' +
      '<h1>Guided camera<br>for <span class="grad-text">video reviews</span></h1>' +
      '<p>A buyer reviews a product they bought by recording a short video.</p>' +
      '<p><b>Goal: record a short video that shows the product clearly, one guided shot at a time.</b></p>' +
      '<a class="proto-case-btn" href="../case-study/reviews.html">Read the case study<span aria-hidden="true"></span></a>';
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
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else window.addEventListener('load', setup);
})();
