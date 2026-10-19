/* Marcajul „Adservio → DIiH” (v24.19).
   Rulează pe www.adservio.ro, în sesiunea părintelui deja logată (fără parolă, fără 2FA).
   Citește răspunsurile apelurilor utile ale site-ului și le trimite NEPRELUCRATE la DIiH (doPost, action=adservioPush).
   Interpretarea o face serverul (Adservio.gs), deci marcajul nu se reinstalează când se schimbă ce extragem.
   Adresa serverului și cheia de trimitere se inserează de aplicația DIiH (Școală → Adservio → Generează marcajul). */
(async function () {
  var URL_DIIH = '__DIIH_URL__';
  var KEY = '__DIIH_KEY__';
  if (location.hostname.indexOf('adservio.ro') === -1) {
    alert('Deschide întâi www.adservio.ro, conectează-te, apoi apasă din nou marcajul.');
    return;
  }

  var box = document.createElement('div');
  box.style.cssText = 'position:fixed;top:12px;right:12px;z-index:2147483647;background:#0f172a;color:#e2e8f0;padding:10px 14px;border-radius:10px;font:13px system-ui,sans-serif;box-shadow:0 4px 16px rgba(0,0,0,.45);max-width:320px;line-height:1.4';
  document.body.appendChild(box);
  function say(t) { box.textContent = 'DIiH · ' + t; }

  var calls = [];
  async function get(kind, path, ctx) {
    try {
      var r = await fetch(path, { credentials: 'include', headers: { 'Accept': 'application/json' } });
      var txt = await r.text();
      var js = null;
      try { js = JSON.parse(txt); } catch (e) { js = null; }
      calls.push({ kind: kind, path: path, status: r.status, ctx: ctx || {}, json: js });
      return js;
    } catch (err) {
      calls.push({ kind: kind, path: path, status: 0, ctx: ctx || {}, error: String(err) });
      return null;
    }
  }
  function list(js) {
    if (js && Array.isArray(js.data)) return js.data;
    if (Array.isArray(js)) return js;
    return js ? [js] : [];
  }
  // Toate valorile distincte ale unei chei, oriunde în răspuns (ex. elevID)
  function findIds(x, key, out) {
    if (!x || typeof x !== 'object') return out;
    if (Array.isArray(x)) { x.forEach(function (v) { findIds(v, key, out); }); return out; }
    Object.keys(x).forEach(function (k) {
      var v = x[k];
      if (k === key && v !== null && typeof v !== 'object') { if (out.indexOf(String(v)) === -1) out.push(String(v)); }
      else findIds(v, key, out);
    });
    return out;
  }

  try {
    say('caut copiii din cont…');
    var prof = await get('profil', '/api/v2/utilizatori/profile');
    var me = prof && (prof.data || prof).uaID;
    var par = await get('parinti', '/api/v2/parinti/elev?epID=' + me);
    var elevi = findIds([par], 'elevID', []);
    if (!elevi.length) { say('Nu am găsit niciun copil în cont. Deschide „Panou principal” și încearcă din nou.'); return; }

    var now = new Date();
    var y1 = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
    var azi = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');

    for (var i = 0; i < elevi.length; i++) {
      var e = elevi[i];
      var c = { elevID: e };
      say('copilul ' + (i + 1) + '/' + elevi.length + ': clase și teme…');
      await get('detalii', '/api/v2/elevi/detalii?elevID=' + e + '&withAccessLevel=1', c);
      var clase = list(await get('clase', '/api/v2/elevi/clase?elevID=' + e + '&cuCiclu=1', c));
      await get('teme', '/api/v2/teme?elevID=' + e + '&cuProfesor=1&cuMaterie=1&cuNota=1&cuRating=1&cuHwsSubmitted=1&_limit=9999', c);

      for (var j = 0; j < clase.length; j++) {
        var cl = clase[j] || {};
        var clID = cl.clID;
        var ascID = cl.ascID || (cl.asc && cl.asc.ascID);
        if (!clID || !ascID) continue;
        var activ = !!(cl.asc && String(cl.asc.ascIsActiv) === '1');
        var ctx = { elevID: e, clID: String(clID), ascID: String(ascID), clasa: cl.clNume || '', an: (cl.asc && cl.asc.ascNume) || '', activ: activ };
        say('copilul ' + (i + 1) + ': clasa ' + (cl.clNume || clID) + ' (' + (j + 1) + '/' + clase.length + ')…');
        await get('perioade', '/api/v2/ani/periods?_limit=-1&sanAscID=' + ascID, ctx);
        await get('repartizare', '/api/v2/elevi/repartizare?elevID=' + e + '&clID=' + clID + '&cuNote=1&cuMedii=1&cuActivitate=1', ctx);
        await get('repartizareAbsente', '/api/v2/elevi/repartizare?elevID=' + e + '&clID=' + clID + '&cuAbsente=1', ctx);
        await get('medii', '/api/v2/medii/elev?elevID=' + e + '&clID=' + clID, ctx);
        await get('absente', '/api/v2/absente?elevID=' + e + '&cuMaterie=1&ascID=' + ascID + '&_limit=-1', ctx);
        await get('scutiri', '/api/v2/exemptions?clID=' + clID + '&elevID=' + e + '&ascID=' + ascID + '&_limit=-1&_order=%3EcreatedAt', ctx);
        await get('avertismente', '/api/v2/avertismente?elevID=' + e + '&ascID=' + ascID + '&_limit=-1&_order=%3EavtData', ctx);
        if (activ) {
          await get('vacante', '/api/v2/ani/vacations?_limit=-1&ascID=' + ascID, ctx);
          await get('orarZi', '/api/v2/timetables/day?uaID=' + e + '&date=' + azi + '&clID=' + clID + '&withLessonPlan=1&_limit=-1', ctx);
        }
      }
    }
    await get('sarbatori', '/api/v2/holidays?startDate=' + y1 + '-09-01&endDate=' + (y1 + 1) + '-08-31');

    var payload = JSON.stringify({ v: 2, trimisLa: new Date().toISOString(), calls: calls });
    say('trimit la DIiH (' + Math.round(payload.length / 1024) + ' KB)…');
    var target = URL_DIIH + '?action=adservioPush&key=' + encodeURIComponent(KEY);
    try {
      await fetch(target, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: payload });
      say('✔ Trimis (' + calls.length + ' cereri). În DIiH: Școală → Adservio → Reîmprospătează.');
    } catch (err) {
      // Dacă site-ul blochează cererea spre Google, trimitem printr-un formular, într-un tab nou
      var f = document.createElement('form');
      f.method = 'POST';
      f.target = '_blank';
      f.action = target;
      var t = document.createElement('textarea');
      t.name = 'payload';
      t.value = payload;
      f.appendChild(t);
      f.style.display = 'none';
      document.body.appendChild(f);
      f.submit();
      say('Trimis printr-un tab nou; acolo vezi răspunsul serverului.');
    }
  } catch (err) {
    say('Eroare: ' + (err && err.message ? err.message : err));
  }
  setTimeout(function () { box.remove(); }, 20000);
})();
