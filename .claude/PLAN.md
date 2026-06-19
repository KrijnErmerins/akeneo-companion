# Plan: Akeneo Companion — Chrome Extension

## Context

Op LedKoning-PDPs worden regelmatig afwijkingen gesignaleerd. Het is onduidelijk of het probleem in Akeneo (incomplete/verkeerde data) of in de webshop-weergave zit. De extensie geeft medewerkers met één klik inzicht: is de Akeneo-data compleet voor dit product? Fase 2 voegt een PDP-vergelijking toe (Akeneo-waarden naast PDP-waarden).

---

## MVP Scope (Fase 1)

- Popup opent bij klik op extensie-icoon
- Detecteert de huidige URL — is het een LedKoning-domein?
- Content script extraheert SKU uit DOM of URL
- Background service worker haalt Akeneo-data op (OAuth2 password grant)
- Popup toont: productnaam, SKU, completeness % per relevante locale (kleurcodering)
- Options-pagina voor admin: Akeneo credentials invoeren (eenmalig)

Fase 2 (niet in MVP): PDP vs. Akeneo discrepantie-check, schrijftoegang.

---

## Technische beslissingen

### Stack
**React + TypeScript + Vite + `@crxjs/vite-plugin`**

### CORS
Chrome extensions met `host_permissions` in `manifest.json` mogen fetch-calls doen vanuit de background service worker zonder CORS-restrictie. Geen backend relay nodig.

### Auth
OAuth2 password grant (Akeneo's standaard):
- `POST /api/oauth/v1/token` met client_id + client_secret + username + password
- Token geldig 3600s — service worker cached het in memory, refresht automatisch
- Credentials opgeslagen in `chrome.storage.local` (nooit in page-context)
- Admin vult eenmalig in via Options-pagina

### SKU-detectie (content script)
1. JSON-LD (`@type: Product`, `sku`)
2. Meta tag `product:retailer_item_id`
3. URL-structuur (TODO: LedKoning-specifiek patroon bevestigen)

### Channel/locale mapping
| Domein-extensie | Akeneo locale |
|---|---|
| .nl | nl_NL |
| .be | nl_BE |
| .de | de_DE |

### Akeneo API-endpoints
- Auth: `POST /api/oauth/v1/token`
- Product: `GET /api/rest/v1/products/{sku}`
- Product Model: `GET /api/rest/v1/product-models/{code}`
- PDP kan product OF product model zijn — extensie probeert `/products/{sku}` eerst, bij 404 fallback naar `/product-models/{code}`

---

## Bestandsstructuur

```
akeneo-companion/
├── manifest.config.ts        # CRXJS manifest definitie
├── vite.config.ts
├── src/
│   ├── background/
│   │   ├── index.ts          # Service worker entry + message handler
│   │   ├── auth.ts           # Token manager (OAuth2)
│   │   └── akeneo.ts         # API client (product + product-model lookup)
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
│   └── PLAN.md               # Dit bestand
└── .env.example
```

---

## Volgende stappen (bouw)

1. `npm run build` uitvoeren — controleer of CRXJS een geldige `dist/` genereert
2. Extensie laden in Chrome via `chrome://extensions` → Load unpacked → `dist/`
3. SKU-detectie testen op een LedKoning PDP — console log in content script bevestigen
4. Options-pagina invullen met Akeneo credentials (bestaande API-client beschikbaar)
5. Popup testen op een product-PDP — completeness ophalen en tonen
6. Product model fallback testen op een PDP die geen simple product is
7. Locale-detectie testen op .be en .de domeinen

## Openstaande TODO's

- [ ] LedKoning-specifiek URL-patroon voor SKU-extractie bevestigen (stap 3 in SKU-detectie)
- [ ] Akeneo API base URL bevestigen (`ledkoning.cloud.akeneo.com` of andere)
- [ ] Product model completeness-structuur uit API valideren (anders dan simple product)
- [ ] Distributie-methode kiezen (Chrome Web Store / Google Admin / unpacked)
- [ ] Icons aanmaken (16px, 48px, 128px) in `public/icons/`
