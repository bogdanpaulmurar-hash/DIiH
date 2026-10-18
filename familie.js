/* DIiH — familie.js (v24.9)
 * 1. Buton rotund „Ecran pornit” (Wake Lock) + countdown roșu
 * 2. Centrul de notificări (clopoțel, tab dedicat, citit/necitit pe server, badge pe iconiță, evenimente pentru familie)
 * 3. Sfinții zilei de pe doxologia.ro + sărbătorile legale (zile libere) evidențiate cu roșu
 * 4. Pornire inteligentă: notificări necitite → centrul de notificări; revenire în același tab sub 20 de minute
 * Se încarcă după scriptul principal din index.html și folosește funcțiile lui (apiJsonp, apiAuthParams, switchTab...).
 */
(function () {
  'use strict';

  const LS = {
    get(k, def) { try { const v = localStorage.getItem(k); return v === null ? def : JSON.parse(v); } catch (e) { return def; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  const esc = s => (s || '').toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const toast = m => { try { showToast(m); } catch (e) {} };
  const api = params => apiJsonp(Object.assign({}, apiAuthParams(), params));
  const pad = n => String(n).padStart(2, '0');
  const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  function addEl(html, parent) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    const node = t.content.firstElementChild;
    (parent || document.body).appendChild(node);
    return node;
  }

  // =====================================================================
  // 1. ECRAN PORNIT (Wake Lock)
  // =====================================================================
  // Ce se poate dintr-o aplicație web: ecranul rămâne aprins cât DIiH e deschis în față (Android, iPhone, Windows).
  // Ce NU se poate: ecran aprins / countdown peste alte aplicații — sistemul eliberează blocarea când ieși din aplicație.
  // La revenire, blocarea se reia automat dacă timpul nu a expirat.
  const AW_KEY = 'diih_awake';
  let aw = LS.get(AW_KEY, { mode: null, until: 0 }); // mode: 'app' (fără limită) | 'timer'
  let awLock = null, awVideo = null, awTick = null;

  async function awAcquire() {
    try {
      if ('wakeLock' in navigator) {
        if (awLock && !awLock.released) return true;
        awLock = await navigator.wakeLock.request('screen');
        awLock.addEventListener('release', () => { awLock = null; });
        return true;
      }
    } catch (e) { /* cade pe varianta video */ }
    try {
      // Rezervă pentru browsere fără Wake Lock (iPhone mai vechi): un clip video mut, în buclă, ține ecranul aprins
      if (!awVideo) {
        awVideo = document.createElement('video');
        awVideo.src = './awake.mp4';
        awVideo.muted = true; awVideo.loop = true; awVideo.playsInline = true;
        awVideo.setAttribute('playsinline', ''); awVideo.setAttribute('muted', '');
        awVideo.style.cssText = 'position:fixed;width:1px;height:1px;opacity:0.01;pointer-events:none;bottom:0;left:0';
        document.body.appendChild(awVideo);
      }
      await awVideo.play();
      return true;
    } catch (e) { return false; }
  }
  function awRelease() {
    try { if (awLock) awLock.release(); } catch (e) {}
    awLock = null;
    try { if (awVideo) awVideo.pause(); } catch (e) {}
  }
  function awFmt(ms) {
    const s = Math.max(0, Math.ceil(ms / 1000));
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
    return h ? `${h}:${pad(m)}:${pad(ss)}` : `${pad(m)}:${pad(ss)}`;
  }
  function awRender() {
    const btn = document.getElementById('awakeBtn');
    const cd = document.getElementById('awakeCountdown');
    if (!btn || !cd) return;
    const active = !!aw.mode;
    btn.classList.toggle('ring-4', active);
    btn.classList.toggle('ring-emerald-400', aw.mode === 'app');
    btn.classList.toggle('ring-red-500', aw.mode === 'timer');
    btn.classList.toggle('animate-pulse', aw.mode === 'timer');
    btn.textContent = aw.mode === 'app' ? '📱' : (aw.mode === 'timer' ? '🔆' : '☀️');
    if (aw.mode === 'timer') {
      cd.classList.remove('hidden');
      cd.textContent = '🔆 ' + awFmt(aw.until - Date.now());
    } else if (aw.mode === 'app') {
      cd.classList.remove('hidden');
      cd.textContent = '📱 Ecran pornit';
    } else cd.classList.add('hidden');
    document.querySelectorAll('[data-aw-state]').forEach(n => {
      n.textContent = aw.mode === 'app' ? 'Activ: aplicația rămâne deschisă, ecranul nu se stinge'
        : aw.mode === 'timer' ? `Activ: ecran pornit încă ${awFmt(aw.until - Date.now())}` : 'Oprit';
    });
  }
  async function awStart(mode, minutes, keepMenu) {
    aw = { mode, until: mode === 'timer' ? Date.now() + minutes * 60000 : 0 };
    LS.set(AW_KEY, aw);
    const ok = await awAcquire();
    if (!ok) toast('Telefonul nu permite păstrarea ecranului pornit din browser.');
    else toast(mode === 'app' ? 'Ecranul rămâne pornit cât aplicația e deschisă.' : `Ecran pornit ${minutes} min.`);
    awLoop();
    if (!keepMenu) awMenu(false);
  }
  function awStop(silent) {
    pipStop();
    aw = { mode: null, until: 0 };
    LS.set(AW_KEY, aw);
    awRelease();
    clearInterval(awTick); awTick = null;
    awRender();
    if (!silent) toast('Ecran pornit: oprit.');
  }
  function awLoop() {
    clearInterval(awTick);
    awRender();
    if (!aw.mode) return;
    awTick = setInterval(() => {
      if (aw.mode === 'timer' && Date.now() >= aw.until) {
        awStop(true);
        toast('⏱ Timpul pentru ecran pornit s-a încheiat.');
        try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch (e) {}
        return;
      }
      awRender();
    }, 1000);
  }
  function awMenu(show) {
    const m = document.getElementById('awakeMenu');
    if (!m) return;
    const open = typeof show === 'boolean' ? show : m.classList.contains('hidden');
    m.classList.toggle('hidden', !open);
    awRender();
  }
  function awCustom() {
    const v = prompt('Câte minute să rămână ecranul pornit?', '15');
    const n = parseInt(v, 10);
    if (n > 0 && n <= 600) awStart('timer', n);
  }
  function awSetFabVisible(v) {
    LS.set('diih_awake_fab', v);
    const f = document.getElementById('awakeFab');
    if (f) f.classList.toggle('hidden', !v);
    const cb = document.getElementById('famAwakeFabToggle');
    if (cb) cb.checked = v;
  }
  function awBuild() {
    addEl(`<div id="awakeCountdown" class="hidden fixed top-1.5 left-1/2 -translate-x-1/2 z-[95] bg-red-600 text-white font-mono font-bold text-sm px-3 py-1 rounded-full shadow-lg shadow-red-900/60 border border-red-300/60 pointer-events-none"></div>`);
    addEl(`<div id="awakeFab" class="fixed z-[60] right-3 bottom-24 flex flex-col items-end gap-2">
      <div id="awakeMenu" class="hidden w-64 bg-[#162035] border border-slate-600 rounded-2xl p-3 shadow-2xl text-xs text-slate-200 space-y-2">
        <div class="flex items-center justify-between"><span class="font-bold text-amber-300">☀️ Ecran pornit</span><button onclick="famAw.menu(false)" class="text-slate-400 px-1">✕</button></div>
        <p data-aw-state class="text-[10px] text-slate-400"></p>
        <button onclick="famAw.start('app')" class="w-full py-2 rounded-xl bg-emerald-900/70 border border-emerald-700 font-bold">📱 Ține aplicația deschisă (fără limită)</button>
        <div class="grid grid-cols-4 gap-1">
          <button onclick="famAw.start('timer',5)" class="py-2 rounded-xl bg-slate-800 border border-slate-600 font-bold">5′</button>
          <button onclick="famAw.start('timer',10)" class="py-2 rounded-xl bg-slate-800 border border-slate-600 font-bold">10′</button>
          <button onclick="famAw.start('timer',30)" class="py-2 rounded-xl bg-slate-800 border border-slate-600 font-bold">30′</button>
          <button onclick="famAw.custom()" class="py-2 rounded-xl bg-slate-800 border border-slate-600 font-bold">⏱…</button>
        </div>
        <button onclick="famAw.stop()" class="w-full py-1.5 rounded-xl bg-red-900/60 border border-red-700 font-bold">⏹ Oprește</button>
        <div class="pt-2 border-t border-slate-700 space-y-1.5">
          <p class="text-[10px] font-bold text-cyan-300">⧉ Varianta 2 (experimental): fereastră plutitoare</p>
          <p class="text-[9px] text-slate-500 leading-snug">Numărătoarea roșie plutește peste Teams / browser, ca un video mic. Cât rulează video-ul, telefonul de obicei nu stinge ecranul. De testat pe fiecare telefon.</p>
          <div class="grid grid-cols-5 gap-1">
            <button onclick="famAw.pip(5)" class="py-2 rounded-xl bg-cyan-950 border border-cyan-700 font-bold">5′</button>
            <button onclick="famAw.pip(10)" class="py-2 rounded-xl bg-cyan-950 border border-cyan-700 font-bold">10′</button>
            <button onclick="famAw.pip(30)" class="py-2 rounded-xl bg-cyan-950 border border-cyan-700 font-bold">30′</button>
            <button onclick="famAw.pip(60)" class="py-2 rounded-xl bg-cyan-950 border border-cyan-700 font-bold">1h</button>
            <button onclick="famAw.pipCustom()" class="py-2 rounded-xl bg-cyan-950 border border-cyan-700 font-bold">⏱…</button>
          </div>
          <div id="awPipBox" class="hidden space-y-1.5">
            <div id="awPipSlot" class="rounded-lg overflow-hidden border border-red-800 bg-black"></div>
            <button onclick="famAw.pipEnter()" class="w-full py-2 rounded-xl bg-cyan-700 text-white font-bold">⧉ Mută peste aplicații</button>
            <p class="text-[9px] text-slate-500">Dacă butonul nu merge, apasă iconița ⧉ (Picture-in-Picture) din colțul video-ului, apoi treci în Teams.</p>
          </div>
          <a href="./pip.html?m=60" target="_blank" rel="noopener" class="block w-full py-2 rounded-xl bg-slate-800 border border-slate-500 text-center font-bold">🍎 iPhone: deschide în Safari (ecran complet → glisează în sus)</a>
        </div>
        <p class="text-[9px] text-slate-500 leading-snug">Funcționează cât aplicația e deschisă pe ecran. Când treci în altă aplicație, telefonul preia controlul; la revenire se reia automat până expiră timpul.</p>
        <button onclick="famAw.fab(false)" class="text-[9px] text-slate-500 underline">Ascunde butonul (îl reafișezi din 🔔 Notificări)</button>
      </div>
      <button id="awakeBtn" onclick="famAw.menu()" class="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-700 text-white text-xl shadow-xl shadow-black/50 border-2 border-amber-200/60 active:scale-90 transition" title="Ecran pornit">☀️</button>
    </div>`);
    awSetFabVisible(LS.get('diih_awake_fab', true));
    if (aw.mode === 'timer' && Date.now() >= aw.until) aw = { mode: null, until: 0 };
    if (aw.mode) { awAcquire(); }
    awLoop();
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && aw.mode) { awAcquire(); awLoop(); }
    });
  }
  // ---- Varianta 2: Picture-in-Picture cu numărătoare (video pre-generat 5/10/30 min, în /pip) ----
  let pipVideo = null;
  function pipEl() {
    if (pipVideo) return pipVideo;
    const v = document.createElement('video');
    // Video CU sunet (o pistă audio de liniște, nu „muted”): telefoanele tratează doar redarea reală ca video
    // și abia atunci nu sting ecranul. Un video mut era ignorat pe 13 Pro Max și S24.
    v.muted = false; v.volume = 1; v.playsInline = true; v.controls = true; v.preload = 'metadata';
    v.setAttribute('playsinline', ''); v.setAttribute('webkit-playsinline', '');
    v.style.cssText = 'width:100%;display:block;aspect-ratio:8/3;background:#000';
    v.addEventListener('ended', () => {
      // peste 2 ore: video-ul se reia până expiră timpul ales
      if (aw.mode === 'timer' && aw.until - Date.now() > 5000) { v.currentTime = 0; v.play().catch(() => {}); return; }
      if (aw.mode === 'timer') { awStop(true); toast('⏱ Timpul pentru ecran pornit s-a încheiat.'); }
      pipStop();
    });
    const slot = document.getElementById('awPipSlot');
    if (slot) slot.appendChild(v);
    pipVideo = v;
    return v;
  }
  function pipStart(min) {
    awStart('timer', min, true);
    const box = document.getElementById('awPipBox');
    if (box) box.classList.remove('hidden');
    const v = pipEl();
    // Un singur video de 2 ore cu numărătoare; pornim de la poziția care arată exact timpul ales
    const offset = Math.max(0, 7200 - min * 60);
    if (!/pip-120\.mp4$/.test(v.currentSrc || '')) v.src = './pip/pip-120.mp4';
    const seek = () => { try { v.currentTime = offset; } catch (e) {} };
    if (v.readyState >= 1) seek(); else v.addEventListener('loadedmetadata', seek, { once: true });
    v.muted = false;
    v.play().then(() => pipEnter(true)).catch(() => {
      // fără gest valid sau cu sunet blocat: încercăm mut, apoi utilizatorul apasă „Mută peste aplicații”
      v.muted = true;
      v.play().catch(() => {});
      toast('Apasă ▶ pe video (cu sunet), apoi „Mută peste aplicații”.');
    });
  }
  function pipCustom() {
    const n = parseInt(prompt('Câte minute? (peste 120, video-ul se reia până la final)', '45'), 10);
    if (n > 0 && n <= 600) pipStart(n);
  }
  function pipEnter(auto) {
    const v = pipVideo;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    try {
      if (typeof v.webkitSupportsPresentationMode === 'function' && v.webkitSupportsPresentationMode('picture-in-picture') && /iPhone|iPad/.test(navigator.userAgent)) {
        v.webkitSetPresentationMode('picture-in-picture');
        awMenu(false);
        return;
      }
      if (document.pictureInPictureEnabled && typeof v.requestPictureInPicture === 'function') {
        v.requestPictureInPicture()
          .then(() => { toast('⧉ Numărătoarea plutește. Poți trece în Teams.'); awMenu(false); })
          .catch(() => { if (!auto) toast('Fereastra plutitoare a fost refuzată. Încearcă iconița ⧉ din video.'); });
        return;
      }
      if (typeof v.webkitSupportsPresentationMode === 'function' && v.webkitSupportsPresentationMode('picture-in-picture')) {
        v.webkitSetPresentationMode('picture-in-picture');
        awMenu(false);
        return;
      }
    } catch (e) {}
    if (!auto) toast('Telefonul/browserul nu permite fereastra plutitoare aici.');
  }
  function pipStop() {
    const v = pipVideo;
    if (!v) return;
    try { if (document.pictureInPictureElement) document.exitPictureInPicture(); } catch (e) {}
    try { if (v.webkitPresentationMode === 'picture-in-picture') v.webkitSetPresentationMode('inline'); } catch (e) {}
    try { v.pause(); } catch (e) {}
    const box = document.getElementById('awPipBox');
    if (box) box.classList.add('hidden');
  }
  window.famAw = { start: awStart, stop: awStop, menu: awMenu, custom: awCustom, fab: awSetFabVisible, pip: pipStart, pipCustom, pipEnter: () => pipEnter(false) };

  // =====================================================================
  // 2. CENTRUL DE NOTIFICĂRI
  // =====================================================================
  const INBOX_SERVER = 'diih_inbox_server';
  const INBOX_LOCAL = 'diih_inbox_local';
  const INBOX_SEEN = 'diih_inbox_seen';
  let inboxServer = LS.get(INBOX_SERVER, []);
  let inboxLocal = LS.get(INBOX_LOCAL, []);
  let readPending = new Set();
  let respondPending = {};
  let famProfiles = LS.get('diih_fam_profiles', []);
  let centerOpen = false;

  function myEmail() { try { return getMyAuthEmail(); } catch (e) { return ''; } }
  function allItems() {
    const srv = inboxServer.map(n => Object.assign({}, n, {
      citit: n.citit || readPending.has(n.id),
      status: respondPending[n.id] || n.status, src: 'srv'
    }));
    const loc = inboxLocal.filter(n => !n.owner || n.owner === myEmail()).map(n => Object.assign({}, n, { src: 'loc' }));
    return srv.concat(loc).sort((a, b) => (b.creat || '').localeCompare(a.creat || ''));
  }
  function isUnread(n) { return !n.citit || (n.tip === 'eveniment' && !n.status); }
  function unreadCount() { return allItems().filter(isUnread).length; }

  function famRenderBell() {
    const b = document.getElementById('famBellBtn');
    const dot = document.getElementById('famBellCount');
    if (!b || !dot) return;
    const n = unreadCount();
    dot.textContent = n > 99 ? '99+' : String(n);
    dot.classList.toggle('hidden', n === 0);
    b.classList.toggle('bg-red-700', n > 0);
    b.classList.toggle('border-red-400', n > 0);
    b.classList.toggle('text-white', n > 0);
    b.classList.toggle('animate-pulse', n > 0);
    b.classList.toggle('bg-cardbg', n === 0);
    try {
      if ('setAppBadge' in navigator) { n > 0 ? navigator.setAppBadge(n) : navigator.clearAppBadge(); }
    } catch (e) {}
  }

  function fmtWhen(s) {
    if (!s) return '';
    const d = new Date(s.replace(' ', 'T'));
    if (isNaN(d)) return s;
    const diff = (Date.now() - d.getTime()) / 60000;
    if (diff < 1) return 'acum';
    if (diff < 60) return `acum ${Math.floor(diff)} min`;
    if (diff < 24 * 60 && d.getDate() === new Date().getDate()) return `azi ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function famRenderCenter() {
    const list = document.getElementById('famNotifList');
    if (!list) return;
    const items = allItems();
    const filt = (document.getElementById('famNotifFilter') || {}).value || 'toate';
    const shown = filt === 'necitite' ? items.filter(isUnread) : items;
    document.getElementById('famNotifSummary').textContent = `${unreadCount()} necitite • ${items.length} în total`;
    if (!shown.length) {
      list.innerHTML = `<div class="text-center text-slate-500 text-xs py-10">🔕 Nicio notificare${filt === 'necitite' ? ' necitită' : ''}.</div>`;
      return;
    }
    list.innerHTML = shown.map(n => {
      const unread = isUnread(n);
      const ev = n.tip === 'eveniment';
      const actions = ev && !n.status ? `
        <div class="flex gap-1.5 mt-2">
          <button onclick="event.stopPropagation(); famNotif.respond('${esc(n.id)}','accept')" class="flex-1 py-1.5 rounded-lg bg-emerald-800 border border-emerald-600 text-[11px] font-bold">✔ Accept</button>
          <button onclick="event.stopPropagation(); famNotif.respond('${esc(n.id)}','ignora')" class="flex-1 py-1.5 rounded-lg bg-slate-800 border border-slate-600 text-[11px] font-bold">✕ Ignoră</button>
        </div>` : (ev && n.status ? `<div class="mt-1 text-[10px] ${n.status === 'acceptat' ? 'text-emerald-400' : 'text-slate-500'}">${n.status === 'acceptat' ? '✔ Acceptat — e în calendarul tău' : '✕ Ignorat — scos din calendarul tău'}</div>` : '');
      return `<div onclick="famNotif.open('${esc(n.id)}','${n.src}')" class="p-3 rounded-xl border cursor-pointer ${unread ? 'bg-red-950/40 border-red-700/70' : 'bg-darkbg border-bordercol opacity-80'}">
        <div class="flex items-start justify-between gap-2">
          <span class="text-[12px] font-bold ${unread ? 'text-white' : 'text-slate-300'}">${unread ? '<span class="inline-block w-2 h-2 rounded-full bg-red-500 mr-1"></span>' : ''}${esc(n.titlu)}</span>
          <span class="text-[9px] text-slate-500 whitespace-nowrap">${esc(fmtWhen(n.creat))}</span>
        </div>
        ${n.mesaj ? `<p class="text-[11px] text-slate-300 mt-1 leading-snug">${esc(n.mesaj)}</p>` : ''}
        ${actions}
      </div>`;
    }).join('');
  }

  function famOpenCenter() {
    const c = document.getElementById('famNotifCenter');
    if (!c) return;
    c.classList.remove('hidden');
    centerOpen = true;
    famRenderCenter();
    famLoadProfiles();
    const cb = document.getElementById('famAwakeFabToggle');
    if (cb) cb.checked = LS.get('diih_awake_fab', true);
  }
  function famCloseCenter() {
    const c = document.getElementById('famNotifCenter');
    if (c) c.classList.add('hidden');
    centerOpen = false;
  }

  function markRead(ids, all) {
    const now = new Date();
    if (all) {
      inboxServer.forEach(n => { if (!n.citit) readPending.add(n.id); });
      inboxLocal.forEach(n => { n.citit = true; });
    } else {
      ids.forEach(id => {
        const loc = inboxLocal.find(n => n.id === id);
        if (loc) loc.citit = true; else readPending.add(id);
      });
    }
    LS.set(INBOX_LOCAL, inboxLocal);
    famRenderBell(); famRenderCenter();
    const srvIds = all ? [] : ids.filter(id => inboxServer.some(n => n.id === id));
    if (all || srvIds.length) {
      api({ action: 'notifMarkRead', ids: srvIds.join(','), all: all ? '1' : '' }).catch(() => {});
    }
    return now;
  }
  function famOpenItem(id, src) {
    const n = allItems().find(x => x.id === id);
    if (!n) return;
    if (n.tip !== 'eveniment' || n.status) markRead([id], false);
    if (n.tab === 'remindere') { remShow(); return; }
    if (n.tab && n.tab !== 'notificari') {
      famCloseCenter();
      try { switchTab(n.tab); } catch (e) {}
    }
  }
  function famRespond(id, raspuns) {
    respondPending[id] = raspuns === 'accept' ? 'acceptat' : 'ignorat';
    readPending.add(id);
    famRenderBell(); famRenderCenter();
    api({ action: 'notifRespond', id, raspuns }).then(r => {
      if (r && r.success) toast(raspuns === 'accept' ? 'Eveniment acceptat.' : 'Eveniment ignorat — scos din calendarul tău.');
      else toast('Nu s-a putut trimite răspunsul' + (r && r.error ? ': ' + r.error : '.'));
    }).catch(e => toast(e.message));
  }

  // Lista venită de pe server (din getLiveData / getAllData). Notificările noi (în afară de cumpărături, care au
  // deja alerta lor) apar și ca notificare de sistem.
  function famSetInbox(list) {
    if (!Array.isArray(list)) return;
    const firstTime = LS.get(INBOX_SEEN, null) === null;
    const seen = new Set(LS.get(INBOX_SEEN, []));
    list.forEach(n => {
      if (!seen.has(n.id)) {
        seen.add(n.id);
        if (!firstTime && !n.citit && n.tip !== 'cumparaturi') {
          try { origTrigger(n.titlu, n.mesaj); } catch (e) {}
        }
      }
      if (n.citit) readPending.delete(n.id);
      if (n.status) delete respondPending[n.id];
    });
    LS.set(INBOX_SEEN, Array.from(seen).slice(-400));
    inboxServer = list;
    LS.set(INBOX_SERVER, list);
    famRenderBell();
    if (centerOpen) famRenderCenter();
    famMaybeAutoOpen();
  }

  // Notificările generate pe dispozitiv (remindere, alerte programate) intră și ele în centru
  let origTrigger = null;
  function hookTrigger() {
    if (typeof window.triggerNotification !== 'function' || origTrigger) return;
    origTrigger = window.triggerNotification;
    window.triggerNotification = function (title, body) {
      try {
        if (!/^🛒/.test(title || '')) {
          inboxLocal.unshift({ id: 'L-' + Date.now() + '-' + Math.floor(Math.random() * 1000), creat: new Date().toISOString().slice(0, 19).replace('T', ' '), titlu: title, mesaj: body, citit: false, tip: 'local', owner: myEmail() });
          inboxLocal = inboxLocal.slice(0, 60);
          LS.set(INBOX_LOCAL, inboxLocal);
          famRenderBell();
          if (centerOpen) famRenderCenter();
        }
      } catch (e) {}
      return origTrigger.apply(this, arguments);
    };
  }

  // ---- Evenimente pentru familie (Google Calendar, prin Familie.gs) ----
  function famLoadProfiles() {
    famRenderProfiles();
    api({ action: 'famProfiles' }).then(r => {
      if (r && Array.isArray(r.profiles)) { famProfiles = r.profiles; LS.set('diih_fam_profiles', famProfiles); famRenderProfiles(); }
    }).catch(() => {});
  }
  function famRenderProfiles() {
    const box = document.getElementById('famEvDest');
    if (!box) return;
    if (!famProfiles.length) { box.innerHTML = '<span class="text-[10px] text-slate-500">Se încarcă membrii familiei… (necesită Familie.gs pe server)</span>'; return; }
    const me = myEmail();
    box.innerHTML = famProfiles.map(p => `<label class="flex items-center gap-1 px-2 py-1 rounded-lg bg-darkbg border border-bordercol text-[11px]">
      <input type="checkbox" value="${esc(p.email)}" ${p.email === me ? 'checked' : ''} class="accent-cyan-500"> ${esc((p.nume || p.email).split(' ')[0])}${p.email === me ? ' (eu)' : ''}</label>`).join('');
  }
  function famEvToggleForm() {
    const f = document.getElementById('famEvForm');
    f.classList.toggle('hidden');
    if (!f.classList.contains('hidden')) {
      const d = new Date(Date.now() + 3600000); d.setMinutes(0, 0, 0);
      const inp = document.getElementById('famEvStart');
      if (!inp.value) inp.value = `${ymd(d)}T${pad(d.getHours())}:00`;
    }
  }
  function famEvSubmit() {
    const titlu = document.getElementById('famEvTitle').value.trim();
    const start = document.getElementById('famEvStart').value;
    const durSel = document.getElementById('famEvDur').value;
    const descriere = document.getElementById('famEvDesc').value.trim();
    const dest = Array.from(document.querySelectorAll('#famEvDest input:checked')).map(x => x.value);
    if (!titlu || !start) return toast('Completează titlul și data.');
    if (!dest.length) return toast('Alege cel puțin o persoană.');
    const btn = document.getElementById('famEvSend');
    btn.disabled = true; btn.textContent = 'Se trimite…';
    api({ action: 'calAddEvent', titlu, start: durSel === 'zi' ? start.slice(0, 10) : start, durata: durSel === 'zi' ? 0 : durSel, toataZiua: durSel === 'zi' ? 'true' : 'false', destinatari: dest.join(','), descriere })
      .then(r => {
        if (r && r.success) {
          toast('📅 Eveniment trimis în calendarul fiecăruia.');
          document.getElementById('famEvTitle').value = '';
          document.getElementById('famEvDesc').value = '';
          document.getElementById('famEvForm').classList.add('hidden');
        } else toast('Nu s-a putut crea evenimentul' + (r && r.error ? ': ' + r.error : ' — ai lipit Familie.gs și ai rulat familieInstaleaza()?'));
      }).catch(e => toast(e.message))
      .finally(() => { btn.disabled = false; btn.textContent = '📅 Trimite în calendar'; });
  }

  function famBuildCenter() {
    // Clopoțelul din bara de sus, lângă butonul de sincronizare
    const sync = document.querySelector('header button[onclick^="fetchDataFromSheet"]');
    if (sync && !document.getElementById('famBellBtn')) {
      const bell = document.createElement('button');
      bell.id = 'famBellBtn';
      bell.title = 'Notificări';
      bell.className = 'relative p-2 rounded-xl bg-cardbg border border-bordercol text-slate-300 active:scale-95 transition';
      bell.innerHTML = '<span class="text-base leading-none">🔔</span><span id="famBellCount" class="hidden absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border border-darkbg">0</span>';
      bell.onclick = famOpenCenter;
      sync.parentNode.insertBefore(bell, sync);
    }
    addEl(`<div id="famNotifCenter" class="hidden fixed inset-0 z-[80] bg-darkbg/98 backdrop-blur flex flex-col">
      <div class="max-w-lg w-full mx-auto flex flex-col h-full">
        <div class="flex items-center justify-between px-4 py-3 border-b border-bordercol">
          <div><h2 class="text-base font-bold text-white">🔔 Notificări</h2><p id="famNotifSummary" class="text-[10px] text-slate-400"></p></div>
          <div class="flex items-center gap-1.5">
            <button onclick="famNotif.markAll()" class="px-2.5 py-1.5 rounded-xl bg-cyan-900 border border-cyan-700 text-cyan-100 text-[11px] font-bold">✔ Citit tot</button>
            <button onclick="famNotif.close()" class="px-2.5 py-1.5 rounded-xl bg-cardbg border border-bordercol text-slate-300 text-[11px] font-bold">🏠 Acasă</button>
          </div>
        </div>
        <div class="px-4 py-2 flex items-center gap-2 border-b border-bordercol">
          <select id="famNotifFilter" onchange="famNotif.render()" class="bg-cardbg border border-bordercol rounded-lg px-2 py-1 text-[11px] text-slate-200">
            <option value="toate">Toate</option><option value="necitite">Doar necitite</option>
          </select>
          <button onclick="famNotif.toggleEv()" class="ml-auto px-2.5 py-1 rounded-lg bg-rose-900/70 border border-rose-700 text-rose-100 text-[11px] font-bold">📅 Eveniment pentru familie</button>
        </div>
        <div id="famEvForm" class="hidden px-4 py-3 space-y-2 border-b border-bordercol bg-cardbg/60 text-xs">
          <input id="famEvTitle" type="text" placeholder="Ce? (ex: Ședință cu părinții)" class="w-full bg-darkbg border border-bordercol rounded-lg p-2 text-white">
          <div class="grid grid-cols-2 gap-2">
            <input id="famEvStart" type="datetime-local" class="bg-darkbg border border-bordercol rounded-lg p-2 text-white">
            <select id="famEvDur" class="bg-darkbg border border-bordercol rounded-lg p-2 text-white">
              <option value="15">15 min</option><option value="30">30 min</option><option value="60" selected>1 oră</option><option value="120">2 ore</option><option value="zi">Toată ziua</option>
            </select>
          </div>
          <div id="famEvDest" class="flex flex-wrap gap-1.5"></div>
          <input id="famEvDesc" type="text" placeholder="Detalii (opțional)" class="w-full bg-darkbg border border-bordercol rounded-lg p-2 text-white">
          <button id="famEvSend" onclick="famNotif.sendEv()" class="w-full py-2 rounded-xl bg-rose-700 text-white font-bold">📅 Trimite în calendar</button>
          <p class="text-[9px] text-slate-500 leading-snug">Apare în Google Calendar al fiecăruia (Samsung Calendar, iPhone cu contul Google adăugat la Calendar, Outlook/Calendar pe Windows). Fiecare îl poate ignora.</p>
        </div>
        <div id="famNotifList" class="flex-1 overflow-y-auto px-4 py-3 space-y-2"></div>
        <div class="px-4 py-2 border-t border-bordercol flex items-center justify-between text-[10px] text-slate-400">
          <label class="flex items-center gap-1.5"><input id="famAwakeFabToggle" type="checkbox" onchange="famAw.fab(this.checked)" class="accent-amber-500"> Butonul ☀️ Ecran pornit</label>
          <span>${typeof APP_VERSION !== 'undefined' ? APP_VERSION : ''}</span>
        </div>
      </div>
    </div>`);
    famRenderBell();
  }
  window.famNotif = { open: famOpenItem, close: famCloseCenter, show: famOpenCenter, markAll: () => markRead([], true), respond: famRespond, render: famRenderCenter, toggleEv: famEvToggleForm, sendEv: famEvSubmit, setInbox: famSetInbox };

  // =====================================================================
  // 3. SFINȚII ZILEI + SĂRBĂTORI LEGALE
  // =====================================================================
  function pasteOrtodox(an) {
    const a = an % 4, b = an % 7, c = an % 19;
    const d = (19 * c + 15) % 30, e = (2 * a + 4 * b - d + 34) % 7;
    const luna = Math.floor((d + e + 114) / 31), zi = ((d + e + 114) % 31) + 1;
    const r = new Date(an, luna - 1, zi);
    r.setDate(r.getDate() + 13);
    return r;
  }
  function sarbatoriLegale(an) {
    const P = pasteOrtodox(an);
    const plus = n => { const d = new Date(P); d.setDate(d.getDate() + n); return d; };
    const z = (l, d) => new Date(an, l - 1, d);
    return [
      [z(1, 1), 'Anul Nou'], [z(1, 2), 'Anul Nou'], [z(1, 6), 'Botezul Domnului (Boboteaza)'], [z(1, 7), 'Soborul Sf. Ioan Botezătorul'],
      [z(1, 24), 'Ziua Unirii Principatelor'], [plus(-2), 'Vinerea Mare'], [P, 'Învierea Domnului (Paștile)'], [plus(1), 'A doua zi de Paști'],
      [z(5, 1), 'Ziua Muncii'], [z(6, 1), 'Ziua Copilului'], [plus(49), 'Rusaliile'], [plus(50), 'A doua zi de Rusalii'],
      [z(8, 15), 'Adormirea Maicii Domnului'], [z(11, 30), 'Sf. Apostol Andrei'], [z(12, 1), 'Ziua Națională'],
      [z(12, 25), 'Nașterea Domnului (Crăciunul)'], [z(12, 26), 'A doua zi de Crăciun']
    ].map(([d, n]) => ({ data: ymd(d), nume: n }));
  }
  function sarbatoareLegala(d) {
    const k = ymd(d);
    return sarbatoriLegale(d.getFullYear()).find(x => x.data === k) || null;
  }
  function urmatoareaZiLibera() {
    const azi = ymd(new Date());
    const all = sarbatoriLegale(new Date().getFullYear()).concat(sarbatoriLegale(new Date().getFullYear() + 1));
    return all.find(x => x.data > azi) || null;
  }
  window.famSarbatoareLegala = sarbatoareLegala; // pentru alte ecrane (ex. calendare)

  // ---- Post și dezlegări (calcul după rânduiala generală BOR) ----
  const ZILE = ['duminică', 'luni', 'marți', 'miercuri', 'joi', 'vineri', 'sâmbătă'];
  const POST_TIPURI = ['aspru', 'ulei', 'peste', 'negru', 'post'];
  function zi(d, n) { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() + n); return x; }
  function intre(d, a, b) { const t = ymd(d); return t >= ymd(a) && t <= ymd(b); }
  function md(d) { return `${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
  function posturiMari(an) {
    const P = pasteOrtodox(an);
    const out = [
      { nume: 'Postul Mare (al Sfintelor Paști)', start: zi(P, -48), end: zi(P, -1) },
      { nume: 'Postul Adormirii Maicii Domnului', start: new Date(an, 7, 1), end: new Date(an, 7, 14) },
      { nume: 'Postul Nașterii Domnului (Crăciunului)', start: new Date(an, 10, 15), end: new Date(an, 11, 24) }
    ];
    const ap = zi(P, 57), apEnd = new Date(an, 5, 28);
    if (ymd(ap) <= ymd(apEnd)) out.splice(1, 0, { nume: 'Postul Sfinților Apostoli Petru și Pavel', start: ap, end: apEnd });
    return out;
  }
  // tip: normal | harti | branza | post | ulei | aspru | peste | negru
  function postInfo(d, cruceAzi) {
    const P = pasteOrtodox(d.getFullYear());
    const w = d.getDay(), m = md(d);
    const r = (tip, text, motiv) => ({ tip, text, motiv: motiv || '' });
    if (m >= '12-25' || m <= '01-04') return r('harti', 'Fără post', 'perioada Nașterii Domnului');
    if (intre(d, P, zi(P, 6))) return r('harti', 'Fără post', 'Săptămâna Luminată');
    if (intre(d, zi(P, 50), zi(P, 56))) return r('harti', 'Fără post', 'săptămâna după Rusalii');
    if (intre(d, zi(P, -70), zi(P, -64))) return r('harti', 'Fără post', 'săptămâna Vameșului și a Fariseului');
    if (intre(d, zi(P, -55), zi(P, -49))) return r('branza', 'Fără carne — lactate, ouă, pește', 'Săptămâna brânzei');
    if (m === '01-05') return r('post', 'Post', 'Ajunul Bobotezei');
    if (m === '08-29') return r('post', 'Post', 'Tăierea capului Sf. Ioan Botezătorul');
    if (m === '09-14') return r('post', 'Post', 'Înălțarea Sfintei Cruci');
    const mari = posturiMari(d.getFullYear());
    const pm = mari.find(p => intre(d, p.start, p.end));
    if (pm) {
      const n = pm.nume.split(' (')[0];
      if (pm.nume.startsWith('Postul Mare')) {
        if (ymd(d) === ymd(zi(P, -2))) return r('negru', 'Post negru (aspru)', 'Vinerea Mare');
        if (ymd(d) === ymd(zi(P, -7))) return r('peste', 'Dezlegare la pește', 'Floriile');
        if (m === '03-25' && ymd(d) < ymd(zi(P, -7))) return r('peste', 'Dezlegare la pește', 'Buna Vestire');
        if (w === 0 || w === 6) return r('ulei', 'Post — dezlegare la ulei și vin', n);
        return r('aspru', 'Post aspru (fără ulei)', n);
      }
      if (pm.nume.startsWith('Postul Sfinților')) {
        if (m === '06-24') return r('peste', 'Dezlegare la pește', 'Nașterea Sf. Ioan Botezătorul');
        if (w === 3 || w === 5) return r('ulei', 'Post — dezlegare la ulei și vin', n);
        return r('peste', 'Post — dezlegare la pește', n);
      }
      if (pm.nume.startsWith('Postul Adormirii')) {
        if (m === '08-06') return r('peste', 'Dezlegare la pește', 'Schimbarea la Față');
        if (w === 0 || w === 6) return r('ulei', 'Post — dezlegare la ulei și vin', n);
        return r('aspru', 'Post aspru (fără ulei)', n);
      }
      // Postul Nașterii Domnului
      if (m === '11-21' || m === '12-06') return r('peste', 'Dezlegare la pește', m === '11-21' ? 'Intrarea în Biserică a Maicii Domnului' : 'Sf. Ierarh Nicolae');
      if (m === '12-24') return r('aspru', 'Post aspru (ajunare)', 'Ajunul Crăciunului');
      if ((w === 0 || w === 6) && m <= '12-20') return r('peste', 'Post — dezlegare la pește', n);
      if (w === 0 || w === 6 || w === 2 || w === 4) return r('ulei', 'Post — dezlegare la ulei și vin', n);
      return r('aspru', 'Post aspru (fără ulei)', n);
    }
    if (w === 3 || w === 5) {
      const mariSarb = ['02-02', '06-24', '06-29', '08-15', '09-08'];
      if (mariSarb.includes(m) || cruceAzi) return r('peste', 'Dezlegare la pește', 'sărbătoare mare în zi de ' + ZILE[w]);
      return r('post', 'Post', ZILE[w]);
    }
    return r('normal', 'Fără post', ZILE[w]);
  }
  function esteZiPost(p) { return POST_TIPURI.includes(p.tip); }
  function urmatoareaZiPost(azi) {
    for (let i = 1; i <= 60; i++) { const d = zi(azi, i); const p = postInfo(d, false); if (esteZiPost(p)) return { d, p, zile: i }; }
    return null;
  }
  function stareaPosturilorMari(azi) {
    const an = azi.getFullYear();
    const toate = posturiMari(an - 1).concat(posturiMari(an), posturiMari(an + 1));
    const acum = toate.find(p => intre(azi, p.start, p.end));
    const urm = toate.filter(p => ymd(p.start) > ymd(azi)).sort((a, b) => a.start - b.start)[0];
    const zileIntre = (a, b) => Math.round((zi(b, 0) - zi(a, 0)) / 86400000);
    return {
      acum: acum ? { nume: acum.nume, ziua: zileIntre(acum.start, azi) + 1, total: zileIntre(acum.start, acum.end) + 1, ramase: zileIntre(azi, acum.end) } : null,
      urm: urm ? { nume: urm.nume, start: urm.start, zile: zileIntre(azi, urm.start) } : null
    };
  }
  const fmtZi = d => `${ZILE[d.getDay()]}, ${d.getDate()} ${d.toLocaleDateString('ro-RO', { month: 'short' }).replace('.', '')}`;
  const POST_ICON = { normal: '🍽', harti: '🍖', branza: '🧀', post: '🥗', ulei: '🫒', aspru: '🥖', peste: '🐟', negru: '⚫' };
  window.famPostInfo = postInfo;

  const DOX_KEY = 'diih_doxologia_zi';
  const MODE_KEY = () => 'diih_sfinti_mode_' + (typeof getCurrentLoggedInUser === 'function' ? getCurrentLoggedInUser() : '');
  function doxMode() { return LS.get(MODE_KEY(), 'scurt'); }
  function doxSetMode(m) { LS.set(MODE_KEY(), m); doxRender(doxData); }

  function doxRender(d) {
    const card = document.getElementById('famSfintiCard');
    if (!card) return;
    const azi = new Date();
    const legal = sarbatoareLegala(azi);
    const okData = d && d.sfinti && d.data === ymd(azi);
    const sfinti = okData ? d.sfinti : [];
    const cruce = sfinti.find(s => s.cruce);
    const post = postInfo(azi, !!cruce);
    const nextPost = esteZiPost(post) ? null : urmatoareaZiPost(azi);
    const mari = stareaPosturilorMari(azi);
    const scurt = doxMode() === 'scurt';
    const rosu = legal || cruce;
    card.className = 'rounded-2xl p-3.5 shadow-lg space-y-2 ' + (legal
      ? 'bg-gradient-to-br from-red-950 to-[#2a0d12] border-4 border-red-500 shadow-red-900/50'
      : (cruce ? 'bg-gradient-to-br from-cardbg to-[#2a1218] border-2 border-red-700/80' : 'bg-cardbg border border-amber-800/60'));
    const curat = s => s.replace(/^\s*[✝†]\)?\s*/, '');
    const antet = okData && d.antet ? d.antet.join(' • ') : azi.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long' });

    let h = `<div class="flex items-center justify-between gap-2">
        <span class="text-xs font-bold uppercase tracking-wider ${rosu ? 'text-red-300' : 'text-amber-300'}">✝ Sfinții zilei</span>
        <span class="text-[10px] text-slate-400 truncate">${esc(antet)}</span>
        <button onclick="famDox.mode('${scurt ? 'detaliat' : 'scurt'}')" class="shrink-0 text-[10px] px-2 py-0.5 rounded-lg bg-darkbg border border-bordercol text-slate-300">${scurt ? 'Detaliat ▾' : 'Scurt ▴'}</button>
      </div>`;
    if (legal) h += `<div class="bg-red-600 text-white font-bold text-xs rounded-xl px-3 py-1.5 text-center border border-red-300">🔴 ZI LIBERĂ — ${esc(legal.nume)}</div>`;

    // Sfinții
    if (!okData) {
      h += `<p class="text-[11px] text-slate-400">${d && d.eroare ? esc(d.eroare) : 'Se încarcă de pe doxologia.ro…'}</p>`;
    } else if (scurt) {
      const princ = cruce || sfinti[0];
      const iPr = sfinti.indexOf(princ);
      h += `<button onclick="famDox.open(${iPr})" class="w-full text-left text-[13px] leading-snug ${cruce ? 'text-red-200 font-bold' : 'text-white font-semibold'}">${cruce ? '<span class="text-red-400">✝</span> ' : ''}${esc(curat(princ.nume))}${sfinti.length > 1 ? ` <span class="text-slate-400 font-normal text-[11px]">+${sfinti.length - 1} sfinți</span>` : ''}</button>`;
    } else {
      h += `<div class="space-y-1">${sfinti.map((s, i) => `<button onclick="famDox.open(${i})" class="w-full text-left px-2.5 py-1.5 rounded-lg ${s.cruce ? 'bg-red-900/50 border border-red-600 text-red-200 font-bold' : 'bg-darkbg border border-bordercol text-slate-200'} text-[12px] flex items-center justify-between gap-2">
          <span>${s.cruce ? '<span class="text-red-400">✝</span> ' : ''}${esc(curat(s.nume))}</span><span class="text-slate-500">›</span></button>`).join('')}</div>`;
      const rd = [];
      if (d.apostol) rd.push(`<button onclick="famDox.openUrl('${esc(d.apostol.url)}')" class="flex-1 px-2 py-1.5 rounded-lg bg-darkbg border border-bordercol text-[11px] text-slate-200 text-left">📖 <b>Apostol</b><br><span class="text-slate-400">${esc(d.apostol.text)}</span></button>`);
      if (d.evanghelie) rd.push(`<button onclick="famDox.openUrl('${esc(d.evanghelie.url)}')" class="flex-1 px-2 py-1.5 rounded-lg bg-darkbg border border-bordercol text-[11px] text-slate-200 text-left">✠ <b>Evanghelie</b><br><span class="text-slate-400">${esc(d.evanghelie.text)}</span></button>`);
      if (rd.length) h += `<div class="flex gap-1.5">${rd.join('')}</div>`;
    }

    // Post / dezlegare / sărbătoare
    const postCls = esteZiPost(post) ? 'text-emerald-300' : (post.tip === 'branza' ? 'text-amber-200' : 'text-slate-300');
    h += `<div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
        <span class="${postCls} font-bold">${POST_ICON[post.tip] || ''} ${esc(post.text)}</span>${post.motiv ? `<span class="text-slate-500">(${esc(post.motiv)})</span>` : ''}
        ${!legal && cruce ? `<span class="text-red-300 font-bold">🔴 Sărbătoare mare</span>` : ''}
      </div>`;

    // Calcul până la următoarea zi de post și următorul post mare
    const linii = [];
    if (esteZiPost(post)) linii.push('Azi e zi de post.');
    else if (nextPost) linii.push(`Următoarea zi de post: <b class="text-emerald-300">${fmtZi(nextPost.d)}</b> (în ${nextPost.zile} ${nextPost.zile === 1 ? 'zi' : 'zile'})`);
    if (mari.acum) linii.push(`Ești în <b class="text-amber-200">${esc(mari.acum.nume.split(' (')[0])}</b>: ziua ${mari.acum.ziua} din ${mari.acum.total}${mari.acum.ramase ? `, mai sunt ${mari.acum.ramase} zile` : ', ultima zi'}`);
    if (mari.urm && (!scurt || !mari.acum)) linii.push(`${esc(mari.urm.nume.split(' (')[0])}: începe ${fmtZi(mari.urm.start)} (în ${mari.urm.zile} zile)`);
    h += `<div class="text-[10px] text-slate-400 space-y-0.5">${linii.map(l => `<p>⏳ ${l}</p>`).join('')}</div>`;

    if (!scurt) {
      const next = urmatoareaZiLibera();
      if (next && !legal) {
        const zl = Math.round((new Date(next.data + 'T00:00') - new Date(ymd(azi) + 'T00:00')) / 86400000);
        h += `<p class="text-[10px] text-slate-400">Următoarea zi liberă: <span class="text-red-300 font-bold">${esc(next.nume)}</span> — ${new Date(next.data + 'T00:00').toLocaleDateString('ro-RO', { day: 'numeric', month: 'long' })} (în ${zl} ${zl === 1 ? 'zi' : 'zile'})</p>`;
      }
      const toate = stareaPosturilorMari(azi);
      h += `<p class="text-[9px] text-slate-500">Postul e calculat după rânduiala generală a BOR; verifică dezlegările locale în calendarul parohiei. Sursa sfinților: doxologia.ro</p>`;
      void toate;
    }
    card.innerHTML = h;
  }
  let doxData = LS.get(DOX_KEY, null);
  function doxLoad(force) {
    const azi = ymd(new Date());
    doxRender(doxData && doxData.data === azi ? doxData : null);
    if (!force && doxData && doxData.data === azi && Date.now() - (doxData._t || 0) < 3 * 3600000) return;
    if (!(typeof getAuthSession === 'function' && getAuthSession())) return;
    api({ action: 'doxologiaZi' }).then(r => {
      if (r && Array.isArray(r.sfinti)) {
        doxData = Object.assign(r, { _t: Date.now() });
        LS.set(DOX_KEY, doxData);
        doxRender(doxData);
      } else if (!doxData || doxData.data !== azi) {
        doxRender({ eroare: r && r.error ? 'doxologia: ' + r.error : 'Serverul nu are încă Familie.gs (sfinții zilei).' });
      }
    }).catch(() => {});
  }
  function doxModal(url, titlu) {
    let m = document.getElementById('famDoxModal');
    if (!m) {
      m = addEl(`<div id="famDoxModal" class="hidden fixed inset-0 z-[85] bg-black/80 flex items-end sm:items-center justify-center">
        <div class="bg-cardbg border border-amber-800/70 rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[88vh] flex flex-col">
          <div class="flex items-center justify-between px-4 py-3 border-b border-bordercol">
            <span id="famDoxTitle" class="text-sm font-bold text-amber-200 pr-2"></span>
            <button onclick="document.getElementById('famDoxModal').classList.add('hidden')" class="text-slate-400 text-lg px-1">✕</button>
          </div>
          <div id="famDoxBody" class="flex-1 overflow-y-auto px-4 py-3 space-y-2 text-[13px] leading-relaxed text-slate-200"></div>
          <a id="famDoxLink" href="#" target="_blank" class="m-3 py-2 rounded-xl bg-rose-900 border border-rose-700 text-white text-xs font-bold text-center">Deschide pe doxologia.ro</a>
        </div></div>`);
    }
    m.classList.remove('hidden');
    document.getElementById('famDoxTitle').textContent = titlu || 'Doxologia';
    document.getElementById('famDoxLink').href = url;
    const body = document.getElementById('famDoxBody');
    body.innerHTML = '<p class="text-slate-400 text-xs">Se încarcă…</p>';
    api({ action: 'doxologiaPagina', url }).then(r => {
      if (!r || !Array.isArray(r.paragrafe)) { body.innerHTML = `<p class="text-slate-400 text-xs">${esc((r && r.error) || 'Conținutul nu e disponibil (necesită Familie.gs).')}</p>`; return; }
      if (r.titlu) document.getElementById('famDoxTitle').textContent = r.titlu;
      body.innerHTML = (r.imagine ? `<img src="${esc(r.imagine)}" class="w-full max-h-64 object-contain rounded-xl bg-black/40" loading="lazy" referrerpolicy="no-referrer">` : '') +
        r.paragrafe.map(p => p.tip === 'titlu' ? `<h3 class="font-bold text-amber-300 pt-2">${esc(p.text)}</h3>` : `<p>${esc(p.text).replace(/\n/g, '<br>')}</p>`).join('');
    }).catch(e => { body.innerHTML = `<p class="text-slate-400 text-xs">${esc(e.message)}</p>`; });
  }
  window.famDox = {
    open: i => { const s = doxData && doxData.sfinti && doxData.sfinti[i]; if (s) doxModal(s.url || 'https://doxologia.ro/calendarul-zilei', s.nume); },
    openUrl: u => doxModal(u, ''),
    refresh: () => doxLoad(true),
    mode: m => doxSetMode(m)
  };
  // Cardul e un widget ca celelalte (ownerWidget_sfinti): se ascunde/ordonează din setările widgeturilor, per profil.
  // La prima rulare pe un profil: activ și primul la admin, ascuns la ceilalți (îl pot activa din setări).
  function doxMigrateWidget() {
    try {
      const user = getCurrentLoggedInUser();
      const key = 'diih_wgt_mig_sfinti_' + user;
      if (localStorage.getItem(key)) return;
      const active = getOwnerWidgetsConfig().filter(x => x !== 'sfinti');
      setOwnerWidgetsConfig(isAdminUser() ? active.concat('sfinti') : active);
      setOwnerWidgetsOrder(['sfinti'].concat(getOwnerWidgetsOrder().filter(x => x !== 'sfinti')));
      localStorage.setItem(key, '1');
    } catch (e) {}
  }
  function doxBuild() {
    const box = document.getElementById('todayOwnerContent');
    if (!box || document.getElementById('ownerWidget_sfinti')) return;
    const wrap = document.createElement('div');
    wrap.id = 'ownerWidget_sfinti';
    wrap.innerHTML = '<div id="famSfintiCard"></div>';
    box.insertBefore(wrap, box.firstElementChild);
    doxMigrateWidget();
    try { applyOwnerWidgetsVisibility(); } catch (e) {}
    doxLoad(false);
    setInterval(() => { if (!document.hidden) doxLoad(false); }, 15 * 60000);
  }

  // =====================================================================
  // 3b. REMINDERE PROGRAMATE (tabul „Remindere” din registru, prin Familie.gs)
  // =====================================================================
  // Recurență: o dată / zilnic / anumite zile / lunar / anual; 1-3 (max. 6) ore pe zi; pentru unul sau mai mulți membri.
  // Fiecare reminder activ ajunge în calendarul destinatarilor (opțional) și ca notificare în aplicație pe telefonul lor.
  const REM_KEY = 'diih_remindere';
  let remList = LS.get(REM_KEY, []);
  let remEditId = null;
  const ZI_SCURT = ['D', 'L', 'Ma', 'Mi', 'J', 'V', 'S'];
  const REC_LABEL = { once: 'O singură dată', daily: 'Zilnic', weekly: 'Anumite zile', monthly: 'Lunar', yearly: 'Anual' };

  function profName(email) {
    const p = famProfiles.find(x => x.email === email);
    return p ? (p.nume || email).split(' ')[0] : (email || '').split('@')[0];
  }
  function remDescriere(r) {
    let t = REC_LABEL[r.recurenta] || r.recurenta;
    if (r.recurenta === 'weekly') t = (r.zile || []).slice().sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7)).map(z => ZI_SCURT[z]).join(', ') || 'săptămânal';
    if (r.recurenta === 'monthly') t = `Lunar, în ziua ${Number((r.dataStart || '').slice(8, 10))}`;
    if (r.recurenta === 'yearly') t = `Anual, ${(r.dataStart || '').slice(8, 10)}.${(r.dataStart || '').slice(5, 7)}`;
    if (r.recurenta === 'once') t = `Pe ${(r.dataStart || '').split('-').reverse().join('.')}`;
    return `${t} • ${(r.ore || []).join(', ')}${r.dataSfarsit ? ` • până la ${r.dataSfarsit.split('-').reverse().join('.')}` : ''}`;
  }
  // Apare azi? (aceeași logică și pentru alerta din aplicație)
  function remAzi(r, d) {
    const t = ymd(d);
    if (!r.activ || !r.dataStart || t < r.dataStart || (r.dataSfarsit && t > r.dataSfarsit)) return false;
    if (r.recurenta === 'once') return t === r.dataStart;
    if (r.recurenta === 'daily') return true;
    if (r.recurenta === 'weekly') return (r.zile && r.zile.length ? r.zile : [new Date(r.dataStart + 'T00:00').getDay()]).includes(d.getDay());
    if (r.recurenta === 'monthly') return t.slice(8) === r.dataStart.slice(8);
    if (r.recurenta === 'yearly') return t.slice(5) === r.dataStart.slice(5);
    return false;
  }
  function remCheckAlerts() {
    const me = myEmail();
    if (!me) return;
    const now = new Date();
    const fired = LS.get('diih_rem_fired', {});
    const today = ymd(now);
    Object.keys(fired).forEach(k => { if (!k.includes(today)) delete fired[k]; });
    remList.forEach(r => {
      if (!r.notifApp || !(r.destinatari || []).includes(me) || !remAzi(r, now)) return;
      (r.ore || []).forEach(o => {
        const [hh, mm] = o.split(':').map(Number);
        const diff = (now.getHours() * 60 + now.getMinutes()) - (hh * 60 + mm);
        const key = `${r.id}_${today}_${o}`;
        if (diff >= 0 && diff <= 90 && !fired[key]) {
          fired[key] = 1;
          const from = r.creatDe && r.creatDe !== me ? ` (de la ${profName(r.creatDe)})` : '';
          try { window.triggerNotification(`⏰ ${r.titlu}${from}`, r.detalii || `Reminder ${o}`); } catch (e) {}
        }
      });
    });
    LS.set('diih_rem_fired', fired);
  }
  function remLoad() {
    if (!(typeof getAuthSession === 'function' && getAuthSession())) return Promise.resolve();
    return api({ action: 'remList' }).then(r => {
      if (r && Array.isArray(r.remindere)) { remList = r.remindere; LS.set(REM_KEY, remList); remRenderList(); }
      else if (r && r.error) remSetInfo(r.error);
      else remSetInfo('Serverul nu are încă Familie.gs v24.13 (tabul Remindere).');
    }).catch(e => remSetInfo(e.message));
  }
  function remSetInfo(t) { const el = document.getElementById('remInfo'); if (el) el.textContent = t || ''; }

  function remRenderList() {
    const box = document.getElementById('remList');
    if (!box) return;
    const me = myEmail();
    const f = (document.getElementById('remFilter') || {}).value || 'toate';
    const fa = (document.getElementById('remFilterActiv') || {}).value || 'active';
    let items = remList.slice();
    if (f === 'trimise') items = items.filter(r => r.creatDe === me && (r.destinatari || []).some(x => x !== me));
    if (f === 'mele') items = items.filter(r => (r.destinatari || []).includes(me));
    if (f.startsWith('pers:')) items = items.filter(r => (r.destinatari || []).includes(f.slice(5)));
    if (fa === 'active') items = items.filter(r => r.activ);
    if (fa === 'inactive') items = items.filter(r => !r.activ);
    // notițele cu reminder (o singură dată), ca să fie toate la un loc
    const note = (typeof allGanduri !== 'undefined' ? allGanduri : []).filter(g => g.reminder && (fa !== 'inactive')).filter(g => {
      if (f === 'trimise') return g.creatDe === me && g.proprietar && g.proprietar !== me;
      if (f === 'mele') return !g.proprietar || g.proprietar === me;
      if (f.startsWith('pers:')) return g.proprietar === f.slice(5);
      return true;
    });
    const canManage = r => isAdminUser() || r.creatDe === me;
    const inactiveCount = remList.filter(r => !r.activ && canManage(r)).length;
    document.getElementById('remSummary').textContent = `${remList.filter(r => r.activ).length} active • ${remList.filter(r => !r.activ).length} inactive` + (note.length ? ` • ${note.length} din notițe` : '');
    const delAll = document.getElementById('remDelInactive');
    if (delAll) delAll.classList.toggle('hidden', inactiveCount === 0);
    let h = items.map(r => `
      <div class="p-3 rounded-xl border ${r.activ ? 'bg-darkbg border-violet-800/70' : 'bg-darkbg/50 border-bordercol opacity-60'}">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <p class="text-[12px] font-bold text-white">⏰ ${esc(r.titlu)}</p>
            <p class="text-[10px] text-violet-300 mt-0.5">${esc(remDescriere(r))}</p>
            ${r.detalii ? `<p class="text-[10px] text-slate-400 mt-0.5">${esc(r.detalii)}</p>` : ''}
            <div class="flex flex-wrap gap-1 mt-1.5">
              ${(r.destinatari || []).map(x => `<span class="text-[10px] px-1.5 py-0.5 rounded-md bg-violet-950 border border-violet-800 text-violet-200">👤 ${esc(profName(x))}${x === me ? ' (eu)' : ''}</span>`).join('')}
              <span class="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400">de la ${esc(profName(r.creatDe))}</span>
              ${r.inCalendar ? `<span class="text-[10px] px-1.5 py-0.5 rounded-md ${r.areEvenimente ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'}">📅 ${r.areEvenimente || !r.activ ? 'în calendar' : 'calendar în așteptare'}</span>` : ''}
              ${r.notifApp ? '<span class="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-300">🔔 în aplicație</span>' : ''}
            </div>
          </div>
          <span class="shrink-0 text-[10px] font-bold ${r.activ ? 'text-emerald-400' : 'text-slate-500'}">${r.activ ? '● Activ' : '○ Inactiv'}</span>
        </div>
        ${canManage(r) ? `<div class="flex gap-1.5 mt-2">
          <button onclick="famRem.edit('${esc(r.id)}')" class="flex-1 py-1 rounded-lg bg-slate-800 border border-slate-600 text-[11px]">✏️ Editează</button>
          <button onclick="famRem.toggle('${esc(r.id)}', ${!r.activ})" class="flex-1 py-1 rounded-lg ${r.activ ? 'bg-amber-950 border-amber-700' : 'bg-emerald-950 border-emerald-700'} border text-[11px]">${r.activ ? '⏸ Oprește' : '▶ Activează'}</button>
          ${!r.activ ? `<button onclick="famRem.del('${esc(r.id)}')" class="flex-1 py-1 rounded-lg bg-red-950 border border-red-800 text-[11px]">🗑 Șterge</button>` : ''}
        </div>` : ''}
      </div>`).join('');
    if (note.length) {
      h += `<p class="text-[10px] font-bold text-slate-400 uppercase pt-2">📝 Remindere din notițe</p>` + note.map(g => `
        <div class="p-2.5 rounded-xl border bg-darkbg border-bordercol text-[11px]">
          <p class="text-slate-200">${esc((g.gand || '').slice(0, 120))}</p>
          <p class="text-[10px] text-slate-400 mt-0.5">${esc(typeof formatNoteReminder === 'function' ? formatNoteReminder(g.reminder) : g.reminder)} • pentru ${esc(profName(g.proprietar || me))}${g.creatDe && g.creatDe !== (g.proprietar || me) ? ` • de la ${esc(profName(g.creatDe))}` : ''}</p>
        </div>`).join('');
    }
    box.innerHTML = h || '<p class="text-center text-slate-500 text-xs py-8">Niciun reminder aici.</p>';
  }

  function remFillPeople(sel) {
    const box = document.getElementById('remDest');
    const flt = document.getElementById('remFilter');
    const me = myEmail();
    if (box) box.innerHTML = famProfiles.length ? famProfiles.map(p => `<label class="flex items-center gap-1 px-2 py-1 rounded-lg bg-darkbg border border-bordercol text-[11px]">
      <input type="checkbox" value="${esc(p.email)}" ${(sel || [me]).includes(p.email) ? 'checked' : ''} class="accent-violet-500"> ${esc((p.nume || p.email).split(' ')[0])}${p.email === me ? ' (eu)' : ''}</label>`).join('') : '<span class="text-[10px] text-slate-500">Se încarcă membrii familiei…</span>';
    if (flt && famProfiles.length && !flt.querySelector('option[value^="pers:"]')) {
      flt.insertAdjacentHTML('beforeend', famProfiles.map(p => `<option value="pers:${esc(p.email)}">Pentru ${esc((p.nume || p.email).split(' ')[0])}</option>`).join(''));
    }
  }
  function remOreRender(ore) {
    const box = document.getElementById('remOre');
    box.innerHTML = ore.map((o, i) => `<div class="flex items-center gap-1"><input type="time" value="${o}" class="remOra bg-darkbg border border-bordercol rounded-lg p-1.5 text-white text-xs">${ore.length > 1 ? `<button onclick="famRem.oraDel(${i})" class="text-slate-400 px-1">✕</button>` : ''}</div>`).join('')
      + (ore.length < 6 ? '<button onclick="famRem.oraAdd()" class="px-2 py-1 rounded-lg bg-slate-800 border border-slate-600 text-[11px]">➕ încă o oră</button>' : '');
  }
  function remOreCurente() { return Array.from(document.querySelectorAll('#remOre .remOra')).map(x => x.value).filter(Boolean); }
  function remRecChange() {
    const v = document.getElementById('remRec').value;
    document.getElementById('remZileBox').classList.toggle('hidden', v !== 'weekly');
    document.getElementById('remEndBox').classList.toggle('hidden', v === 'once');
  }
  function remOpenForm(r) {
    remEditId = r ? r.id : null;
    const f = document.getElementById('remForm');
    f.classList.remove('hidden');
    document.getElementById('remFormTitle').textContent = r ? '✏️ Editează reminderul' : '➕ Reminder nou';
    document.getElementById('remTitlu').value = r ? r.titlu : '';
    document.getElementById('remDetalii').value = r ? (r.detalii || '') : '';
    document.getElementById('remRec').value = r ? r.recurenta : 'daily';
    document.getElementById('remStart').value = r ? r.dataStart : ymd(new Date());
    document.getElementById('remEnd').value = r ? (r.dataSfarsit || '') : '';
    document.getElementById('remCal').checked = r ? r.inCalendar : true;
    document.getElementById('remApp').checked = r ? r.notifApp : true;
    document.querySelectorAll('#remZile input').forEach(x => { x.checked = r ? (r.zile || []).includes(Number(x.value)) : [1, 2, 3, 4, 5].includes(Number(x.value)); });
    remOreRender(r ? r.ore.slice() : ['08:00']);
    remFillPeople(r ? r.destinatari : null);
    remRecChange();
    f.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function remSave() {
    const data = {
      id: remEditId, titlu: document.getElementById('remTitlu').value.trim(), detalii: document.getElementById('remDetalii').value.trim(),
      destinatari: Array.from(document.querySelectorAll('#remDest input:checked')).map(x => x.value),
      recurenta: document.getElementById('remRec').value,
      zile: Array.from(document.querySelectorAll('#remZile input:checked')).map(x => Number(x.value)),
      ore: Array.from(new Set(remOreCurente())).sort(), dataStart: document.getElementById('remStart').value,
      dataSfarsit: document.getElementById('remRec').value === 'once' ? '' : document.getElementById('remEnd').value,
      inCalendar: document.getElementById('remCal').checked, notifApp: document.getElementById('remApp').checked, activ: true
    };
    if (!data.titlu) return toast('Scrie ce trebuie amintit.');
    if (!data.destinatari.length) return toast('Alege pentru cine e reminderul.');
    if (!data.ore.length) return toast('Pune cel puțin o oră.');
    if (data.recurenta === 'weekly' && !data.zile.length) return toast('Alege zilele.');
    if (data.dataSfarsit && data.dataSfarsit < data.dataStart) return toast('Data de sfârșit e înaintea începutului.');
    const btn = document.getElementById('remSaveBtn');
    btn.disabled = true; btn.textContent = 'Se salvează…';
    api({ action: 'remSave', data: JSON.stringify(data) }).then(r => {
      if (r && r.success) {
        remList = r.remindere; LS.set(REM_KEY, remList);
        document.getElementById('remForm').classList.add('hidden');
        remRenderList();
        toast(data.inCalendar ? '⏰ Reminder salvat și trimis în calendar.' : '⏰ Reminder salvat.');
      } else toast('Nu s-a salvat' + (r && r.error ? ': ' + r.error : ' — ai lipit Familie.gs v24.13?'));
    }).catch(e => toast(e.message)).finally(() => { btn.disabled = false; btn.textContent = '💾 Salvează și trimite'; });
  }
  function remAction(action, params, okMsg) {
    api(Object.assign({ action }, params)).then(r => {
      if (r && r.success) { remList = r.remindere; LS.set(REM_KEY, remList); remRenderList(); if (okMsg) toast(okMsg); }
      else toast((r && r.error) || 'Nu s-a putut.');
    }).catch(e => toast(e.message));
  }
  function remShow() {
    const c = document.getElementById('famRemCenter');
    c.classList.remove('hidden');
    famCloseCenter();
    remRenderList();
    famLoadProfilesThen(() => { remFillPeople(); remRenderList(); });
    remLoad();
  }
  function famLoadProfilesThen(cb) {
    if (famProfiles.length) cb();
    api({ action: 'famProfiles' }).then(r => { if (r && Array.isArray(r.profiles)) { famProfiles = r.profiles; LS.set('diih_fam_profiles', famProfiles); cb(); } }).catch(() => {});
  }
  function remBuild() {
    addEl(`<div id="famRemCenter" class="hidden fixed inset-0 z-[81] bg-darkbg/98 backdrop-blur flex flex-col">
      <div class="max-w-lg w-full mx-auto flex flex-col h-full">
        <div class="flex items-center justify-between px-4 py-3 border-b border-bordercol">
          <div><h2 class="text-base font-bold text-white">⏰ Remindere</h2><p id="remSummary" class="text-[10px] text-slate-400"></p></div>
          <div class="flex items-center gap-1.5">
            <button onclick="famRem.nou()" class="px-2.5 py-1.5 rounded-xl bg-violet-800 border border-violet-600 text-white text-[11px] font-bold">➕ Nou</button>
            <button onclick="document.getElementById('famRemCenter').classList.add('hidden')" class="px-2.5 py-1.5 rounded-xl bg-cardbg border border-bordercol text-slate-300 text-[11px] font-bold">✕</button>
          </div>
        </div>
        <div class="flex-1 overflow-y-auto">
          <div id="remForm" class="hidden px-4 py-3 space-y-2 border-b border-bordercol bg-cardbg/60 text-xs">
            <p id="remFormTitle" class="font-bold text-violet-300"></p>
            <input id="remTitlu" type="text" placeholder="Ce? (ex: Medicamentul, Temele, Sună la bunica)" class="w-full bg-darkbg border border-bordercol rounded-lg p-2 text-white">
            <input id="remDetalii" type="text" placeholder="Detalii (opțional)" class="w-full bg-darkbg border border-bordercol rounded-lg p-2 text-white">
            <p class="text-[10px] text-slate-400 font-bold">Pentru cine</p>
            <div id="remDest" class="flex flex-wrap gap-1.5"></div>
            <p class="text-[10px] text-slate-400 font-bold">Ore (de 1, 2 sau 3 ori pe zi)</p>
            <div id="remOre" class="flex flex-wrap items-center gap-1.5"></div>
            <div class="grid grid-cols-2 gap-2">
              <label class="space-y-0.5"><span class="text-[10px] text-slate-400 font-bold">Repetă</span>
                <select id="remRec" onchange="famRem.recChange()" class="w-full bg-darkbg border border-bordercol rounded-lg p-2 text-white">
                  <option value="once">O singură dată</option><option value="daily">Zilnic</option><option value="weekly">Anumite zile</option><option value="monthly">Lunar</option><option value="yearly">Anual</option>
                </select></label>
              <label class="space-y-0.5"><span class="text-[10px] text-slate-400 font-bold">Începe pe</span>
                <input id="remStart" type="date" class="w-full bg-darkbg border border-bordercol rounded-lg p-2 text-white"></label>
            </div>
            <div id="remZileBox" class="hidden">
              <div id="remZile" class="flex gap-1">${[1, 2, 3, 4, 5, 6, 0].map(z => `<label class="flex-1 text-center"><input type="checkbox" value="${z}" class="peer hidden"><span class="block py-1.5 rounded-lg bg-darkbg border border-bordercol peer-checked:bg-violet-700 peer-checked:border-violet-400 peer-checked:text-white text-slate-400 font-bold text-[11px] cursor-pointer">${ZI_SCURT[z]}</span></label>`).join('')}</div>
            </div>
            <label id="remEndBox" class="block space-y-0.5"><span class="text-[10px] text-slate-400 font-bold">Până pe (opțional — gol = fără sfârșit)</span>
              <input id="remEnd" type="date" class="w-full bg-darkbg border border-bordercol rounded-lg p-2 text-white"></label>
            <div class="flex flex-wrap gap-3 text-[11px] text-slate-300">
              <label class="flex items-center gap-1.5"><input id="remCal" type="checkbox" class="accent-violet-500"> 📅 Trimite în calendarul lor</label>
              <label class="flex items-center gap-1.5"><input id="remApp" type="checkbox" class="accent-violet-500"> 🔔 Notificare în aplicație</label>
            </div>
            <div class="flex gap-2">
              <button onclick="document.getElementById('remForm').classList.add('hidden')" class="px-3 py-2 rounded-xl bg-slate-800 border border-slate-600 font-bold">Renunță</button>
              <button id="remSaveBtn" onclick="famRem.save()" class="flex-1 py-2 rounded-xl bg-violet-700 text-white font-bold">💾 Salvează și trimite</button>
            </div>
          </div>
          <div class="px-4 py-2 flex flex-wrap items-center gap-2 border-b border-bordercol">
            <select id="remFilter" onchange="famRem.render()" class="bg-cardbg border border-bordercol rounded-lg px-2 py-1 text-[11px] text-slate-200">
              <option value="toate">Toate</option><option value="trimise">Trimise de mine altora</option><option value="mele">Pentru mine</option>
            </select>
            <select id="remFilterActiv" onchange="famRem.render()" class="bg-cardbg border border-bordercol rounded-lg px-2 py-1 text-[11px] text-slate-200">
              <option value="active">Active</option><option value="inactive">Inactive</option><option value="toate">Active + inactive</option>
            </select>
            <button id="remDelInactive" onclick="famRem.delInactive()" class="hidden ml-auto px-2 py-1 rounded-lg bg-red-950 border border-red-800 text-red-200 text-[11px] font-bold">🗑 Șterge inactivele</button>
          </div>
          <p id="remInfo" class="px-4 pt-2 text-[10px] text-amber-400"></p>
          <div id="remList" class="px-4 py-2 space-y-2"></div>
        </div>
      </div>
    </div>`);
    // Intrări: în centrul de notificări și sus în tabul Notițe
    const evBtn = document.querySelector('#famNotifCenter button[onclick="famNotif.toggleEv()"]');
    if (evBtn) evBtn.insertAdjacentHTML('beforebegin', '<button onclick="famRem.show()" class="ml-auto px-2.5 py-1 rounded-lg bg-violet-900/70 border border-violet-700 text-violet-100 text-[11px] font-bold">⏰ Remindere</button>'), evBtn.classList.remove('ml-auto');
    const notite = document.getElementById('tab-notite');
    if (notite) notite.insertAdjacentHTML('afterbegin', '<button onclick="famRem.show()" class="w-full p-3 rounded-2xl bg-gradient-to-r from-violet-950 to-cardbg border border-violet-700/70 text-left flex items-center justify-between"><span class="text-xs font-bold text-violet-200">⏰ Remindere programate <span class="text-violet-400 font-normal">— recurente, pe zile, de mai multe ori pe zi, pentru familie</span></span><span class="text-violet-300">›</span></button>');
    remLoad();
    setInterval(remCheckAlerts, 60000);
    setTimeout(remCheckAlerts, 5000);
    setInterval(() => { if (!document.hidden) remLoad(); }, 10 * 60000);
  }
  window.famRem = {
    show: remShow, nou: () => remOpenForm(null), edit: id => { const r = remList.find(x => x.id === id); if (r) remOpenForm(r); },
    save: remSave, render: remRenderList, recChange: remRecChange,
    oraAdd: () => { const o = remOreCurente(); o.push('20:00'); remOreRender(o); },
    oraDel: i => { const o = remOreCurente(); o.splice(i, 1); remOreRender(o.length ? o : ['08:00']); },
    toggle: (id, activ) => remAction('remToggle', { id, activ: String(activ) }, activ ? 'Reminder activat.' : 'Reminder oprit (scos din calendar).'),
    del: id => { if (confirm('Ștergi definitiv reminderul?')) remAction('remDelete', { id }, 'Reminder șters.'); },
    delInactive: () => {
      const me = myEmail();
      const ids = remList.filter(r => !r.activ && (isAdminUser() || r.creatDe === me)).map(r => r.id);
      if (!ids.length || !confirm(`Ștergi ${ids.length} remindere inactive?`)) return;
      ids.reduce((pr, id) => pr.then(() => api({ action: 'remDelete', id }).then(r => { if (r && r.remindere) remList = r.remindere; })), Promise.resolve())
        .then(() => { LS.set(REM_KEY, remList); remRenderList(); toast('Remindere inactive șterse.'); });
    }
  };

  // =====================================================================
  // 4. PORNIRE INTELIGENTĂ + REVENIRE ÎN ACELAȘI LOC
  // =====================================================================
  const VIEW_KEY = 'diih_last_view';
  const RESUME_MS = 20 * 60000;
  const bootAt = Date.now();
  let autoOpened = false;
  let hiddenAt = 0;
  function saveView(tab) {
    const cur = LS.get(VIEW_KEY, {});
    LS.set(VIEW_KEY, { tab: tab || cur.tab || 'today', t: Date.now() });
  }
  function hookSwitchTab() {
    if (typeof window.switchTab !== 'function' || window.switchTab._fam) return;
    const orig = window.switchTab;
    window.switchTab = function (tabId) {
      const r = orig.apply(this, arguments);
      saveView(tabId);
      return r;
    };
    window.switchTab._fam = true;
  }
  function famMaybeAutoOpen() {
    if (autoOpened || centerOpen) return;
    if (Date.now() - bootAt > 20000) return; // doar imediat după deschidere
    if (unreadCount() > 0) { autoOpened = true; famOpenCenter(); }
  }
  function bootRoute() {
    const v = LS.get(VIEW_KEY, null);
    if (unreadCount() > 0) { autoOpened = true; famOpenCenter(); return; }
    if (v && v.tab && v.tab !== 'today' && Date.now() - v.t < RESUME_MS) {
      try { switchTab(v.tab); } catch (e) {}
    }
  }
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') { hiddenAt = Date.now(); saveView(); return; }
    if (hiddenAt && Date.now() - hiddenAt > RESUME_MS) {
      // Revenire după mult timp (aplicația n-a fost închisă de sistem): ca la o deschidere nouă
      if (unreadCount() > 0) famOpenCenter();
      else { famCloseCenter(); try { switchTab('today'); } catch (e) {} }
    }
    hiddenAt = 0;
    famRenderBell();
  });

  // =====================================================================
  function init() {
    hookTrigger();
    hookSwitchTab();
    awBuild();
    famBuildCenter();
    remBuild();
    doxBuild();
    bootRoute();
    // Lista de pe server vine la fiecare sincronizare; până la primul răspuns o cerem o dată separat
    setTimeout(() => {
      if (typeof getAuthSession === 'function' && getAuthSession()) api({ action: 'notifList' }).then(r => { if (r && Array.isArray(r.notificari)) famSetInbox(r.notificari); }).catch(() => {});
    }, 2500);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
