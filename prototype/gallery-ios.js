/* iOS-style photo picker header for the camera gallery.
   Adds "Cancel · Photos/Albums · Add" on top of the prototype's own gallery and keeps
   all its logic (selection, limits, loading): the new buttons just trigger the original ones. */
(function () {
  function setup() {
    var overlay = document.querySelector('.cam-gallery-overlay');
    var sheet = overlay && overlay.querySelector('.cam-gallery-modal-sheet');
    if (!sheet || sheet.querySelector('.ios-picker-bar')) return;

    var bar = document.createElement('div');
    bar.className = 'ios-picker-bar';
    bar.innerHTML =
      '<button type="button" class="ios-cancel">Cancel</button>' +
      '<div class="ios-seg" role="tablist" aria-label="Library">' +
        '<button type="button" role="tab" class="ios-seg-btn is-on" data-view="media"></button>' +
        '<button type="button" role="tab" class="ios-seg-btn" data-view="albums">Albums</button>' +
      '</div>' +
      '<button type="button" class="ios-add" disabled>Add</button>';
    sheet.insertBefore(bar, sheet.firstChild);

    var mediaTab = document.getElementById('cam-gallery-media-tab');
    var albumsTab = document.getElementById('cam-gallery-albums-tab');
    var nativeDone = document.getElementById('cam-gallery-native-done');
    var nativeCount = document.getElementById('cam-gallery-native-count');
    var segMedia = bar.querySelector('[data-view="media"]');
    var segAlbums = bar.querySelector('[data-view="albums"]');
    var add = bar.querySelector('.ios-add');

    function sync() {
      var label = mediaTab ? mediaTab.textContent.trim() : 'Photos';
      segMedia.textContent = /video/i.test(label) ? 'Videos' : 'Photos';
      var mediaOn = !albumsTab || !albumsTab.classList.contains('is-active');
      segMedia.classList.toggle('is-on', mediaOn);
      segAlbums.classList.toggle('is-on', !mediaOn);
      segMedia.setAttribute('aria-selected', String(mediaOn));
      segAlbums.setAttribute('aria-selected', String(!mediaOn));
      var n = parseInt(nativeCount && nativeCount.textContent, 10) || 0;
      add.textContent = n > 0 ? 'Add (' + n + ')' : 'Add';
      add.disabled = !n || (nativeDone && nativeDone.disabled);
    }

    bar.querySelector('.ios-cancel').addEventListener('click', function () {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });
    segMedia.addEventListener('click', function () { if (mediaTab) mediaTab.click(); setTimeout(sync, 30); });
    segAlbums.addEventListener('click', function () { if (albumsTab) albumsTab.click(); setTimeout(sync, 30); });
    add.addEventListener('click', function () { if (nativeDone) nativeDone.click(); });

    var mo = new MutationObserver(sync);
    [mediaTab, albumsTab, nativeCount, nativeDone].forEach(function (el) {
      if (el) mo.observe(el, { attributes: true, childList: true, characterData: true, subtree: true });
    });
    sync();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
