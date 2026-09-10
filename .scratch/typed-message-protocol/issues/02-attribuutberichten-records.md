# 02: Attribuutberichten over het nieuwe protocol, Akeneo-client geeft Records

**What to build:** De popup haalt family-attributen, attribuuttypes, attribuutopties en attribute groups op via het getypte background-kanaal. Er gaan geen Maps meer over de seam: de Akeneo-client levert gewone objecten en de popup krijgt ze in die vorm binnen. Voor de content/PIM-collega verandert er niets: attributen staan correct gegroepeerd per attribute group, in de juiste volgorde, en select-attributen tonen optielabels in de locale van de storefront. De bug uit commit 7e35570 (groepering werkte niet, omdat Maps het berichtkanaal niet overleven) kan niet meer terugkomen.

Spec: `.scratch/typed-message-protocol/spec.md` (Implementation Decisions, migratiestap 2; Testing Decisions, regressietest Map-bug).

**Blocked by:** 01 (Messaging-module, met het product-bericht volledig over het nieuwe protocol)

**Status:** ready-for-agent

- [ ] Het background-kanaal van de messaging-module bevat de vier attribuutberichten, elk met een getypte payload en een getypt antwoord:
  - [ ] family-code → lijst attributen met required-vlag;
  - [ ] family-code → type en group per attribuutcode;
  - [ ] attribuutcode → labels per locale per optiecode;
  - [ ] geen payload → labels per locale en sorteervolgorde per groepcode.
- [ ] De functies van de Akeneo-client voor attribuuttypes, attribuutopties en attribute groups geven gewone objecten (Records) terug in plaats van Maps. Endpoints, paginering en de 401-retry veranderen niet.
- [ ] De background registreert de vier handlers via de messaging-module en gebruikt de cache-helper met dezelfde sleutels als nu (family-code, attribuutcode, één sleutel voor groups) en een TTL van 5 minuten. De handgeschreven caches voor deze berichten zijn weg.
- [ ] De oude background-router handelt deze vier berichten niet meer af.
- [ ] De popup vraagt alle vier op via de verstuurfunctie van het background-kanaal en zet de ontvangen objecten waar nodig om naar de interne state. Volgorde en afhankelijkheden van de effects blijven gelijk; de bekende eslint-waarschuwing over dependencies in het optie-effect blijft bewust staan (buiten scope).
- [ ] Er staan geen `as unknown as`-casts meer rond deze vier berichten, niet in de background en niet in de popup.
- [ ] Background-tests via de in-memory adapter controleren de volledige payloadvorm van elk van de vier antwoorden, en dat een tweede aanroep binnen de TTL de Akeneo-client niet raakt.
- [ ] Regressietest: attribute groups en attribuutopties hebben na de JSON-round-trip nog hun inhoud (labels en sorteervolgorde). Met het oude Map-formaat zou deze test rood worden.
- [ ] De eigen tests van de Akeneo-client zijn bijgewerkt voor de Records.
- [ ] Popup-tests stubben de messaging-client voor deze berichten in plaats van `chrome.runtime.sendMessage`.
- [ ] `npm test` is groen, de build (type-check + bundle) slaagt en eslint geeft geen nieuwe waarschuwingen.
