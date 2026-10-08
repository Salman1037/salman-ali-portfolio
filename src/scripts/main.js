const header = document.querySelector('header');
const menu = document.querySelector('.menu-toggle');

function setMenu(open) {
  header?.classList.toggle('menu-open', open);
  menu?.setAttribute('aria-expanded', String(open));
  menu?.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
}

menu?.addEventListener('click', () => setMenu(!header.classList.contains('menu-open')));
document.querySelectorAll('nav a').forEach((link) => {
  link.addEventListener('click', () => setMenu(false));
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && header?.classList.contains('menu-open')) {
    setMenu(false);
    menu?.focus();
  }
});

const filters = document.querySelectorAll('[data-filter]');
filters.forEach((button) => button.addEventListener('click', () => {
  filters.forEach((item) => {
    item.classList.toggle('active', item === button);
    item.setAttribute('aria-pressed', String(item === button));
  });
  let count = 0;
  document.querySelectorAll('.project-card').forEach((card) => {
    card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter;
    if (!card.hidden) count++;
  });
  document.querySelector('#filter-status').textContent = `${count} projects shown`;
}));

// Prepare a draft; the visitor explicitly sends it through their email client.
document.querySelector('#contact-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const subject = `${data.get('type')} — ${data.get('name')}`;
  const body = `Name: ${data.get('name')}\nReply email: ${data.get('email')}\n\n${data.get('message')}`;
  window.location.href = `mailto:${encodeURIComponent(form.dataset.recipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  document.querySelector('#form-status').textContent = `Your email draft is ready to open. If your email app does not open, write directly to ${form.dataset.recipient}.`;
});

const progress = document.querySelector('.scroll-progress');
if (progress) {
  let queued = false;
  window.addEventListener('scroll', () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      const length = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = `${length > 0 ? window.scrollY / length * 100 : 0}%`;
      queued = false;
    });
  }, { passive: true });
}

// Content stays visible when animation support or JavaScript is unavailable.
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && window.gsap) {
  if (document.querySelector('.hero')) {
    gsap.from('.hero .intro,.hero h1,.hero-description,.hero-actions', {
      opacity: 0, y: 22, stagger: 0.1, duration: 0.9, ease: 'power2.out',
    });
  }
  if (document.querySelector('.stack-panel')) {
    gsap.from('.stack-panel', { opacity: 0, y: 20, duration: 1, delay: 0.2 });
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      gsap.from(entry.target, { opacity: 0, y: 24, duration: 0.75, ease: 'power2.out' });
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
}
