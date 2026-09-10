# 03: Content-kanaal over het nieuwe protocol, `SKU_DETECTED` eruit

**What to build:** De popup vraagt de SKU en de PDP-gegevens (titel, prijs, EAN, afbeelding) aan de content script op via het getypte content-kanaal van de messaging-module. Voor de content/PIM-collega verandert er niets:
- de popup vindt de SKU van de PDP, ook na een variantwissel;
- de popup vindt de SKU ook als de content script nog niet draaide (via de bestaande injectie-fallback);
- de PDP-vergelijking toont de gescrapete waarden naast die uit Akeneo.

Het ongebruikte `SKU_DETECTED`-bericht, waar niemand naar luistert, verdwijnt uit het protocol.

Spec: `.scratch/typed-message-protocol/spec.md` (Implementation Decisions, migratiestap 3; Testing Decisions, seam 1 content-tests; Verificatie buiten unit tests).

**Blocked by:** 01 (Messaging-module, met het product-bericht volledig over het nieuwe protocol). Kan parallel met 02.

**Status:** ready-for-agent

- [ ] Het content-kanaal van de messaging-module bevat twee berichten: SKU opvragen (→ SKU of null) en PDP-gegevens opvragen (→ gescrapete PDP-velden). Beide hebben een getypte payload en een getypt antwoord.
- [ ] De content script registreert beide handlers via de messaging-module. De MutationObserver blijft de huidige SKU bijhouden, zodat de SKU-handler na een variantwissel de variant teruggeeft.
- [ ] De content script stuurt geen `SKU_DETECTED` meer. Dat berichttype staat nergens meer in het protocol.
- [ ] De `window`-variabele die de injectie-fallback van de popup uitleest blijft bestaan en wordt nog steeds bijgewerkt bij een variantwissel.
- [ ] De popup vraagt SKU en PDP-gegevens op via de verstuurfunctie van het content-kanaal (met het tab-id). Een rejectie (content script niet aanwezig) leidt tot hetzelfde injectie-fallbackpad als nu. Foutmeldingen die de gebruiker ziet blijven gelijk.
- [ ] Content-tests via de in-memory adapter:
  - [ ] de SKU-handler geeft de SKU uit de PDP terug;
  - [ ] na een wijziging van het SKU-element geeft hij de nieuwe variant-SKU terug;
  - [ ] de PDP-gegevens-handler geeft de gescrapete velden in de juiste vorm terug.
- [ ] Popup-tests stubben de messaging-client voor het content-kanaal in plaats van `chrome.tabs.sendMessage`. De bestaande test voor "geen SKU gevonden" blijft slagen.
- [ ] `npm test` is groen, de build (type-check + bundle) slaagt en eslint geeft geen nieuwe waarschuwingen.
- [ ] **Handmatig, aftekenen door Krijn:** de gebouwde extensie getest op een echte LedKoning-PDP. Gecontroleerd:
  - [ ] (a) een product;
  - [ ] (b) een product model;
  - [ ] (c) een variantwissel via een swatch, waarna de popup opnieuw wordt geopend;
  - [ ] (d) de popup op een tab die open stond vóór het herladen van de extensie (injectie-fallback).
  
  Het ticket is pas klaar na dit aftekenen (zie `AUTONOMY.md`).
