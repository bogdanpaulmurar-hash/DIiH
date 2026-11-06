# TESTING — DIiH Hub

Pașii de test pe versiune (ce faci → ce trebuie să se întâmple). Rezultatele raportate se notează în CHANGELOG.md.

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
