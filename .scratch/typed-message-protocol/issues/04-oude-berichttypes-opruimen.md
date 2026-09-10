# 04: Oude berichttypes opruimen

**What to build:** Het oude protocol verdwijnt helemaal. Wie de code leest, vindt het berichtcontract nog maar op één plek: de messaging-module. Dit is de contract-stap: er verandert niets aan wat de popup toont.
- Weg: het oude berichttype met alleen optionele velden, de twee oude response-types en de oude background-router.
- De documentatie beschrijft de nieuwe berichtenstroom.

Spec: `.scratch/typed-message-protocol/spec.md` (Implementation Decisions, migratiestap 4).

**Blocked by:** 02 (Attribuutberichten over het nieuwe protocol, Akeneo-client geeft Records) en 03 (Content-kanaal over het nieuwe protocol, `SKU_DETECTED` eruit)

**Status:** ready-for-agent

- [ ] De oude background-router, die geen berichten meer afhandelt, is verwijderd. De background heeft alleen nog de handlers via de messaging-module.
- [ ] Het oude berichttype met optionele velden en de twee oude response-types zijn verwijderd uit de domeintypes. Daar staan alleen nog domeintypes en de locale-mapping.
- [ ] Nergens in de broncode staat nog een `as unknown as`-cast rond berichten of hun payloads.
- [ ] Geen code importeert of verwijst nog naar de verwijderde types.
- [ ] De architectuursectie in `CLAUDE.md` en de structuursectie in de README beschrijven de nieuwe berichtenstroom: de messaging-module, twee kanalen, en geen `SKU_DETECTED` meer. Andere verouderde punten in die docs blijven buiten dit ticket.
- [ ] `npm test` is groen, de build (type-check + bundle) slaagt en eslint geeft geen nieuwe waarschuwingen.
