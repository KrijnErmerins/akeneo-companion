# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

`tsc` and `vite` are not globally available — always run them via local binaries:

```powershell
# Build (type-check + bundle)
.\node_modules\.bin\tsc -b; if ($?) { .\node_modules\.bin\vite build }

# Lint
.\node_modules\.bin\eslint .

# Dev (hot-reload, loads unpacked from dist/)
.\node_modules\.bin\vite
```

`npm run build` currently fails on Windows because `tsc` isn't in PATH. Use the local binary invocations above instead.

After any build, load the extension in Chrome via **chrome://extensions → Load unpacked → select `dist/`**.

## Credentials

Akeneo credentials are embedded at build time via a `.env` file (gitignored). Copy `.env.example` to `.env` and fill in:

```
VITE_AKENEO_BASE_URL=
VITE_AKENEO_CLIENT_ID=
VITE_AKENEO_CLIENT_SECRET=
VITE_AKENEO_USERNAME=
VITE_AKENEO_PASSWORD=
```

The credentials object at `src/background/credentials.ts` reads these via `import.meta.env`. The options page (`src/options/`) can also write credentials to `chrome.storage.local` at runtime, but the build-time `.env` values take precedence in `credentials.ts`.

## Architecture

**Message flow:** Popup → Background SW → Akeneo API → Popup

1. When a product page loads, `src/content/sku-detector.ts` extracts the SKU and pushes a `SKU_DETECTED` message to the background service worker. It also responds to `GET_SKU` messages from the popup on demand.

2. `src/background/index.ts` listens for `GET_PRODUCT` messages from the popup, calls `lookupProduct()`, and returns the result.

3. `src/background/akeneo.ts` queries `/api/rest/v1/products/{sku}` first; on 404 it falls back to `/api/rest/v1/product-models/{sku}`.

4. `src/background/auth.ts` holds a module-level `cachedToken`. The service worker is persistent across a browser session, so the token survives between popup opens.

5. `src/popup/App.tsx` sends a `GET_PRODUCT` message to the background and renders the response as an attribute table with fill-rate badge.

**Locale resolution:** `src/types/akeneo.ts` exports `DOMAIN_LOCALE_MAP` (TLD → locale) and `HOSTNAME_LOCALE_MAP` (full hostname → locale, for staging). The same maps are duplicated inline in `src/content/sku-detector.ts` — keep them in sync when adding new domains.

**Adding a new storefront domain:** Update `content_scripts.matches` and `host_permissions` in `manifest.config.ts`, and add the TLD/hostname to both `DOMAIN_LOCALE_MAP`/`HOSTNAME_LOCALE_MAP` in `src/types/akeneo.ts` and the inline maps in `src/content/sku-detector.ts`.

## Behavioral Guidelines

### 1. Think Before Coding

Before implementing: state assumptions explicitly, surface multiple interpretations instead of picking silently, push back when a simpler approach exists, and stop to ask when something is unclear.

### 2. Simplicity First

Minimum code that solves the problem. No unrequested features, abstractions, flexibility, or error handling for impossible scenarios. If it could be 50 lines, don't write 200.

### 3. Surgical Changes

Touch only what the request requires. Don't improve adjacent code, comments, or formatting. Match existing style. If unrelated dead code is spotted, mention it — don't delete it. Remove only imports/variables/functions that *your* changes made unused.

### 4. Goal-Driven Execution

Transform tasks into verifiable goals before starting. For multi-step tasks, state a brief plan with a verify step for each:

```text
1. [Step] → verify: [check]
2. [Step] → verify: [check]
```

## Key Constraints

- **Manifest V3** — no persistent background pages; the service worker can be killed. Token cache in `auth.ts` is module-level and survives within a session but not across browser restarts.
- **No test suite** exists yet.
- The popup is fixed at 340×200px (set in `manifest.config.ts` via `default_popup`).
- All UI strings are in Dutch.
