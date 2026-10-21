/* Language layer (EN / ES) · María Paula León
   English is the source text, written in the HTML. Spanish lives in a dictionary per page
   (window.I18N_ES, loaded before this file) keyed by a short hash of the English block.
   - Blocks: any element whose children are only inline tags (a, b, strong, span, ...); loose text next to block children
     is wrapped in a <span data-i18n-w>. Its markup is kept:
     the Spanish string must have the same tags in the same order, and only the text is swapped.
   - Attributes: alt, aria-label, title, placeholder, data-label, and the page <title> / meta description.
   - Choice is saved in localStorage ("mpl-lang"); ?lang=es or ?lang=en overrides it. Default: English.
   - Debug: add ?i18n=debug and open the console to list English blocks that have no Spanish yet.
   - Links with data-href-en / data-href-es get that href for the current language (e.g. the CV).
   - Images: window.I18N_IMG lists the files under img/ that have a Spanish version in img/es/ (same name); in Spanish those <img> use it.
   - Elements with data-no-i18n are skipped (the language switch itself). */
(function () {
  'use strict';
  var STORE = 'mpl-lang';
  var SKIP = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, CANVAS: 1, TEMPLATE: 1, TEXTAREA: 1, IFRAME: 1, SVG: 1 };
  var INLINE = { A: 1, B: 1, STRONG: 1, EM: 1, I: 1, SPAN: 1, BR: 1, SUP: 1, SUB: 1, SMALL: 1, TIME: 1, CODE: 1, MARK: 1, ABBR: 1, U: 1, KBD: 1, SVG: 1 };
  var ATTRS = ['alt', 'aria-label', 'title', 'placeholder', 'data-label'];
  var LETTER = /[A-Za-zÀ-ɏ]/;
  var dict = window.I18N_ES || {};
  var regs = [];
  var imgs = [];
  var missing = [];

  function read(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function write(key, v) { try { localStorage.setItem(key, v); } catch (e) { /* private mode */ } }
  function fromUrl() { var m = /[?&]lang=(en|es)\b/.exec(location.search); return m ? m[1] : null; }
  var lang = fromUrl() || (read(STORE) === 'es' ? 'es' : 'en');
  if (fromUrl()) write(STORE, lang);

  function norm(s) { return s.replace(/\s+/g, ' ').trim(); }
  function hash(s) { var x = 0x811c9dc5; for (var i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 0x01000193) >>> 0; } return x.toString(36); }
  function up(n) { return n.nodeName.toUpperCase(); }

  /* Serialised block with every <svg> reduced to an empty placeholder, so icons never end up in the dictionary */
  function ser(el) {
    var c = el.cloneNode(true), s = c.querySelectorAll('svg');
    for (var i = 0; i < s.length; i++) { while (s[i].firstChild) s[i].removeChild(s[i].firstChild); [].slice.call(s[i].attributes).forEach(function (a) { s[i].removeAttribute(a.name); }); }
    return norm(c.innerHTML);
  }

  function isLeaf(el) {
    if (!LETTER.test(el.textContent)) return false;
    var d = el.querySelectorAll('*');
    for (var i = 0; i < d.length; i++) {
      if (d[i].closest('svg') && up(d[i]) !== 'SVG') continue; /* icon internals */
      if (!INLINE[up(d[i])]) return false;
    }
    return true;
  }

  function walk(el, blocks, orphans) {
    if (SKIP[up(el)] || el.hasAttribute('data-no-i18n')) return;
    if (isLeaf(el)) { blocks.push(el); return; }
    for (var n = el.firstChild, next; n; n = next) {
      next = n.nextSibling;
      if (n.nodeType === 3 && LETTER.test(n.nodeValue)) {
        /* loose text next to block children: wrap it so it can be translated on its own */
        var w = document.createElement('span'); w.setAttribute('data-i18n-w', '');
        el.replaceChild(w, n); w.appendChild(n); blocks.push(w);
      } else if (n.nodeType === 1) walk(n, blocks, orphans);
    }
  }

  /* Every translatable item on the page, in document order */
  function collect() {
    var blocks = [], orphans = [], items = [];
    walk(document.body, blocks, orphans);
    blocks.forEach(function (el) { items.push({ el: el, attr: null, html: ser(el) }); });
    [].slice.call(document.body.querySelectorAll('[' + ATTRS.join('],[') + ']')).forEach(function (el) {
      if (el.closest('[data-no-i18n]') || SKIP[up(el)]) return;
      ATTRS.forEach(function (a) {
        var v = el.getAttribute(a);
        if (v && LETTER.test(v)) items.push({ el: el, attr: a, html: norm(v) });
      });
    });
    var md = document.querySelector('meta[name="description"]');
    if (md) items.push({ el: md, attr: 'content', html: norm(md.getAttribute('content') || '') });
    if (document.title) items.push({ el: document, attr: 'title', html: norm(document.title) });
    items.forEach(function (it) { it.hash = hash(it.html); });
    return { items: items, orphans: orphans };
  }

  /* Swap text only: the live elements stay (so scripts and classes keep working).
     A block is split into "slots" of text between its child elements; the elements must match (same tags, same order),
     but the text around them is free, so Spanish can drop or add words before, between or after the tags. */
  function slotsOf(node) {
    var els = [], slots = [[]];
    for (var n = node.firstChild; n; n = n.nextSibling) {
      if (n.nodeType === 1) { els.push(n); slots.push([]); }
      else if (n.nodeType === 3) slots[slots.length - 1].push(n);
    }
    return { els: els, slots: slots };
  }
  function same(a, b) {
    var x = slotsOf(a).els, y = slotsOf(b).els;
    if (x.length !== y.length) return false;
    for (var i = 0; i < x.length; i++) {
      var tag = x[i].nodeName.toLowerCase();
      if (tag !== y[i].nodeName.toLowerCase()) return false;
      if (tag !== 'svg' && !same(x[i], y[i])) return false;
    }
    return true;
  }
  function copy(a, b) {
    var x = slotsOf(a), y = slotsOf(b);
    for (var s = 0; s < x.slots.length; s++) {
      var es = y.slots[s].map(function (n) { return n.nodeValue; }).join('');
      var live = x.slots[s], target = null, k;
      for (k = 0; k < live.length; k++) if (/\S/.test(live[k].nodeValue)) { target = live[k]; break; }
      if (target) {
        target.nodeValue = es;
        live.forEach(function (n) { if (n !== target && /\S/.test(n.nodeValue)) n.nodeValue = ''; });
      } else if (/\S/.test(es)) {
        if (live.length) live[0].nodeValue = es;
        else a.insertBefore(document.createTextNode(es), x.els[s] || null);
      }
      /* else: no text on either side: keep the original spacing */
    }
    for (var i = 0; i < x.els.length; i++) if (x.els[i].nodeName.toLowerCase() !== 'svg') copy(x.els[i], y.els[i]);
  }
  function setBlock(el, html) {
    var t = document.createElement('template'); t.innerHTML = html;
    if (same(el, t.content)) copy(el, t.content);
    else if (window.console) console.warn('[i18n] structure mismatch, kept as is:', html.slice(0, 80));
  }
  function setValue(r, which) {
    var v = which === 'es' ? r.es : r.en;
    if (r.attr === 'title' && r.el === document) document.title = v;
    else if (r.attr) r.el.setAttribute(r.attr, v);
    else setBlock(r.el, v);
  }

  function scan() {
    regs = []; missing = [];
    var found = collect();
    found.items.forEach(function (it) {
      var es = dict[it.hash];
      var en = it.attr ? it.html : it.el.innerHTML;
      if (es !== undefined) regs.push({ el: it.el, attr: it.attr, en: en, es: es });
      else missing.push({ hash: it.hash, html: it.html });
    });
  }

  /* Screenshots that contain interface text: swap to the Spanish copy kept in img/es/ */
  function scanImages() {
    imgs = [];
    var list = window.I18N_IMG || [];
    if (!list.length) return;
    [].forEach.call(document.querySelectorAll('img[src]'), function (el) {
      var src = el.getAttribute('src'), m = /^(.*?)img\/([^?#]+)(.*)$/.exec(src);
      if (m && list.indexOf(m[2]) > -1) imgs.push({ el: el, en: src, es: m[1] + 'img/es/' + m[2] + m[3] });
    });
  }

  function buttons() {
    [].forEach.call(document.querySelectorAll('[data-lang]'), function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-lang') === lang ? 'true' : 'false'); });
  }
  function apply() {
    regs.forEach(function (r) { setValue(r, lang); });
    imgs.forEach(function (r) { var v = lang === 'es' ? r.es : r.en; if (r.el.getAttribute('src') !== v) r.el.setAttribute('src', v); });
    document.documentElement.lang = lang;
    [].forEach.call(document.querySelectorAll('[data-href-' + lang + ']'), function (a) { a.setAttribute('href', a.getAttribute('data-href-' + lang)); });
    buttons();
    document.documentElement.classList.remove('i18n-pending');
    if (lang === 'es' && /[?&]i18n=debug/.test(location.search) && window.console) console.info('[i18n] English blocks without Spanish (' + missing.length + '):', missing);
  }
  function set(l) {
    if (l !== 'en' && l !== 'es') return;
    lang = l; write(STORE, l); apply();
    try { window.dispatchEvent(new CustomEvent('langchange', { detail: l })); } catch (e) { /* old browser */ }
  }

  function init() {
    scan();
    scanImages();
    apply();
    document.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-lang]');
      if (b) { e.preventDefault(); set(b.getAttribute('data-lang')); }
    });
  }

  window.I18N = { get lang() { return lang; }, set: set, collect: function () { return collect().items.map(function (i) { return { hash: i.hash, html: i.html, attr: i.attr, hidden: !!(i.el.closest && i.el.closest('[hidden]')) }; }); }, orphans: function () { return collect().orphans.map(function (o) { return o.outerHTML.slice(0, 120); }); }, missing: function () { return missing; } };

  /* Run once everything else (including the inline scripts that rewrite headings) has finished */
  if (document.readyState === 'complete') init(); else window.addEventListener('load', init);
})();
