/* DIiH — autoscroll.js (v24.60)
 * Buton plutitor „Autoscroll”: derulează foarte lent pagina (sau containerul care derulează efectiv în ecranul curent).
 * Prima apăsare pornește; apăsarea următoare deschide controlul discret (mai încet / mai repede / oprește).
 * Se poate ascunde din 🔔 Notificări (aceeași casetă ca „Ecran pornit”). Doar frontend, fără date în foaie.
 * v24.60: cât rulează autoscrollul, ecranul nu se stinge (Wake Lock propriu, separat de butonul ☀️ „Ecran pornit”;
 * rezervă: clip video mut, invizibil, doar pe telefoanele fără Wake Lock). La oprire se eliberează.
 */
(function () {
  'use strict';
  const LS = {
    get(k, def) { try { const v = localStorage.getItem(k); return v === null ? def : JSON.parse(v); } catch (e) { return def; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  // Pixeli pe secundă, de la foarte lent la mai rapid
  const SPEEDS = [3, 5, 7, 10, 14, 19, 26, 35, 48, 65, 90, 125];
  let level = Math.min(SPEEDS.length - 1, Math.max(0, LS.get('diih_autoscroll_v2', 3)));
  let running = false, raf = 0, last = 0, touching = false, menuOpen = false;
  let target = null, targetCheck = 0;

  function isScrollable(el) {
    if (!el || el === document.body || el === document.documentElement) return false;
    const s = getComputedStyle(el);
    return /(auto|scroll)/.test(s.overflowY) && el.scrollHeight - el.clientHeight > 2;
  }
  // Containerul care derulează în punctul din mijlocul ecranului (modale, Rugăciuni, Biblia, Psaltire...); altfel pagina
  function findTarget() {
    const x = Math.round(innerWidth / 2), y = Math.round(innerHeight * 0.55);
    let el = document.elementFromPoint(x, y);
    while (el && el !== document.body && el !== document.documentElement) {
      if (isScrollable(el)) return el;
      el = el.parentElement;
    }
    return document.scrollingElement || document.documentElement;
  }
  // ---- Ecran aprins cât derulează (independent de „Ecran pornit” din familie.js) ----
  let asLock = null, asVideo = null;
  async function wakeOn() {
    if (!running) return;
    try {
      if ('wakeLock' in navigator) {
        if (asLock && !asLock.released) return;
        asLock = await navigator.wakeLock.request('screen');
        asLock.addEventListener('release', () => { asLock = null; });
        if (!running) wakeOff(); // s-a oprit între timp
        return;
      }
    } catch (e) { /* refuzat sau indisponibil: cade pe clipul video */ }
    try {
      if (!asVideo) {
        asVideo = document.createElement('video');
        asVideo.src = './awake.mp4';
        asVideo.muted = true; asVideo.loop = true; asVideo.playsInline = true;
        asVideo.setAttribute('playsinline', ''); asVideo.setAttribute('muted', '');
        asVideo.setAttribute('aria-hidden', 'true');
        asVideo.style.cssText = 'position:fixed;width:1px;height:1px;opacity:0.01;pointer-events:none;bottom:0;left:0';
        document.body.appendChild(asVideo);
      }
      await asVideo.play();
    } catch (e) { /* telefonul nu permite: autoscrollul merge oricum */ }
  }
  function wakeOff() {
    try { if (asLock) asLock.release(); } catch (e) {}
    asLock = null;
    try { if (asVideo) asVideo.pause(); } catch (e) {}
  }
  // Sistemul eliberează blocarea când ieși din aplicație; la revenire o reluăm dacă autoscrollul încă rulează
  document.addEventListener('visibilitychange', () => { if (!document.hidden && running) wakeOn(); });

  function atEnd(el) { return el.scrollTop + el.clientHeight >= el.scrollHeight - 1; }

  // Poziție ținută în zecimale: nu mai rotunjim la pixel întreg la fiecare pas, deci mișcarea e continuă
  let pos = 0;
  function frame(t) {
    if (!running) return;
    const dt = Math.min(0.05, (t - last) / 1000); last = t;
    if (!touching && !document.hidden) {
      if (!target || !target.isConnected || t - targetCheck > 700) {
        const nt = findTarget(); targetCheck = t;
        if (nt !== target) { target = nt; pos = target.scrollTop; target.style.scrollBehavior = 'auto'; }
      }
      // dacă utilizatorul a derulat singur (sau pagina s-a mutat), reluăm de unde e acum
      if (Math.abs(target.scrollTop - pos) > 2) pos = target.scrollTop;
      const before = target.scrollTop;
      pos += SPEEDS[level] * dt;
      target.scrollTop = pos;
      if (atEnd(target) && target.scrollTop - before < 0.01) {
        const alt = findTarget();
        if (alt === target) { stop(true); return; }
        target = null;
      }
    }
    raf = requestAnimationFrame(frame);
  }
  function start() {
    if (running) return;
    running = true; target = null; last = performance.now();
    raf = requestAnimationFrame(frame);
    wakeOn();
    render();
  }
  function stop(atBottom) {
    running = false; cancelAnimationFrame(raf);
    wakeOff();
    render();
    if (atBottom) { try { showToast('Autoscroll: ai ajuns la capăt.'); } catch (e) {} }
  }
  function setLevel(d) {
    level = Math.min(SPEEDS.length - 1, Math.max(0, level + d));
    LS.set('diih_autoscroll_v2', level);
    render();
  }
  function menu(show) {
    menuOpen = typeof show === 'boolean' ? show : !menuOpen;
    render();
  }
  function onBtn() {
    if (!running) { start(); return; }
    menu();
  }
  function setFabVisible(v) {
    LS.set('diih_autoscroll_fab', v);
    const f = document.getElementById('autoscrollFab');
    if (f) f.classList.toggle('hidden', !v);
    if (!v) { stop(); menuOpen = false; }
    const cb = document.getElementById('famAutoscrollFabToggle');
    if (cb) cb.checked = v;
  }
  function render() {
    const f = document.getElementById('autoscrollFab');
    if (!f) return;
    const btn = f.querySelector('[data-as-btn]');
    btn.style.opacity = running ? '0.75' : '0.38';
    btn.classList.toggle('ring-2', running);
    f.querySelector('[data-as-menu]').classList.toggle('hidden', !(running && menuOpen));
    f.querySelector('[data-as-level]').textContent = (level + 1) + '/' + SPEEDS.length;
    btn.title = running ? 'Autoscroll pornit — apasă pentru viteză / oprire' : 'Autoscroll';
  }
  function build() {
    if (document.getElementById('autoscrollFab')) return;
    const icon = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h14"/><path d="M7 10l5 5 5-5"/><path d="M7 15l5 5 5-5"/></svg>`;
    const el = document.createElement('div');
    el.id = 'autoscrollFab';
    el.className = 'fixed z-[60] left-3 bottom-24 flex flex-col items-start gap-2';
    el.innerHTML = `
      <div data-as-menu class="hidden flex items-center gap-1 bg-[#162035]/90 border border-slate-600/70 rounded-full px-1.5 py-1 shadow-xl text-slate-200 text-sm">
        <button data-as="slow" class="w-8 h-8 rounded-full bg-slate-800/80 font-bold" aria-label="Mai încet">−</button>
        <span data-as-level class="text-[10px] font-mono w-8 text-center text-slate-300"></span>
        <button data-as="fast" class="w-8 h-8 rounded-full bg-slate-800/80 font-bold" aria-label="Mai repede">+</button>
        <button data-as="stop" class="w-8 h-8 rounded-full bg-red-900/70 text-xs" aria-label="Oprește">⏹</button>
      </div>
      <button data-as-btn class="w-10 h-10 rounded-full bg-slate-700 text-slate-100 flex items-center justify-center shadow-lg shadow-black/40 border border-slate-400/50 ring-sky-300/70 active:scale-90 transition" style="opacity:.38" aria-label="Autoscroll">${icon}</button>`;
    document.body.appendChild(el);
    el.querySelector('[data-as-btn]').addEventListener('click', onBtn);
    el.querySelector('[data-as="slow"]').addEventListener('click', () => setLevel(-1));
    el.querySelector('[data-as="fast"]').addEventListener('click', () => setLevel(1));
    el.querySelector('[data-as="stop"]').addEventListener('click', () => { menuOpen = false; stop(); });
    // Cât ții degetul pe ecran, derularea se oprește (ca să poți citi / derula manual)
    addEventListener('touchstart', () => { touching = true; }, { passive: true });
    addEventListener('touchend', () => { touching = false; }, { passive: true });
    addEventListener('touchcancel', () => { touching = false; }, { passive: true });
    setFabVisible(LS.get('diih_autoscroll_fab', true));
    render();
  }
  window.famAs = { fab: setFabVisible, start, stop, menu };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
