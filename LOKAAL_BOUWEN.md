# Lokaal bouwen en testen — Akeneo Companion

Stappenplan om de meest recente versie van de extensie lokaal te bouwen en in Chrome te laden.

## Vereisten

- [Node.js](https://nodejs.org/) v20 of hoger
- Git
- Google Chrome

Controleer je Node.js-versie:

```bash
node --version
# verwacht: v20.x.x of hoger
```

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

### macOS / Linux

```bash
cp .env.example .env
```

### Windows (PowerShell)

```powershell
Copy-Item .env.example .env
```

Open het nieuwe `.env`-bestand en vul de ontbrekende credentials in. De base URL staat al ingevuld in `.env.example`; voeg alleen de API-sleutels en inloggegevens toe:

```
VITE_AKENEO_CLIENT_ID=
VITE_AKENEO_CLIENT_SECRET=
VITE_AKENEO_USERNAME=
VITE_AKENEO_PASSWORD=
```

> **Let op:** Commit `.env` nooit naar Git — het staat in `.gitignore`.

## 4. Extensie bouwen

`tsc` en `vite` zijn niet globaal beschikbaar. Gebruik altijd de lokale binaries.

### macOS / Linux

```bash
./node_modules/.bin/tsc -b && ./node_modules/.bin/vite build
```

### Windows (PowerShell)

```powershell
.\node_modules\.bin\tsc -b; if ($?) { .\node_modules\.bin\vite build }
```

Na een succesvolle build staat de output in `dist/`. Controleer:

```bash
ls dist/
# verwacht: manifest.json, background/, popup/, content/, icons/
```

## 5. Extensie laden in Chrome

1. Open Chrome en ga naar `chrome://extensions`
2. Zet **Ontwikkelaarsmodus** aan (schakelaar rechtsboven)
3. Klik op **Uitgepakte extensie laden**
4. Selecteer de `dist/`-map in de repository
5. De extensie verschijnt nu in de lijst en is actief

## 6. Testen

De extensie is actief op alle ondersteunde storefronts:

| Storefront | Domein |
|---|---|
| LedKoning NL | ledkoning.nl |
| LedKoning BE | ledkoning.be |
| LedStripKoning NL | ledstripkoning.nl |
| LedStripKoning BE | ledstripkoning.be |
| SolarlampKoning NL | solarlampkoning.nl |
| SolarlampKoning BE | solarlampkoning.be |
| BouwlampKoning NL | bouwlampkoning.nl |
| BouwlampKoning BE | bouwlampkoning.be |
| SmartHomeKoning NL | smarthomekoning.nl |
| SmartHomeKoning BE | smarthomekoning.be |
| LedProfielKoning NL | ledprofielkoning.nl |
| LedProfielKoning BE | ledprofielkoning.be |
| LedChampion DE | ledchampion.de |
| Staging DE | de.ledchampion.magento2.led.p.maxserv.io |
| Staging DE (accept.) | de.ledchampion.magento2.led.a.maxserv.dev |

Testprocedure:

1. Navigeer naar een productpagina op een van de bovenstaande domeinen
2. Klik op het extensie-icoon in de Chrome-werkbalk
3. Controleer of het juiste product en de vulgraad worden getoond
4. Ververs de tab als de extensie nog de vorige pagina toont

## 7. Geautomatiseerde tests

```bash
./node_modules/.bin/vitest run --config vitest.config.ts
```

### Windows (PowerShell)

```powershell
.\node_modules\.bin\vitest run --config vitest.config.ts
```

## 8. Lint

```bash
./node_modules/.bin/eslint .
```

### Windows (PowerShell)

```powershell
.\node_modules\.bin\eslint .
```

## Opnieuw bouwen na een wijziging

Herhaal stap 4. Klik daarna in `chrome://extensions` op de **herlaad-knop** (cirkel-pijl) bij de extensie. Ververs ook de tab waarop je test om de nieuwe versie te activeren.

## Dev-modus (hot-reload)

```bash
./node_modules/.bin/vite
```

### Windows (PowerShell)

```powershell
.\node_modules\.bin\vite
```

> **Let op:** Hot-reload werkt alleen voor de popup en options-pagina. Wijzigingen in content scripts of de service worker vereisen een handmatige build (stap 4) én herlaad in `chrome://extensions`.
