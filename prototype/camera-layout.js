/* Camera layout tweaks for the portfolio version:
   - gallery thumbnail moves into the bottom row, left of the mode tabs
   - "Delete" (free video, paused) becomes a horizontal icon + label button below the shutter */
(function () {
  function setup() {
    var gallery = document.getElementById('cam-gallery-btn');
    var nav = document.getElementById('cam-nav');
    if (gallery && nav && gallery.parentElement !== nav) nav.insertBefore(gallery, nav.firstChild); // gallery sits in the bottom row, left of the mode tabs
    var del = document.getElementById('cam-nav-delete-btn');
    var slot = document.querySelector('.cam-confirm-slot');
    var ok = document.getElementById('cam-confirm-btn');
    if (del && slot && del.parentElement !== slot) slot.insertBefore(del, ok || slot.firstChild); // Delete sits left of the check
    if (del && !del.querySelector('.ph-del')) {
      del.innerHTML = '<i class="ph ph-backspace ph-del" aria-hidden="true"></i>';
      del.setAttribute('aria-label', 'Delete last take');
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
