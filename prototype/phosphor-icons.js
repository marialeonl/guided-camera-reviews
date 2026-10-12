/* Swaps the camera control icons for Phosphor Icons (pinned v2.1.1).
   Regular weight = off, fill = on, so state never depends on colour alone.
   The prototype keeps its own logic: when it re-renders an icon after a state
   change, this layer swaps it again based on the button's data-state. */
(function () {
  var BASE = 'https://unpkg.com/@phosphor-icons/web@2.1.1/src/';
  ['regular', 'fill'].forEach(function (w) {
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = BASE + w + '/style.css';
    document.head.appendChild(l);
  });

  function icon(cls, extra) {
    return '<i class="' + cls + ' ph-cam" aria-hidden="true"></i>' + (extra || '');
  }
  var RENDER = {
    'cam-flip-btn': function () { return icon('ph ph-camera-rotate'); },
    'cam-flash-btn': function (s) { return s === 'on' ? icon('ph-fill ph-lightning is-on') : icon('ph ph-lightning-slash'); },
    'cam-timer-btn': function (s) {
      return s && s !== 'off'
        ? icon('ph-fill ph-timer is-on', '<span class="ph-cam-badge">' + s + 's</span>')
        : icon('ph ph-timer');
    }
  };

  function paint(btn) {
    var slot = btn.querySelector('.cam-icon-slot') || btn;
    var html = RENDER[btn.id](btn.dataset.state);
    if (btn.id !== 'cam-flip-btn') btn.setAttribute('aria-pressed', String(!!btn.dataset.state && btn.dataset.state !== 'off'));
    if (slot.getAttribute('data-ph') === html) return;
    slot.setAttribute('data-ph', html);
    slot.innerHTML = html;
  }

  function setup() {
    Object.keys(RENDER).forEach(function (id) {
      var btn = document.getElementById(id);
      if (!btn) return;
      paint(btn);
      new MutationObserver(function () {
        var slot = btn.querySelector('.cam-icon-slot') || btn;
        if (!slot.querySelector('.ph-cam') || slot.getAttribute('data-ph') !== RENDER[id](btn.dataset.state)) {
          slot.removeAttribute('data-ph');
          paint(btn);
        }
      }).observe(btn, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-state'] });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
