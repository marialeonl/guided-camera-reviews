/* Removes internal-only prototype controls (links to deprecated flows, unreleased
   proposals, status badges) and keeps the "try the states" controls for shipped features. */
(function () {
  var DROP = ['MVP Reviews', 'End game', 'Propuestas de galería', 'Gallery proposals'];
  function clean() {
    var sb = document.querySelector('.proto-sidebar');
    if (!sb) return;
    sb.querySelectorAll('.proto-feature').forEach(function (f) {
      var h = f.querySelector('.proto-feature-header, .proto-feature-header-static');
      var label = h ? h.textContent.trim() : '';
      if (DROP.some(function (d) { return label.indexOf(d) === 0; })) f.remove();
    });
    sb.querySelectorAll('.proto-feature-status--hold, .proto-feature-status--deprecated').forEach(function (b) { b.remove(); });
    sb.querySelectorAll('.proto-feature-case-label--separated').forEach(function (l) { l.remove(); });
    if (!sb.querySelector('.proto-feature')) { sb.style.display = 'none'; return; }
    if (!sb.querySelector('.proto-sidebar-intro')) {
      var intro = document.createElement('p');
      intro.className = 'proto-sidebar-intro';
      intro.textContent = 'Automatic video adjustments';
      sb.insertBefore(intro, sb.firstChild);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', clean); else clean();
})();
