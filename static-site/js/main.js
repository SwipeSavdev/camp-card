// Mobile navigation toggle
(function() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', function() {
      const isOpen = nav.classList.toggle('site-nav--open');
      toggle.setAttribute('aria-expanded', isOpen);
      document.body.classList.toggle('nav-open', isOpen);
    });

    // Close nav when clicking outside
    document.addEventListener('click', function(e) {
      if (nav.classList.contains('site-nav--open') &&
          !nav.contains(e.target) &&
          !toggle.contains(e.target)) {
        nav.classList.remove('site-nav--open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('nav-open');
      }
    });

    // Close nav on escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && nav.classList.contains('site-nav--open')) {
        nav.classList.remove('site-nav--open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('nav-open');
      }
    });
  }
})();
