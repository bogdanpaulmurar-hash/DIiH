# DIiH — note pentru Claude

Reguli generale (v1.1; textul complet: repo `dev-framework`, GLOBAL_RULES.md):
- Răspunde în română, scurt; rezultatul primul; spune ce nu ai putut verifica.
- Lucrează în etape mici: citește doar ce trebuie (caută, apoi deschide porțiunea), scrie doar funcțiile modificate, plan de 3–5 rânduri înainte de schimbări mari.
- După fiecare etapă rulează testele proiectului și notează în CHANGELOG.md.
- Parolele și cheile stau în keyring sau variabile de mediu; documentația vizibilă omite numele angajatorului, e-mailurile de firmă, ID-urile și numerele interne.
- Aplicații Windows: Python cu `pythonw`, tray, fără `.exe`; respectă DevPilot (`DEVPILOT_MANAGED`, `DEVPILOT_SUPPRESS`).
- Git: GitHub e sursa de adevăr; un singur laptop o dată; commit și push înainte de schimbarea laptopului; lasă Drive să termine sincronizarea.

Aplicația familiei (PWA): Astăzi, Pomelnic, Calendar, Notițe, Cumpărături, Scriptură, Nota zilei, Școală/Adservio, remindere, „Ecran pornit”. Frontend static + backend Google Apps Script cu date în Google Sheets.

## Unde e codul
- `index.html` (~12.000 de rânduri) — toată interfața și logica. **Nu-l citi întreg.** Caută:
  - tab-urile: `<section id="tab-` (today, pomelnic, calendar, notite, cumparaturi, scriptura, notazilei, more);
  - modulele: `// ======` (ex. ADSERVIO, ȘCOALĂ → SUBTAB-URI + TEME, NOTIȚE PER PROFIL, CALENDARUL ANULUI ȘCOLAR);
  - apoi deschide doar porțiunea găsită.
- `familie.js` (remindere/familie, Ecran pornit), `adservio-marcaj.js`, `sw.js` (service worker), `manifest*.json`, `icons/`
- Backend Apps Script, copiat din script.google.com: `_API.gs…txt` (`doGet`/`doPost`, rutare), `_Familie.gs…txt`, `_Adservio.gs…txt`, `_Cod.gs…txt`, `_Psaltire.gs…txt`

## Versiune și livrare
- La fiecare schimbare: `APP_VERSION` din `index.html` + `CACHE_NAME` din `sw.js` (aceeași versiune) + intrare nouă în `CHANGELOG.md`.
- În CHANGELOG scrie mereu dacă e „doar frontend” sau dacă trebuie **deploy în Apps Script** (și ce fișier `.gs` s-a schimbat).
- Modificările de backend se fac în fișierele `_*.gs…txt`; utilizatorul le copiază în Apps Script și face deploy (adesea de pe telefon), deci spune-i exact ce fișier și ce funcție.
- Verificarea se face pe telefon: Samsung (Android), iPhone XR, iPhone 13 Pro Max.

## Reguli
- Utilizatori: admin (Bogdan), Andreea, Luca — fiecare cu login Google și setări per profil.
- Fiecare membru își poate redenumi aplicația. Ce primesc ceilalți (evenimente, remindere, notificări) **nu** conține „DIiH”, doar prenumele expeditorului. Calendarul comun: „Familia-ABL_Murar”.
- Datele Adservio vin din sincronizarea din Apps Script; nu se apelează Adservio din browser.
- Comentarii, CHANGELOG și commit-uri în română; răspunsuri scurte, ușor de citit pe telefon.
- De verificat: „Încarcă în Drive” din Calendarul Anului Școlar dădea eroarea de permisiune `DriveApp.createFolder` (scope Drive în `appsscript.json` + reautorizare).

## Context comun
Prezentarea proiectelor și lista de erori/modificări sunt în două Google Docs: **PROIECTE_CONTEXT (live)** și **MODIFICARI_PROIECTE (live)** — citește doar secțiunea DIiH. Ce s-a implementat și confirmat se șterge din MODIFICARI.

## Când se actualizează fișierul
În același commit, când apare un modul sau un fișier nou, se schimbă procesul de versiune/deploy sau un defect scoate la iveală o regulă de ținut minte. Nu pentru funcții obișnuite. Sub ~60 de rânduri.
