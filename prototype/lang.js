/* Language for the prototype: same choice as the rest of the site (localStorage "mpl-lang"; ?lang=en|es overrides it).
   The product UI is written in Spanish. English is a copy layer (i18n-en.js) that is skipped when the language is Spanish.
   Load this before i18n-en.js, proto-shell.js, portfolio-clean.js and proto-notes.js. */
(function () {
  var m = /[?&]lang=(en|es)\b/.exec(location.search), l = m && m[1];
  try { if (l) localStorage.setItem('mpl-lang', l); else l = localStorage.getItem('mpl-lang'); } catch (e) { /* private mode */ }
  window.PROTO_LANG = l === 'es' ? 'es' : 'en';
  document.documentElement.setAttribute('data-lang', window.PROTO_LANG);
  /* Switch language: save it and reload (the English layer cannot be undone in place) */
  window.protoSetLang = function (next) {
    try { localStorage.setItem('mpl-lang', next); } catch (e) { /* private mode */ }
    var u = new URL(location.href); u.searchParams.delete('lang'); location.replace(u.toString());
  };
})();
