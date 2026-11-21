/* DIiH — autoscroll.js (v24.49)
 * Buton plutitor „Autoscroll”: derulează foarte lent pagina (sau containerul care derulează efectiv în ecranul curent).
 * Prima apăsare pornește; apăsarea următoare deschide controlul discret (mai încet / mai repede / oprește).
 * Se poate ascunde din 🔔 Notificări (aceeași casetă ca „Ecran pornit”). Doar frontend, fără date în foaie.
 */
(function () {
  'use strict';
  const LS = {
    get(k, def) { try { const v = localStorage.getItem(k); return v === null ? def : JSON.parse(v); } catch (e) { return def; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  // Pixeli pe secundă, de la foarte lent la mai rapid
  const SPEEDS = [4, 8, 14, 22, 34, 50, 75, 110];
  let level = Math.min(SPEEDS.length - 1, Math.max(0, LS.get('diih_autoscroll_level', 2)));
  let running = false, raf = 0, last = 0, acc = 0, touching = false, menuOpen = false;
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
  function atEnd(el) { return el.scrollTop + el.clientHeight >= el.scrollHeight - 1; }

  function frame(t) {
    if (!running) return;
    const dt = Math.min(0.1, (t - last) / 1000); last = t;
    if (!touching && !document.hidden) {
      if (!target || !target.isConnected || t - targetCheck > 700) { target = findTarget(); targetCheck = t; }
      acc += SPEEDS[level] * dt;
      if (acc >= 1) {
        const px = Math.floor(acc); acc -= px;
        const before = target.scrollTop;
        target.scrollTop = before + px;
        if (target.scrollTop === before && atEnd(target)) { // am ajuns la capăt: reîncearcă pe alt container la următoarea verificare
          targetCheck = 0;
          const alt = findTarget();
          if (alt === target) { stop(true); return; }
        }
      }
    }
    raf = requestAnimationFrame(frame);
  }
  function start() {
    if (running) return;
    running = true; acc = 0; target = null; last = performance.now();
    raf = requestAnimationFrame(frame);
    render();
  }
  function stop(atBottom) {
    running = false; cancelAnimationFrame(raf);
    render();
    if (atBottom) { try { showToast('Autoscroll: ai ajuns la capăt.'); } catch (e) {} }
  }
  function setLevel(d) {
    level = Math.min(SPEEDS.length - 1, Math.max(0, level + d));
    LS.set('diih_autoscroll_level', level);
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
