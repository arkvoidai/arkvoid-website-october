(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#primary-nav');

  if (menuButton && navigation) {
    menuButton.addEventListener('click', () => {
      const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!isOpen));
      menuButton.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
      navigation.classList.toggle('is-open', !isOpen);
    });

    navigation.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', 'Open navigation');
        navigation.classList.remove('is-open');
      });
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', 'Open navigation');
        navigation.classList.remove('is-open');
      }
    });
  }

  const revealItems = document.querySelectorAll('.reveal');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!('IntersectionObserver' in window) || reduceMotion) {
    revealItems.forEach((element) => element.classList.add('is-visible'));
    return;
  }

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -7% 0px',
    threshold: 0.08
  });

  revealItems.forEach((element) => revealObserver.observe(element));
})();
