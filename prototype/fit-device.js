/* Scales the phone frame so it takes 90% of the window height. */
(function () {
  function fit() {
    var frame = document.querySelector('.device-frame');
    if (!frame) return;
    frame.style.zoom = 1;
    var h = frame.offsetHeight || 939;
    frame.style.zoom = (window.innerHeight * 0.9 / h).toFixed(4);
  }
  window.addEventListener('resize', fit);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fit); else fit();
})();
