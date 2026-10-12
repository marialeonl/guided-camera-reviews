/* iOS-style camera mode switcher, in a loop.
   The selected mode sits in the centre of a pill track with its neighbours on
   each side (Video · Guided video · Photo), wrapping around. Keeps the
   prototype's own tab buttons and click/swipe logic: it only reorders and
   slides them. */
(function () {
  var CYCLE = ['video', 'video-guiado', 'foto']; // left → right, Guided video in the middle

  function setup() {
    var tabs = document.getElementById('cam-tabs');
    if (!tabs || tabs.parentElement.classList.contains('cam-tabs-track')) return;
    var track = document.createElement('div');
    track.className = 'cam-tabs-track';
    tabs.parentNode.insertBefore(track, tabs);
    track.appendChild(tabs);

    function byKey(k) { return tabs.querySelector('.cam-tab[data-tab="' + k + '"]'); }
    function activeKey() {
      var a = tabs.querySelector('.cam-tab.is-active');
      return a ? a.getAttribute('data-tab') : 'video-guiado';
    }
    /* Fixed order: Video · Guided video · Photo. All three fit inside the pill, so
       nothing slides or wraps: the group stays centred and only the highlight moves. */
    function groupOffset() { return Math.round((track.clientWidth - tabs.offsetWidth) / 2); }
    function layout() {
      CYCLE.forEach(function (k) { var el = byKey(k); if (el) tabs.appendChild(el); });
      tabs.style.transition = 'none';
      tabs.style.transform = 'translateX(' + groupOffset() + 'px)';
    }
    function offsetFor() { return groupOffset(); }

    /* ---- Drag to switch (follows the finger; releases toward the dragged side, in a loop) ---- */
    var nav = track.parentElement || track;
    var pid = null, startX = 0, startBase = 0, startT = 0, moved = false, suppressClick = false;
    nav.style.touchAction = 'pan-y';
    nav.style.cursor = 'grab';

    function currentX() { return parseFloat((tabs.style.transform.match(/-?[\d.]+/) || [0])[0]) || 0; }
    function neighbor(dir) { // dir: +1 = tab on the right, -1 = tab on the left
      var list = Array.prototype.slice.call(tabs.querySelectorAll('.cam-tab')).filter(function (t) { return !t.disabled && !t.classList.contains('is-locked'); });
      var i = list.indexOf(tabs.querySelector('.cam-tab.is-active'));
      return list[i + dir] || null;
    }
    function centre(el) { return el.offsetLeft + el.offsetWidth / 2; }
    function snapBack(x) {
      tabs.style.transition = 'transform .32s cubic-bezier(.32,.72,0,1)';
      tabs.style.transform = 'translateX(' + Math.round(x) + 'px)';
    }

    nav.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (!track.offsetWidth) return;
      pid = e.pointerId; startX = e.clientX; startT = e.timeStamp; startBase = currentX(); moved = false;
    });
    nav.addEventListener('pointermove', function (e) {
      if (pid === null || e.pointerId !== pid) return;
      var dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 6) {
        moved = true;
        try { nav.setPointerCapture(pid); } catch (err) { /* noop */ }
        tabs.style.transition = 'none';
        nav.style.cursor = 'grabbing';
      }
      if (moved) {
        var a = tabs.querySelector('.cam-tab.is-active');
        var r = neighbor(1), l = neighbor(-1);
        var maxL = r ? centre(r) - centre(a) : 40;   // dragging left reveals the right neighbour
        var maxR = l ? centre(a) - centre(l) : 40;   // dragging right reveals the left neighbour
        var d = Math.max(-maxL * .35, Math.min(maxR * .35, dx));
        tabs.style.transform = 'translateX(' + (startBase + d) + 'px)';
      }
    });
    function endDrag(e) {
      if (pid === null || e.pointerId !== pid) return;
      var wasMoved = moved, dx = e.clientX - startX, dt = Math.max(1, e.timeStamp - startT);
      pid = null; moved = false; nav.style.cursor = 'grab';
      try { nav.releasePointerCapture(e.pointerId); } catch (err) { /* noop */ }
      if (!wasMoved) return;
      var a = tabs.querySelector('.cam-tab.is-active');
      var target = null;
      var r = neighbor(1), l = neighbor(-1);
      var dist = Math.max(48, ((r ? centre(r) - centre(a) : 0) + (l ? centre(a) - centre(l) : 0)) / 2);
      var flick = Math.abs(dx) / dt > 0.45 && Math.abs(dx) > 14;
      if (dx < 0 && (Math.abs(dx) > dist * 0.3 || flick)) target = r;      // dragged left → next mode
      else if (dx > 0 && (Math.abs(dx) > dist * 0.3 || flick)) target = l; // dragged right → previous mode
      if (target && !target.disabled && !target.classList.contains('is-locked')) target.click();
      // after switching, swallow the click the browser fires on pointer-up so it doesn't hit a tab
      suppressClick = true; setTimeout(function () { suppressClick = false; }, 0);
      setTimeout(function () { if (!target || tabs.querySelector('.cam-tab.is-active') === a) snapBack(groupOffset()); }, 40);
    }
    nav.addEventListener('pointerup', endDrag);
    nav.addEventListener('pointercancel', endDrag);
    nav.addEventListener('click', function (e) { if (suppressClick) { e.stopPropagation(); e.preventDefault(); } }, true);

    new MutationObserver(function (muts) {
      if (muts.some(function (m) { return m.attributeName === 'class'; })) layout();
    }).observe(tabs, { subtree: true, attributes: true, attributeFilter: ['class'] });
    window.addEventListener('resize', function () { layout(); });
    layout();
    setTimeout(function () { layout(); }, 60);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { layout(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
