/* Preview · subtitles without a voice recording.
   In the original prototype the subtitles come from a recorded voice. Here they belong to the video itself:
   the Subtitles button shows for any video, the lines are editable in the existing sheet, and the on-video
   caption follows the video's own playback. Sample lines stand in for the transcript. */
(function () {
  var SAMPLE = 'Clean, deep sound. Comfortable for hours.';

  function g(name) { return window[name]; }
  function video() { return document.getElementById('prev-gallery-video'); }
  function isVideo() { var m = g('currentMedia'); return !!m && (m.type === 'video' || m.type === 'video-guiado'); }
  function key() {
    try { return String(g('activePreviewVoiceMediaId') || (g('previewVoiceMediaId') && g('previewVoiceMediaId')(g('currentMedia'))) || 'sample'); }
    catch (e) { return 'sample'; }
  }
  function duration() {
    var v = video(), m = g('currentMedia');
    return Math.max(1, Math.min(12, (v && isFinite(v.duration) && v.duration) || (m && m.durationSeconds) || 12));
  }
  function ensureLines() {
    var store = g('ccCaptionLinesByMedia'), edited = g('ccCaptionLinesEditedByMedia'), sig = g('ccCaptionLineSignatures');
    var k = key();
    var d0 = duration();
    // keep user edits; otherwise rebuild when the real video duration becomes known
    if (store[k] && edited[k] && (store[k]._touched || Math.abs((store[k]._dur || 0) - d0) < .5)) return store[k];
    var words = SAMPLE.split(/\s+/), n = Math.ceil(words.length / 4), d = duration(), lines = [];
    for (var i = 0; i < n; i++) lines.push({ start: d * i / n, time: Math.round(d * i / n), text: words.slice(i * 4, i * 4 + 4).join(' ') });
    lines._dur = d; store[k] = lines; sig[k] = ''; edited[k] = true;
    return lines;
  }

  /* On-video caption */
  function update() {
    var wrap = document.getElementById('prev-voice-captions');
    var cap = wrap && wrap.querySelector('.prev-voice-caption');
    var v = video();
    if (!wrap || !cap) return;
    if (!g('ccEnabled') || !g('ccApplied') || !isVideo() || !v || v.classList.contains('is-hidden')) { wrap.classList.remove('is-visible'); return; }
    var lines = ensureLines(), t = v.currentTime || 0, idx = 0;
    for (var i = 1; i < lines.length; i++) { if (t >= lines[i].start) idx = i; else break; }
    var line = lines[idx], words = String(line.text || '').split(/\s+/).filter(Boolean);
    if (!words.length) { wrap.classList.remove('is-visible'); return; }
    var next = lines[idx + 1] ? lines[idx + 1].start : duration();
    var span = Math.max(.1, next - line.start);
    var wi = Math.min(words.length - 1, Math.floor(Math.max(0, t - line.start) / span * words.length));
    var ck = idx + ':' + words.join(' ');
    if (cap.dataset.captionKey !== ck) {
      cap.replaceChildren();
      words.forEach(function (w) { var s = document.createElement('span'); s.className = 'caption-word'; s.textContent = w; cap.appendChild(s); });
      cap.dataset.captionKey = ck;
    }
    Array.prototype.forEach.call(cap.children, function (el, i) { el.classList.toggle('is-current-word', i === wi); });
    cap.dataset.style = g('ccCaptionStyle');
    var pos = g('ccCaptionPosition');
    wrap.style.top = pos === 'top' ? '28%' : pos === 'bottom' ? '68%' : '50%';
    wrap.classList.add('is-visible');
  }

  /* Subtitles button: visible for any video */
  function syncButton() {
    var b = document.getElementById('prev-fx-cc-btn');
    if (!b) return;
    var on = !!(g('ccEnabled') && g('ccApplied'));
    b.classList.toggle('is-hidden', !isVideo());
    b.classList.toggle('is-active', on);
    b.setAttribute('aria-pressed', String(on));
  }

  /* Sheet: same UI as before, rows built from the video's lines */
  function open() {
    var lines = ensureLines();
    var toggle = document.getElementById('cc-enabled-toggle');
    if (!g('ccApplied')) window.ccEnabled = true;       // first time: toggle on, button stays unselected until Save
    if (toggle) toggle.checked = !!g('ccEnabled');
    var list = document.getElementById('cc-lines');
    if (list) {
      list.replaceChildren();
      lines.forEach(function (line, index) {
        var row = document.createElement('div'); row.className = 'cc-line'; row.setAttribute('data-caption-index', String(index));
        var time = document.createElement('span'); time.className = 'cc-line-time'; time.textContent = '0:' + String(line.time).padStart(2, '0');
        var input = document.createElement('input'); input.className = 'cc-line-input'; input.type = 'text'; input.value = line.text;
        input.autocomplete = 'off'; input.spellcheck = true; input.setAttribute('enterkeyhint', 'done');
        input.setAttribute('aria-label', 'Edit subtitle starting at 0:' + String(line.time).padStart(2, '0'));
        input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); input.blur(); } });
        input.addEventListener('focus', function () {
          window.ccSelectedLineIndex = index; window.ccKeyboardInput = input;
          list.querySelectorAll('.cc-line').forEach(function (l) { l.classList.toggle('is-active', l === row); });
          if (window.setCaptionKeyboardVisible) window.setCaptionKeyboardVisible(true);
        });
        input.addEventListener('input', function () { line.text = input.value; lines._touched = true; update(); });
        input.addEventListener('blur', function () {
          setTimeout(function () {
            if (list.contains(document.activeElement)) return;
            window.ccSelectedLineIndex = -1; row.classList.remove('is-active');
            if (window.setCaptionKeyboardVisible) window.setCaptionKeyboardVisible(false);
          }, 80);
        });
        row.addEventListener('click', function (e) { if (e.target !== input) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); } });
        row.append(time, input); list.appendChild(row);
      });
    }
    window.ccSelectedLineIndex = -1;
    if (window.setCaptionKeyboardVisible) window.setCaptionKeyboardVisible(false);
    if (window.prevFxTogglePanel) window.prevFxTogglePanel('captions');
  }

  function init() {
    if (!g('ccCaptionLinesByMedia')) return;           // original script not present
    window.prevCCOpen = open;
    window.updatePreviewVoiceCaption = update;
    window.updatePreviewCaptionsAction = syncButton;
    // defaults for the portfolio: subtitles on, at the bottom, regular style
    window.ccCaptionPosition = 'bottom';
    window.ccEnabled = false; window.ccApplied = false;   // off until the buyer turns them on
    document.querySelectorAll('#prev-sheet-captions .cc-position-btn').forEach(function (b) { b.classList.toggle('is-selected', b.getAttribute('data-position') === 'bottom'); });
    var v = video();
    if (v) ['timeupdate', 'play', 'pause', 'seeked', 'loadedmetadata'].forEach(function (ev) { v.addEventListener(ev, update); });
    var btn = document.getElementById('prev-fx-cc-btn');
    if (btn) new MutationObserver(syncButton).observe(btn, { attributes: true, attributeFilter: ['class'] });
    syncButton(); update();
    setInterval(function () { syncButton(); }, 500);
  }
  if (document.readyState === 'complete') init(); else window.addEventListener('load', init);
})();
