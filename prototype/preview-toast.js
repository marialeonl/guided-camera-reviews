/* Preview: when it opens, a message slides down from the top ("You earned N tickets") for the
   first photo / video / guided video of the session, then slides away. Whatever stays in the preview
   is what gets uploaded to the form. */
(function () {
  var POINTS = { photo: 50, video: 80, 'video-guiado': 90 };
  var shown = false;
  function show(points) {
    var phone = document.querySelector('.prev-phone');
    if (!phone || shown) return;
    shown = true;
    var t = document.createElement('div');
    t.className = 'prev-earn-toast';
    t.setAttribute('role', 'status');
    var es = window.PROTO_LANG === 'es';
    t.innerHTML = '<span class="prev-earn-toast__coin" aria-hidden="true"></span><span>' + (es ? 'Ganaste <b>' + points + ' puntos</b>' : 'You earned <b>' + points + ' tickets</b>') + '</span>';
    phone.appendChild(t);
    requestAnimationFrame(function () { requestAnimationFrame(function () { t.classList.add('is-in'); }); });
    setTimeout(function () { t.classList.remove('is-in'); }, 3200);
    setTimeout(function () { t.remove(); }, 4000);
  }
  function check() {
    var m = window.currentMedia;
    if (!m || shown) return false;
    var pts = POINTS[m.type];
    var sel = document.querySelector('.prev-photo-set-thumb.is-selected');
    var firstOfType = !sel || sel.classList.contains('has-reward');   // only the first of each type earns points
    if (pts && firstOfType) show(pts);
    return true;
  }
  function start() {
    var tries = 0;
    var iv = setInterval(function () { tries++; if (check() || tries > 20) clearInterval(iv); }, 300);
  }
  if (document.readyState === 'complete') start(); else window.addEventListener('load', start);
})();
