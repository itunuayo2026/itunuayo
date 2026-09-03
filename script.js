// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(link =>
  link.addEventListener('click', () => navLinks.classList.remove('open'))
);

// Highlight active nav link based on scroll position
const navAnchors = navLinks.querySelectorAll('a[data-nav]');
const sections = Array.from(navAnchors)
  .map(a => document.getElementById(a.dataset.nav))
  .filter(Boolean);

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navAnchors.forEach(a => a.classList.remove('active'));
    const activeLink = navLinks.querySelector(`a[data-nav="${entry.target.id}"]`);
    if (activeLink) activeLink.classList.add('active');
  });
}, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

sections.forEach(section => sectionObserver.observe(section));

// Back to top button
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  backToTop.classList.toggle('show', window.scrollY > 500);
});
backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Countdown to wedding day (White Wedding, 10:00 AM WAT)
const weddingDate = new Date('2026-09-26T10:00:00+01:00').getTime();

function updateCountdown() {
  const now = Date.now();
  const diff = weddingDate - now;

  const els = {
    days: document.getElementById('cd-days'),
    hours: document.getElementById('cd-hours'),
    mins: document.getElementById('cd-mins'),
    secs: document.getElementById('cd-secs'),
  };

  if (diff <= 0) {
    els.days.textContent = '00';
    els.hours.textContent = '00';
    els.mins.textContent = '00';
    els.secs.textContent = '00';
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);

  els.days.textContent = String(days).padStart(2, '0');
  els.hours.textContent = String(hours).padStart(2, '0');
  els.mins.textContent = String(mins).padStart(2, '0');
  els.secs.textContent = String(secs).padStart(2, '0');
}
updateCountdown();
setInterval(updateCountdown, 1000);

// Toast helper
const toast = document.getElementById('toast');
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2600);
}

// Gift selection (toggle select/deselect) + capture modal
const giftGrid = document.getElementById('giftGrid');
const giftModal = document.getElementById('giftModal');
const giftModalClose = document.getElementById('giftModalClose');
const giftModalName = document.getElementById('giftModalName');
const giftModalIcon = document.getElementById('giftModalIcon');
const giftForm = document.getElementById('giftForm');
const giftModalHiddenInput = document.getElementById('giftModalHiddenInput');

function openGiftModal(giftName, iconHTML) {
  giftModalName.textContent = giftName;
  giftModalIcon.innerHTML = iconHTML || '';
  giftModalHiddenInput.value = giftName;
  giftModal.classList.add('open');
}

function closeGiftModal() {
  giftModal.classList.remove('open');
}

giftModalClose.addEventListener('click', closeGiftModal);
giftModal.addEventListener('click', (e) => {
  if (e.target === giftModal) closeGiftModal();
});

giftGrid.addEventListener('click', (e) => {
  const btn = e.target.closest('.gift-select');
  if (!btn) return;
  const card = btn.closest('.gift-card');
  const giftName = card.dataset.gift;
  const isAlreadySelected = card.classList.contains('selected');

  if (isAlreadySelected) {
    // Deselect
    card.classList.remove('selected');
    btn.textContent = 'Select Gift';
    showToast(`"${giftName}" deselected.`);
    return;
  }

  // Selecting a new gift clears any other selection (single choice at a time)
  giftGrid.querySelectorAll('.gift-card').forEach(c => {
    c.classList.remove('selected');
    c.querySelector('.gift-select').textContent = 'Select Gift';
  });

  card.classList.add('selected');
  btn.textContent = 'Selected ✓';

  const iconHTML = card.querySelector('.gift-icon')?.innerHTML || '';
  openGiftModal(giftName, iconHTML);
});

// Gift capture form submit (posts to Google Apps Script so we can show a nice toast)
giftForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const action = giftForm.getAttribute('action');
  try {
    // Google Apps Script web apps don't send CORS headers, so the response
    // is opaque under no-cors — a resolved fetch means the request reached the script.
    await fetch(action, {
      method: 'POST',
      mode: 'no-cors',
      body: new URLSearchParams(new FormData(giftForm)),
    });
    showToast('Thank you! We\'ve got your details — see you at the wedding!');
    giftForm.reset();
    closeGiftModal();
  } catch (err) {
    showToast('Network error — please try again.');
  }
});
