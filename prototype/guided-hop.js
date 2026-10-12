/* Guided video: the prompt and its section hop together (small bounce) when the mode opens
   and whenever the next section becomes the current one. */
(function () {
  var timer = null;
  function hop() {
    var chip = document.querySelector('.cam-instruction-chip');
    var step = document.querySelector('.cam-step-thumb.is-active');
    var els = [chip, step].filter(Boolean);
    if (!els.length) return;
    els.forEach(function (el) { el.classList.remove('is-hopping'); });
    void document.body.offsetWidth;
    els.forEach(function (el) { el.classList.add('is-hopping'); });
    clearTimeout(timer);
    timer = setTimeout(function () { els.forEach(function (el) { el.classList.remove('is-hopping'); }); }, 1200);
  }
  function currentId() { var a = document.querySelector('.cam-step-thumb.is-active'); return a ? a.id : ''; }
  function setup() {
    var last = currentId(), guided = document.body.classList.contains('cam-mode-guiado');
    if (guided) setTimeout(hop, 500);                         // opening in guided video
    new MutationObserver(function () {
      var now = document.body.classList.contains('cam-mode-guiado');
      if (now && !guided) setTimeout(hop, 120);              // switched into guided video
      guided = now;
    }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    var row = document.querySelector('.cam-steps-row');
    if (row) new MutationObserver(function () {
      var id = currentId();
      if (id && id !== last && document.body.classList.contains('cam-mode-guiado')) { last = id; setTimeout(hop, 150); }   // next section
      else last = id || last;
    }).observe(row, { attributes: true, subtree: true, attributeFilter: ['class'] });
  }
  /* Press feedback: the tapped section and the prompt both sink a little while pressed and spring back on release */
  function pressSetup() {
    var row = document.querySelector('.cam-steps-row');
    if (!row) return;
    var held = [];
    function release() { held.forEach(function (el) { el.classList.remove('is-pressed'); }); held = []; }
    row.addEventListener('pointerdown', function (e) {
      var thumb = e.target.closest && e.target.closest('.cam-step-thumb');
      if (!thumb) return;
      release();
      held = [thumb, document.querySelector('.cam-instruction-chip')].filter(Boolean);
      held.forEach(function (el) { el.classList.add('is-pressed'); });
    });
    ['pointerup', 'pointercancel'].forEach(function (t) { window.addEventListener(t, release); });
  }
  if (document.readyState === 'complete') pressSetup(); else window.addEventListener('load', pressSetup);
  if (document.readyState === 'complete') setup(); else window.addEventListener('load', setup);
})();
