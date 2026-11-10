# TESTING — DIiH Hub

Pașii de test pe versiune (ce faci → ce trebuie să se întâmple). Rezultatele raportate se notează în CHANGELOG.md.

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
