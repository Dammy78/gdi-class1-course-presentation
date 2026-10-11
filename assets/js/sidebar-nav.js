(function () {
  var toggle = document.querySelector('.sidebar-toggle');
  var sidebar = document.getElementById('course-sidebar');
  if (!toggle || !sidebar) return;

  function setOpen(open) {
    sidebar.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  toggle.addEventListener('click', function () {
    setOpen(!sidebar.classList.contains('is-open'));
  });

  sidebar.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      if (window.matchMedia('(max-width: 960px)').matches) {
        setOpen(false);
      }
    });
  });

  var hash = window.location.hash;
  if (hash) {
    var active = sidebar.querySelector('a[href*="' + hash + '"]');
    if (active) {
      sidebar.querySelectorAll('a.is-active').forEach(function (a) {
        a.classList.remove('is-active');
      });
      active.classList.add('is-active');
    }
  }

  if (!('IntersectionObserver' in window)) return;
  var sections = document.querySelectorAll('[data-sidebar-section]');
  if (!sections.length) return;

  var map = {};
  sidebar.querySelectorAll('a[data-nav]').forEach(function (a) {
    map[a.getAttribute('data-nav')] = a;
  });

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.getAttribute('data-sidebar-section');
        Object.keys(map).forEach(function (k) {
          map[k].classList.toggle('is-active', k === id);
        });
      });
    },
    { rootMargin: '-20% 0px -55% 0px', threshold: 0 }
  );
  sections.forEach(function (s) {
    observer.observe(s);
  });
})();
