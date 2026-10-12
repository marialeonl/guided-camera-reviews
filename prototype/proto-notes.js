/* Hand-drawn annotations around the phone: screen title + objective, with small arrows that point at the real parts
   of the screen (added on top, nothing else changes). */
(function () {
  var page = (location.pathname.split('/').pop() || '').replace('.html', '');
  var COPY = {
    'review-form': { title: 'Review form', goal: 'Rate the product, comment and add a video or photo.', top: true },
    'camara-video-guiado': { align: '.cam-tabs-track', side: 'right' },
    'camara-preview': { title: 'Video preview', goal: 'Check the video and polish it before saving.', top: true }
  };
  var EXTRA = {
    'review-form': [
      { text: '<b>Uploader</b> Where the buyer adds a guided video, a video or a photo.', target: '#rf-upload-media', edge: true, wide: true }
    ],
    'camara-preview': [
      { text: 'Try these tools!', target: '.prev-fx-actions', heading: true, wide: true },
      { text: '<b>Trim</b> Pick where the video starts and ends. Drag the selected part to move it.', target: '#prev-fx-trim-btn', edge: true, wide: true, noArrow: true },
      { text: '<b>Text</b> Write on the video. Change the font, color and alignment.', target: '#prev-fx-text-btn', edge: true, wide: true, noArrow: true },
      { text: '<b>Stickers</b> Add stickers and emojis. Some are suggested from your review.', target: '#prev-fx-stickers-btn', edge: true, wide: true, noArrow: true },
      { text: '<b>Mute</b> Turn the sound off or back on.', target: '#prev-fx-sound-btn', edge: true, wide: true, noArrow: true },
      { text: '<b>Subtitles</b> Show captions and edit each line.', target: '#prev-fx-cc-btn', edge: true, wide: true, noArrow: true },
      { side: 'left', text: 'Everything you upload shows here. Tap one to preview it.', target: '#prev-photo-set-thumbs', edge: true },
      { side: 'left', text: 'Add more photos or videos', target: '.prev-add-btn', edge: true }
    ]
  };
  /* The camera has three modes; the notes explain whichever one is selected */
  var CAM = {
    'video-guiado': { title: 'Guided video', goal: 'Record 3 short takes of 4 seconds. A prompt guides each one: the product, a close-up and how it is used.', extras: [
      { text: 'Camera tools', target: '.cam-header-actions' },
      { side: 'left', text: '3 guided parts for a more complete review', target: '.cam-steps-row', edge: true },
      { side: 'left', text: 'One tap records each 4 s part', target: '#cam-shutter-btn', edge: true, hideRec: true } ] },
    'video': { title: 'Video', goal: 'Record one free video of up to 90 seconds. You can pause and keep going.', extras: [
      { text: 'Camera tools', target: '.cam-header-actions' },
      { side: 'left', text: 'Tap to record, tap again to pause', target: '#cam-shutter-btn', edge: true, hideRec: true },
      { side: 'left', text: 'Gallery. Add videos or photos you already have.', target: '#cam-gallery-btn', edge: true } ] },
    'foto': { title: 'Photo', goal: 'Take photos of the product. You can add up to 8.', extras: [
      { text: 'Camera tools', target: '.cam-header-actions' },
      { side: 'left', text: 'One tap takes a photo', target: '#cam-shutter-btn', edge: true, hideRec: true },
      { side: 'left', text: 'Gallery. Add videos or photos you already have.', target: '#cam-gallery-btn', edge: true } ] }
  };
  function camMode() { var a = document.querySelector('.cam-tab.is-active'); return (a && a.getAttribute('data-tab')) || 'video-guiado'; }
  var NS = 'http://www.w3.org/2000/svg';
  var svg, notes = [];

  function el(cls, html) { var d = document.createElement('div'); d.className = 'pn ' + cls; d.innerHTML = html; document.body.appendChild(d); notes.push(d); return d; }
  var lastRect = {};   // while a part is temporarily hidden (e.g. recording), its note stays where it was
  function vis(sel) {   // is the part really on screen right now? (hidden while recording, etc.)
    var e = document.querySelector(sel); if (!e) return false;
    var r = e.getBoundingClientRect(), c = getComputedStyle(e);
    if (!r.width || !r.height || c.visibility === 'hidden' || c.display === 'none' || parseFloat(c.opacity) === 0) return false;
    for (var p = e.parentElement; p && p !== document.body; p = p.parentElement) { var pc = getComputedStyle(p); if (pc.display === 'none' || pc.visibility === 'hidden') return false; }
    return true;
  }
  function rect(sel) {
    var e = document.querySelector(sel), r = e && e.getBoundingClientRect();
    if (r && r.width) { lastRect[sel] = { top: r.top, bottom: r.bottom, left: r.left, right: r.right, width: r.width, height: r.height }; return lastRect[sel]; }
    return lastRect[sel] || null;
  }

  function arrow(S, E, delay) {
    var g = document.createElementNS(NS, 'g');
    var dx = E.x - S.x, dy = E.y - S.y, len = Math.sqrt(dx * dx + dy * dy) || 1;
    var cx = (S.x + E.x) / 2 - dy / len * 5, cy = (S.y + E.y) / 2 + dx / len * 5;   // a hint of curve, like a quick pen stroke
    var body = document.createElementNS(NS, 'path');
    body.setAttribute('d', 'M' + S.x + ' ' + S.y + ' Q ' + cx + ' ' + cy + ' ' + E.x + ' ' + E.y);
    var ang = Math.atan2(E.y - cy, E.x - cx);
    var head = document.createElementNS(NS, 'path'), L = 9;
    function pt(a) { return (E.x - Math.cos(ang + a) * L) + ' ' + (E.y - Math.sin(ang + a) * L); }
    head.setAttribute('d', 'M' + pt(0.5) + ' L' + E.x + ' ' + E.y + ' L' + pt(-0.5));
    [body, head].forEach(function (p) { g.appendChild(p); });
    svg.appendChild(g);
  }

  function setup() {
    var c = COPY[page]; if (!c) return;
    var isCam = page === 'camara-video-guiado', mode = isCam ? camMode() : null;
    function content() { return isCam ? CAM[mode] || CAM['video-guiado'] : c; }
    svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'pn-svg'); document.body.appendChild(svg);
    var main = el('pn-main', '');
    var extras = [];
    function render() {
      var k = content();
      main.innerHTML = '<div class="pn-title">' + k.title + '</div><div class="pn-text">' + k.goal + '</div>';
      extras.forEach(function (d) { d.remove(); notes.splice(notes.indexOf(d), 1); });
      extras = (isCam ? k.extras : EXTRA[page] || []).map(function (e) { var d = el('pn-extra ' + (e.side === 'left' ? 'pn-left' : 'pn-right') + (e.heading ? ' pn-heading' : '') + (e.wide ? ' pn-wide' : ''), '<div class="pn-text">' + e.text + '</div>'); d._e = e; return d; });
    }
    render();

    function place() {
      var frame = document.querySelector('.device-frame'); if (!frame) return;
      var fr = frame.getBoundingClientRect();
      var show = fr.left - 420 > 250;
      svg.style.display = show ? 'block' : 'none';
      notes.forEach(function (n) { n.style.display = show ? 'block' : 'none'; });
      if (!show) return;
      while (svg.firstChild) svg.removeChild(svg.firstChild);

      // left: title + what the screen is for, at the height of the bottom controls, arrow pointing right
      var al = rect(c.align);
      var ay = c.top ? fr.top + 78 : (al ? al.top + al.height / 2 : fr.bottom - 60);
      var mr = c.side === 'right';
      main.style.left = (mr ? fr.right + 52 : fr.left - 230) + 'px'; main.style.top = '0px';
      var mh = main.getBoundingClientRect().height;
      var top = c.top ? Math.max(12, ay - 20) : Math.max(12, ay - mh + 8);   // last line of the text sits at the height of the bottom controls
      main.style.top = top + 'px';
      var m = main.getBoundingClientRect(), my = c.top ? top + 20 : ay;
      var mainShown = c.top || vis(c.align);
      if (mainShown) { if (mr) arrow({ x: m.left - 4, y: my }, { x: fr.right + 8, y: my }); else arrow({ x: m.right - 6, y: my }, { x: fr.left - 8, y: my }); }

      // right: the other parts of the screen
      var lastBottom = { left: -1e9, right: -1e9 };
      extras.forEach(function (d) {
        var e = d._e, tt = rect(e.target), side = e.side === 'left' ? 'left' : 'right';
        var shown = vis(e.target) && !(e.hideRec && /cam-is-recording/.test(document.body.className));   // a note and its arrow are only on screen while their part is (the shutter note also goes while recording)
        d.style.display = (tt && shown) ? 'block' : 'none'; if (!tt || !shown) return;
        var ey = e.heading ? tt.top + 18 : tt.top + (e.edge ? tt.height / 2 : Math.min(40, tt.height / 2));
        d.style.left = (side === 'left' ? fr.left - 230 : fr.right + 52) + 'px'; d.style.top = '0px';
        var h = d.getBoundingClientRect().height;
        var top2 = Math.max(ey - h / 2, lastBottom[side] + 10);   // notes never touch each other
        d.style.top = top2 + 'px';
        var r = d.getBoundingClientRect(); lastBottom[side] = r.bottom;
        if (e.heading) {   // a single arrow from the heading to the tools
          arrow({ x: r.left - 4, y: r.top + h / 2 }, { x: fr.right + 8, y: r.top + h / 2 });
          return;
        }
        if (e.noArrow) return;
        if (side === 'left') arrow({ x: r.right - 6, y: r.top + h / 2 }, { x: fr.left - 8, y: ey });
        else arrow({ x: r.left - 4, y: r.top + h / 2 }, { x: fr.right + 8, y: ey });
      });
    }
    function tick() { if (isCam && camMode() !== mode) { mode = camMode(); render(); } place(); }
    place(); window.addEventListener('resize', place); setTimeout(tick, 500); setInterval(tick, 500);   // follows the screen when its layout changes
  }
  if (document.readyState === 'complete') setup(); else window.addEventListener('load', setup);
})();
