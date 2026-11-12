document.documentElement.classList.add('js');

// Load the site-wide polish layer on every page without duplicating <link> tags.
if (!document.querySelector('link[data-irf-enhancements]')) {
  const enhancementStyles = document.createElement('link');
  enhancementStyles.rel = 'stylesheet';
  enhancementStyles.href = new URL('enhancements.css?v=20260923-3', document.currentScript.src).href;
  enhancementStyles.dataset.irfEnhancements = 'true';
  document.head.appendChild(enhancementStyles);
}

const header = document.querySelector('[data-header]');
const nav = document.querySelector('[data-nav]');
const navToggle = document.querySelector('[data-nav-toggle]');
const navLinks = [...document.querySelectorAll('.primary-nav a[href^="#"]')];
const sections = [...document.querySelectorAll('main section[id]')];

const updateMobileNavOffset = () => {
  if (!header) return;
  const headerBottom = Math.max(0, Math.round(header.getBoundingClientRect().bottom));
  document.documentElement.style.setProperty('--mobile-nav-top', `${headerBottom}px`);
};

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
  if (event.key === 'Escape' && nav?.classList.contains('is-open')) {
    closeNav();
    navToggle?.focus();
  }
});

const updateHeader = () => {
  header?.classList.toggle('is-scrolled', window.scrollY > 20);
  updateMobileNavOffset();
};
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });
window.addEventListener('resize', () => {
  updateMobileNavOffset();
  if (window.innerWidth > 1120) closeNav();
}, { passive: true });

if ('IntersectionObserver' in window) {
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
}

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

// Website forms: send each submission directly to the foundation's inbox
// (impactreachfoundation@gmail.com) through FormSubmit. If the service cannot
// be reached, offer the visitor a prepared email as a fallback.
const FORM_ENDPOINT = 'https://formsubmit.co/ajax/impactreachfoundation@gmail.com';
const FORM_EMAIL = 'impactreachfoundation@gmail.com';

const websiteForms = [
  { selector: '[data-contact-form]', status: '[data-form-status]', subject: (d) => `IRF website inquiry: ${d.get('reason') || 'General inquiry'}`,
    fields: [['Name', 'name'], ['Email', 'email'], ['Organization', 'organization'], ['Reason', 'reason'], ['Message', 'message']] },
  { selector: '[data-support-form]', status: '[data-support-status]', subject: (d) => `IRF support interest: ${d.get('support-type') || 'Support inquiry'}`,
    fields: [['Name', 'name'], ['Email', 'email'], ['Organization', 'organization'], ['Support interest', 'support-type'], ['Program interest', 'program'], ['Message', 'message']] },
  { selector: '[data-donation-form]', status: '[data-donation-status]', subject: (d) => `IRF donation inquiry: ${d.get('donation-type') || 'Donation inquiry'}`,
    fields: [['Name', 'name'], ['Email', 'email'], ['Organization', 'organization'], ['Donation interest', 'donation-type'], ['Program interest', 'program'], ['Message', 'message']] }
];

websiteForms.forEach(({ selector, status, subject, fields }) => {
  const form = document.querySelector(selector);
  if (!form) return;
  const statusEl = form.querySelector(status) || document.querySelector(status);
  const button = form.querySelector('button[type="submit"]');

  const setStatus = (message, state) => {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.dataset.state = state;
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    if (String(data.get('_honey') || '')) return; // spam bot filled the hidden field

    const payload = { _subject: subject(data), _template: 'table', _replyto: String(data.get('email') || ''), _captcha: 'false' };
    fields.forEach(([label, name]) => { payload[label] = String(data.get(name) || '').trim() || 'Not provided'; });

    const originalLabel = button ? button.innerHTML : '';
    if (button) { button.disabled = true; button.textContent = 'Sending…'; }
    setStatus('Sending your message…', 'pending');

    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || String(result.success) !== 'true') throw new Error(result.message || 'Send failed');
      form.reset();
      setStatus('Thank you. Your message has been sent to ImpactReach Foundation. We will reply by email.', 'success');
    } catch (error) {
      const body = fields.map(([label, name]) => `${label}: ${data.get(name) || 'Not provided'}`).join('\n');
      const mailto = `mailto:${FORM_EMAIL}?subject=${encodeURIComponent(payload._subject)}&body=${encodeURIComponent(body)}`;
      setStatus('', 'error');
      if (statusEl) {
        statusEl.append('We could not send your message right now. ');
        const link = document.createElement('a');
        link.href = mailto;
        link.textContent = 'Send it by email instead';
        statusEl.append(link, ` or write to ${FORM_EMAIL}.`);
      }
    } finally {
      if (button) { button.disabled = false; button.innerHTML = originalLabel; }
    }
  });
});

// Load below-the-fold background photos only when they come near the screen.
(() => {
  const root = document.documentElement;
  const targets = document.querySelectorAll('.about__image, .home-news__media, .news-card__media, .fi-hub__media, .campaign-banner__aside');
  if (!root.classList.contains('lazy-bg')) return;
  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-near'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-near');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '600px 0px' });
  targets.forEach((el) => observer.observe(el));
})();
