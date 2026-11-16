// Rugăciuni — subtaburi și texte. Pentru o rugăciune nouă: adaugi un obiect în RUGACIUNI_CATEGORII
// (id, titlu, rugaciuni: [{ titlu, text }]). Paragrafele din text se despart printr-un rând gol.
const RUGACIUNI_CATEGORII = [
  { id: 'spovedanie', titlu: 'Spovedanie', rugaciuni: [] },
  { id: 'impartasanie', titlu: 'Împărtășanie', rugaciuni: [] },
  { id: 'dimineata', titlu: 'Dimineață', rugaciuni: [] },
  { id: 'seara', titlu: 'Seară', rugaciuni: [] },
  { id: 'inainte-psaltire', titlu: 'Înainte de Psaltire', rugaciuni: [] }
];

let rugaciuniSubtabCurent = null;

function rugaciuniEsc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function rugaciuniSelecteaza(id) {
  rugaciuniSubtabCurent = id;
  try { localStorage.setItem('diih_rugaciuni_subtab', id); } catch (e) {}
  renderRugaciuni();
  const bar = document.getElementById('rugaciuniSubtabBar');
  const btn = bar && bar.querySelector('[data-rug="' + id + '"]');
  if (btn && btn.scrollIntoView) btn.scrollIntoView({ inline: 'center', block: 'nearest' });
}

function renderRugaciuni() {
  const bar = document.getElementById('rugaciuniSubtabBar');
  const cont = document.getElementById('rugaciuniContinut');
  if (!bar || !cont) return;
  if (!rugaciuniSubtabCurent || !RUGACIUNI_CATEGORII.some(c => c.id === rugaciuniSubtabCurent)) {
    let salvat = null;
    try { salvat = localStorage.getItem('diih_rugaciuni_subtab'); } catch (e) {}
    rugaciuniSubtabCurent = RUGACIUNI_CATEGORII.some(c => c.id === salvat) ? salvat : RUGACIUNI_CATEGORII[0].id;
  }
  bar.innerHTML = RUGACIUNI_CATEGORII.map(c => {
    const on = c.id === rugaciuniSubtabCurent;
    return '<button type="button" data-rug="' + c.id + '" onclick="rugaciuniSelecteaza(\'' + c.id + '\')" class="shrink-0 px-3 py-2 rounded-xl text-[12px] font-bold border transition '
      + (on ? 'bg-rose-900 text-rose-100 border-rose-700' : 'bg-darkbg text-slate-400 border-bordercol hover:text-white') + '">' + rugaciuniEsc(c.titlu) + '</button>';
  }).join('');
  const cat = RUGACIUNI_CATEGORII.find(c => c.id === rugaciuniSubtabCurent);
  if (!cat.rugaciuni.length) {
    cont.innerHTML = '<p class="text-xs text-slate-500 italic text-center py-6">Rugăciunile pentru „' + rugaciuniEsc(cat.titlu) + '” se adaugă în curând.</p>';
    return;
  }
  cont.innerHTML = cat.rugaciuni.map(r => {
    const paragrafe = String(r.text || '').split(/\n\s*\n/).map(p => '<p class="leading-relaxed">' + rugaciuniEsc(p.trim()).replace(/\n/g, '<br>') + '</p>').join('');
    return '<article class="bg-darkbg border border-bordercol rounded-2xl p-4 space-y-2 text-[15px] text-slate-200">'
      + (r.titlu ? '<h4 class="text-sm font-bold text-rose-300">' + rugaciuniEsc(r.titlu) + '</h4>' : '') + paragrafe + '</article>';
  }).join('');
}
