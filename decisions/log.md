# Beslissingenlog — Akeneo Companion

Append-only. Format: `[YYYY-MM-DD] BESLISSING: ... | REDENERING: ... | CONTEXT: ...`

[2026-07-17] BESLISSING: Akeneo Companion blijft een blijvend intern LedKoning-hulpmiddel, geen extern/commercieel product | REDENERING: doelgroep is uitsluitend het content/PIM-team, geen behoefte aan pricing, klantbeheer of externe distributie | CONTEXT: fundering-ronde (VISION.md, PRODUCT.md, AUTONOMY.md) opgezet naar aanleiding van de nieuwe funderingseis voor SaaS-/productprojecten in `references/projects.md` (LK - Agent).

[2026-07-17] BESLISSING: extensie gebruikt dezelfde Akeneo-credentials/omgeving als pimport | REDENERING: één bestaande, werkende Akeneo-verbinding hergebruiken in plaats van een los service-account op te zetten | CONTEXT: zie AUTONOMY.md — wijzigingen aan die gedeelde omgeving vereisen altijd akkoord vooraf omdat ze ook pimport raken.

[2026-09-10] BESLISSING: in deze repo vervangen `/to-spec` + `/to-tickets` de globale `/writing-plans`, en `/implement` vervangt `/executing-plans` | REDENERING: de mattpocock-flow legt spec en tickets vast in de repo (`.scratch/`), met blocking edges en testseams, en sluit aan op `/grill-with-docs` en `/implement`; twee planningsroutes naast elkaar leidt tot dubbel plannen | CONTEXT: setup van de engineering-skills (`docs/agents/`, flow in `docs/agents/workflow.md`); de globale instructie in `~/.claude/CLAUDE.md` blijft voor andere projecten ongewijzigd.
