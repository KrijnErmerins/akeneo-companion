# Autonomiegrenzen — Akeneo Companion

## Agent mag zelfstandig

- Bugfixes binnen bestaande scope (SKU-detectie, completeness-weergave, locale-mapping).
- UI-aanpassingen binnen de popup/options-pagina.
- Nieuw domein/locale toevoegen aan `DOMAIN_LOCALE_MAP` / `HOSTNAME_LOCALE_MAP` (zie CLAUDE.md — beide plekken tegelijk bijwerken).
- Tests schrijven/uitbreiden.
- Fase 2-onderzoek/prototyping van de PDP-vergelijking, zolang dit read-only blijft en niet live gaat zonder akkoord.

## Vereist altijd akkoord vooraf

- Schrijftoegang toevoegen richting Akeneo (fase 2-uitbreiding buiten de huidige read-only scope).
- Wijzigingen aan hoe/waar Akeneo-credentials worden opgeslagen (nu: `chrome.storage.local`, nooit in page-context — zie CLAUDE.md).
- Elke wijziging die de gedeelde Akeneo-credentials/omgeving raakt die ook pimport gebruikt — eerst afstemmen, dit heeft impact buiten dit project.
- Distributie buiten "unpacked" installeren (Chrome Web Store publiceren, Google Admin-uitrol naar alle collega's).
- Nieuwe externe endpoints/derde partijen die data ontvangen.
- Uitbreiding naar domeinen/merken buiten LedKoning.

## Eskalatieroute bij twijfel

Stoppen en Krijn taggen — niet doorbouwen op een aanname bij twijfel of iets binnen bovenstaande grenzen valt.

## Project-specifieke verificatie-eisen (aanvullend op `references/rules.md`)

- Credentials nooit loggen (ook niet in console.log tijdens debuggen) — dit is een browserextensie, console-logs zijn voor iedereen met devtools zichtbaar.
- Bij wijzigingen aan SKU-detectie of completeness-weergave: testen op een echte LedKoning-PDP vóór als klaar markeren, niet alleen unit tests.
- Manifest V3-beperking bewaken: service worker kan gekilld worden — geen aannames dat state (bijv. token-cache) altijd nog leeft.
