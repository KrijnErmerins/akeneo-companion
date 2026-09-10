# Spec: getypt message-protocol

**Status:** ready-for-agent

Bron: architectuurreview 2026-09-10, kandidaat A ("getypt message-protocol"), uitgewerkt in twee grilling-rondes. Termen volgen `CONTEXT.md`.

## Problem Statement

De extensie bestaat uit drie delen die via berichten met elkaar praten: de popup, de background service worker en de content script op de PDP. Het contract tussen die delen staat nergens op één plek en de compiler controleert het niet.

- Het berichttype is één interface met alleen optionele velden. Elke handler moet zelf controleren wat er wel en niet meekomt.
- Eén response-type wordt voor vier verschillende payloads misbruikt. Payloads worden aan beide kanten weggecast. De compiler ziet dus niet wanneer een payload van vorm verandert.
- Dat heeft al een bug in productie gebracht: attribuutgroepering werkte niet, omdat Maps het berichtkanaal niet overleven. Alle tests bleven groen, want de background-tests controleren alleen `success` en nooit de vorm van de payload.
- Popup → content script (`GET_SKU`, `GET_PDP_DATA`) valt helemaal buiten het type. De content script stuurt een `SKU_DETECTED` waar niemand naar luistert. De background antwoordt daar `'Invalid message'` op, en een test legt dat vast.
- Elke background-handler herhaalt hetzelfde patroon: validatie, eigen cache, credentials laden, Akeneo aanroepen, antwoorden, `true` teruggeven. Dat staat er vijf keer.
- Elke aanroeper in de popup moet zelf `lastError` en `success` controleren, in geneste callbacks.

Voor het content/PIM-team betekent dit dat bugs in wat de popup toont (groepering, optielabels, completeness) makkelijk ongemerkt in productie komen. Fase 2 (PDP-vergelijking) voegt meer berichten toe, en elk nieuw bericht maakt het huidige patroon groter.

## Solution

Eén messaging-module bezit het hele berichtcontract tussen popup, background en content script.

- Per kanaal is er één getypte request→response-map: berichten naar de background en berichten naar de content script. Voor elk berichttype ligt vast welke payload erbij hoort en welk antwoord terugkomt.
- Aanroepers sturen een bericht via één functie per kanaal en krijgen een Promise met de getypte data terug. Die Promise rejectt bij elke fout.
- Handlers registreren zich getypt per kanaal. De module regelt `sendResponse`, `return true` en het foutformaat.
- Er gaan alleen JSON-serialiseerbare payloads over de seam. Maps en andere niet-serialiseerbare waarden kunnen er niet meer doorheen.
- Eén generieke cache-helper vervangt de vijf handgeschreven caches.

Voor de gebruiker verandert er niets zichtbaars: de popup toont hetzelfde. Wat verandert: de compiler en de tests vangen dit soort bugs voortaan af, voordat het team ze op een PDP tegenkomt.

## User Stories

1. As a content/PIM-collega, I want de popup exact dezelfde productgegevens te blijven tonen als nu, so that de ombouw mijn werk niet verstoort.
2. As a content/PIM-collega, I want attributen correct per attribute group gegroepeerd te zien, so that ik snel het juiste deel van de productdata vind.
3. As a content/PIM-collega, I want optielabels van select-attributen in mijn locale te zien in plaats van ruwe codes, so that ik waarden kan beoordelen zonder Akeneo te openen.
4. As a content/PIM-collega, I want een duidelijke Nederlandstalige foutmelding als Akeneo niet bereikbaar is of het product niet bestaat, so that ik weet of het aan de data of aan de verbinding ligt.
5. As a content/PIM-collega, I want dat de toolbar-badge na het openen van de popup het percentage voor dit product toont, ook als het product net al bekeken was, so that de badge betrouwbaar blijft.
6. As a content/PIM-collega, I want dat een tweede keer openen van de popup voor dezelfde SKU binnen enkele minuten snel is, so that ik vlot tussen PDP's kan wisselen.
7. As a content/PIM-collega, I want dat de popup nog steeds de SKU vindt als de content script nog niet op de pagina draaide, so that ik niet eerst hoef te verversen.
8. As a content/PIM-collega, I want dat de PDP-gegevens (titel, prijs, EAN, afbeelding) nog steeds naast de Akeneo-waarden verschijnen, so that de PDP-vergelijking blijft werken.
9. As a content/PIM-collega, I want dat de popup werkt voor zowel een product als een product model, so that elke PDP bruikbaar blijft.
10. As a developer, I want voor elk berichttype op één plek zien welke payload erin gaat en welk antwoord eruit komt, so that ik niet door vier bestanden hoef te zoeken.
11. As a developer, I want een compile-fout als ik een bericht met een verkeerde of ontbrekende payload stuur, so that fouten niet pas in de browser opduiken.
12. As a developer, I want een compile-fout als een handler een antwoord van de verkeerde vorm teruggeeft, so that popup en background het nooit oneens kunnen zijn over een payload.
13. As a developer, I want een compile-fout als ik een content-script-bericht naar de background stuur of andersom, so that berichten nooit op het verkeerde kanaal belanden.
14. As a developer, I want dat een niet-serialiseerbare payload (zoals een Map) niet over de seam kan, so that de Map-bug niet terugkomt.
15. As a developer, I want een bericht versturen en een Promise met getypte data terugkrijgen, so that ik geen geneste callbacks en handmatige `lastError`-checks hoef te schrijven.
16. As a developer, I want dat die Promise rejectt bij een fout uit de handler, een `lastError` of een ontbrekend antwoord, so that foutafhandeling op één plek (een catch) zit.
17. As a developer, I want een handler als gewone async functie schrijven, so that ik `sendResponse` en `return true` niet zelf hoef te beheren.
18. As a developer, I want dat berichttypes zonder handler geen antwoord krijgen, so that een listener nooit de race wint van de listener die het bericht wél afhandelt.
19. As a developer, I want één cache-helper met sleutel en TTL die ik in een handler om een Akeneo-aanroep zet, so that ik geen eigen cache-structuur per berichttype hoef te bouwen.
20. As a developer, I want dat bijwerkingen zoals de toolbar-badge in de handler blijven en ook bij een cache-treffer draaien, so that caching geen gedrag verandert.
21. As a developer, I want dat de Akeneo-client JSON-serialiseerbare structuren teruggeeft, so that er nergens conversie van en naar Maps nodig is.
22. As a developer, I want dat domeintypes (product, product model, family, attribute group) los staan van de berichttypes, so that het domeinmodel niet vervuild raakt met transportdetails.
23. As a developer, I want background-handlers kunnen testen door een bericht via de messaging-interface te sturen en het getypte antwoord te controleren, so that tests de echte payloadvorm raken en niet alleen `success`.
24. As a developer, I want dat de test-adapter elke payload door een JSON-round-trip haalt, so that serialisatiefouten in tests rood worden, net als in de browser.
25. As a developer, I want popup-tests schrijven door de messaging-client te stubben, so that ik geen chrome-callbackketens in exacte volgorde hoef na te bootsen.
26. As a developer, I want content-script-handlers kunnen testen via dezelfde interface als de popup ze aanroept, so that het content-kanaal net zo goed gedekt is als het background-kanaal.
27. As a developer, I want dat de chrome-specifieke adapter apart getest wordt op `lastError`, foutantwoorden, onbekende types en asynchrone handlers, so that het productiepad dezelfde garanties heeft als de test-adapter.
28. As a developer, I want dat het ongebruikte `SKU_DETECTED`-bericht verdwijnt, so that er geen dode routes in het protocol zitten die toekomstige lezers misleiden.
29. As a developer (fase 2), I want een nieuw berichttype toevoegen door één entry in de request→response-map en één handler, so that nieuwe features het protocol niet uitbreiden met extra boilerplate.
30. As a developer, I want dat de migratie in kleine stappen gebeurt waarin de extensie steeds werkt en de tests groen blijven, so that ik elke stap los kan verifiëren en releasen.

## Implementation Decisions

**Nieuwe module: messaging-module**
- Bezit het volledige berichtcontract tussen popup, background en content script. Is de enige plek die de chrome messaging-API's aanroept.
- Twee request→response-maps, één per kanaal:
  - **Background-kanaal**: product ophalen (SKU + locale → product-lookupresultaat), family-attributen (family-code → lijst attributen met required-vlag), attribuuttypes (family-code → per attribuutcode type en group), attribuutopties (attribuutcode → per optiecode labels per locale), attribute groups (geen payload → per groepcode labels per locale en sorteervolgorde).
  - **Content-kanaal**: SKU opvragen (→ SKU of null) en PDP-gegevens opvragen (→ gescrapete PDP-velden).
- Interface voor aanroepers: één verstuurfunctie per kanaal. De functie voor het content-kanaal neemt ook het tab-id. Beide geven een Promise met de getypte response-data.
- Interface voor handlers: één registratiefunctie per kanaal, met een object van async handlers per berichttype. Een handler krijgt de getypte payload en geeft getypte data terug of gooit een fout.
- Een cache-helper: sleutel, TTL en een fetch-functie; binnen de TTL komt het gecachte resultaat terug. Handlers roepen hem zelf aan rond de Akeneo-aanroep.
- Een in-memory adapter die alleen tests gebruiken: verstuurfuncties gaan direct naar de geregistreerde handlers, en elke payload en elk antwoord gaat door een JSON-round-trip.
- De chrome-adapter is intern en maakt geen deel uit van de interface.

**Draadformaat en fouten**
- Op de lijn gaat een discriminated union: succes met data, of mislukking met een foutmelding.
- De verstuurfunctie rejectt bij een mislukking, bij `chrome.runtime.lastError` en bij een ontbrekend antwoord.
- Een berichttype zonder handler krijgt geen antwoord: de listener geeft `false` terug en roept `sendResponse` niet aan. Het huidige `'Invalid message'`-antwoord verdwijnt.
- Validatiefouten over ontbrekende payloadvelden bestaan niet meer tijdens runtime. De compiler dwingt de verplichte velden af.
- Payloads en antwoorden zijn JSON-serialiseerbaar. Het type laat bij voorkeur geen Map, Set, functie of klasse-instantie toe.
- Geen runtime-validatie (zoals zod): alle kanalen zijn intern, en de JSON-round-trip in tests dekt het serialisatierisico.
- Zelf geschreven, geen externe messaging-library.

**Aangepaste modules**
- **Akeneo-client module**: de functies voor attribuuttypes, attribuutopties en attribute groups geven gewone objecten (Records) terug in plaats van Maps. Het ophalen zelf (endpoints, paginering, 401-retry) verandert niet.
- **Background**: registreert de vijf handlers via de messaging-module. Gebruikt de cache-helper met dezelfde TTL van 5 minuten en dezelfde cache-sleutels (product: SKU + locale; family, types: family-code; opties: attribuutcode; groups: één sleutel). De badge-update blijft in de product-handler en draait ook bij een cache-treffer. Credentials laden verandert niet.
- **Content script**: registreert de handlers voor SKU en PDP-gegevens via de messaging-module. Stuurt geen `SKU_DETECTED` meer. De MutationObserver blijft de huidige SKU bijhouden voor de SKU-handler. De `window`-variabele voor de injectie-fallback van de popup blijft zoals hij is.
- **Popup**: vervangt alle chrome-berichtaanroepen door de verstuurfuncties. Zet ontvangen Records waar nodig om naar de interne state. De volgorde en afhankelijkheden van de effects blijven gelijk; alleen de aanroepen veranderen. De injectie-fallback met `executeScript` blijft zoals hij is.
- **Domeintypes**: het berichttype met optionele velden en de twee oude response-types verdwijnen. Domeintypes (product-lookupresultaat, family-attribuut, PDP-gegevens, diff-velden, credentials) en de locale-mapping blijven.

**Migratievolgorde** (elke stap laat de extensie werken en de tests groen):
1. Messaging-module met beide adapters. Het product-bericht gaat als eerste volledig over het nieuwe protocol: van popup via background terug naar popup.
2. De vier attribuutberichten naar het nieuwe protocol, samen met de Akeneo-client die Records teruggeeft.
3. Het content-kanaal naar het nieuwe protocol, en `SKU_DETECTED` eruit.
4. De oude berichttypes en response-types opruimen, en controleren dat er geen casts van het type `as unknown as` meer rond berichten staan.

## Testing Decisions

**Wat een goede test hier is**
- Een test stuurt een bericht via de interface van de messaging-module en controleert wat terugkomt: de volledige getypte payload, niet alleen `success`. Hij controleert ook zichtbare bijwerkingen (badge, het aantal Akeneo-aanroepen). Interne structuur (welke cache-map, hoe de listener is opgebouwd) wordt niet getest.
- De interface is het testoppervlak: callers en tests gaan over dezelfde seam.

**Seams**
1. **Interface van de messaging-module** (hoofd-seam), via de in-memory adapter met JSON-round-trip.
   - Background-tests: echte handlers registreren, berichten versturen via de background-verstuurfunctie. Controleren: payloadvorm per berichttype; badge-update bij een verse lookup én bij een cache-treffer; tweede aanroep binnen de TTL raakt de Akeneo-client niet; na de TTL wel; fouten uit de Akeneo-client komen als rejectie bij de aanroeper; onbekend type krijgt geen antwoord.
   - Content-tests: SKU- en PDP-handlers via de content-verstuurfunctie; SKU volgt een variantwissel via de MutationObserver.
   - Popup-tests: de messaging-client stubben in plaats van `chrome.runtime.sendMessage`-ketens. `chrome.tabs.query` en `chrome.scripting.executeScript` blijven via de globale chrome-stub gemockt.
2. **Akeneo-client module**: blijft gemockt in background-tests zoals nu; alleen de mock-returnwaarden worden Records. De eigen tests van de Akeneo-client worden bijgewerkt voor de Records.
3. **Chrome-adapter** (interne seam van de messaging-module), getest tegen de bestaande globale chrome-stub: `lastError` leidt tot rejectie; een mislukt antwoord leidt tot rejectie met de foutmelding; een onbekend type krijgt geen `sendResponse` en de listener geeft `false` terug; een asynchrone handler laat de listener `true` teruggeven en stuurt later het antwoord.

**Regressietest voor de Map-bug**
- Een test die aantoont dat attribute groups en attribuutopties na de JSON-round-trip nog hun inhoud hebben (labels en sorteervolgorde). Met het oude Map-formaat zou deze test rood worden.

**Prior art**
- De globale chrome-stub in de test-setup (storage, runtime, tabs, scripting, action) blijft de basis.
- De background-tests die de Akeneo-client en credentials mocken en de listener via een `invoke`-helper aanroepen. Die helper wordt vervangen door de in-memory adapter.
- De popup-tests met helpers voor tab, SKU en product (`stubTab`, `stubSku`, `stubProduct`). `stubSku` en `stubProduct` worden stubs van de messaging-client.
- De twee tests die `'Invalid message'` vastleggen worden herschreven naar "onbekend type krijgt geen antwoord".

**Verificatie buiten unit tests**
- Build (type-check + bundle) na elke stap.
- Stap 3 raakt de SKU-detectie. Die stap moet getest worden op een echte LedKoning-PDP, zowel met een product als met een product model, en met een variantwissel (zie `AUTONOMY.md`).

## Out of Scope

- **Eén query voor de productsheet** (kandidaat B): de vier attribuutberichten blijven in deze spec als losse berichttypes bestaan. Samenvoegen gebeurt later.
- **Eén set completeness-regels** (kandidaat C): badge, popup en PDP-diff blijven hun eigen berekening houden.
- **Credentials en verbinding** (kandidaat D): de cache houdt geen rekening met gewijzigde credentials, en de options-pagina houdt zijn eigen token-aanroep. Wijzigingen daaraan vereisen volgens `AUTONOMY.md` eerst akkoord.
- **De huidige PDP ophalen vanuit de popup** (kandidaat E): de injectie-fallback, de `window`-variabele en de crashpaden bij een tab zonder URL blijven zoals ze zijn. Variantwissels bereiken een open popup nog steeds niet.
- **De eslint-waarschuwing** over ontbrekende dependencies in het optie-effect van de popup: niet repareren, want kandidaat B haalt dat effect weg.
- **De toolbar-badge met twee schrijvers** (update-melding wordt overschreven door het percentage).
- Schrijftoegang naar Akeneo, nieuwe berichttypes voor fase 2, runtime-validatie, een externe messaging-library.

## Further Notes

- Commit 7e35570 is de concrete aanleiding: Map-payloads overleefden `chrome.runtime.sendMessage` niet, en de groepering werkte daardoor niet, terwijl alle tests groen waren.
- De popup-effects hebben een bekend stale-closure-risico: het optie-effect leest de productwaarden maar hangt alleen af van de family. Dat blijft bewust staan (zie Out of Scope) en valt weg met kandidaat B.
- Na deze spec zijn kandidaten B en C de logische vervolgstappen. Ze worden veiliger doordat de compiler dan de payloadvormen bewaakt.
- UI-teksten blijven Nederlands. Foutmeldingen die de gebruiker ziet veranderen niet.
