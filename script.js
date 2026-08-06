/* =========================================================
   Spider-Man: Brand New Day — Landing Page Script
   Handles: in-page nav scrolling, mobile menu, navbar-on-scroll,
   hero cover (auto-sized, compact) + parallax, scroll-reveal
   animations, button ripple, floating particles, cast dossier
   cards (uniform sizing), gallery grid (uniform sizing), and the
   generative web canvas (signature hero element).
   ========================================================= */

// ---------- In-page nav (handled in JS so it never triggers a "leaving the page" prompt) ----------
document.querySelectorAll('[data-scroll]').forEach(el => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.getElementById(el.dataset.scroll);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
    mobileMenu.classList.add('hidden');
    mobileMenu.classList.remove('flex');
  });
});

// ---------- Mobile menu ----------
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
menuBtn.addEventListener('click', () => {
  mobileMenu.classList.toggle('hidden');
  mobileMenu.classList.toggle('flex');
});

// ---------- Navbar bg on scroll ----------
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('border-glow', window.scrollY > 40);
});

// ---------- Hero cover image: compact, auto-sized ----------
// Sizes the hero to the image's aspect ratio but keeps it noticeably
// smaller than before — capped at 40% of viewport height (was 70%).
const parallaxBg = document.getElementById('parallaxBg');
const HERO_IMAGE = 'poster.jpg'; // swap to 'spidy poster.jpg' or 'spiderman1.jpg' if you prefer

function fitHeroToImage() {
  if (!parallaxBg) return;

  const isImgTag = parallaxBg.tagName === 'IMG';
  if (isImgTag && !parallaxBg.src) parallaxBg.src = HERO_IMAGE;
  const src = isImgTag
    ? parallaxBg.src
    : (getComputedStyle(parallaxBg).backgroundImage.slice(5, -2).replace(/["']/g, '') || HERO_IMAGE);

  const probe = new Image();
  probe.onload = () => {
    const naturalRatio = probe.naturalHeight / probe.naturalWidth;
    const containerWidth = parallaxBg.parentElement.offsetWidth;
    const idealHeight = containerWidth * naturalRatio;

    // Compact hero: capped at 40% of viewport height, floor of 220px.
    const maxHeight = window.innerHeight * 0.4;
    const finalHeight = Math.max(220, Math.min(idealHeight, maxHeight));

    parallaxBg.parentElement.style.height = finalHeight + 'px';
    parallaxBg.parentElement.style.overflow = 'hidden';

    if (isImgTag) {
      parallaxBg.style.width = '100%';
      parallaxBg.style.height = '100%';
      parallaxBg.style.objectFit = 'cover';
      parallaxBg.style.objectPosition = 'center';
    } else {
      parallaxBg.style.backgroundImage = `url("${src}")`;
      parallaxBg.style.backgroundSize = 'cover';
      parallaxBg.style.backgroundPosition = 'center';
    }
  };
  probe.src = src;
}

fitHeroToImage();
window.addEventListener('resize', fitHeroToImage);

// ---------- Hero parallax ----------
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (y < window.innerHeight) {
    parallaxBg.style.transform = `translateY(${y * 0.35}px) scale(1.08)`;
  }
});

// ---------- Scroll reveal ----------
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in-view'); });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal, .reveal-scale').forEach(el => io.observe(el));

// ---------- Ripple effect ----------
document.querySelectorAll('.ripple').forEach(btn => {
  btn.addEventListener('click', function (e) {
    const rect = this.getBoundingClientRect();
    const circle = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    circle.style.width = circle.style.height = size + 'px';
    circle.style.left = (e.clientX - rect.left - size / 2) + 'px';
    circle.style.top = (e.clientY - rect.top - size / 2) + 'px';
    circle.classList.add('ripple-circle');
    this.appendChild(circle);
    setTimeout(() => circle.remove(), 600);
  });
});

// ---------- Floating particles (trimmed for performance) ----------
const particleLayer = document.getElementById('particles');
if (particleLayer) {
  const PARTICLE_COUNT = window.innerWidth < 768 ? 12 : 18;
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 4 + 2;
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.left = Math.random() * 100 + 'vw';
    p.style.bottom = '-20px';
    p.style.animationDuration = (Math.random() * 12 + 10) + 's';
    p.style.animationDelay = (Math.random() * 10) + 's';
    if (i % 2 === 0) p.style.background = 'radial-gradient(circle, rgba(30,58,138,0.9), transparent 70%)';
    particleLayer.appendChild(p);
  }
}

// ---------- Cast data (mapped to your actual files) ----------
// Tramell Tillman & Michael Mando have no image files yet, so they
// automatically fall back to the initials glyph.
const cast = [
  { name: 'Tom Holland',     role: 'Peter Parker / Spider-Man', file: '001', photo: 'tom.jpg' },
  { name: 'Zendaya',         role: 'MJ',                        file: '002', photo: 'zendaya.jpg' },
  { name: 'Sadie Sink',      role: 'New Character',             file: '003', photo: 'sadie%20sink.jpg' },
  { name: 'Mark Ruffalo',    role: 'Bruce Banner / Hulk',        file: '004', photo: 'mark.jpg' },
  { name: 'Jacob Batalon',   role: 'Ned Leeds',                  file: '005', photo: 'ned.jpg' },
  { name: 'Jon Bernthal',    role: 'Frank Castle / Punisher',    file: '006', photo: 'punisher.jpg' },
  
];
const initials = n => n.split(' ').map(w => w[0]).join('');
const castGrid = document.getElementById('castGrid');

// Uniform box every dossier photo gets forced into, regardless of the
// source image's native size/orientation.
const DOSSIER_PHOTO_HEIGHT = '260px';

if (castGrid) {
  cast.forEach((c) => {
    const card = document.createElement('div');
    card.className = 'dossier reveal hover-lift rounded-2xl overflow-hidden text-left pb-5';
    card.setAttribute('data-case', 'FILE·' + c.file);

    card.innerHTML = `
      <div class="dossier-photo" style="height:${DOSSIER_PHOTO_HEIGHT}; overflow:hidden; position:relative;">
        ${c.photo ? `<img src="${c.photo}" alt="${c.name}" loading="lazy"
             style="width:100%; height:100%; object-fit:cover; object-position:center top; display:block;"
             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` : ''}
        <span class="glyph" style="${c.photo ? 'display:none;' : 'display:flex;'} align-items:center; justify-content:center; width:100%; height:100%;">${initials(c.name)}</span>
        <div class="dossier-scan"></div>
      </div>
      <div class="px-4 pt-4">
        <p class="font-tech text-white tracking-wide text-lg">${c.name}</p>
        <p class="text-spidered text-xs uppercase tracking-widest mt-1">${c.role}</p>
        <p class="text-gray-600 text-[10px] tracking-[0.2em] mt-2">STATUS: <span class="redacted w-10"></span></p>
      </div>
    `;
    castGrid.appendChild(card);
    io.observe(card);
  });
}

// ---------- Gallery grid (uses your leftover shots — no-op if #galleryGrid isn't in your HTML) ----------
const galleryImages = ['spiderman1.jpg', 'spiderman2.jpg', 'fight.jpg', 'black.png', 'spidy%20poster.jpg'];
const galleryGrid = document.getElementById('galleryGrid');
if (galleryGrid) {
  galleryImages.forEach((src) => {
    const fig = document.createElement('figure');
    fig.className = 'gallery-item reveal-scale';
    fig.innerHTML = `<img src="${src}" alt="Gallery still" loading="lazy">`;
    galleryGrid.appendChild(fig);
    io.observe(fig);
  });
}

// ---------- Signature element: generative spider-web canvas ----------
const webCanvas = document.getElementById('webCanvas');
const wctx = webCanvas.getContext('2d');
const heroEl = document.getElementById('home');
let nodes = [];
let mouse = { x: -9999, y: -9999 };

function sizeCanvas() {
  webCanvas.width = heroEl.offsetWidth;
  webCanvas.height = heroEl.offsetHeight;
  const count = window.innerWidth < 768 ? 28 : 55;
  nodes = Array.from({ length: count }, () => ({
    x: Math.random() * webCanvas.width,
    y: Math.random() * webCanvas.height,
    vx: (Math.random() - 0.5) * 0.25,
    vy: (Math.random() - 0.5) * 0.25,
  }));
}
sizeCanvas();
window.addEventListener('resize', sizeCanvas);
heroEl.addEventListener('mousemove', (e) => {
  const r = heroEl.getBoundingClientRect();
  mouse.x = e.clientX - r.left;
  mouse.y = e.clientY - r.top;
});
heroEl.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function drawWeb() {
  wctx.clearRect(0, 0, webCanvas.width, webCanvas.height);
  for (let n of nodes) {
    if (!reduceMotion) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > webCanvas.width) n.vx *= -1;
      if (n.y < 0 || n.y > webCanvas.height) n.vy *= -1;
    }
  }
  const all = nodes.concat([{ x: mouse.x, y: mouse.y, isMouse: true }]);
  for (let i = 0; i < all.length; i++) {
    for (let j = i + 1; j < all.length; j++) {
      const a = all[i], b = all[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const max = a.isMouse || b.isMouse ? 220 : 130;
      if (dist < max) {
        const t = 1 - dist / max;
        const near = a.isMouse || b.isMouse;
        wctx.strokeStyle = near ? `rgba(225,29,72,${t * 0.7})` : `rgba(148,163,184,${t * 0.25})`;
        wctx.lineWidth = near ? 1.2 : 0.6;
        wctx.beginPath();
        wctx.moveTo(a.x, a.y);
        wctx.lineTo(b.x, b.y);
        wctx.stroke();
      }
    }
  }
  for (let n of nodes) {
    wctx.fillStyle = 'rgba(148,163,184,0.5)';
    wctx.beginPath();
    wctx.arc(n.x, n.y, 1.4, 0, Math.PI * 2);
    wctx.fill();
  }
  requestAnimationFrame(drawWeb);
}
drawWeb();