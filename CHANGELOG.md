# CHANGELOG — DIiH Hub

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
- **Note Biblia (registru nou, Mai multe → Note Biblia)** — căutare după carte/capitol/verset/text, ștergere cu confirmare și anulare. Funcția de „trimitere” (legătură între note) rămâne neimplementată — are nevoie de confirmarea antetelor reale de coloane din sheet-ul live (vezi nota de mai jos).
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

### De confirmat cu utilizatorul înainte de pasul următor
- **Antetele reale ale coloanelor din `noteBIBLIA_Anania`** (în special coloana de „trimitere”) — mirror-ul local (`DIiH.xlsx`) e vechi și nu se potrivește cu structura din cod; logica de trimitere/referință încrucișată nu a fost implementată până la confirmare.
- **Numele aplicației Andreea**: promptul cere „ABL”, dar configurația existentă (funcțională) folosește „Andreea” peste tot (manifest, titlu, `APP_USERS`) — nu a fost schimbat, pentru a nu strica identitatea deja instalată pe dispozitive.
