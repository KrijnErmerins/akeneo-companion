# Akeneo Companion

Chrome-extensie voor het content/PIM-team bij LedKoning. Toont met één klik op een PDP of de Akeneo-data compleet is voor dat product — zonder los in te loggen op Akeneo en de SKU handmatig op te zoeken.

Zie `VISION.md`, `PRODUCT.md` en `AUTONOMY.md` voor waarom dit bestaat, wat de scope is en welke grenzen gelden voor AI-agents die hierop doorontwikkelen.

## Features

- Detecteert automatisch of de huidige pagina een LedKoning-PDP is
- Herkent de SKU uit de pagina (DOM/URL)
- Haalt de Akeneo-data op voor die SKU (product of product model)
- Toont productnaam, SKU en completeness % per locale, met kleurcodering
- Locale-detectie per domein (`.nl`, `.be`, `.de`)
- Options-pagina om Akeneo-credentials eenmalig in te stellen

## Tech Stack

- **Framework**: React + TypeScript + Vite
- **Extensie**: Chrome Manifest V3, gebouwd met `@crxjs/vite-plugin`
- **Auth**: Akeneo OAuth2 password grant (zelfde Akeneo-omgeving als pimport)

## Setup

### Vereisten

- Node.js
- Akeneo API-credentials (zelfde omgeving als pimport)

### Installeren

```powershell
npm install
cp .env.example .env
# Vul de Akeneo-credentials in .env in
```

### Bouwen

`tsc` en `vite` zijn niet globaal beschikbaar — gebruik de lokale binaries:

```powershell
.\node_modules\.bin\tsc -b; if ($?) { .\node_modules\.bin\vite build }
```

### Extensie laden in Chrome

1. Ga naar `chrome://extensions`
2. Zet "Developer mode" aan
3. Klik "Load unpacked" en selecteer de `dist/`-map

### Ontwikkelen

```powershell
.\node_modules\.bin\vite
```

Zie `LOKAAL_BOUWEN.md` voor verdere details.

## Project Structure

```
akeneo-companion/
├── manifest.config.ts        # CRXJS manifest definitie
├── vite.config.ts
├── src/
│   ├── background/
│   │   ├── index.ts          # Service worker entry + message handler
│   │   ├── auth.ts           # Token manager (OAuth2)
│   │   ├── akeneo.ts         # API client (product + product-model lookup)
│   │   └── credentials.ts    # Build-time credentials (.env)
│   ├── content/
│   │   └── sku-detector.ts   # SKU uit DOM/URL extraheren
│   ├── popup/
│   │   ├── index.html
│   │   ├── main.tsx
│   │   └── App.tsx           # Completeness UI met kleurcodering
│   ├── options/
│   │   ├── index.html
│   │   └── Options.tsx       # Credentials-form voor admin
│   └── types/
│       └── akeneo.ts         # TypeScript types + DOMAIN_LOCALE_MAP
├── .claude/
│   └── PLAN.md                # Technisch MVP-plan
├── VISION.md                  # Waarom dit bestaat
├── PRODUCT.md                 # Scope en MVP-afbakening
├── AUTONOMY.md                # Grenzen voor AI-agents
├── decisions/log.md           # Beslissingenlog
└── DESIGN.md                  # Brandguide/design tokens (zelfde stijl als pimport)
```

## Styling

`DESIGN.md` bevat de design tokens (kleuren, typografie, spacing) — bewust in dezelfde stijl als pimport. Gebruik deze tokens, geen hardcoded waarden.

## Status

Interne tool voor LedKoning, fase 1 (read-only completeness-check). Geen externe distributie.
