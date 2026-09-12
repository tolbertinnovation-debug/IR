const header = document.querySelector('[data-header]');
const nav = document.querySelector('[data-nav]');
const navToggle = document.querySelector('[data-nav-toggle]');
const navLinks = [...document.querySelectorAll('.primary-nav a[href^="#"]')];
const sections = [...document.querySelectorAll('main section[id]')];

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

const contactForm = document.querySelector('[data-contact-form]');
const formStatus = document.querySelector('[data-form-status]');

contactForm?.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(contactForm);
  const reason = String(formData.get('reason') || 'General inquiry');
  const subject = `IRF website inquiry: ${reason}`;
  const body = [
    `Name: ${formData.get('name') || ''}`,
    `Email: ${formData.get('email') || ''}`,
    `Organization: ${formData.get('organization') || 'Not provided'}`,
    `Reason: ${reason}`,
    '',
    String(formData.get('message') || '')
  ].join('\n');

  if (formStatus) {
    formStatus.textContent = 'Your email application should open with this message prepared. Review it, then press send.';
  }

  window.location.href = `mailto:impactreachfoundation@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});
