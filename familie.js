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
  async function awStart(mode, minutes) {
    aw = { mode, until: mode === 'timer' ? Date.now() + minutes * 60000 : 0 };
    LS.set(AW_KEY, aw);
    const ok = await awAcquire();
    if (!ok) toast('Telefonul nu permite păstrarea ecranului pornit din browser.');
    else toast(mode === 'app' ? 'Ecranul rămâne pornit cât DIiH e deschis.' : `Ecran pornit ${minutes} min.`);
    awLoop();
    awMenu(false);
  }
  function awStop(silent) {
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
        <p class="text-[9px] text-slate-500 leading-snug">Funcționează cât DIiH e deschis pe ecran. Când treci în altă aplicație, telefonul preia controlul; la revenire se reia automat până expiră timpul.</p>
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
  window.famAw = { start: awStart, stop: awStop, menu: awMenu, custom: awCustom, fab: awSetFabVisible };

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
          <span>DIiH v24.9</span>
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

  const DOX_KEY = 'diih_doxologia_zi';
  function doxRender(d) {
    const card = document.getElementById('famSfintiCard');
    if (!card) return;
    const azi = new Date();
    const legal = sarbatoareLegala(azi);
    const mareSarb = d && d.sfinti && d.sfinti.some(s => s.cruce);
    card.className = 'rounded-2xl p-4 shadow-lg space-y-2 ' + (legal
      ? 'bg-gradient-to-br from-red-950 to-[#2a0d12] border-4 border-red-500 shadow-red-900/50'
      : (mareSarb ? 'bg-gradient-to-br from-cardbg to-[#2a1218] border-2 border-red-700/80' : 'bg-cardbg border border-amber-800/60'));
    const next = urmatoareaZiLibera();
    const zile = next ? Math.round((new Date(next.data + 'T00:00') - new Date(ymd(azi) + 'T00:00')) / 86400000) : 0;
    let html = `<div class="flex items-center justify-between">
        <span class="text-xs font-bold uppercase tracking-wider ${legal || mareSarb ? 'text-red-300' : 'text-amber-300'}">✝ Sfinții zilei</span>
        <span class="text-[10px] text-slate-400">${esc(d && d.antet ? d.antet.join(' • ') : azi.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long' }))}</span>
      </div>`;
    if (legal) html += `<div class="bg-red-600 text-white font-bold text-sm rounded-xl px-3 py-2 text-center border border-red-300">🔴 ZI LIBERĂ — ${esc(legal.nume)}</div>`;
    if (!d || !d.sfinti) {
      html += `<p class="text-[11px] text-slate-400">${d && d.eroare ? esc(d.eroare) : 'Se încarcă de pe doxologia.ro…'}</p>
        <a href="https://doxologia.ro/calendarul-zilei" target="_blank" class="text-[11px] text-cyan-300 underline">Deschide calendarul pe doxologia.ro</a>`;
    } else {
      const lst = d.sfinti.map((s, i) => `<button onclick="famDox.open(${i})" class="w-full text-left px-2.5 py-1.5 rounded-lg ${s.cruce ? 'bg-red-900/50 border border-red-600 text-red-200 font-bold' : 'bg-darkbg border border-bordercol text-slate-200'} text-[12px] flex items-center justify-between gap-2 ${i >= 4 ? 'famDoxMore hidden' : ''}">
          <span>${s.cruce ? '<span class="text-red-400">✝</span> ' : ''}${esc(s.nume.replace(/^\s*[✝†]\)?\s*/, ''))}</span><span class="text-slate-500">›</span></button>`).join('');
      html += `<div class="space-y-1">${lst}</div>`;
      if (d.sfinti.length > 4) html += `<button onclick="document.querySelectorAll('.famDoxMore').forEach(x=>x.classList.toggle('hidden')); this.textContent = this.textContent.startsWith('▾') ? '▴ Mai puțini' : '▾ Toți sfinții (${d.sfinti.length})'" class="text-[11px] text-amber-300 font-bold">▾ Toți sfinții (${d.sfinti.length})</button>`;
      const rd = [];
      if (d.apostol) rd.push(`<button onclick="famDox.openUrl('${esc(d.apostol.url)}')" class="flex-1 px-2 py-1.5 rounded-lg bg-darkbg border border-bordercol text-[11px] text-slate-200 text-left">📖 <b>Apostol</b><br><span class="text-slate-400">${esc(d.apostol.text)}</span></button>`);
      if (d.evanghelie) rd.push(`<button onclick="famDox.openUrl('${esc(d.evanghelie.url)}')" class="flex-1 px-2 py-1.5 rounded-lg bg-darkbg border border-bordercol text-[11px] text-slate-200 text-left">✠ <b>Evanghelie</b><br><span class="text-slate-400">${esc(d.evanghelie.text)}</span></button>`);
      if (rd.length) html += `<div class="flex gap-1.5">${rd.join('')}</div>`;
    }
    if (next && !legal) html += `<p class="text-[10px] text-slate-400">Următoarea zi liberă: <span class="text-red-300 font-bold">${esc(next.nume)}</span> — ${new Date(next.data + 'T00:00').toLocaleDateString('ro-RO', { day: 'numeric', month: 'long' })} (în ${zile} ${zile === 1 ? 'zi' : 'zile'})</p>`;
    card.innerHTML = html;
  }
  let doxData = LS.get(DOX_KEY, null);
  function doxLoad(force) {
    const azi = ymd(new Date());
    if (doxData && doxData.data === azi) doxRender(doxData); else doxRender(null);
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
    refresh: () => doxLoad(true)
  };
  function doxBuild() {
    const today = document.getElementById('tab-today');
    if (!today || document.getElementById('famSfintiCard')) return;
    const card = document.createElement('div');
    card.id = 'famSfintiCard';
    today.insertBefore(card, today.firstElementChild);
    doxLoad(false);
    setInterval(() => { if (!document.hidden) doxLoad(false); }, 15 * 60000);
  }

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
    doxBuild();
    bootRoute();
    // Lista de pe server vine la fiecare sincronizare; până la primul răspuns o cerem o dată separat
    setTimeout(() => {
      if (typeof getAuthSession === 'function' && getAuthSession()) api({ action: 'notifList' }).then(r => { if (r && Array.isArray(r.notificari)) famSetInbox(r.notificari); }).catch(() => {});
    }, 2500);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
