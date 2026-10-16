# CHANGELOG — DIiH Hub

## v23.3 — 2026-10-16 — Doar conectare Google, restricții complete

Frontend (`index.html`, `andreea.html`, `sw.js`) și backend (`_API.gs`, versiunea 23.3). **Ordinea de publicare: întâi push pe GitHub, apoi deploy în Apps Script.**

### Securitate
- **Tokenul vechi al API-ului și parolele profilurilor au fost scoase din cod.** Serverul acceptă doar sesiuni Google (modul e permanent „strict”). Tokenul vechi, rămas în istoricul public al repo-ului, nu mai deschide nimic.
- `DIiH.xlsx` (export local cu date personale) nu mai e urmărit în git și e adăugat în `.gitignore`. Fișierul rămâne pe Drive.
- La orice conectare sau deconectare Google, datele din sheet păstrate local se golesc și aplicația se reîncarcă. Pe un dispozitiv comun nu mai rămân vizibile datele contului anterior.

### Restricții
- Se ascund și butoanele Psaltire, Note Biblia și Gânduri din „Mai multe”, pentru profilurile fără acces.
- **Dreptul „doar vede” e respectat și în aplicație**: adăugarea, editarea, ștergerea și bifele dintr-un modul fără „edit” sunt blocate, cu mesajul „Ai doar drept de vizualizare la …”. Înainte, modificarea apărea local, dar serverul o refuza.

### Schimbat
- Fereastra de autentificare are doar „Sign in with Google” și codul de asociere. Butonul „Treci pe Andreea” devine „Schimbă contul”, iar „Deconectare” deconectează contul Google.
- Fără sesiune Google validă, aplicația cere conectarea în loc să rămână fără date.
- Butonul „Raport Detaliat pe Perioadă” din Școală afișează că raportul e în lucru (înainte nu făcea nimic, pentru că funcția lui lipsea).

### De știut
- Linkurile vechi de partajare cu cod secret nu mai funcționează (foloseau tokenul). Se elimină complet în v24.0.

## v23.2 — 2026-10-15 — Conectare cu Google (aplicație)

Doar `index.html`, `andreea.html`, `sw.js`. Backend-ul rămâne v23.1, deci nu e nevoie de deploy în Apps Script.

### Adăugat
- **Conectare cu Google**: butonul oficial Google apare în fereastra de autentificare și în Setări → Cont Google. Serverul verifică login-ul și deschide o sesiune de 30 de zile pe dispozitiv. Caseta arată emailul, rolul și data expirării, plus butonul „Deconectare Google”.
- **Conectare cu cod de asociere**: pentru dispozitivele unde login-ul Google nu merge (ex. cont de copil cu restricții Family Link, aplicație instalată pe iPhone). Codul îl generează adminul.
- **Admin → Profile și acces**: lista profilurilor (rol, activ, sesiuni active), adăugare și editare (email, nume, rol admin/membru/copil, activ, acces pe fiecare modul: implicit după rol / fără acces / doar vede / vede și editează), generare cod de asociere, închiderea tuturor sesiunilor unui profil, afișarea modului (tranziție/strict).
- **Meniul și widgeturile** modulelor fără acces se ascund pentru profilurile non-admin. Datele lor oricum nu mai pleacă din server.
- Profilul și permisiunile se reîmprospătează la fiecare sincronizare. Dacă sesiunea expiră sau e închisă de admin, aplicația o șterge și cere reconectarea.
- Profilurile noi (ex. Luca) primesc automat un utilizator local separat, cu propriile setări. Numele din antet se ia din profil.

### Tranziție
- Fiecare cerere trimite acum și sesiunea Google, și tokenul vechi. Parola veche mai funcționează până la v23.3.

## v23.1 — 2026-10-15 — Autentificare (backend)

Doar backend (`_API.gs`); aplicația funcționează exact ca înainte, prin modul de tranziție.

### Adăugat
- **Login cu Google verificat pe server**: acțiunea `authGoogle` verifică la Google ID token-ul (client OAuth DIiH, email confirmat) și emite o sesiune de 30 de zile. În tabul `Sesiuni` se păstrează doar hash-ul tokenului.
- **Tab nou `Profile`** (creat automat): `Email, Nume, Rol, Activ, Permisiuni, Widgeturi, Meniu, Titlu, Logo, PozaFileId, IconaFileId, ActualizatLa`. Roluri: admin / membru / copil. Permisiuni pe modul: none / view / edit (pomelnic, scoala, psaltire, notite, cumparaturi, inventar, gandul, scriptura, biblia360, setari).
- **Primul admin fără email în cod**: dacă `Profile` e gol, proprietarul scriptului devine admin la primul login Google.
- **Verificare la fiecare cerere**: acțiunile cer dreptul pe modulul lor; acțiunile necunoscute cer admin; sincronizarea nu mai trimite modulele fără drept de vizualizare.
- **Administrare** (doar admin): `authListProfiles`, `authSaveProfile`, `authRevokeSessions`, `authCreatePairCode` (cod de asociere de 8 caractere, valabil 15 minute, pentru dispozitive fără login Google), `authSetMode`.
- **Mod tranziție / strict** (cheia `auth_mode` din `Setari`): în tranziție tokenul vechi mai funcționează; modul strict se poate porni doar dintr-o sesiune Google de admin. Cheile `auth_*` nu se mai pot scrie prin `setSettingRaw`.
- Login-urile, refuzurile și modificările de profil se scriu în `LOG_app`.

### Corectat (securitate)
- `getDriveImage` putea citi orice fișier din Drive-ul proprietarului, dacă i se știa ID-ul. Acum citește doar fișierele din folderul aplicației (`DIiH_App_Fisiere`).

## v23.0 — 2026-10-14

Actualizare majoră: structuri noi de date (tab ModelCitire, tab GandulZilei, coloane noi în Scoala_Activitati), stocare de imagini în Google Drive, și o serie de corecturi și completări cerute pe modulele existente. Nu s-a modificat, șters sau redenumit nicio dată existentă — toate modificările pe Sheet sunt adăugări idempotente (verifică dacă lipsesc, apoi le creează).

### Fișiere modificate
- `index.html`, `andreea.html` (frontend, profilurile Bogdan/Andreea)
- `_API.gs_cod_din_skript.google.com.txt` (backend — de aplicat manual în script.google.com)
- `manifest.json`, `manifest-andreea.json`, `manifest-shared.json`, `manifest-shared-casa.json`
- `icons/` — PNG-uri noi generate (vezi mai jos)

### Adăugat
- **Tab nou `ModelCitire`** — plan de citire a Scripturii pe modele, cu 3 modele pre-populate: „Pr. Nicolae Dima (propunere video)” (42 de poziții), „Ordinea canonică Anania” (80 de poziții, câte o carte), „Test” (3 poziții, inactiv). Bifarea unei poziții marchează automat (write-through) toate capitolele cărților acelei poziții în evidența existentă de lectură, și se reflectă ca indicator pe fiecare carte din vizualizarea canonică (uniune model + canonic).
- **Tab nou `GandulZilei`** — sursă cloud pentru widgetul „Gândul Zilei” (înainte funcționa doar cu un array local, din cauza unui bug de randare care îl ținea complet gol). Suportă adăugare, editare și dezactivare din aplicație, fără ștergere de rânduri; array-ul local hardcodat rămâne fallback dacă sheet-ul nu răspunde, și e folosit o singură dată pentru populare inițială a tab-ului.
- **Coloane noi `Data_Achitat` și `Comentariu_Plata`** în `Scoala_Activitati` — completate automat când o activitate devine „Achitat”; golirea lor la revenirea pe neachitat cere confirmare și se loghează în tabul nou `LOG_app`.
- **Coloane `Sters`/`DataStergere`** adăugate idempotent (auto-create la prima utilizare) pe `Notite`/`Ganduri` și pe `noteBIBLIA_Anania`, pentru ștergere soft cu fereastră de anulare.
- **Stocare de imagini în Google Drive** (`DIiH_App_Fisiere`) — infrastructură nouă (`doPost` pentru încărcare, acțiunea `getDriveImage` pentru citire), folosită de calendarul școlar și de iconițele custom. ID-ul fișierului se păstrează în Setari; nicio imagine nu se mai salvează în celule.
- **Calendarul anului școlar de la inspectorat** (tab Școală) — încărcare de poză per an școlar (doar Bogdan/administrator), vizualizare full-screen cu zoom (pinch/roată) și pan, salt pe lună pe baza unor puncte marcate manual o singură dată. Date speciale anuale (Săptămâna Verde, Săptămâna Altfel) — formular dedicat care generează automat activități „fără plată” pe fiecare zi din interval, vizibile direct în calendarul lunii.
- **Sumar financiar Școală** extins: Luna trecută, Ultimele 30 de zile, interval personalizat; plus total achitat, număr de activități, și defalcare pe copil și pe tip de activitate.
- **Bifă nouă „Pomelnicul zilei”** în calendarul de rânduială, separată de bifa existentă „Pomelnic” (complet) — nu se combină.
- **Lista de cumpărături** — linkurile din text devin clickabile (etichetă = domeniul, URL complet în tooltip), cu reparare de layout pentru linkuri foarte lungi.
- **Notițe** — ștergere cu confirmare obligatorie, selecție multiplă cu „Șterge selectate (N)”, ștergere soft cu anulare.
- **Note Biblia (registru nou, Mai multe → Note Biblia)** — căutare după carte/capitol/verset/text, ștergere cu confirmare și anulare. Trimiterile între note au fost adăugate pe 2026-10-15 (vezi mai jos).
- **Iconiță aplicație personalizată per profil** (Setări) — încărcare imagine locală, redimensionare automată la 512×512, salvare în Drive, revenire la sigiliul implicit. Manifestul PWA se generează acum dinamic (Blob) cu numele și iconița profilului activ.
- **Logo (emoji) din antet** — buton „Revino la implicit” per profil.
- **Iconițe PNG noi** pentru manifest/apple-touch-icon, generate din sigiliul existent (neatins) și din iconița inimii Andreei: `icons/app-192.png`, `icons/app-512.png`, `icons/app-512-maskable.png`, `icons/apple-touch-180.png`, `icons/icon-heart-apple-180.png`, `icons/icon-heart-ekg-maskable.png`, `icons/icon-family-home-maskable.png`.
- **Tab nou Info** (Mai multe → Info) — ce este aplicația, funcții pe modul, instrucțiuni de utilizare, instalare, schimbare iconiță/logo, date și confidențialitate, versiune.

### Corectat
- Widgetul „Gândul Zilei” nu se actualiza niciodată — funcția de randare căuta elemente DOM cu ID-uri inexistente.
- Un `localStorage.setItem` fără protecție pentru Note Anania / Biblia 360 (seturi mari de date) putea arunca `QuotaExceededError` și oprea silențios restul sincronizării (widgete, programul zilei etc. rămâneau neactualizate după fiecare sincronizare completă).
- Sumarul financiar Școală folosea `todayStr` fără să-l mai declare după refactorizarea filtrului de perioadă.

### Setări noi (chei în tab-ul `Setari`, scrise prin acțiunea generică `setSettingRaw`/citite prin `getSettingsRaw`)
- `drive_folder_id` — ID-ul folderului Drive al aplicației (creat automat la prima încărcare de fișier).
- `ModelCitireActiv` — ID-ul modelului de citire selectat.
- `CalendarScolar_<an>` — ID fișier Drive al calendarului anual (ex. `CalendarScolar_2026-2027`).
- `CalendarScolarPuncte_<an>` — poziții (procente x/y) ale punctelor de start pentru fiecare lună.
- `SaptamanaVerde_<an>` / `SaptamanaAltfel_<an>` — intervalul de date (format `start_end`).
- `IconaApp_<profil>` — ID fișier Drive al iconiței custom per profil.

### Completări 2026-10-15
- **Note Biblia — editare**: fiecare notă se poate edita direct în registru (✏️); salvarea scrie în sheet (`updateNoteAnania`) și completează `DataModificare`.
- **Coloana J „Capitol # / #”** din `noteBIBLIA_Anania` se citește acum din sheet și se afișează în widget, în Nota Zilei și în registru (ex. „Capitol 3/17”), separat de marcajul notei.
- **Note Biblia — trimiteri între note**: trimiterile din Nota de subsol (col. H), de forma „vezi Fc 3, 2”, „vezi nota de la 5, 22” (aceeași carte) sau „vezi v. 5” (același capitol), devin link-uri care deschid nota-țintă, găsită după Carte (col. B), Capitol (col. C) și Verset (col. D). Căutarea acceptă „Fc 3, 2”, „Facerea 3:2”, „1 Rg 2”, „Iș 3, 13-15” și arată nota-țintă plus „Note care trimit către …”. Filtru nou „Doar notele care au trimiteri”, buton „← Înapoi” după salt. Cheia se calculează în memorie; nu s-a adăugat nicio coloană. Trimiterile spre cărți care nu sunt în colecție (ex. Mt, In, Rm) se recunosc, dar nu devin link.
- **Versiune actualizată peste tot la v23.0**: textul „Versiune Curentă” din Setări, cache-ul `sw.js` (`diih-cache-v23`), antetul backend-ului. Backend-ul trimite acum `backendVersion` la sincronizare, iar Setări afișează „Backend (Apps Script): v23.0 ✅” sau avertizează dacă rulează încă versiunea veche.
- **Numele aplicației Andreea** → „ABL - Andreea” (short_name „ABL”) în manifest, titlu și `APP_USERS`.
