# Lokaal bouwen en testen — Akeneo Companion

Stappenplan om de meest recente versie van de extensie lokaal te bouwen en in Chrome te laden.

## Vereisten

- [Node.js](https://nodejs.org/) v20 of hoger
- Git
- Google Chrome

---

## 1. Repository ophalen

```bash
git clone https://github.com/KrijnErmerins/akeneo-companion.git
cd akeneo-companion
```

Als je de repo al hebt:

```bash
git checkout main
git pull origin main
```

## 2. Afhankelijkheden installeren

```bash
npm install
```

## 3. Omgevingsvariabelen instellen

Kopieer het voorbeeldbestand en vul de Akeneo-credentials in:

```bash
cp .env.example .env
```

Open `.env` en vul de waarden in:

```
VITE_AKENEO_BASE_URL=https://jouw-akeneo-instantie.com
VITE_AKENEO_CLIENT_ID=...
VITE_AKENEO_CLIENT_SECRET=...
VITE_AKENEO_USERNAME=...
VITE_AKENEO_PASSWORD=...
```

## 4. Extensie bouwen

### Windows (PowerShell)

```powershell
.\node_modules\.bin\tsc -b; if ($?) { .\node_modules\.bin\vite build }
```

### macOS / Linux

```bash
./node_modules/.bin/tsc -b && ./node_modules/.bin/vite build
```

Na een succesvolle build staat de output in de map `dist/`.

## 5. Extensie laden in Chrome

1. Open Chrome en ga naar `chrome://extensions`
2. Zet **Ontwikkelaarsmodus** aan (rechtsboven)
3. Klik op **Uitgepakte extensie laden**
4. Selecteer de `dist/`-map in de repository
5. De extensie verschijnt nu in de lijst en is actief

## 6. Testen

- Navigeer naar een productpagina op een ondersteunde storefront (bijv. ledkoning.nl)
- Klik op het extensie-icoon in de Chrome-werkbalk
- Controleer of het juiste product en de vulgraad worden getoond

## Opnieuw bouwen na een wijziging

Herhaal stap 4. Klik daarna in `chrome://extensions` op de **herlaad-knop** (cirkel-pijl) bij de extensie om de nieuwe versie te activeren.
