/* When there is no camera (blocked, denied or none), the camera screen plays demo footage of the product
   instead of the "allow camera access" message, so the prototype can still be explored. */
(function () {
  var VIDEO = 'assets/portfolio/demo-feed.mp4', POSTER = 'assets/portfolio/demo-feed.jpg';
  var COVER = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:1;display:block';
  function apply() {
    var fb = document.getElementById('cam-feed-fallback');
    if (!fb || fb.hidden) return;
    var img = fb.querySelector('.cam-feed-fallback-img');
    var msg = fb.querySelector('.cam-feed-fallback-msg');
    if (img) { if (img.getAttribute('src') !== POSTER) img.setAttribute('src', POSTER); img.style.cssText = COVER; }
    if (msg) msg.style.display = 'none';
    fb.style.opacity = '1'; fb.style.visibility = 'visible';
    if (!fb.querySelector('#demo-feed-video')) {
      var v = document.createElement('video');
      v.id = 'demo-feed-video'; v.src = VIDEO; v.poster = POSTER;
      v.muted = true; v.loop = true; v.autoplay = true; v.playsInline = true; v.setAttribute('playsinline', '');
      v.style.cssText = COVER;
      v.addEventListener('error', function () { v.remove(); });
      fb.appendChild(v);
      var p = v.play(); if (p && p.catch) p.catch(function () { /* autoplay blocked: the poster stays */ });
    }
  }
  window.addEventListener('load', function () { apply(); setInterval(apply, 600); });
})();
