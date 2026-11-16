// Rugăciuni — subtaburi și texte. Pentru o rugăciune nouă: adaugi un obiect în RUGACIUNI_CATEGORII
// (id, titlu, rugaciuni: [{ titlu, text }]). Paragrafele din text se despart printr-un rând gol.
// Textele sunt în rugaciuni-texte.js (RUGACIUNI_TEXTE, după id).
const RUGACIUNI_CATEGORII = [
  { id: 'spovedanie', titlu: 'Spovedanie' },
  { id: 'impartasanie', titlu: 'Împărtășanie' },
  { id: 'dimineata', titlu: 'Dimineață' },
  { id: 'seara', titlu: 'Seară' },
  { id: 'inainte-psaltire', titlu: 'Înainte de Psaltire' },
  { id: 'lucru', titlu: 'Începerea lucrului' }
].map(c => Object.assign(c, { get rugaciuni() { return (typeof RUGACIUNI_TEXTE !== 'undefined' && RUGACIUNI_TEXTE[c.id]) || []; } }));

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
    const paragrafe = String(r.text || '').split(/\n\s*\n/).map(rugaciuniParagraf).join('');
    return '<article class="bg-darkbg border border-bordercol rounded-2xl p-4 space-y-3 text-[15px] text-slate-200">'
      + (r.titlu ? '<h4 class="text-base font-extrabold text-rose-300 border-b border-rose-900/60 pb-2">' + rugaciuniEsc(r.titlu) + '</h4>' : '') + paragrafe + '</article>';
  }).join('');
}

// Un paragraf: „### Titlu” = subtitlu îngroșat auriu; „_text_” întreg = indicație cursivă roz; în rest text, cu **îngroșat** și _cursiv_
function rugaciuniParagraf(p) {
  p = p.trim();
  if (!p) return '';
  if (p.indexOf('### ') === 0) {
    return '<h5 class="font-extrabold text-amber-300 text-[15px] pt-2">' + rugaciuniEsc(p.slice(4)) + '</h5>';
  }
  if (/^_[^_]+_,?$/.test(p)) {
    return '<p class="italic text-rose-300/90 leading-relaxed">' + rugaciuniEsc(p.replace(/^_|_,?$/g, '')) + '</p>';
  }
  const html = rugaciuniEsc(p)
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white">$1</strong>')
    .replace(/(^|[\s(])_([^_]+)_/g, '$1<em class="text-rose-300/90">$2</em>')
    .replace(/\n/g, '<br>');
  return '<p class="leading-relaxed">' + html + '</p>';
}
