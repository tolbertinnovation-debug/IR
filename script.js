document.documentElement.classList.add('js');

// Load the site-wide polish layer on every page without duplicating <link> tags.
if (!document.querySelector('link[data-irf-enhancements]')) {
  const enhancementStyles = document.createElement('link');
  enhancementStyles.rel = 'stylesheet';
  enhancementStyles.href = 'enhancements.css?v=20260914-2';
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

document.querySelector('[data-year]')?.replaceChildren(String(new Date().getFullYear()));

// Thin branded progress indicator helps long content pages feel easier to navigate.
const progress = document.createElement('div');
progress.className = 'site-progress';
progress.setAttribute('aria-hidden', 'true');
document.body.appendChild(progress);

const updateProgress = () => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const percentage = maxScroll > 0 ? Math.min(100, Math.max(0, (window.scrollY / maxScroll) * 100)) : 0;
  progress.style.width = `${percentage}%`;
};
updateProgress();
window.addEventListener('scroll', updateProgress, { passive: true });
window.addEventListener('resize', updateProgress, { passive: true });

// Persistent, accessible actions across the whole website.
const currentPage = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
const floatingActions = document.createElement('div');
floatingActions.className = 'irf-floating-actions';
floatingActions.setAttribute('aria-label', 'Quick actions');

if (currentPage !== 'donate.html') {
  const donateLink = document.createElement('a');
  donateLink.className = 'irf-float-donate';
  donateLink.href = 'donate.html';
  donateLink.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 21S3 15.5 3 8.8A5.3 5.3 0 0 1 12 5a5.3 5.3 0 0 1 9 3.8C21 15.5 12 21 12 21Z"/></svg><span>Donate</span>';
  floatingActions.appendChild(donateLink);
}

if (currentPage !== 'contact.html') {
  const contactLink = document.createElement('a');
  contactLink.className = 'irf-float-contact';
  contactLink.href = 'contact.html';
  contactLink.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M3 5h18v14H3V5Zm9 7 7-4.4V7H5v.6l7 4.4Zm0 2.3L5 10v7h14v-7l-7 4.3Z"/></svg><span>Contact</span>';
  floatingActions.appendChild(contactLink);
}

if (floatingActions.children.length) document.body.appendChild(floatingActions);

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

const supportForm = document.querySelector('[data-support-form]');
const supportStatus = document.querySelector('[data-support-status]');

supportForm?.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(supportForm);
  const supportType = String(formData.get('support-type') || 'Support inquiry');
  const program = String(formData.get('program') || 'No specific program');
  const subject = `IRF support interest: ${supportType}`;
  const body = [
    `Name: ${formData.get('name') || ''}`,
    `Email: ${formData.get('email') || ''}`,
    `Organization: ${formData.get('organization') || 'Not provided'}`,
    `Support interest: ${supportType}`,
    `Program interest: ${program}`,
    '',
    String(formData.get('message') || '')
  ].join('\n');

  if (supportStatus) {
    supportStatus.textContent = 'Your email application should open with this message prepared. Review it, then press send.';
  }

  window.location.href = `mailto:impactreachfoundation@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

const donationForm = document.querySelector('[data-donation-form]');
const donationStatus = document.querySelector('[data-donation-status]');

donationForm?.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(donationForm);
  const donationType = String(formData.get('donation-type') || 'Donation inquiry');
  const program = String(formData.get('program') || 'No specific program');
  const subject = `IRF donation inquiry: ${donationType}`;
  const body = [
    `Name: ${formData.get('name') || ''}`,
    `Email: ${formData.get('email') || ''}`,
    `Organization: ${formData.get('organization') || 'Not provided'}`,
    `Donation interest: ${donationType}`,
    `Program interest: ${program}`,
    '',
    String(formData.get('message') || '')
  ].join('\n');

  if (donationStatus) {
    donationStatus.textContent = 'Your email application should open with this donation inquiry prepared. Review it, then press send.';
  }

  window.location.href = `mailto:impactreachfoundation@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});
