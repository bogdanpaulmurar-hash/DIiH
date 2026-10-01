# Propuneri și Ghid Schimbare Pictograme (Icons) — DIiH Hub

În acest folder sunt generate variante de pictograme vectoriale SVG de înaltă rezoluție (scalabile la orice dimensiune fără pierderi de calitate), create special pentru profilul duhovnicesc și personal al aplicației DIiH:

---

## ☦️ Variantele Brâncovenești și Tradiționale (Create conform imaginilor transmise):

1. **`icon-monograma-hristos-brancoveneasca.svg` (Placă Pictată în Stil Brâncovenesc)**
   - **Simbol:** Inspirată 1:1 din icoana pictată pe lemn: câmp carmin-teracotă cald, bordură perlată brâncovenească (șirag de mărgăritare), colțuri și rozete florale tradiționale, inel circular cu Rugăciunea lui Iisus („DOAMNE IISUSE HRISTOASE, FIUL LUI DUMNEZEU, MILUIEȘTE-MĂ PE MINE PĂCĂTOSUL †”) și medalion central cu Monograma lui Hristos (Chi-Rho / ☧ cu capete înmugurite, Alfa și Omega).
   - **Recomandare:** Emblema principală, autentică și caldă pentru aplicație.

2. **`icon-sigiliu-monograma-hristos.svg` (Sigiliu Monastic Bizantin Auriu)**
   - **Simbol:** Sigiliu rotund monastic pe fundal închis cu bordură gravată dublă, Rugăciunea lui Iisus scrisă circular și Monograma Hristică (Chi-Rho, Alfa, Omega) cu finisaj auriu.
   - **Recomandare:** Variantă solemnă, perfectă ca emblemă rotundă pe telefon și laptop.

3. **`icon-sigiliu-gravura-monograma.svg` (Gravură Tradițională Alb-Negru)**
   - **Simbol:** Sigiliul gravat autentic alb-negru / tuș tradițional (identic cu prima schiță atașată).
   - **Recomandare:** Contrast maxim, stil xilogravură mănăstirească veche.

---

## Alte Variante Disponibile:

4. **`icon-orthodox-cross.svg` (Crucea Ortodoxă Bizantină & Raze)**
   - **Simbol:** Cruce aurie bizantină pe fundal profund albastru-noapte (`#090d16` -> `#1e293b`), cu nimb de lumină caldă.

5. **`icon-monogram-diih.svg` (Monograma Stil DIiH — Busolă Cerească)**
   - **Simbol:** Monograma aurie `DIiH` înscrisă într-un cerc de lumină și navigație duhovnicească.

6. **`icon-psaltire-candle.svg` (Candela Aprinsă & Cartea Deschisă)**
   - **Simbol:** Candelă aprinsă cu flacără aurie deasupra Psaltirii deschise.

7. **`icon-heart-cross.svg` (Inima Pomenirii & Crucea Duhovnicească)**
   - **Simbol:** O inimă purpurie caldă îmbrățișată de o cruce aurie discretă, cu raze celeste.

---

## Cum poți schimba pictograma aplicației (Desktop & Telefon):

### Metoda 1: Direct în aplicație (Fără reinstalare)
1. Deschide aplicația pe laptop sau telefon.
2. Mergi la tabul **⋯ Mai multe** -> **Setări**.
3. La secțiunea **Personalizare Brand (Cloud)**:
   - În câmpul pentru emoji/logo, poți introduce oricare simbol (ex: ☦️, 🕯️, 🧭, 📖, 🤍).
   - Apasă **Salvează în Cloud**. Acesta se actualizează instantaneu pe favicon și în antetul aplicației.

### Metoda 2: Schimbare definitivă în Manifestul PWA (`manifest.json`)
Dacă dorești ca icoana instalată pe ecranul telefonului sau în Windows Start Menu să fie una dintre imaginile SVG de mai sus:
1. În fișierul `manifest.json`, înlocuiește secțiunea `"icons"` cu calea relativă:
```json
"icons": [
  {
    "src": "./icons/icon-orthodox-cross.svg",
    "sizes": "192x192 512x512",
    "type": "image/svg+xml",
    "purpose": "any maskable"
  }
]
```
2. În `index.html`, linia cu `<link id="appFavicon" ...>` se poate schimba la:
```html
<link id="appFavicon" rel="icon" href="./icons/icon-orthodox-cross.svg">
```
3. Fă `git add .`, `git commit` și `git push`, apoi în aplicație apasă **Curăță Cache & Reîncarcă**.
