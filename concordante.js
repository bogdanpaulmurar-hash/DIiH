// =====================================================================================================
// MODELUL „CRONOLOGIC-PARALEL (cu concordanțe)” — date (v24.51)
// Fiecare poziție = un capitol principal + referințe (pasaje paralele). Numerotarea e cea din aplicație,
// adică Biblia Bartolomeu Valeriu Anania (BVA), după Septuaginta: Regi 1–4, Paralipomena 1–2, Psalmii LXX,
// 3 Ezdra = 1 Ezdra din Septuaginta. Ca să corectezi o legătură, modifici doar acest fișier.
//
// Referință: [carte (prescurtarea din aplicație), loc, nivel, sursa]
//   loc:   „36” = capitol întreg · „2-4” = capitolele 2–4 întregi · „32:1-19” = doar versete (nu bifează capitolul)
//   nivel: 1 = chiar Scriptura leagă pasajele (același eveniment/domnie, dată sau nume din text)
//          2 = trimitere verificată în Biblia ortodoxă de pe azbyka.ru („Параллели”)
//          3 = așezare după cronologia istorică sau tradiție; de verificat (apare cu „?” în aplicație)
// ATENȚIE: ID-ul unei referințe = id-ul poziției + litera locului ei în listă (a, b, c...). Referințele noi se adaugă
// mereu LA FINALUL listei poziției; nu muta și nu șterge referințe vechi, ca să nu se piardă bifele salvate.
// Tranșa a treia (Facerea–Rut, 1–2 Regi) stă înaintea lui Solomon. Rămân de adăugat: Iov, Iuditei, Noul Testament.
// =====================================================================================================
(function () {
  const S = {
    T: 'Textul Scripturii (BVA): același eveniment sau aceeași domnie',
    N: 'Textul Scripturii (BVA): trimitere sau dată numită în text',
    AZ: 'azbyka.ru, Biblia ortodoxă, trimiteri „Параллели”',
    C: 'Cronologie istorică / tradiție (de verificat)'
  };
  const pos = [];
  // P(id, perioadă, carte, capitol, [referințe], notă?)
  const R = r => ({ carte: r[0], loc: r[1], nivel: r[2], sursa: S[r[3]] || r[3] });
  // A(id, [referințe]) adaugă referințe LA FINALUL unei poziții existente (tranșa a doua), fără să schimbe ID-urile vechi
  const A = (id, refs) => { const p = pos.find(x => x.id === id); if (!p) throw new Error('Poziție necunoscută: ' + id); refs.forEach(r => p.refs.push(R(r))); };
  const P = (id, per, carte, cap, refs, nota) => pos.push({ id, per, carte, cap, refs: (refs || []).map(r => ({ carte: r[0], loc: r[1], nivel: r[2], sursa: S[r[3]] || r[3] })), nota: nota || '' });

  // =====================================================================================================
  // TRANȘA A TREIA (v24.54): de la Facere la David (Facerea–Rut, 1–2 Regi). Pozițiile stau înaintea lui Solomon.
  // Referințele sunt doar cele pe care le leagă chiar Scriptura (citate în Noul Testament, reluări în Deuteronom,
  // Paralipomena, Psalmi cu titlu istoric verificat în BVA). Cele fără sursă sigură nu se pun.
  // =====================================================================================================
  // SEG(id, carte, nr. capitole, [[de la, până la, perioada]]) creează câte o poziție pe capitol
  const SEG = (idp, carte, n, segs) => {
    for (let c = 1; c <= n; c++) {
      const s = segs.find(x => c >= x[0] && c <= x[1]);
      P(idp + c, s ? s[2] : '', carte, c, []);
    }
  };
  // AR(id, [referințe]) = adaugă referințe unei poziții din această tranșă
  const AR = A;

  SEG('Fc', 'Fac.', 50, [[1, 2, 'Facerea lumii și a omului'], [3, 5, 'Căderea și urmașii lui Adam'], [6, 9, 'Potopul'], [10, 11, 'Neamurile și turnul Babel'], [12, 25, 'Avraam'], [26, 28, 'Isaac și Iacov'], [29, 36, 'Iacov (Israel)'], [37, 50, 'Iosif în Egipt']]);
  AR('Fc1', [['Ioan', '1:1-18', 1, 'Ioan 1:1-3 reia „la început” din Facere 1:1'], ['Evr.', '11:3', 1, 'Evr. 11:3 (lumile au fost întocmite prin cuvântul lui Dumnezeu)']]);
  AR('Fc2', [['Mat.', '19:3-8', 1, 'Mat. 19:4-6 citează Facerea 1:27 și 2:24']]);
  AR('Fc3', [['Rom.', '5:12-21', 1, 'Rom. 5:12-19 (Adam și Hristos)'], ['1 Tim.', '2:13-14', 1, '1 Tim. 2:13-14 (Adam și Eva)']]);
  AR('Fc4', [['Evr.', '11:4', 1, 'Evr. 11:4 (jertfa lui Abel)'], ['1 Ioan', '3:11-12', 1, '1 Ioan 3:12 (Cain)']]);
  AR('Fc5', [['1 Par.', '1:1-4', 1, '1 Par. 1:1-4 reia șirul neamurilor de la Adam la Noe'], ['Luc.', '3:36-38', 1, 'Luc. 3:36-38 (neamul lui Iisus până la Adam)'], ['Iuda', '1:14-15', 1, 'Iuda 14 (Enoh)']]);
  AR('Fc6', [['Mat.', '24:37-39', 1, 'Mat. 24:37-39 (zilele lui Noe)'], ['1 Pet.', '3:20', 1, '1 Pet. 3:20 (corabia lui Noe)'], ['2 Pet.', '2:5', 1, '2 Pet. 2:5 (Noe, propovăduitor al dreptății)']]);
  AR('Fc10', [['1 Par.', '1:5-27', 1, '1 Par. 1:5-27 reia șirul neamurilor din Facere 10–11']]);
  AR('Fc11', [['Fapte', '2:1-11', 1, 'Pogorârea Duhului Sfânt (Fapte 2) este tâlcuită patristic ca desfacerea încurcării limbilor de la Babel (tradiție)'], ['1 Par.', '1:24-27', 1, '1 Par. 1:24-27 (șirul de la Sem la Avraam)']]);
  AR('Fc12', [['Evr.', '11:8-10', 1, 'Evr. 11:8-10 (chemarea lui Avraam)'], ['Fapte', '7:2-4', 1, 'Fapte 7:2-4 (Ștefan despre chemarea lui Avraam)'], ['Gal.', '3:6-9', 1, 'Gal. 3:8 citează Facerea 12:3']]);
  AR('Fc14', [['Evr.', '7:1-10', 1, 'Evr. 7:1-10 (Melhisedec)'], ['Ps.', '109', 1, 'Ps. 109:4 („preot în veac, după rânduiala lui Melhisedec”)']]);
  AR('Fc15', [['Rom.', '4:1-25', 1, 'Rom. 4:3 citează Facerea 15:6'], ['Gal.', '3:6-18', 1, 'Gal. 3:6 citează Facerea 15:6']]);
  AR('Fc17', [['Rom.', '4:9-12', 1, 'Rom. 4:11 (semnul tăierii împrejur)'], ['Fapte', '7:8', 1, 'Fapte 7:8 (legământul tăierii împrejur)']]);
  AR('Fc18', [['Evr.', '13:2', 1, 'Evr. 13:2 (primirea de oaspeți, Avraam)']]);
  AR('Fc19', [['Luc.', '17:28-32', 1, 'Luc. 17:28-32 (zilele lui Lot)'], ['2 Pet.', '2:6-8', 1, '2 Pet. 2:6-8 (Sodoma și Lot)'], ['Iuda', '1:7', 1, 'Iuda 7 (Sodoma și Gomora)']]);
  AR('Fc21', [['Gal.', '4:22-31', 1, 'Gal. 4:22-31 (Agar și Sara)'], ['Rom.', '9:7-9', 1, 'Rom. 9:7-9 (Isaac, copilul făgăduinței)']]);
  AR('Fc22', [['Evr.', '11:17-19', 1, 'Evr. 11:17-19 (jertfirea lui Isaac)'], ['Iac.', '2:21-23', 1, 'Iac. 2:21-23 (Avraam, ispitit și socotit drept)']]);
  AR('Fc23', [['Fapte', '7:15-16', 1, 'Fapte 7:15-16 (mormântul din Sihem/Hebron)']]);
  AR('Fc25', [['1 Par.', '1:28-34', 1, '1 Par. 1:28-34 (urmașii lui Avraam)'], ['Evr.', '12:16', 1, 'Evr. 12:16 (Esau și dreptul întâiului născut)']]);
  AR('Fc27', [['Rom.', '9:10-13', 1, 'Rom. 9:10-13 (Iacov și Esau)'], ['Evr.', '11:20', 1, 'Evr. 11:20 (binecuvântarea lui Isaac)']]);
  AR('Fc28', [['Ioan', '1:51', 1, 'Ioan 1:51 (scara lui Iacov)']]);
  AR('Fc32', [['Os.', '12:3-5', 1, 'Os. 12:3-5 (Iacov s-a luptat cu îngerul)']]);
  AR('Fc36', [['1 Par.', '1:35-54', 1, '1 Par. 1:35-54 (neamul lui Esau)']]);
  AR('Fc38', [['Mat.', '1:3', 1, 'Mat. 1:3 (Iuda, Tamar, Fares)'], ['1 Par.', '2:3-4', 1, '1 Par. 2:3-4']]);
  AR('Fc46', [['1 Par.', '2:1-2', 1, '1 Par. 2:1-2 (fiii lui Israel)'], ['Fapte', '7:14-15', 1, 'Fapte 7:14-15 (70 de suflete în Egipt)']]);
  AR('Fc48', [['Evr.', '11:21', 1, 'Evr. 11:21 (Iacov binecuvântează pe fiii lui Iosif)']]);
  AR('Fc49', [['Apoc.', '5:5', 1, 'Apoc. 5:5 („Leul din semințenia lui Iuda”)']]);
  AR('Fc50', [['Evr.', '11:22', 1, 'Evr. 11:22 (poruncile lui Iosif despre oasele sale)'], ['Fapte', '7:9-16', 1, 'Fapte 7:9-16 (Ștefan despre Iosif)']]);

  SEG('Ie', 'Ieș.', 40, [[1, 11, 'Robia și cele zece plăgi'], [12, 15, 'Paștele și trecerea Mării Roșii'], [16, 18, 'În pustie'], [19, 24, 'Legea la Sinai'], [25, 31, 'Porunci pentru cort'], [32, 34, 'Vițelul de aur'], [35, 40, 'Cortul mărturiei']]);
  AR('Ie1', [['Fapte', '7:17-19', 1, 'Fapte 7:17-19 (Ștefan despre robia din Egipt)']]);
  AR('Ie2', [['Evr.', '11:23-26', 1, 'Evr. 11:23-26 (credința lui Moise)'], ['Fapte', '7:20-29', 1, 'Fapte 7:20-29 (Ștefan despre Moise)']]);
  AR('Ie3', [['Marc.', '12:26', 1, 'Marc. 12:26 (rugul)'], ['Fapte', '7:30-34', 1, 'Fapte 7:30-34 (rugul aprins)']]);
  AR('Ie12', [['1 Cor.', '5:7', 1, '1 Cor. 5:7 („Paștile noastre, Hristos”)'], ['1 Pet.', '1:19', 1, '1 Pet. 1:19 (mielul fără prihană)']]);
  AR('Ie14', [['1 Cor.', '10:1-2', 1, '1 Cor. 10:1-2'], ['Evr.', '11:29', 1, 'Evr. 11:29 (trecerea Mării Roșii)']]);
  AR('Ie16', [['Ioan', '6:30-35', 1, 'Ioan 6:31-35 (mana)'], ['1 Cor.', '10:3', 1, '1 Cor. 10:3 (hrana duhovnicească)']]);
  AR('Ie17', [['1 Cor.', '10:4', 1, '1 Cor. 10:4 (stânca)'], ['Num.', '20:1-13', 1, 'Num. 20:1-13 (apă din stâncă, a doua oară)']]);
  AR('Ie18', [['Deut.', '1:9-18', 1, 'Deut. 1:9-18 reia așezarea judecătorilor']]);
  AR('Ie19', [['Evr.', '12:18-21', 1, 'Evr. 12:18-21 (muntele Sinai)'], ['Deut.', '4:10-14', 1, 'Deut. 4:10-14']]);
  AR('Ie20', [['Deut.', '5:1-22', 1, 'Deut. 5:6-21 reia cele zece porunci']]);
  AR('Ie24', [['Evr.', '9:18-20', 1, 'Evr. 9:18-20 (sângele legământului)']]);
  AR('Ie25', [['Evr.', '8:1-5', 1, 'Evr. 8:5 citează Ieșirea 25:40'], ['Evr.', '9:1-5', 1, 'Evr. 9:1-5 (cortul și odoarele)']]);
  AR('Ie32', [['Deut.', '9:7-21', 1, 'Deut. 9:7-21 reia întâmplarea vițelului'], ['Fapte', '7:39-41', 1, 'Fapte 7:39-41'], ['Neem.', '9:16-21', 1, 'Neem. 9:16-21'], ['Ps.', '105', 1, 'Ps. 105:19-23 (Horeb și vițelul de aur)']]);
  AR('Ie34', [['Deut.', '10:1-5', 1, 'Deut. 10:1-5 (tablele noi)'], ['2 Cor.', '3:7-18', 1, '2 Cor. 3:7-18 (fața lui Moise)']]);
  AR('Ie35', [['Ieș.', '25-31', 1, 'Ieșirea 35–40 împlinește poruncile din Ieșirea 25–31']]);

  SEG('Lv', 'Lev.', 27, [[1, 7, 'Jertfele'], [8, 10, 'Preoția lui Aaron'], [11, 15, 'Curat și necurat'], [16, 16, 'Ziua ispășirii'], [17, 22, 'Legea sfințeniei'], [23, 25, 'Sărbători și anul sabatic'], [26, 27, 'Binecuvântări, blesteme, juruințe']]);
  AR('Lv1', [['Evr.', '10:1-18', 1, 'Evr. 10 (jertfele Legii și jertfa lui Hristos)']]);
  AR('Lv11', [['Deut.', '14:3-21', 1, 'Deut. 14:3-21 reia legea despre mâncăruri'], ['Fapte', '10:9-16', 1, 'Fapte 10:9-16 (vedenia lui Petru)']]);
  AR('Lv16', [['Evr.', '9:1-28', 1, 'Evr. 9 (arhiereul și ziua ispășirii)']]);
  AR('Lv18', [['Deut.', '27:20-23', 1, 'Deut. 27:20-23 (blesteme pentru păcate de acest fel)']]);
  AR('Lv19', [['Mat.', '22:39', 1, 'Mat. 22:39 citează Leviticul 19:18'], ['Iac.', '2:8', 1, 'Iac. 2:8']]);
  AR('Lv23', [['Num.', '28-29', 1, 'Num. 28–29 reia jertfele sărbătorilor'], ['Deut.', '16:1-17', 1, 'Deut. 16:1-17']]);
  AR('Lv26', [['Deut.', '28', 1, 'Deut. 28 (binecuvântări și blesteme)']]);

  SEG('Nm', 'Num.', 36, [[1, 10, 'Numărătoarea și plecarea de la Sinai'], [11, 20, 'Cele patruzeci de ani în pustie'], [21, 25, 'Spre țara făgăduinței'], [26, 36, 'A doua numărătoare și hotarele']]);
  AR('Nm9', [['Ieș.', '12', 1, 'Ieșirea 12: aceeași sărbătoare a Paștelui']]);
  AR('Nm11', [['Ps.', '77', 1, 'Ps. 77:26-31 amintește prepelițele și mana'], ['1 Cor.', '10:6', 1, '1 Cor. 10:6']]);
  AR('Nm13', [['Deut.', '1:19-46', 1, 'Deut. 1:19-46 reia trimiterea iscoadelor'], ['Evr.', '3:7-19', 1, 'Evr. 3:7-19 (necredința din pustie)']]);
  AR('Nm16', [['Iuda', '1:11', 1, 'Iuda 11 (răzvrătirea lui Core)']]);
  AR('Nm21', [['Ioan', '3:14-15', 1, 'Ioan 3:14-15 (șarpele de aramă)']]);
  AR('Nm22', [['2 Pet.', '2:15-16', 1, '2 Pet. 2:15-16 (Valaam)'], ['Miheia', '6:5', 1, 'Miheia 6:5 (Balac și Valaam)']]);
  AR('Nm25', [['Ps.', '105', 1, 'Ps. 105:28-31 (Baal-Peor)'], ['Apoc.', '2:14', 1, 'Apoc. 2:14']]);
  AR('Nm27', [['Deut.', '34', 1, 'Deut. 34 (moartea lui Moise)']]);
  AR('Nm28', [['Lev.', '23', 1, 'Lev. 23 (sărbătorile)']]);

  SEG('Dt', 'Deut.', 34, [[1, 4, 'Cuvântările lui Moise: istoria pustiei'], [5, 11, 'Legea și credincioșia'], [12, 26, 'Legile pentru țara făgăduinței'], [27, 30, 'Legământul din Moab'], [31, 34, 'Cântarea și moartea lui Moise']]);
  AR('Dt5', [['Ieș.', '20', 1, 'Ieșirea 20: cele zece porunci']]);
  AR('Dt6', [['Mat.', '22:37-38', 1, 'Mat. 22:37-38 citează Deut. 6:5']]);
  AR('Dt8', [['Mat.', '4:4', 1, 'Mat. 4:4 citează Deut. 8:3']]);
  AR('Dt9', [['Ieș.', '32', 1, 'Ieșirea 32: același vițel de aur']]);
  AR('Dt18', [['Fapte', '3:22-23', 1, 'Fapte 3:22-23 citează Deut. 18:15-19']]);
  AR('Dt32', [['Rom.', '10:19', 1, 'Rom. 10:19 citează Deut. 32:21']]);
  AR('Dt34', [['Iuda', '1:9', 1, 'Iuda 9 (trupul lui Moise)']]);

  SEG('Ios', 'Ios.', 24, [[1, 12, 'Cucerirea țării'], [13, 22, 'Împărțirea țării'], [23, 24, 'Ultimele cuvinte ale lui Isus Navi']]);
  AR('Ios2', [['Evr.', '11:31', 1, 'Evr. 11:31 (Rahav)'], ['Iac.', '2:25', 1, 'Iac. 2:25 (Rahav)'], ['Mat.', '1:5', 1, 'Mat. 1:5 (Rahav în neamul lui Iisus)']]);
  AR('Ios3', [['Ps.', '113', 1, 'Ps. 113:3-5 (Iordanul se dă înapoi)']]);
  AR('Ios6', [['Evr.', '11:30', 1, 'Evr. 11:30 (zidurile Ierihonului)']]);
  AR('Ios7', [['1 Par.', '2:7', 1, '1 Par. 2:7 (Acar)']]);
  AR('Ios24', [['Fapte', '7:15-16', 1, 'Fapte 7:15-16']]);

  SEG('Jd', 'Jud.', 21, [[1, 2, 'După moartea lui Isus Navi'], [3, 16, 'Judecătorii lui Israel'], [17, 21, 'Fărădelegile din vremea fără rege']]);
  AR('Jd1', [['Ios.', '15-17', 1, 'Judecători 1:1–2:5 reia pe scurt cucerirea din Isus Navi 15–17']]);
  AR('Jd2', [['Ios.', '24:28-31', 1, 'Judecători 2:6-9 reia Isus Navi 24:28-31']]);
  AR('Jd4', [['Evr.', '11:32', 1, 'Evr. 11:32 (Barac)']]);
  AR('Jd6', [['Evr.', '11:32', 1, 'Evr. 11:32 (Ghedeon)'], ['Ps.', '82', 1, 'Ps. 82:11 (Oreb, Zeeb, Zebee)']]);
  AR('Jd11', [['Evr.', '11:32', 1, 'Evr. 11:32 (Iefta)']]);
  AR('Jd13', [['Evr.', '11:32', 1, 'Evr. 11:32 (Samson)']]);

  P('Rut1', 'Rut', 'Rut', 1, []);
  P('Rut2', 'Rut', 'Rut', 2, []);
  P('Rut3', 'Rut', 'Rut', 3, []);
  P('Rut4', 'Rut', 'Rut', 4, [['Mat.', '1:3-6', 1, 'Mat. 1:5 (Rut în neamul lui Iisus)'], ['1 Par.', '2:9-15', 1, '1 Par. 2:9-15 (neamul lui David)']]);

  SEG('1Rg', '1 Regi', 31, [[1, 7, 'Eli și Samuel'], [8, 15, 'Saul, primul rege'], [16, 31, 'David și Saul']]);
  AR('1Rg2', [['Luc.', '1:46-55', 1, 'Luc. 1:46-55 (Magnificatul) are ecouri din rugăciunea Anei']]);
  AR('1Rg8', [['Fapte', '13:21', 1, 'Fapte 13:21 (cererea unui rege)']]);
  AR('1Rg13', [['Fapte', '13:21-22', 1, 'Fapte 13:21-22 (Saul respins; David ales)']]);
  AR('1Rg19', [['Ps.', '58', 1, 'Titlul Ps. 58 (BVA): „când Saul a trimis și i-a urmărit casa, ca să-l ucidă”']]);
  AR('1Rg21', [['Ps.', '33', 1, 'Titlul Ps. 33 (BVA): David își schimbă înfățișarea înaintea lui Ahimelec'], ['Mat.', '12:3-4', 1, 'Mat. 12:3-4 (David și pâinile punerii înainte)'], ['Marc.', '2:25-26', 1, 'Marc. 2:25-26']]);
  AR('1Rg28', [['Sir.', '46:13-20', 1, 'Sirah 46:13-20 (Samuel)']]);
  AR('1Rg31', [['1 Par.', '10', 1, '1 Par. 10 reia moartea lui Saul']]);

  SEG('2Rg', '2 Regi', 24, [[1, 10, 'David rege peste Iuda și Israel'], [11, 20, 'Păcatul lui David și răzvrătirea lui Avesalom'], [21, 24, 'Încheierea domniei lui David']]);
  AR('2Rg5', [['1 Par.', '11:1-9', 1, '1 Par. 11:1-9 reia ungerea și Ierusalimul'], ['1 Par.', '14', 1, '1 Par. 14']]);
  AR('2Rg6', [['1 Par.', '13', 1, '1 Par. 13'], ['1 Par.', '15-16', 1, '1 Par. 15–16 (chivotul în Ierusalim)']]);
  AR('2Rg7', [['1 Par.', '17', 1, '1 Par. 17 reia profeția lui Natan']]);
  AR('2Rg8', [['1 Par.', '18', 1, '1 Par. 18']]);
  AR('2Rg10', [['1 Par.', '19', 1, '1 Par. 19']]);
  AR('2Rg11', [['1 Par.', '20:1-3', 1, '1 Par. 20:1-3 (asediul Rabei)']]);
  AR('2Rg12', [['Ps.', '50', 1, 'Titlul Ps. 50 (BVA): Natan la David, după Batșeba']]);
  AR('2Rg23', [['1 Par.', '11:10-47', 1, '1 Par. 11:10-47 (vitejii lui David)']]);
  AR('2Rg24', [['1 Par.', '21', 1, '1 Par. 21 reia numărătoarea poporului']]);

  // ---- Solomon (3 Regi 1–11) ----
  P('3Rg1', 'Începutul domniei lui Solomon', '3 Regi', 1, [['1 Par.', '28-29', 1, 'T']]);
  P('3Rg2', 'Moartea lui David', '3 Regi', 2, [['1 Par.', '29:26-30', 1, 'T']]);
  P('3Rg3', 'Solomon cere înțelepciune', '3 Regi', 3, [['2 Par.', '1', 1, 'T'], ['Înț.', '9', 1, 'N'], ['Ps.', '71', 1, 'Titlul psalmului: „pentru Solomon” (BVA)'], ['Ps.', '126', 1, 'Titlul psalmului: „al lui Solomon” (BVA)']]);
  P('3Rg4', 'Înțelepciunea lui Solomon', '3 Regi', 4, [['Prov.', '1-31', 1, 'Prov. 1:1 numește pe Solomon'], ['Ecl.', '1-12', 1, 'Ecl. 1:1 („fiul lui David, rege în Ierusalim”)'], ['Cânt.', '1-8', 1, 'Cânt. 1:1 („a lui Solomon”)']]);
  P('3Rg5', 'Pregătirea templului', '3 Regi', 5, [['2 Par.', '2', 1, 'T']]);
  P('3Rg6', 'Zidirea templului', '3 Regi', 6, [['2 Par.', '3', 1, 'T']]);
  P('3Rg7', 'Palatul și odoarele templului', '3 Regi', 7, [['2 Par.', '4', 1, 'T']]);
  P('3Rg8', 'Sfințirea templului', '3 Regi', 8, [['2 Par.', '5-7', 1, 'T']]);
  P('3Rg9', 'Lucrările lui Solomon', '3 Regi', 9, [['2 Par.', '8', 1, 'T']]);
  P('3Rg10', 'Regina din miazăzi', '3 Regi', 10, [['2 Par.', '9', 1, 'T'], ['Mat.', '12:42', 1, 'N'], ['Luc.', '11:31', 1, 'N']]);
  P('3Rg11', 'Sfârșitul domniei lui Solomon', '3 Regi', 11, [['2 Par.', '9:29-31', 1, 'T']]);
  // ---- Regatul împărțit ----
  P('3Rg12', 'Împărțirea regatului', '3 Regi', 12, [['2 Par.', '10', 1, 'T']]);
  P('3Rg13', 'Omul lui Dumnezeu din Iuda', '3 Regi', 13, [['4 Regi', '23:15-20', 1, 'N']]);
  P('3Rg14', 'Roboam și Ieroboam', '3 Regi', 14, [['2 Par.', '11-12', 1, 'T']]);
  P('3Rg15', 'Abia și Asa', '3 Regi', 15, [['2 Par.', '13', 1, 'T'], ['2 Par.', '14-16', 1, 'T']]);
  P('3Rg16', 'Regii lui Israel: Baasa până la Ahab', '3 Regi', 16, []);
  P('3Rg17', 'Ilie, seceta și Sarepta', '3 Regi', 17, [['Luc.', '4:25-26', 1, 'N'], ['Iac.', '5:17-18', 1, 'N']]);
  P('3Rg18', 'Ilie pe Carmel', '3 Regi', 18, [['Mal.', '4:5-6', 1, 'N']]);
  P('3Rg19', 'Ilie la Horeb', '3 Regi', 19, [['Rom.', '11:2-5', 1, 'N']]);
  P('3Rg20', 'Ahab: via lui Nabot și războiul cu Siria', '3 Regi', 20, [], 'În Septuaginta (și în BVA) capitolele 20–21 au ordinea Nabot, apoi războiul cu Siria; în alte Biblii e invers. Citește-le pe amândouă în ordinea din Anania.');
  P('3Rg21', 'Ahab și Siria', '3 Regi', 21, []);
  P('3Rg22', 'Iosafat și Ahab la Ramot', '3 Regi', 22, [['2 Par.', '17-20', 1, 'T']]);
  // ---- 4 Regi ----
  P('4Rg1', 'Ahazia al lui Israel', '4 Regi', 1, [['2 Par.', '20:35-37', 1, 'T']]);
  P('4Rg2', 'Ilie răpit la cer; Elisei', '4 Regi', 2, [['Sir.', '48:1-14', 1, 'Sirah 48 vorbește despre Ilie și Elisei']]);
  P('4Rg3', 'Ioram al lui Israel; Moab', '4 Regi', 3, []);
  P('4Rg4', 'Minunile lui Elisei', '4 Regi', 4, []);
  P('4Rg5', 'Neeman Sirianul', '4 Regi', 5, [['Luc.', '4:27', 1, 'N']]);
  P('4Rg6', 'Elisei și Siria', '4 Regi', 6, []);
  P('4Rg7', 'Ridicarea asediului Samariei', '4 Regi', 7, []);
  P('4Rg8', 'Ioram și Ahazia ai lui Iuda', '4 Regi', 8, [['2 Par.', '21', 1, 'T'], ['2 Par.', '22:1-6', 1, 'T']]);
  P('4Rg9', 'Iehu uns rege', '4 Regi', 9, [['2 Par.', '22:7-9', 1, 'T']]);
  P('4Rg10', 'Casa lui Ahab nimicită', '4 Regi', 10, [['Os.', '1:4', 1, 'Osea 1:4 pomenește Iezreelul și casa lui Iehu']]);
  P('4Rg11', 'Atalia și Ioas', '4 Regi', 11, [['2 Par.', '22:10-23:21', 1, 'T']]);
  P('4Rg12', 'Ioas repară templul', '4 Regi', 12, [['2 Par.', '24', 1, 'T']]);
  P('4Rg13', 'Ioahaz și Ioas ai lui Israel; moartea lui Elisei', '4 Regi', 13, []);
  P('4Rg14', 'Amația și Ieroboam al II-lea', '4 Regi', 14, [['2 Par.', '25', 1, 'T'], ['Iona', '1-4', 1, '4 Regi 14:25 numește pe Iona, fiul lui Amitai'], ['Am.', '1-9', 1, 'Amos 1:1 (în zilele lui Ozia și Ieroboam)']]);
  P('4Rg15', 'Azaria (Ozia), Ioatam și ultimii regi ai lui Israel', '4 Regi', 15, [['2 Par.', '26', 1, 'T'], ['2 Par.', '27', 1, 'T'], ['Isa.', '1-6', 1, 'Isaia 1:1 și 6:1 (anul morții regelui Ozia)'], ['Os.', '1-14', 1, 'Osea 1:1 (Ozia, Ioatam, Ahaz, Iezechia)']]);
  P('4Rg16', 'Ahaz', '4 Regi', 16, [['2 Par.', '28', 1, 'T'], ['Isa.', '7-8', 2, 'AZ: Isaia 7:1 → 4 Regi 15:37; 16:5']]);
  P('4Rg17', 'Căderea Samariei', '4 Regi', 17, [['Tob.', '1-14', 1, 'Tobit 1:2 (Salmanasar)']]);
  P('4Rg18', 'Iezechia și Senaherib', '4 Regi', 18, [['Isa.', '36', 2, 'AZ: Isaia 36:1 → 4 Regi 18:13; 2 Par 32:1; Sir 48:20'], ['2 Par.', '29-31', 1, 'T'], ['2 Par.', '32:1-19', 2, 'AZ: Isaia 36:1 → 2 Par 32:1'], ['Sir.', '48:17-25', 2, 'AZ: Isaia 36:1 → Sir 48:20'], ['Miheia', '1-7', 1, 'Miheia 1:1 (Ioatam, Ahaz, Iezechia)']], 'Pasajul din 4 Regi 18:13–20:19 se află și în Isaia 36–39.');
  P('4Rg19', 'Rugăciunea lui Iezechia; îngerul', '4 Regi', 19, [['Isa.', '37', 2, 'AZ: Isaia 36–37 ↔ 4 Regi 18–19'], ['2 Par.', '32:20-23', 1, 'T']]);
  P('4Rg20', 'Boala lui Iezechia', '4 Regi', 20, [['Isa.', '38-39', 2, 'AZ: Isaia 38–39 ↔ 4 Regi 20'], ['2 Par.', '32:24-33', 1, 'T']]);
  P('4Rg21', 'Manase și Amon', '4 Regi', 21, [['2 Par.', '33', 1, 'T'], ['Man.', '1', 1, '2 Par 33:12-13, 18-19 pomenesc rugăciunea lui Manase']]);
  P('4Rg22', 'Iosia găsește cartea Legii', '4 Regi', 22, [['2 Par.', '34', 1, 'T'], ['Sof.', '1-3', 1, 'Sofonie 1:1 (în zilele lui Iosia)'], ['Ier.', '1', 1, 'Ieremia 1:2 (anul 13 al lui Iosia)']]);
  P('4Rg23', 'Reforma lui Iosia; moartea lui', '4 Regi', 23, [['2 Par.', '35', 1, 'T'], ['2 Par.', '36:1-4', 1, 'T'], ['3 Ezdr.', '1', 1, '3 Ezdra 1 repovestește Paștele lui Iosia']]);
  P('4Rg24', 'Ioiachim și Ioiachin; prima robie', '4 Regi', 24, [['2 Par.', '36:5-10', 1, 'T'], ['Iez.', '1', 1, 'Iezechiel 1:1-2 (anul 5 de la robia lui Ioiachin)']]);
  P('4Rg25', 'Căderea Ierusalimului', '4 Regi', 25, [['2 Par.', '36:11-21', 1, 'T'], ['Ier.', '52', 1, 'Ieremia 52 repetă 4 Regi 24:18–25:30'], ['Iez.', '24', 1, 'Iezechiel 24:1 are aceeași dată ca 4 Regi 25:1'], ['Plâng.', '1-5', 3, 'C'], ['Avd.', '1', 1, 'Avdie 1:10-14 (ziua căderii Ierusalimului)'], ['Ps.', '136', 1, 'Psalmul 136 (BVA): „pe râurile Babilonului”'], ['Bar.', '1-5', 1, 'Baruh 1:1-2 (după luarea Ierusalimului)'], ['Ep. Ier.', '1', 1, 'Epistola lui Ieremia către cei duși în robie']]);
  // ---- Robia și Daniel ----
  P('Dn1', 'Robia: Daniel la curtea Babilonului', 'Dan.', 1, [['2 Par.', '36:5-7', 1, 'Dan 1:1-2'], ['Sus.', '1', 3, 'C']]);
  P('Dn2', 'Visul lui Nabucodonosor', 'Dan.', 2, []);
  P('Dn3', 'Cuptorul de foc', 'Dan.', 3, [['Cânt. 3 tin.', '1', 1, 'Cântarea celor trei tineri este în Septuaginta chiar în Daniel 3']]);
  P('Dn4', 'Nebunia lui Nabucodonosor', 'Dan.', 4, []);
  P('Dn5', 'Ospățul lui Belșațar', 'Dan.', 5, []);
  P('Dn6', 'Daniel în groapa cu lei', 'Dan.', 6, [['Bel', '1', 3, 'C']]);
  P('Dn7', 'Viziunea celor patru fiare (anul 1 al lui Belșațar)', 'Dan.', 7, []);
  P('Dn8', 'Berbecul și țapul (anul 3 al lui Belșațar)', 'Dan.', 8, []);
  P('Dn9', 'Rugăciunea lui Daniel; cele șaptezeci de săptămâni', 'Dan.', 9, [['Ier.', '25:11-12', 1, 'Daniel 9:2 numește pe Ieremia și cei 70 de ani'], ['Ier.', '29:10', 1, 'Daniel 9:2 numește pe Ieremia și cei 70 de ani']]);
  P('Dn10', 'Viziunea de la Tigru (anul 3 al lui Cirus)', 'Dan.', 10, []);
  P('Dn11', 'Războaiele regilor', 'Dan.', 11, []);
  P('Dn12', 'Sfârșitul vremurilor', 'Dan.', 12, []);
  // ---- Întoarcerea din robie (Ezdra 1–10, Neemia, Estera) ----
  P('1Ez1', 'Decretul lui Cirus', '1 Ezdr.', 1, [['2 Par.', '36:22-23', 1, 'T'], ['3 Ezdr.', '2', 1, '3 Ezdra 2 repovestește Ezdra 1 și 4'], ['Isa.', '44-45', 1, 'Isaia 44:28 și 45:1 numesc pe Cirus']]);
  P('1Ez2', 'Lista celor întorși', '1 Ezdr.', 2, [['3 Ezdr.', '5', 1, '3 Ezdra 5 repovestește Ezdra 2–3'], ['Neem.', '7:6-72', 1, 'Aceeași listă']]);
  P('1Ez3', 'Jertfelnicul și temelia templului', '1 Ezdr.', 3, []);
  P('1Ez4', 'Opoziția vecinilor', '1 Ezdr.', 4, [['3 Ezdr.', '3-4', 1, '3 Ezdra 3–4: povestea paznicilor lui Darius și a lui Zorobabel']]);
  P('1Ez5', 'Profeții Agheu și Zaharia', '1 Ezdr.', 5, [['Ag.', '1-2', 1, 'Ezdra 5:1 numește pe Agheu; Agheu 1:1 (anul 2 al lui Darius)'], ['Zah.', '1-8', 1, 'Ezdra 5:1 numește pe Zaharia; Zaharia 1:1']]);
  P('1Ez6', 'Templul isprăvit și sfințit', '1 Ezdr.', 6, [['3 Ezdr.', '6-7', 1, '3 Ezdra 6–7 repovestește Ezdra 5–6']]);
  P('Est1', 'Estera: ospățul și Vaști', 'Est.', 1, [], 'Estera se așază aici după cronologia istorică (Ahașveroș între Darius și Artaxerxe); locul se verifică.');
  P('Est2', 'Estera devine regină', 'Est.', 2, []);
  P('Est3', 'Hamanul și porunca', 'Est.', 3, []);
  P('Est4', 'Mardoheu și Estera', 'Est.', 4, []);
  P('Est5', 'Estera înaintea regelui', 'Est.', 5, []);
  P('Est6', 'Cinstirea lui Mardoheu', 'Est.', 6, []);
  P('Est7', 'Hamanul osândit', 'Est.', 7, []);
  P('Est8', 'Porunca nouă', 'Est.', 8, []);
  P('Est9', 'Purimul', 'Est.', 9, []);
  P('Est10', 'Mărirea lui Mardoheu', 'Est.', 10, []);
  P('1Ez7', 'Ezdra pleacă spre Ierusalim', '1 Ezdr.', 7, [['3 Ezdr.', '8', 1, '3 Ezdra 8 repovestește Ezdra 7–8']]);
  P('1Ez8', 'Cei ce s-au întors cu Ezdra', '1 Ezdr.', 8, []);
  P('1Ez9', 'Căsătoriile cu străinii', '1 Ezdr.', 9, [['3 Ezdr.', '9', 1, '3 Ezdra 9 repovestește Ezdra 9–10 și Neemia 8']]);
  P('1Ez10', 'Pocăința poporului', '1 Ezdr.', 10, []);
  ['Neemia pleacă spre Ierusalim', 'Rugăciunea lui Neemia', 'Zidirea zidului', 'Opoziție', 'Nedreptățile dintre frați', 'Zidul isprăvit', 'Lista de la Neemia', 'Ezdra citește Legea', 'Mărturisirea poporului', 'Cei ce locuiesc în Ierusalim', 'Preoți și leviți', 'Sfințirea zidului', 'Reformele lui Neemia'].forEach((per, i) => {
    const refs = [];
    if (i === 6) refs.push(['1 Ezdr.', '2', 1, 'Neemia 7:6-72 repetă Ezdra 2']);
    if (i === 7) refs.push(['3 Ezdr.', '9:37-55', 1, '3 Ezdra repovestește Neemia 7:73–8:12']);
    if (i === 12) refs.push(['Mal.', '1-4', 3, 'C']);
    P('Ne' + (i + 1), per, 'Neem.', i + 1, refs);
  });
  // Neemia: în aplicație „Cartea lui Neemia (a doua a lui Ezdra)” folosește prescurtarea „Neem.”


  // =====================================================================================================
  // TRANȘA A DOUA (v24.52): profeții și pozițiile de după Neemia. Numerotarea din Ieremia în Anania e cea
  // ebraică (25 = cei 70 de ani, 26 = cuvântarea din templu, 36 = cartea arsă, 51 = Babilonul): verificat pe biblia.dervent.ro.
  // =====================================================================================================
  A('4Rg15', [['Ioil', '1-3', 3, 'C']]);
  A('4Rg16', [['Isa.', '9-12', 3, 'C']]);
  A('4Rg18', [['Isa.', '13-23', 3, 'Isaia 14:28 (anul morții lui Ahaz) și 20:1 (Sargon, Asdod) dau reperele; restul n-are dată în text'], ['Isa.', '24-35', 3, 'C']]);
  A('4Rg22', [['Ier.', '2-6', 1, 'Ieremia 3:6 (în zilele regelui Iosia)']]);
  A('4Rg23', [['Naum', '1-3', 3, 'Naum 3:8 vorbește de Tebe ca de o cetate căzută; Ninive e încă în picioare']]);
  A('4Rg24', [
    ['Avac.', '1-3', 3, 'Avacum 1:6 („ridic pe Caldei”); textul nu dă domnia'],
    ['Ier.', '7-20', 3, 'Ieremia 7:1-15 și 26:1-6 repetă aceeași cuvântare, datată în 26:1 la începutul domniei lui Ioiachim; capitolele 8–20 n-au dată în text'],
    ['Ier.', '22', 1, 'Ieremia 22:11, 18, 24 numește pe Salum (Ioahaz), Ioiachim și Conia'],
    ['Ier.', '23', 3, 'C'],
    ['Ier.', '24', 1, 'Ieremia 24:1 (după robia lui Iehonia)'],
    ['Ier.', '25-26', 1, 'Ieremia 25:1 (anul 4 al lui Ioiachim) și 26:1 (începutul domniei lui Ioiachim)'],
    ['Ier.', '35-36', 1, 'Ieremia 35:1 și 36:1 (în zilele lui Ioiachim)'],
    ['Ier.', '45-46', 1, 'Ieremia 45:1 și 46:2 (anul 4 al lui Ioiachim)']
  ]);
  A('4Rg25', [
    ['Ier.', '21', 1, 'Ieremia 21:1 (regele Zedechia)'],
    ['Ier.', '27-29', 1, 'Ieremia 27:1 și 28:1 (anul 4 al lui Zedechia)'],
    ['Ier.', '30-34', 1, 'Ieremia 32:1 (anul 10 al lui Zedechia) și 34:1 (asediul); capitolele 30–31 n-au dată'],
    ['Ier.', '37-39', 1, 'Ieremia 37:1 și 39:1-2 (Zedechia, căderea cetății)'],
    ['Ier.', '40-44', 1, 'Ieremia 40:1 și 41:1 (după căderea Ierusalimului); vezi 4 Regi 25:22-26'],
    ['Ier.', '47-49', 3, 'Ieremia 49:34 e datat (începutul domniei lui Zedechia); celelalte oracole despre neamuri n-au dată'],
    ['Ier.', '50-51', 1, 'Ieremia 51:59 (anul 4 al lui Zedechia)'],
    ['Iez.', '2-23', 1, 'Iezechiel 1:2, 8:1 și 20:1 (anii 5–7 ai robiei) și 24:1 (anul 9)'],
    ['Iez.', '25-32', 1, 'Iezechiel 26:1, 29:1, 32:1 (anii 10–12 ai robiei)'],
    ['Iez.', '33', 1, 'Iezechiel 33:21 (anul 12 al robiei: vestea căderii Ierusalimului)']
  ]);
  A('Dn3', [['Iez.', '34-39', 3, 'C']]);
  A('Dn4', [['Iez.', '40-48', 3, 'Iezechiel 40:1 (anul 25 al robiei); așezare tradițională în timpul robiei']]);
  A('1Ez1', [['Isa.', '40-43', 3, 'Isaia 44:28 și 45:1 numesc pe Cirus; capitolele de mângâiere 40–43 și 46–66 se așază aici tematic'], ['Isa.', '46-66', 3, 'C']]);
  A('Ne13', [['Zah.', '9-14', 3, 'C']]);

  // ---- Epoca Macabeilor (după Neemia și Maleahi) ----
  ['Persecuția lui Ptolemeu Filopator', 'Rugăciunea lui Simon', 'Dumnezeu scapă pe evrei', 'Rugăciunea lui Eleazar', 'Libertate și sărbătoare', 'Scrisoarea regelui', 'Pocăința și mulțumirea']
    .forEach((per, i) => P('3Mc' + (i + 1), per, '3 Mac.', i + 1, [], i === 0 ? 'Cartea a treia a Macabeilor se petrece sub Ptolemeu al IV-lea Filopator (în Egipt), înaintea persecuției lui Antioh din 1 Macabei (așezare istorică, de verificat).' : ''));
  const MAC1 = ['Antioh Epifan și prigoana', 'Matatia și răscoala', 'Iuda Macabeul', 'Curățirea și înnoirea templului', 'Luptele lui Iuda în jur', 'Moartea lui Antioh; Lisias', 'Nicanor și Alchim', 'Alianța cu romanii', 'Ionatan', 'Ionatan mare preot', 'Ionatan și Demetrie', 'Ionatan și Iudeea', 'Ionatan prins', 'Simon, mare preot', 'Simon și Antioh al VII-lea', 'Sfârșitul lui Simon'];
  const MAC1_REFS = {
    1: [['Dan.', '8', 3, 'Tâlcuire patristică (de verificat): Daniel 8 și 11 privesc la Antioh Epifan'], ['Dan.', '11', 3, 'C'], ['2 Mac.', '1-6', 1, 'T']],
    2: [['2 Mac.', '7', 1, '2 Macabei 7: mucenicii din aceeași prigoană']],
    3: [['2 Mac.', '8', 1, 'T']],
    4: [['2 Mac.', '10-11', 1, 'T'], ['Ioan', '10:22', 1, 'Ioan 10:22 (sărbătoarea înnoirii templului)']],
    5: [['2 Mac.', '12', 1, 'T']],
    6: [['2 Mac.', '9', 1, 'T'], ['2 Mac.', '13', 1, 'T']],
    7: [['2 Mac.', '14-15', 1, 'T']]
  };
  MAC1.forEach((per, i) => P('1Mc' + (i + 1), per, '1 Mac.', i + 1, MAC1_REFS[i + 1] || []));

  window.CONCORDANTE_MODEL = {
    id: 'CRONOLOGIC_PARALEL',
    nume: 'Cronologic-paralel cu concordanțe (de la Facere la Macabei)',
    nivele: { 1: 'Scriptura leagă pasajele', 2: 'verificat pe azbyka.ru', 3: 'cronologie/tradiție, de verificat' },
    pozitii: pos
  };
})();
