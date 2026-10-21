/* Site header · María Paula León  (UNIVERSAL: every page of the portfolio, the case study and the prototype, uses this file)
   Builds the header in place of its own <script> tag, so put the tag where the header should go (first thing in <body>, after the skip link).
   Pair it with header.css in <head>. To change the header (links, labels, projects, behaviour), edit only header.js and header.css.

   - Brand + pill (Work · Contact · EN|ES). Work opens a card with the projects on hover or tap; a tap on a project opens its case study.
   - Fixed at the top; once you scroll, a soft veil appears (is-floating); over dark sections the text turns white (on-dark).
   - Texts and language switch live here, in both languages, so no page dictionary has to know about the header (it carries data-no-i18n).
   - To add a project to the card: add one entry to PROJECTS (set wip:false and href when its case study exists). */
(function () {
  var script = document.currentScript;
  if (!script || !script.src || !script.parentNode || document.querySelector('header.topbar')) return;
  var base = new URL('.', script.src);                                 /* .../case-study/ */
  function url(p) { return new URL(p, base).href; }
  var HOME = url('../index.html'), CONTACT = url('about.html');

  var COPY = {
    en: { work: 'Work', contact: 'Contact', head: 'Selected work', wip: 'WIP', all: 'All work', projects: 'Projects' },
    es: { work: 'Proyectos', contact: 'Contacto', head: 'Proyectos destacados', wip: 'WIP', all: 'Ver todos', projects: 'Proyectos' }
  };
  var PROJECTS = [
    { href: 'reviews.html',
      en: { s: '01 · Social commerce', t: 'Guided camera for <span class="grad-text">video reviews</span>' },
      es: { s: '01 · Comercio social', t: 'Cámara guiada para <span class="grad-text">opiniones en video</span>' } },
    { wip: true,
      en: { s: '02 · Live shopping', t: 'Lives' },
      es: { s: '02 · Compras en vivo', t: 'Lives' } },
    { wip: true,
      en: { s: '03 · Accessibility', t: 'Accessible <span class="grad-text">video feed</span>' },
      es: { s: '03 · Accesibilidad', t: 'Feed de video <span class="grad-text">accesible</span>' } }
  ];

  /* Same choice as the rest of the site: ?lang= > localStorage "mpl-lang" (the page engines read the same sources) */
  function lang() {
    var l = window.PROTO_LANG || (window.I18N && window.I18N.lang);
    if (!l) { try { l = (/[?&]lang=(en|es)\b/.exec(location.search) || [])[1] || localStorage.getItem('mpl-lang'); } catch (e) { /* private mode */ } }
    return l === 'es' ? 'es' : 'en';
  }

  /* Inter, in case the page does not load it already (the prototype pages) */
  if (!document.querySelector('link[href*="family=Inter"]')) {
    var f = document.createElement('link');
    f.rel = 'stylesheet'; f.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
    document.head.appendChild(f);
  }

  /* ---------- Markup ---------- */
  var onContact = /about\.html$/.test(location.pathname), L = lang();
  var bar = document.createElement('header');
  bar.className = 'topbar'; bar.setAttribute('data-no-i18n', '');
  bar.innerHTML =
    '<a href="' + HOME + '"><strong>María Paula León</strong></a>' +
    '<nav aria-label="Main">' +
      '<a href="' + HOME + '" data-nav="work"' + (onContact ? '' : ' aria-current="page"') + '>' + COPY[L].work + '</a>' +
      '<a href="' + CONTACT + '" data-nav="contact"' + (onContact ? ' aria-current="page"' : '') + '>' + COPY[L].contact + '</a>' +
      '<span class="lang" role="group" aria-label="Language / Idioma">' +
        '<button type="button" data-l="en" lang="en" title="English" aria-pressed="' + (L === 'en') + '">EN</button>' +
        '<button type="button" data-l="es" lang="es" title="Español" aria-pressed="' + (L === 'es') + '">ES</button>' +
      '</span>' +
    '</nav>';
  script.parentNode.insertBefore(bar, script);

  var nav = bar.querySelector('nav'), trigger = nav.querySelector('[data-nav="work"]'), contact = nav.querySelector('[data-nav="contact"]');

  /* ---------- Language ---------- */
  bar.querySelector('.lang').addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('button[data-l]');
    if (!b || b.getAttribute('aria-pressed') === 'true') return;
    var l = b.getAttribute('data-l');
    if (window.protoSetLang) window.protoSetLang(l);                    /* prototype: saves and reloads */
    else if (window.I18N) window.I18N.set(l);                           /* site pages: swaps text and images in place */
    else { try { localStorage.setItem('mpl-lang', l); } catch (err) { /* private mode */ } location.reload(); }
  });
  function sync() {
    var l = lang(), c = COPY[l];
    trigger.textContent = c.work; contact.textContent = c.contact;
    [].forEach.call(bar.querySelectorAll('button[data-l]'), function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-l') === l ? 'true' : 'false'); });
    if (panel.classList.contains('is-open')) renderPanel();
  }
  window.addEventListener('langchange', sync);

  /* ---------- Work dropdown ---------- */
  var panel = document.createElement('div');
  panel.className = 'wm'; panel.id = 'wm-panel'; panel.setAttribute('role', 'group');
  bar.appendChild(panel);
  trigger.classList.add('has-wm');
  trigger.setAttribute('aria-haspopup', 'true'); trigger.setAttribute('aria-expanded', 'false'); trigger.setAttribute('aria-controls', 'wm-panel');

  function renderPanel() {
    var l = lang(), c = COPY[l];
    panel.setAttribute('aria-label', c.projects);
    panel.innerHTML =
      '<p class="wm-h">' + c.head + '</p><ul class="wm-list">' +
      PROJECTS.map(function (p) {
        var t = p[l], inner = '<span class="wm-txt"><span class="wm-s">' + t.s + '</span><span class="wm-t">' + t.t + '</span></span>';
        return p.wip
          ? '<li><span class="wm-item is-wip">' + inner + '<em class="wm-wip">' + c.wip + '</em></span></li>'
          : '<li><a class="wm-item" href="' + url(p.href) + '">' + inner + '<i class="wm-go" aria-hidden="true">→</i></a></li>';
      }).join('') +
      '</ul><a class="wm-all" href="' + HOME + '#work">' + c.all + '<i aria-hidden="true">→</i></a>';
  }
  /* Hang the card under the pill, aligned to its right edge */
  function place() {
    var n = nav.getBoundingClientRect(), b = bar.getBoundingClientRect();
    panel.style.top = Math.round(n.bottom - b.top + 10) + 'px';
    panel.style.right = Math.max(8, Math.round(b.right - n.right)) + 'px';
  }
  var pinned = false, leaveTimer = 0;               /* pinned: opened by a click/tap, so it stays until you click elsewhere */
  function isOpen() { return panel.classList.contains('is-open'); }
  function open(focusFirst) {
    renderPanel(); place();
    panel.classList.add('is-open'); trigger.setAttribute('aria-expanded', 'true');
    if (focusFirst) { var a = panel.querySelector('a'); if (a) a.focus(); }
  }
  function close(returnFocus) {
    clearTimeout(leaveTimer); pinned = false;
    panel.classList.remove('is-open'); trigger.setAttribute('aria-expanded', 'false');
    if (returnFocus) trigger.focus();
  }
  /* Mouse: opens while hovering "Work" or the card, closes a moment after the pointer leaves both */
  function hoverIn(e) { if (e.pointerType !== 'mouse') return; clearTimeout(leaveTimer); if (!isOpen()) open(false); }
  function hoverOut(e) {
    if (e.pointerType !== 'mouse' || pinned) return;
    clearTimeout(leaveTimer);
    leaveTimer = setTimeout(function () { if (!pinned) close(); }, 200);
  }
  trigger.addEventListener('pointerenter', hoverIn); panel.addEventListener('pointerenter', hoverIn);
  trigger.addEventListener('pointerleave', hoverOut); panel.addEventListener('pointerleave', hoverOut);
  trigger.addEventListener('click', function (e) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;       /* modifier-click still goes to the Work page */
    e.preventDefault();
    if (isOpen() && pinned) close();
    else if (isOpen()) pinned = true;                                   /* already open from hovering: a click keeps it open */
    else { open(e.detail === 0); pinned = true; }                       /* tap / keyboard: toggle (keyboard moves into the card) */
  });
  document.addEventListener('pointerdown', function (e) { if (isOpen() && !panel.contains(e.target) && !trigger.contains(e.target)) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && isOpen()) close(panel.contains(document.activeElement)); });
  panel.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('a')) close(); });
  window.addEventListener('resize', function () { if (isOpen()) place(); });

  /* ---------- Veil and dark sections ---------- */
  /* Is there a dark section behind the header right now? Look at what sits under its middle and find the first solid background. */
  function darkBehind() {
    var x = Math.round(window.innerWidth / 2), y = Math.max(8, Math.round(bar.offsetHeight / 2));
    var els = document.elementsFromPoint ? document.elementsFromPoint(x, y) : [];
    for (var i = 0; i < els.length; i++) {
      if (bar.contains(els[i])) continue;
      for (var n = els[i]; n && n.nodeType === 1; n = n.parentElement) {
        var m = /rgba?\(([^)]+)\)/.exec(getComputedStyle(n).backgroundColor);
        if (!m) continue;
        var c = m[1].split(',').map(parseFloat), a = c.length > 3 ? c[3] : 1;
        if (a > 0.6) return (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) < 110;
      }
    }
    return false;
  }
  var ticking = false;
  function update() {
    ticking = false;
    bar.classList.toggle('is-floating', window.scrollY > 24);
    bar.classList.toggle('on-dark', darkBehind());
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener('load', update);
  update();
})();
