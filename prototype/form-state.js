/* Keeps what the buyer entered in the form (stars, comment, anonymous, fit) while they go to the
   camera / preview and come back, including after discarding a video. "Restart prototype" clears it. */
(function () {
  var sid = (location.search.match(/[?&]sid=([^&]+)/) || [])[1] || 'default';
  var KEY = 'rf-draft:' + sid;
  function read() { try { return JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch (e) { return null; } }
  function write(d) { try { sessionStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { /* noop */ } }

  function collect() {
    var row = document.querySelector('.rf-stars-row');
    var ta = document.getElementById('rf-comment-textarea');
    var anon = document.getElementById('rf-anonymous-toggle');
    var dots = Array.prototype.slice.call(document.querySelectorAll('.rf-fit-dot'));
    return {
      rating: row ? parseInt(row.dataset.rating || '0', 10) : null,
      text: ta ? ta.value : '',
      anon: !!(anon && anon.checked),
      fit: dots.findIndex(function (d) { return d.classList.contains('is-selected'); })
    };
  }
  var t = null, cleared = false;
  function scheduleSave() { if (cleared) return; clearTimeout(t); t = setTimeout(function () { write(collect()); }, 60); }

  function restore() {
    var d = read();
    if (!d) return;
    var stars = document.querySelectorAll('.rf-star-btn');
    if (d.rating && stars[d.rating - 1]) stars[d.rating - 1].click();
    var ta = document.getElementById('rf-comment-textarea');
    if (ta && d.text) { ta.value = d.text; ta.dispatchEvent(new Event('input', { bubbles: true })); }
    var anon = document.getElementById('rf-anonymous-toggle');
    if (anon && d.anon) { anon.checked = true; anon.dispatchEvent(new Event('change', { bubbles: true })); }
    if (d.fit >= 0 && window.setReviewFitAnswer) window.setReviewFitAnswer(d.fit);
  }

  function setup() {
    restore();
    ['click', 'input', 'change', 'pointerup'].forEach(function (ev) { document.addEventListener(ev, scheduleSave, true); });
    window.addEventListener('pagehide', function () { if (!cleared) write(collect()); });
    var reset = document.getElementById('proto-reset-btn');
    if (reset) reset.addEventListener('click', function () { try { sessionStorage.removeItem(KEY); } catch (e) { /* noop */ } clearTimeout(t); cleared = true; }, true);
  }
  if (document.readyState === 'complete') setTimeout(setup, 50); else window.addEventListener('load', function () { setTimeout(setup, 50); });
})();
