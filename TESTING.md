# TESTING — DIiH Hub

Pașii de test pe versiune (ce faci → ce trebuie să se întâmple). Rezultatele raportate se notează în CHANGELOG.md.

## v24.55 — Iov, deuterocanonice, Noul Testament

Doar frontend; „Curăță Cache & Reîncarcă” până apare v24.55.

1. Modelul cu concordanțe: după Facerea 50 urmează Iov 1 (42 de capitole), apoi Ieșirea 1.
2. La 4 Regi 25 apar Baruh 1–5, Plângerile și Epistola lui Ieremia; la Daniel 3, Cântarea celor trei tineri.
3. La finalul modelului: Matei 1 cu Luca 1 și 3:23-38; Matei 14 cu Marc 6 și Ioan 6; Matei 28 cu Marc 16, Luca 24, Ioan 20–21.
4. Bifează Marc 6 din Matei 14: la Marc, capitolul apare citit și în lista generală.
5. Fapte 18 are 1 Tes. și 2 Tes.; Fapte 28 are Efes., Col., Filim. etc.; Apoc. 1 are 1–3 Ioan.

## v24.54 — Concordanțe de la Facere

Doar frontend; „Curăță Cache & Reîncarcă” până apare v24.54.

1. Scriptură → Model de citire → „Cronologic-paralel cu concordanțe (de la Facere la Macabei)”: lista începe cu Facerea 1, înaintea lui 3 Regi 1.
2. Facerea 1 are referințe (Ioan 1:1-18, Evr. 11:3), fiecare cu bifă, sursă și 📖 Anania.
3. Bifează Facerea 1 → capitolul apare citit în evidența generală; referințele ei rămân de bifat separat.
4. La Ieșirea 32: referința Ps. 105 bifată din card nu mută pagina.
5. 2 Regi 12: referința Ps. 50 duce la psalmul 50 în Anania.

## v24.53 — Concordanțe în widget, fără salt de pagină

Înainte: doar frontend; „Curăță Cache & Reîncarcă” până apare v24.53.

1. Planul Pr. Nicolae Dima, următorul capitol 2 Par. 20: în Scriptură, sub „Următorul capitol de citit”, apare „Concordanțe de văzut (2 Par. 20)” cu „Legat de 3 Regi 22” și link 📖 Anania. Titlul se vede întreg.
2. Același text apare în widgetul „Continuitate Sf. Scriptură” din Astăzi; atingerea linkului nu te duce în Scriptură.
3. La un capitol cu referințe (ex. 3 Regi 5 în planul cronologic): referințele au bife; bifează una din widget, fără să se miște pagina.
4. Din Astăzi: apasă „Am citit” de mai multe ori: pagina rămâne exact unde ești.
5. În Scriptură, în lista modelului derulată în jos: bifează o poziție; lista nu sare la început.
6. Butonul ↗ de lângă „Am citit” deschide capitolul în biblia.dervent.ro.

## v24.52 — Concordanțe în planul Dima, tranșa a doua

Înainte: doar frontend; pe telefon „Curăță Cache & Reîncarcă” până apare v24.52 (backend-ul 24.51 trebuie să fie deja deployat).

1. Canonic: bifează tot Isaia 36. Plan model „Cronologic-paralel”, poziția 4 Regi 18: referința „Isa. 36” e bifată, cu „citit deja”.
2. Canonic: bifează toată cartea a doua Paralipomena. La 4 Regi 11 referința „2 Par. 22:10-23:21” și celelalte din 2 Par. apar bifate.
3. Alege planul Pr. Nicolae Dima: la „Cartea a doua Paralipomena” vezi „N/36 cap.” cât e citit și „Concordanțe (N)”; deschide-l: legături ✓/○ cu 📖 Anania.
4. Debifează o referință deja citită: apare confirmare; la „Anulează” rămâne bifată.
5. Citește în planul cronologic 4 Regi 18 cu toate referințele, apoi mergi în planul Dima la Isaia: capitolele deja citite apar citite.
6. Pe un profil fără drepturi de admin: aceleași rezultate.

## v24.51 — Model cronologic-paralel cu concordanțe

Înainte: copiază `_API.gs_cod_din_skript.google.com.txt` în Apps Script (fișierul `_API.gs`), Deploy → Manage deployments → editează deployment-ul existent → New version. Apoi pe telefon: „Curăță Cache & Reîncarcă” până apare v24.51.

1. Scriptură → Plan de Citire (Model): în listă apare „Cronologic-paralel cu concordanțe (de la Solomon la Neemia)”; alege-l. Vezi „0 / 92”.
2. La „3 Regi 1” bifează capitolul principal: poziția rămâne neîncheiată, scrie „1 din 2 bifate”. Bifează referința „1 Par. 28-29”: poziția devine verde, contorul urcă la „1 / 92”.
3. În Canonic (Anania): 3 Regi 1 și 1 Paralipomena 28–29 apar citite.
4. Apasă „📖 Anania ↗” la o referință pe versete (de ex. 2 Par. 32:1-19 la 4 Regi 18): se deschide biblia.dervent.ro la versetul respectiv.
5. La 4 Regi 18 bifează „Isaia 36”: capitolul Isaia 36 apare citit în Canonic. Mai jos, la 4 Regi 19, „Isaia 37” apare cu sursa azbyka.ru.
6. Bifează referința „Isaia 36” și vezi la 4 Regi 18 „Apare și la: …” unde e cazul; o referință pe capitol deja citit arată „citit deja”.
7. Închide și redeschide aplicația, apoi intră de pe alt dispozitiv: bifele referințelor sunt aceleași (în Sheet, tabul ProgresScriptura, coloana „Concordante” conține ID-uri ca `3Rg1.a`).
8. Schimbă modelul pe „Ordinea canonică Anania”: lista veche și bifele ei merg ca înainte.
9. Versetul zilei / Biblia: butonul spre Anania deschide cartea și capitolul corect (de ex. Isaia, Psalmi).
10. Repetă pe un profil fără drepturi de admin: aceleași bife; „Lectură nouă” golește și referințele.

## v24.50 — Autoscroll fluid

Înainte: doar frontend. Pe telefon: „Curăță Cache & Reîncarcă” până apare v24.50.

1. Pornește Autoscroll pe un text lung (Rugăciuni): textul urcă lin, fără tremur sau sărituri, la treapta implicită și la cele mai mici.
2. „+” de câteva ori: viteza crește treptat, fără salt mare între trepte; la treapta 12 e rapid, dar tot fluid.
3. Derulează cu degetul în timp ce merge, apoi dă drumul: continuă de unde ai rămas, fără să sară înapoi.
4. Verifică pe iPhone și pe Samsung.

## v24.49 — Autoscroll plutitor

Înainte: doar frontend. Pe telefon: „Curăță Cache & Reîncarcă” până apare v24.49.

1. În stânga-jos apare un buton mic, semitransparent, cu săgeți în jos; rămâne pe loc când derulezi.
2. Apasă-l pe Acasă sau Notițe: pagina începe să deruleze foarte lent; butonul devine mai vizibil.
3. Apasă-l din nou: apare controlul − / treaptă / + / ⏹. „+” accelerează, „−” încetinește, ⏹ oprește.
4. Mai multe → Rugăciuni (text lung), Biblia și Psaltire: derulează textul din ecranul respectiv.
5. Atinge ecranul cât derulează: se oprește cât ții degetul, apoi continuă. La capăt se oprește cu mesaj.
6. 🔔 Notificări → debifează „Autoscroll”: butonul dispare peste tot (și rămâne ascuns după reîncărcare); bifează-l: reapare.
7. Repetă pe profilul Andreea/Luca: același comportament, iar butonul ☀️ Ecran pornit (dreapta-jos) merge ca înainte.

## v24.48 — Texte în tabul Rugăciuni

Înainte: doar frontend. Pe telefon: „Curăță Cache & Reîncarcă” până apare v24.48.

1. Mai multe → Rugăciuni: apar 6 subtaburi, cu scroll lateral.
2. Fiecare subtab arată textul: titluri îngroșate, indicații în cursive, culori distincte; textul se citește ușor, fără simboluri ciudate.
3. Spovedanie are două rugăciuni: „Înainte de spovedanie” și „După spovedanie”.
4. Împărtășanie e lungă: derulează până la final, verifică canonul și cele 12 rugăciuni.
5. Aplicația deschisă fără internet (după o primă încărcare) arată tot textele.

## v24.46–24.47 — Fără Calendar Bife; tab Rugăciuni

Înainte: doar frontend. Pe telefon: „Curăță Cache & Reîncarcă” până apare v24.47.

1. Psaltire → fereastra „Rânduială Zilnică”: doar subtaburile „Catisma & Pomelnic” și „Rugăciune Neam”.
2. Mai multe → Rugăciune: apare butonul „Rugăciuni”; se deschide tabul cu 5 subtaburi.
3. Bara de subtaburi se derulează lateral; apeși unul → se evidențiază, iar mesajul „se adaugă în curând” își schimbă titlul.
4. Închide și redeschide aplicația → tabul se deschide la ultimul subtab ales.

## v24.45 — Psaltire fără simboluri ciudate, note Biblia mai rapide

Înainte: doar frontend. Pe telefon: Setări → „Curăță Cache & Reîncarcă” până apare v24.45.

1. Pomelnic → Psaltire grup → ➕ persoană, alege o secțiune (ex. bolnavi) → apare în secțiunea aleasă, cu numele curat.
2. Deschide foaia Psaltire_Grup: numele nou nu conține „§iune=”, iar coloana Secțiune are valoarea aleasă.
3. Persoanele adăugate înainte cu „§iune=” se văd acum curate în aplicație.
4. Mai multe → Note Biblia: se încarcă repede, apar 40 de note, „Arată încă 40” adaugă altele; căutarea găsește și note de după primele 40.
5. Profil fără admin: aceleași verificări, dacă are drept pe Psaltire.

## v24.44 — Bolnavii în pomelnicul zilei

Înainte: doar frontend. Pe telefon: Setări → „Curăță Cache & Reîncarcă” până apare v24.44.

1. Pomelnic → Pomelnicul Zilei: între vii și adormiți apare „🏥 Pentru cei bolnavi” cu toți cei vii bifați „Bolnav”.
2. Debifează „Arată-i în pomelnicul zilei” → secțiunea dispare (și din widgetul din Astăzi). Bifează la loc → revine.
3. Pomelnic → Comasat: „Pomelnic personal · bolnavi” apare înaintea bolnavilor din psaltire; debifează „Arată-i în pomelnicul comasat” → dispare doar de acolo.
4. Redeschide pe alt dispozitiv cu același profil → bifele rămân cum le-ai lăsat.
5. Profil fără admin (Andreea): vede doar bolnavii din pomelnicul ei; bifele merg și se păstrează pe telefonul ei.

## v24.43 — Pomelnicul comasat

Înainte: doar frontend. Pe telefon: Setări → „Curăță Cache & Reîncarcă” până apare v24.43.

1. Admin: Pomelnic → „Comasat” (primul subtab) → apar întâi vii (cu eticheta categoriei), apoi părinți duhovnici, grup, bolnavi, apoi adormiți.
2. Compară vii și adormiții cu tabul „Pomelnicul Zilei” și grupul/bolnavii cu Citirea Psaltirii: aceleași nume.
3. Categoria „inclusă mereu” (ex. familia) apare prima, separată de rest printr-o linie punctată.
4. Nume lungi: se văd întregi, fără „...”, și nu apare vârsta.
5. Scrie un text lung în „După cei vii” → apare pe loc în listă; ieși din casetă → „Text salvat”. Golește-l → dispare, fără spațiu rămas.
6. Redeschide aplicația pe alt dispozitiv → textele apar (după sincronizare).
7. Setări → widgeturi: bifează „Pomelnicul comasat” → widgetul din Astăzi arată numărul de vii / psaltire / adormiți și deschide pagina.
8. Profil fără admin: vede doar vii și adormiți (fără psaltire), fără casetele de text.

## v24.42 — Adservio dintr-un buton

Înainte: copiază `_API.gs` și `Adservio.gs` în Apps Script, Deploy → Manage deployments → editează → New version. În aplicație: Setări → „Curăță Cache & Reîncarcă” până apare v24.42.

1. Admin, telefon: Școală → Adservio → „Actualizează din Adservio” → apar pașii, apoi caseta pentru cod (sau direct „Gata”, dacă Adservio nu cere cod).
2. Scrii un cod greșit → mesaj „Codul nu e bun…”, caseta rămâne.
3. „Nu a venit codul? Cere alt cod” → mesaj „Am cerut un cod nou”, vine un e-mail/SMS nou.
4. Scrii codul bun, „Ține minte” bifat → „Gata. De acum butonul merge fără cod.”, notele și absențele se actualizează, temele noi apar în Teme.
5. Apeși din nou butonul → merge fără cod.
6. A doua zi după 07:00: „Ultima sincronizare” arată ora de dimineață (actualizare automată).
7. Profil fără admin, cu editare pe Școală: butonul merge după pasul 4; înainte de pasul 4 afișează „Îl poate introduce doar administratorul”.
8. Profil doar cu vizualizare pe Școală: butonul e blocat (mesajul obișnuit de drepturi).
9. Marcajul vechi (rezervă, doar admin): încă trimite datele.
10. Dacă apare „nu sunt robot”: aplicația arată mesajul roșu și trimite la marcaj.
