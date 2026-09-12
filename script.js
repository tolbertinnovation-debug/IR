const header = document.querySelector('[data-header]');
const nav = document.querySelector('[data-nav]');
const navToggle = document.querySelector('[data-nav-toggle]');
const navLinks = [...document.querySelectorAll('.primary-nav a[href^="#"]')];
const sections = [...document.querySelectorAll('main section[id]')];
const logo = document.querySelector('[data-logo]');
const logoFallback = document.querySelector('[data-logo-fallback]');

if (logo) {
  const showFallback = () => {
    logo.hidden = true;
    if (logoFallback) logoFallback.hidden = false;
  };

  logo.addEventListener('error', showFallback);
  if (logo.complete && logo.naturalWidth === 0) showFallback();
}

const closeNav = () => {
  nav?.classList.remove('is-open');
  navToggle?.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('nav-open');
  navToggle?.querySelector('.sr-only')?.replaceChildren('Open navigation menu');
};

navToggle?.addEventListener('click', () => {
  const willOpen = navToggle.getAttribute('aria-expanded') !== 'true';
  navToggle.setAttribute('aria-expanded', String(willOpen));
  nav?.classList.toggle('is-open', willOpen);
  document.body.classList.toggle('nav-open', willOpen);
  navToggle.querySelector('.sr-only')?.replaceChildren(willOpen ? 'Close navigation menu' : 'Open navigation menu');
});

navLinks.forEach((link) => link.addEventListener('click', closeNav));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeNav();
});

const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 20);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

const activeSectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((link) => {
      const isMatch = link.getAttribute('href') === `#${entry.target.id}`;
      link.classList.toggle('is-active', isMatch);
      if (isMatch) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  });
}, { rootMargin: '-35% 0px -55%', threshold: 0 });

sections.forEach((section) => activeSectionObserver.observe(section));

const revealItems = document.querySelectorAll('[data-reveal]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (reducedMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => revealObserver.observe(item));
}

document.querySelector('[data-year]').textContent = new Date().getFullYear();
