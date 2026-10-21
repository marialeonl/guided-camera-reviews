/* Shared page behaviour · María Paula León
   - "Back to top" floats at the bottom right only while you scroll UP (past the first screen); it hides when you scroll down.
   (The header, its veil over dark sections and its language switch live in header.js / header.css.) */
(function () {
  var toTop = document.getElementById('to-top');
  if (!toTop) return;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ticking = false, goingTop = false, lastY = window.scrollY, up = false, run = 0;

  function update() {
    ticking = false;
    var y = window.scrollY, d = y - lastY;
    lastY = y;
    /* Shown only while you scroll UP (past the first screen); it hides again as soon as you scroll down */
    if (d < 0) { run = run > 0 ? d : run + d; if (run < -6) up = true; }
    else if (d > 0) { run = run < 0 ? d : run + d; if (run > 6) up = false; }
    if (y <= 24) { goingTop = false; up = false; }
    toTop.classList.toggle('is-on', up && y > 400 && !goingTop);
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();
  toTop.addEventListener('click', function () {
    goingTop = true; toTop.classList.remove('is-on');
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });
})();
