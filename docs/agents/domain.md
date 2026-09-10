# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

Layout: **single-context** (one `CONTEXT.md` + `docs/adr/` at the repo root).

## Before exploring, read these

- **`CONTEXT.md`** at the repo root: the domain glossary.
- **`docs/adr/`**: read ADRs that touch the area you're about to work in.
- **`decisions/log.md`**: the project's append-only decision log (product, scope and ownership decisions). Treat its entries with the same weight as ADRs.
- **`VISION.md`, `PRODUCT.md`, `AUTONOMY.md`**: why this exists, MVP scope, and what needs sign-off first. Don't propose work that crosses a non-goal or an "akkoord vooraf" line without flagging it.

If `CONTEXT.md` or `docs/adr/` don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates them lazily when terms or decisions actually get resolved.

## Where new decisions go

- **Architecture / code-shape decisions** (seams, module shape, a rejected refactor with a load-bearing reason) → an ADR in `docs/adr/`.
- **Product / scope / ownership decisions** → a line in `decisions/log.md`, using its existing format: `[YYYY-MM-DD] BESLISSING: ... | REDENERING: ... | CONTEXT: ...`

## File structure

```
/
├── CONTEXT.md
├── docs/adr/
│   └── 0001-<slug>.md
├── decisions/log.md
└── src/
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal: either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR or a `decisions/log.md` entry, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0007 (event-sourced orders), but worth reopening because…_
