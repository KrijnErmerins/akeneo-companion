# Product — Akeneo Companion

## Persona's

Content/PIM-collega: beoordeelt PDP's, wil in één oogopslag weten of de Akeneo-data compleet is voor een product. Dit is de enige persona — zie VISION.md.

## MVP — must-have (Fase 1, uit .claude/PLAN.md)

- Popup opent bij klik op extensie-icoon.
- Detecteert of de huidige pagina een LedKoning-domein is.
- Content script extraheert SKU uit DOM/URL.
- Background service worker haalt Akeneo-data op (OAuth2 password grant).
- Popup toont productnaam, SKU en completeness % per relevante locale, met kleurcodering.
- Options-pagina voor admin om Akeneo-credentials eenmalig in te voeren.

## MVP — nice-to-have (Fase 2, later)

- PDP-vergelijking: Akeneo-waarden naast de daadwerkelijke PDP-weergave, om discrepanties te tonen.
- Schrijftoegang (bewerken vanuit de extensie) — nu bewust nog geen onderdeel.

## Businessmodel

Niet van toepassing — dit is en blijft een intern LedKoning-hulpmiddel, geen verkocht product. Succes wordt gemeten in adoptie binnen het content/PIM-team, niet in omzet of klantaantallen (zie VISION.md, definitie van succes).

## Buiten scope (voorlopig)

- Distributie buiten LedKoning (Chrome Web Store, andere bedrijven).
- Multi-merk/i18n voor niet-LedKoning webshops.
- Schrijftoegang tot Akeneo.

## Afhankelijkheden

- Akeneo API-credentials: dezelfde omgeving/credentials als pimport. Let op — wijzigingen aan die gedeelde Akeneo-omgeving (bijv. credential-rotatie, environment-switch) raken dus ook deze extensie; zie AUTONOMY.md.
- LedKoning-domeinen en hun locale-mapping (`.nl` → nl_NL, `.be` → nl_BE, `.de` → de_DE — uit .claude/PLAN.md, uitbreiden bij nieuwe domeinen).
