# 01: Messaging-module, met het product-bericht volledig over het nieuwe protocol

**What to build:** De popup haalt het product voor de huidige SKU en locale op via het nieuwe, getypte background-kanaal van een nieuwe messaging-module. Voor de content/PIM-collega verandert er niets: de popup toont hetzelfde product of product model, de toolbar-badge toont het juiste percentage (ook als het product binnen 5 minuten opnieuw wordt geopend), en fouten uit Akeneo komen als dezelfde Nederlandstalige melding in de popup. Dit is de expand-stap: de vier attribuutberichten en het content-kanaal blijven voorlopig op het oude protocol draaien, naast het nieuwe.

Spec: `.scratch/typed-message-protocol/spec.md` (Implementation Decisions, migratiestap 1; Testing Decisions, seams 1 en 3).

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Er is een messaging-module met een getypte request→response-map voor het background-kanaal en een voor het content-kanaal. Het content-kanaal mag in dit ticket nog leeg zijn. Voor het background-kanaal staat alleen het product-bericht erin (SKU + locale → product-lookupresultaat).
- [ ] De module biedt per kanaal een verstuurfunctie die een Promise met getypte data teruggeeft, en een registratiefunctie voor async handlers.
- [ ] De Promise rejectt bij een mislukt antwoord (met de foutmelding), bij `chrome.runtime.lastError` en bij een ontbrekend antwoord.
- [ ] Op de lijn gaat een discriminated union: succes met data, of mislukking met een fout. Het type laat alleen JSON-serialiseerbare payloads toe.
- [ ] Een berichttype zonder geregistreerde handler krijgt geen antwoord: de listener geeft `false` terug en roept `sendResponse` niet aan.
- [ ] De module heeft een cache-helper (sleutel, TTL, fetch-functie).
- [ ] De module heeft een in-memory adapter voor tests: verstuurfuncties gaan direct naar de geregistreerde handlers, en elke payload en elk antwoord gaat door een JSON-round-trip.
- [ ] De background registreert de product-handler via de module. De cache-sleutel is SKU + locale, de TTL 5 minuten. De badge wordt bijgewerkt bij een verse lookup én bij een cache-treffer.
- [ ] De oude background-router handelt het product-bericht niet meer af en antwoordt niet meer op berichttypes die hij niet kent: geen `'Invalid message'`, gewoon `false` teruggeven. Zo wint hij de race niet van de nieuwe listener. De vier attribuutberichten blijven ongewijzigd in de oude router werken.
- [ ] De popup vraagt het product op via de verstuurfunctie van het background-kanaal. Foutmeldingen die de gebruiker ziet blijven gelijk.
- [ ] Background-tests via de in-memory adapter:
  - [ ] de volledige payloadvorm van het product-antwoord;
  - [ ] de badge-update bij een verse lookup en bij een cache-treffer;
  - [ ] een tweede aanroep binnen de TTL raakt de Akeneo-client niet, na de TTL wel;
  - [ ] een fout uit de Akeneo-client komt als rejectie bij de aanroeper.
- [ ] Tests van de chrome-adapter tegen de globale chrome-stub:
  - [ ] `lastError` leidt tot rejectie;
  - [ ] een mislukt antwoord leidt tot rejectie met de foutmelding;
  - [ ] een onbekend type krijgt geen `sendResponse` en de listener geeft `false` terug;
  - [ ] een async handler laat de listener `true` teruggeven en stuurt het antwoord later.
- [ ] Popup-tests stubben de messaging-client voor het product-bericht in plaats van `chrome.runtime.sendMessage`. De bestaande tests voor fouten en succes blijven slagen.
- [ ] De oude tests die `'Invalid message'` vastleggen zijn herschreven naar "onbekend type krijgt geen antwoord".
- [ ] `npm test` is groen, de build (type-check + bundle) slaagt en eslint geeft geen nieuwe waarschuwingen.
