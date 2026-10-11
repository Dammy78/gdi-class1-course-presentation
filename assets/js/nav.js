(function () {
  var btn = document.querySelector('.nav-toggle');
  if (!btn) return;
  var menu = document.getElementById('nav-menu') || document.getElementById('site-nav');
  if (!menu) return;
  var controlsId = menu.id;
  if (controlsId && btn.getAttribute('aria-controls') !== controlsId) {
    btn.setAttribute('aria-controls', controlsId);
  }
  function setOpen(open) {
    menu.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  btn.addEventListener('click', function () {
    setOpen(!menu.classList.contains('is-open'));
  });
})();
