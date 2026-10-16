# CHANGELOG — DIiH Hub

## v24.0.3 — 2026-10-16 — Cumpărături private pe server, adăugare rapidă din widgeturi

Frontend (`index.html`, `sw.js`) și backend (`_API.gs`, versiunea 24.0.3).

### Cumpărături
- **„Nu partaja” e acum privat pe server**: un produs marcat așa ajunge doar la cel care l-a adăugat. Înainte, serverul îl trimitea tuturor și doar aplicația îl ascundea.
- Proprietarul unui produs nou e întotdeauna contul Google conectat (coloana `Owner` primește emailul). La produsele vechi, cu un nume în `Owner`, se potrivește numele profilului.
- Nimeni nu poate șterge produsele private ale altcuiva, nici prin „golește magazinul”.
- Notificarea „X a adăugat pe listă” folosește numele real al celui care a adăugat, în locul numelor Bogdan/Andreea scrise în cod, și nu mai apare pentru produsele adăugate de tine.

### Widgeturi pe Astăzi
- **Cumpărături**: rând de adăugare rapidă (Enter sau „+”), cu magazinul implicit **„Oriunde”** sau oricare dintre magazinele deja din listă. Widgetul arată ultimele 3 produse adăugate.
- **Notițe & remindere**: câmp de **oră** lângă notița rapidă. Reminderul se pune azi la ora aleasă sau mâine, dacă ora a trecut deja.

## v24.0.2 — 2026-10-16 — Notițe per profil, remindere, widget nou

Frontend (`index.html`, `sw.js`) și backend (`_API.gs`, versiunea 24.0.2).

### Notițe per profil
- Fiecare profil vede **doar notițele lui**. Filtrarea se face pe server, deci nici datele nu pleacă spre alții.
- Coloane noi în `Notite` (create automat): `Proprietar` (emailul profilului), `CreatDe`, `Reminder`.
- Notițele vechi, fără proprietar, aparțin profilului cu numele din coloana „User” (ex. „Andreea Murar”). Cele fără user aparțin adminului.
- **Adminul poate scrie notițe pentru oricine**, din câmpul „Pentru” al formularului, opțional cu reminder. În lista lui apar cu eticheta „Pentru X”, iar la destinatar cu „De la X”. Ceilalți pot scrie doar pentru ei.
- Editarea și ștergerea sunt permise doar pe notițele proprii sau pe cele scrise de tine.

### Remindere
- Câmp nou „⏰ Reminder” (dată și oră) la fiecare notiță. Notificarea vine doar proprietarului, o singură dată, în primele 2 ore după ora setată, cât timp aplicația e deschisă.

### Widgetul „Notițe & remindere” (Astăzi)
- Arată reminderele apropiate (cele trecute în roșu), apoi ultimele notițe proprii, plus câmpul **„Notiță rapidă”** (Enter salvează). Insigna arată câte remindere sunt azi și câte notițe ai.
- Înainte afișa cea mai veche notiță din tot sheet-ul, nefiltrată pe profil.

### Corectat
- **Profilurile non-admin nu puteau salva sau edita notițe din v23.3**: aplicația trimitea `addGand`/`updateGand`, acțiuni care lipseau din regulile serverului. Notița apărea doar local și se pierdea la sincronizare.

## v24.0.1 — 2026-10-16 — Notificări per profil, Setări restrânse, registrul doar pentru admin

Frontend (`index.html`, `sw.js`) și backend (`_API.gs`, versiunea 24.0.1).

### Notificări
- **Configurația e per profil**: se salvează în cheia `notif_cfg_<email>` din Setari și fiecare cont primește doar configurația lui. Înainte, o singură configurație comună se aplica pe toate dispozitivele, iar Andreea primea alertele adminului. Adminul preia o singură dată vechea configurație comună.
- Oricine își poate salva propriile notificări, chiar fără „Setări: edit”.
- **Notificări doar din modulele permise**: Psaltire (psaltire), aniversări, pomeniri și notificarea individuală (pomelnic), Școală (scoala). Secțiunile fără acces nu mai apar în pagina Notificări și nu se mai declanșează.
- **Data locală în loc de UTC**: între 00:00 și 03:00, lista „deja trimise azi” și activitățile școlare ale zilei se calculau pe ziua anterioară.
- Configurația și istoricul notificărilor se golesc la schimbarea contului pe dispozitiv.

### Setări
- Linkul și ID-ul **registrului Google Sheets** se arată doar adminului.
- Profilurile fără „Setări: edit” văd din Setări doar contul Google, versiunea, instalarea și curățarea cache-ului. Personalizarea (poză, titlu, logo, iconiță, meniu, consola de diagnostic) și pagina „Widget” sunt ascunse.

### Corectat
- Salvarea unui profil din Admin nu mai eșuează complet dacă urcarea pozei sau a iconiței pică. Celelalte câmpuri se salvează, iar mesajul spune ce imagine nu a mers.
- `autorizeazaToatePermisiunile()` cere acum și **scrierea** în Drive (actualizează descrierea folderului aplicației). Înainte, cerea doar citirea, iar încărcarea iconiței/pozei dădea „You do not have permission to call DriveApp.createFolder”.

## v24.0 — 2026-10-16 — O singură aplicație, personalizare per profil

Frontend (`index.html`, `andreea.html`, `sw.js`) și backend (`_API.gs`, versiunea 24.0). Push pe GitHub înainte de deploy.

### O singură aplicație
- `andreea.html` nu mai e o copie separată a aplicației: doar redirecționează spre `index.html`. Aplicația Andreei, deja instalată, se deschide în continuare; ce vede depinde acum de contul ei Google.
- **Eliminată partajarea prin link cu cod secret** (`?share=`), cu panoul „Admin — Partajare Acces”, ecranul „Astăzi” partajat, alegerea widgeturilor pentru familie și `manifest-shared.json` / `manifest-shared-casa.json`. Accesul se dă acum doar din Admin → Profile și acces.
- Ce era util din partajare a rămas: profilul Andreei vede în Pomelnic doar persoanele bifate „Pomelnic Andreea” (Col D).

### Personalizare per profil, aceeași pe toate dispozitivele
- Titlul, logo-ul, widgeturile de pe Astăzi, meniul de jos, poza de profil și iconița fiecărui profil se păstrează în tabul **Profile** (coloanele Titlu, Logo, Widgeturi, Meniu, PozaFileId, IconaFileId). Pozele și iconițele sunt în Drive (`DIiH_App_Fisiere`). Se aplică la fiecare sincronizare pe orice dispozitiv.
- **Adminul** poate schimba oricui, din Admin → Profile → Editează: titlu, logo, meniu, widgeturi, poză, iconiță.
- Ceilalți își pot schimba singuri personalizarea doar dacă au **Setări: vede și editează**. Altfel, butoanele respective spun „Ai doar drept de vizualizare la Setări”.
- Backend: acțiune nouă `authSaveMyProfile`, doar pentru câmpurile de personalizare și doar pe propriul profil. Rolul și permisiunile le schimbă numai adminul.
- Înainte, titlul, logo-ul și iconița se citeau dintr-o setare globală, comună tuturor, care suprascria profilul fiecăruia.

### Iconița pe laptop (fără fundal negru)
- Manifestul generat dinamic folosește adrese absolute și iconițe PNG transparente, plus o variantă „maskable”. Înainte, căile relative nu se rezolvau dintr-un manifest `blob:`, iar Chrome pe laptop punea o iconiță generată de el, pe fundal negru.
- Iconițele încărcate se centrează automat pe un pătrat transparent. Pentru efect pe un dispozitiv deja instalat: dezinstalare și reinstalare.

### Securitate
- Serverul nu mai trimite aplicației vechile chei `user_profiles_json` (cu poze base64) și `sharing_config_json`, care ajungeau la orice cont conectat, inclusiv la profilurile cu acces restrâns.

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
