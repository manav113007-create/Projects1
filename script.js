/* =========================================================
   Spider-Man: Brand New Day — Landing Page Script
   In-page nav, mobile menu, scroll reveals, ripple, particles,
   cast dossiers, lazy YouTube facade and the generative web canvas.
   All scroll/resize work is rAF-throttled; the canvas pauses when
   the hero leaves the viewport.
   ========================================================= */

(() => {
  'use strict';

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (sel) => document.querySelector(sel);

  /* ---------- Mobile menu ---------- */
  const menuBtn = $('#menuBtn');
  const mobileMenu = $('#mobileMenu');

  function closeMenu() {
    if (!mobileMenu) return;
    mobileMenu.hidden = true;
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Open menu');
  }

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      const open = mobileMenu.hidden;
      mobileMenu.hidden = !open;
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
  }

  /* ---------- In-page nav ---------- */
  document.querySelectorAll('[data-scroll]').forEach((el) => {
    el.addEventListener('click', (e) => {
      const target = document.getElementById(el.dataset.scroll);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      closeMenu();
    });
  });

  /* ---------- Navbar state + hero parallax (single rAF-throttled listener) ---------- */
  const navbar = $('#navbar');
  const parallaxBg = $('#parallaxBg');
  let ticking = false;

  function onScrollFrame() {
    const y = window.scrollY;
    if (navbar) navbar.classList.toggle('is-scrolled', y > 24);
    if (parallaxBg && !reduceMotion && y < window.innerHeight) {
      parallaxBg.style.transform = `translate3d(0, ${y * 0.25}px, 0) scale(1.06)`;
    }
    ticking = false;
  }

  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(onScrollFrame);
  }, { passive: true });
  onScrollFrame();

  /* ---------- Scroll reveal ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in-view');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  const observeReveals = (root = document) =>
    root.querySelectorAll('.reveal:not(.in-view), .reveal-scale:not(.in-view)').forEach((el) => io.observe(el));
  observeReveals();

  /* ---------- Ripple ---------- */
  document.addEventListener('click', (e) => {
    const host = e.target.closest('.ripple');
    if (!host || reduceMotion) return;
    const rect = host.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const circle = document.createElement('span');
    circle.className = 'ripple-circle';
    circle.style.width = circle.style.height = `${size}px`;
    circle.style.left = `${e.clientX - rect.left - size / 2}px`;
    circle.style.top = `${e.clientY - rect.top - size / 2}px`;
    host.appendChild(circle);
    setTimeout(() => circle.remove(), 600);
  });

  /* ---------- Floating particles ---------- */
  const particleLayer = $('#particles');
  if (particleLayer && !reduceMotion) {
    const count = innerWidth < 768 ? 10 : 18;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      const size = Math.random() * 4 + 2;
      p.className = 'particle';
      p.style.cssText = `width:${size}px;height:${size}px;left:${Math.random() * 100}vw;bottom:-20px;` +
        `animation-duration:${Math.random() * 12 + 12}s;animation-delay:${Math.random() * 10}s;`;
      if (i % 2 === 0) p.style.background = 'radial-gradient(circle, rgba(30,58,138,0.9), transparent 70%)';
      frag.appendChild(p);
    }
    particleLayer.appendChild(frag);
  }

  /* ---------- Cast dossiers ---------- */
  const cast = [
    { name: 'Tom Holland', role: 'Peter Parker / Spider-Man', file: '001', photo: 'img/tom-800.webp' },
    { name: 'Zendaya', role: 'MJ', file: '002', photo: 'img/zendaya-800.webp' },
    { name: 'Sadie Sink', role: 'New Character', file: '003', photo: 'img/sadie-sink-800.webp' },
    { name: 'Mark Ruffalo', role: 'Bruce Banner / Hulk', file: '004', photo: 'img/mark-800.webp' },
    { name: 'Jacob Batalon', role: 'Ned Leeds', file: '005', photo: 'img/ned-800.webp' },
    { name: 'Jon Bernthal', role: 'Frank Castle / Punisher', file: '006', photo: 'img/punisher-800.webp' },
  ];
  const initials = (n) => n.split(' ').map((w) => w[0]).join('');
  const castGrid = $('#castGrid');

  if (castGrid) {
    const frag = document.createDocumentFragment();
    cast.forEach((c) => {
      const card = document.createElement('article');
      card.className = 'dossier reveal hover-lift';
      card.dataset.case = `FILE·${c.file}`;
      card.innerHTML = `
        <div class="dossier__photo">
          <span class="dossier__glyph">${initials(c.name)}</span>
          ${c.photo ? `<img src="${c.photo}" alt="${c.name}" loading="lazy" decoding="async"
               onerror="this.remove()">` : ''}
          <span class="dossier__scan"></span>
        </div>
        <div class="dossier__info">
          <p class="dossier__name">${c.name}</p>
          <p class="dossier__role">${c.role}</p>
          <p class="dossier__status">Status: <span class="redacted"></span></p>
        </div>`;
      frag.appendChild(card);
    });
    castGrid.appendChild(frag);
    observeReveals(castGrid);
  }

  /* ---------- Trailer: click-to-load YouTube facade (keeps first paint light) ---------- */
  const trailer = $('#videoContainer');
  if (trailer) {
    trailer.addEventListener('click', () => {
      if (trailer.classList.contains('is-playing')) return;
      const id = trailer.dataset.video;
      trailer.classList.add('is-playing');
      trailer.innerHTML =
        `<iframe src="https://www.youtube.com/embed/${id}?autoplay=1&rel=0"
                 title="Spider-Man: Brand New Day official trailer"
                 allow="autoplay; encrypted-media; picture-in-picture"
                 allowfullscreen loading="lazy"></iframe>`;
    }, { once: false });
  }

  /* ---------- Generative spider-web canvas ---------- */
  const canvas = $('#webCanvas');
  const hero = $('#home');

  if (canvas && hero && canvas.getContext) {
    const ctx = canvas.getContext('2d', { alpha: true });
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const pointer = { x: -9999, y: -9999 };
    let nodes = [];
    let running = false;
    let rafId = 0;

    function size() {
      const w = hero.offsetWidth;
      const h = hero.offsetHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = w < 640 ? 18 : w < 1024 ? 34 : 55;
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
      }));
    }

    function draw() {
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);

      for (const n of nodes) {
        if (reduceMotion) break;
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }

      const points = pointer.x > -9999 ? nodes.concat([{ ...pointer, isPointer: true }]) : nodes;
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const a = points[i], b = points[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          const near = a.isPointer || b.isPointer;
          const max = near ? 220 : 130;
          if (dist >= max) continue;
          const t = 1 - dist / max;
          ctx.strokeStyle = near ? `rgba(225,29,72,${t * 0.7})` : `rgba(148,163,184,${t * 0.25})`;
          ctx.lineWidth = near ? 1.2 : 0.6;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      ctx.fillStyle = 'rgba(148,163,184,0.5)';
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }

      if (running) rafId = requestAnimationFrame(draw);
    }

    function start() {
      if (running) return;
      running = true;
      rafId = requestAnimationFrame(draw);
    }
    function stop() {
      running = false;
      cancelAnimationFrame(rafId);
    }

    size();
    draw();

    // Only animate while the hero is on screen.
    new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()))
      .observe(hero);
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));

    let resizeId;
    addEventListener('resize', () => {
      clearTimeout(resizeId);
      resizeId = setTimeout(() => { size(); if (!running) draw(); }, 150);
    });

    hero.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const r = hero.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
    }, { passive: true });
    hero.addEventListener('pointerleave', () => { pointer.x = -9999; pointer.y = -9999; });
  }
})();
