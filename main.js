/* ══════════════════════════════════════════════════════════════════════
   YAMANI RESEARCH GROUP  |  main.js
   ══════════════════════════════════════════════════════════════════════ */

'use strict';

/* ── THEME SWITCHER ──────────────────────────────────────────────────── */
const THEMES = ['cosmos','aurora','solar','quantum','arctic'];
let currentTheme = localStorage.getItem('yamani-theme') || 'cosmos';

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  currentTheme = theme;
  localStorage.setItem('yamani-theme', theme);

  document.querySelectorAll('.theme-btn').forEach(btn => {
    const isActive = btn.dataset.theme === theme;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });

  // Re-draw particles with new color
  initParticles();
}

document.querySelectorAll('.theme-btn').forEach(btn => {
  btn.addEventListener('click', () => applyTheme(btn.dataset.theme));
});

applyTheme(currentTheme);

/* ── PARTICLE CANVAS ─────────────────────────────────────────────────── */
const canvas = document.getElementById('particles-canvas');
const ctx    = canvas.getContext('2d');
let particles = [];
let animId;

function getParticleColor() {
  const root = document.documentElement;
  const style = getComputedStyle(root);
  return style.getPropertyValue('--particle-color').trim() || 'rgba(124,131,253,0.5)';
}

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', () => { resizeCanvas(); createParticles(); });

function createParticle() {
  return {
    x:   Math.random() * canvas.width,
    y:   Math.random() * canvas.height,
    r:   Math.random() * 1.8 + 0.4,
    vx:  (Math.random() - 0.5) * 0.35,
    vy:  (Math.random() - 0.5) * 0.35,
    alpha: Math.random() * 0.6 + 0.1,
  };
}

function createParticles() {
  const count = Math.min(Math.floor((canvas.width * canvas.height) / 14000), 120);
  particles = Array.from({ length: count }, createParticle);
}

function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const color = getParticleColor();

  // Draw connecting lines
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 130) {
        ctx.beginPath();
        ctx.strokeStyle = color.replace(/[\d.]+\)$/, (0.15 * (1 - dist / 130)).toFixed(3) + ')');
        ctx.lineWidth = 0.5;
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }

  // Draw particles
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = color.replace(/[\d.]+\)$/, p.alpha.toFixed(3) + ')');
    ctx.fill();
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
  });
}

function initParticles() {
  if (animId) cancelAnimationFrame(animId);
  createParticles();
  function loop() {
    drawParticles();
    animId = requestAnimationFrame(loop);
  }
  loop();
}
initParticles();

/* ── NAVBAR SCROLL ───────────────────────────────────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
  updateActiveNav();
}, { passive: true });

/* ── HAMBURGER ───────────────────────────────────────────────────────── */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
});

navLinks.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

/* ── ACTIVE NAV HIGHLIGHT ────────────────────────────────────────────── */
const sections = ['hero','about','research','team','publications','capabilities','vision'];
const navMap = {
  hero:          document.getElementById('nl-hero'),
  about:         document.getElementById('nl-about'),
  research:      document.getElementById('nl-research'),
  team:          document.getElementById('nl-team'),
  publications:  document.getElementById('nl-publications'),
  capabilities:  document.getElementById('nl-cap'),
  vision:        document.getElementById('nl-vision'),
};

function updateActiveNav() {
  let current = 'hero';
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el && window.scrollY >= el.offsetTop - 200) current = id;
  });
  Object.entries(navMap).forEach(([id, link]) => {
    if (link) link.classList.toggle('active', id === current);
  });
}

/* ── COUNTER ANIMATION ───────────────────────────────────────────────── */
function animateCounter(el, target, duration = 1800) {
  let start = null;
  function step(timestamp) {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  }
  requestAnimationFrame(step);
}

let countersTriggered = false;
function triggerCounters() {
  if (countersTriggered) return;
  const statsBar = document.getElementById('stats-bar');
  if (!statsBar) return;
  const rect = statsBar.getBoundingClientRect();
  if (rect.top < window.innerHeight) {
    countersTriggered = true;
    document.querySelectorAll('[data-target]').forEach(el => {
      animateCounter(el, parseInt(el.dataset.target));
    });
  }
}

window.addEventListener('scroll', triggerCounters, { passive: true });
triggerCounters();

/* ── SCROLL REVEAL ───────────────────────────────────────────────────── */
const revealEls = [
  ...document.querySelectorAll('.about-card, .research-card, .team-card, .pi-card'),
  ...document.querySelectorAll('.pub-card, .cap-item, .goal-card, .project-item, .grant-card'),
  ...document.querySelectorAll('.tl-item, .chain-step, .vision-statement'),
];

revealEls.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

/* Staggered reveal for grids */
function staggerReveal(selector, delay = 80) {
  document.querySelectorAll(selector).forEach((el, i) => {
    el.style.transitionDelay = `${i * delay}ms`;
  });
}
staggerReveal('.research-card', 90);
staggerReveal('.team-card', 80);
staggerReveal('.cap-item', 60);
staggerReveal('.chain-step', 70);

/* ── CAPABILITY TABS ─────────────────────────────────────────────────── */
const tabs   = document.querySelectorAll('.cap-tab');
const panels = document.querySelectorAll('.cap-panel');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    panels.forEach(p => p.classList.remove('active'));

    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    const target = document.getElementById(tab.getAttribute('aria-controls'));
    if (target) target.classList.add('active');
  });
});

/* ── RESEARCH CARD FLIP / GLITCH HOVER EFFECT ────────────────────────── */
document.querySelectorAll('.research-card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.setProperty('--glow', '1');
  });
  card.addEventListener('mouseleave', () => {
    card.style.removeProperty('--glow');
  });
});

/* ── INTERACTIVE MOLECULE PARALLAX ────────────────────────────────────── */
const molEl = document.getElementById('hero-molecule');
document.addEventListener('mousemove', (e) => {
  if (!molEl) return;
  const { clientX, clientY } = e;
  const cx = window.innerWidth  / 2;
  const cy = window.innerHeight / 2;
  const dx = (clientX - cx) / cx;
  const dy = (clientY - cy) / cy;
  molEl.style.transform = `translateY(-50%) rotate(${dx * 6}deg) scale(${1 + Math.abs(dy) * 0.05})`;
});

/* ── PUBLICATION CARD EXPAND ─────────────────────────────────────────── */
document.querySelectorAll('.pub-card').forEach(card => {
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      card.classList.toggle('expanded');
    }
  });
});

/* ── KEYBOARD THEME CYCLE (Alt + T) ──────────────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.altKey && e.key === 't') {
    e.preventDefault();
    const idx = THEMES.indexOf(currentTheme);
    applyTheme(THEMES[(idx + 1) % THEMES.length]);
  }
});

/* ── SMOOTH SCROLL OFFSET (for fixed nav) ───────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offsetTop = target.offsetTop - 70;
    window.scrollTo({ top: offsetTop, behavior: 'smooth' });
  });
});

/* ── CURSOR GLOW (desktop) ───────────────────────────────────────────── */
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const glow = document.createElement('div');
  glow.style.cssText = `
    position: fixed; width: 400px; height: 400px;
    border-radius: 50%; pointer-events: none; z-index: 0;
    background: radial-gradient(circle, var(--accent-glow, rgba(124,131,253,0.12)) 0%, transparent 70%);
    transform: translate(-50%, -50%);
    transition: left 0.12s ease, top 0.12s ease, opacity 0.3s;
    opacity: 0;
  `;
  document.body.appendChild(glow);

  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
    glow.style.opacity = '1';
  });
  document.addEventListener('mouseleave', () => { glow.style.opacity = '0'; });
}

/* ── HERO BADGE ANIMATE ON LOAD ─────────────────────────────────────── */
window.addEventListener('load', () => {
  document.body.style.opacity = '1';
  triggerCounters();
});

/* ── PRINT / PAGE TITLE UPDATE ON SECTION CHANGE ────────────────────── */
const sectionTitles = {
  hero:         'Yamani Research Group | KFUPM',
  about:        'About | Yamani Research Group',
  research:     'Research | Yamani Research Group',
  team:         'Team | Yamani Research Group',
  publications: 'Publications | Yamani Research Group',
  capabilities: 'Capabilities | Yamani Research Group',
  vision:       'Vision | Yamani Research Group',
};

const titleObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      document.title = sectionTitles[entry.target.id] || document.title;
    }
  });
}, { threshold: 0.5 });

sections.forEach(id => {
  const el = document.getElementById(id);
  if (el) titleObserver.observe(el);
});

console.log('%c🔬 Yamani Research Group', 'color: #7c83fd; font-size: 18px; font-weight: bold;');
console.log('%cKFUPM · IRC-HTCM · Hydrogen & Carbon Management', 'color: #56cfe1; font-size: 12px;');
console.log('%cPress Alt+T to cycle themes!', 'color: #c77dff; font-size: 11px;');
