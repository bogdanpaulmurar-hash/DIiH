# Propuneri și Ghid Schimbare Pictograme (Icons) — DIiH Hub

În acest folder sunt generate 4 variante de pictograme vectoriale SVG de înaltă rezoluție (scalabile la orice dimensiune fără pierderi de calitate), create special pentru profilul duhovnicesc și personal al aplicației DIiH:

---

## Variantele create:

1. **`icon-orthodox-cross.svg` (Crucea Ortodoxă Bizantină & Raze)**
   - **Simbol:** Cruce aurie bizantină pe fundal profund albastru-noapte (`#090d16` -> `#1e293b`), cu nimb de lumină caldă.
   - **Recomandare:** Varianta clasică, solemnă, ideală pentru Psaltire și Pomelnic.

2. **`icon-monogram-diih.svg` (Monograma Stil DIiH — Hristos Monogram IC-XC / Cale & Busolă)**
   - **Simbol:** Monograma aurie `DIiH` înscrisă într-un cerc de lumină și navigație duhovnicească (busolă cerească).
   - **Recomandare:** Identitate de brand personalizată, modernă și discretă.

3. **`icon-psaltire-candle.svg` (Candela Aprinsă & Cartea Deschisă)**
   - **Simbol:** Candelă aprinsă cu flacără aurie deasupra Psaltirii deschise.
   - **Recomandare:** Pentru rugăciune, pravilă și veghere duhovnicească.

4. **`icon-heart-cross.svg` (Inima Pomenirii & Crucea Duhovnicească)**
   - **Simbol:** O inimă purpurie caldă îmbrățișată de o cruce aurie discretă, cu raze celeste.
   - **Recomandare:** Păstrează ideea inimii (dragostea pentru cei vii și cei adormiți), însă cu elevație grafică duhovnicească.

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
