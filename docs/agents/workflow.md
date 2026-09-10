# Werkwijze — van idee tot release

Hoe werk in deze repo loopt, met de engineering-skills (mattpocock-skills). Dit document is de afspraak; wijk er alleen bewust van af.

De meeste skills hieronder zijn **door de gebruiker te starten** (slash-command). Een agent kan ze niet zelf aanroepen — die zegt welke skill nu aan de beurt is.

## Hoofdroute: idee → release

```
/grill-with-docs ──► (prototype?) ──► /to-spec ──► /to-tickets ──► /implement per ticket
       │                                                              │
       └── één sessie? ───────────────────────────────────────────────┘ /implement direct
```

### 1. `/grill-with-docs` — idee aanscherpen

Interview tot alle vragen beantwoord zijn. Legt vast wat het leert:

- nieuwe of verscherpte begrippen → `CONTEXT.md`
- architectuurbeslissingen → `docs/adr/`
- product-/scopebeslissingen → `decisions/log.md` (bestaand formaat)

Gebruik **niet** `/grill-me` in deze repo: dezelfde vragen, maar slaat niets op. `/grill-me` is voor ideeën zonder repo eronder.

**Check vóór je verder gaat:** raakt het idee een non-goal (`VISION.md`) of een "akkoord vooraf"-punt (`AUTONOMY.md`) — schrijftoegang naar Akeneo, credential-opslag, gedeelde pimport-omgeving, nieuwe externe endpoints, distributie? Dan eerst akkoord van Krijn, niet doorbouwen.

### 2. Optioneel: prototype

Is een vraag alleen met draaiende code te beantwoorden (state, business-logica, een UI die je moet zien)?

1. `/handoff` → nieuwe sessie
2. `/prototype` → wegwerpcode die één vraag beantwoordt, bewaard op branch `prototype/<naam>`
3. `/handoff` terug → verwijs ernaar vanuit de oorspronkelijke thread

Voor popup-UI: bekijk het prototype in Chrome (unpacked `dist/`) op een echte LedKoning-PDP.

### 3. Eén sessie of meerdere?

**Meerdere sessies:**

1. `/to-spec` — zet de thread om in `.scratch/<feature>/spec.md`. Geen nieuw interview; spreekt de testseams af.
2. `/to-tickets` — knipt de spec in tracer-bullet tickets: `.scratch/<feature>/issues/NN-<slug>.md`, elk met `Blocked by:` en `Status: ready-for-agent`.
3. Per ticket `/implement`, met **`/clear` tussen elk ticket**. Werk de frontier af: tickets waarvan alle blockers klaar zijn, laagste nummer eerst.

**Eén sessie:** direct `/implement` in dezelfde context.

`/implement` bouwt via `/tdd` (red-green, één slice tegelijk) en sluit af met `/code-review` (standaarden + spec) vóór de commit.

### Contexthygiëne

Stap 1 t/m `/to-tickets` in **één ononderbroken contextvenster** — niet compacten of clearen, zodat grilling, spec en tickets op dezelfde denkstappen bouwen. Nadert de sessie ~150k tokens vóór `/to-tickets`: `/compact` bij de dichtstbijzijnde fasegrens. Elke `/implement` start daarna vers vanuit het ticket.

## Andere ingangen

| Situatie | Skill | Daarna |
|---|---|---|
| Binnengekomen bugs/verzoeken (niet zelf gemaakt) | `/triage` | levert `ready-for-agent`-tickets → `/implement` |
| Iets is stuk en hardnekkig | `/diagnosing-bugs` | eerst een commando dat rood gaat op déze bug, dan fix + regressietest |
| Groot, mistig traject (bv. heel fase 2) | `/wayfinder` | kaart met beslissingstickets → daarna `/to-spec` |

Tickets uit `/to-tickets` zijn al agent-klaar: **niet** triagen.

## Onderhoud

- **`/improve-codebase-architecture`** — als er ruimte is. Zoekt verdiepingskansen (ondiepe modules, lekkende seams), rapporteert als HTML. Een gekozen kandidaat wordt een nieuw idee → terug naar stap 1.
- **`/code-review <ref>`** — review van een diff tegen een vast punt (commit/tag).

## Losse hulpmiddelen

- `/research` — achtergrondagent leest bronnen, levert een geciteerd markdown-bestand; input voor `/grill-with-docs`.
- `/to-questionnaire` — als het antwoord bij iemand anders ligt (bv. het content/PIM-team).
- `/wait-what` — als een uitleg niet landde.
- `/domain-modeling`, `/codebase-design` — vocabulaire; worden meestal door andere skills aangeroepen.

## Repo-specifieke regels die in elke fase gelden

- **Build na elke wijziging in `src/`**: `.\node_modules\.bin\tsc -b; if ($?) { .\node_modules\.bin\vite build }`
- **Tests** vóór commit bij logica-wijzigingen: `npm test`
- **Echte PDP**: wijzigingen aan SKU-detectie of completeness-weergave testen op een echte LedKoning-PDP, niet alleen unit tests.
- **Git**: direct committen en pushen op `main`, geen branches/PR's (behalve `prototype/<naam>`).
- **UI-teksten** in het Nederlands.

## Planning: vervangt `/writing-plans`

In deze repo vervangen `/to-spec` + `/to-tickets` de globale `/writing-plans`, en `/implement` vervangt `/executing-plans`. Gebruik die twee niet hier. Het plan voor een niet-triviale taak is de spec in `.scratch/<feature>/spec.md` plus de tickets eronder. Zie `decisions/log.md` (2026-09-10).
