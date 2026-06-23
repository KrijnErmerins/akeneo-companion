---
version: alpha
name: Pimport-design-analysis
description: "A calm, professional admin interface for an Akeneo PIM sync tool — white content canvas on a soft off-white body, anchored by a deep slate sidebar (#1F2937) that carries the navigation. Brand voltage is a single trustworthy blue (#4386F0) used for primary actions, active states, and the logo; everything else is restrained grays, hairline borders, and barely-there shadows. Type runs GT America for headings and Open Sans for body at modest weights. Built on Bootstrap 5, so every token below maps to a CSS custom property in app/static/css/styles.css. Edit the seed values to re-skin the whole app — derived tokens recompute automatically via color-mix()."

colors:
  primary: "#4386F0"
  primary-dark: "#2D6DE0"
  primary-darker: "#1A56C8"
  primary-light: "#E8F0FE"
  primary-mid: "#C5D8FC"
  accent: "#4386F0"
  secondary: "#6B7280"
  on-primary: "#000000"
  on-brand: "#FFFFFF"
  ink: "#333333"
  body: "#4B5563"
  muted: "#6B7280"
  canvas: "#FFFFFF"
  body-bg: "#F8FAFC"
  surface: "#F8FAFC"
  surface-soft: "#FAFAFA"
  surface-strong: "#F4F5F7"
  hairline: "#E2E8F0"
  hairline-soft: "#F4F5F7"
  border-strong: "#D1D5DB"
  sidebar-bg: "#1F2937"
  sidebar-text: "#F9FAFB"
  sidebar-icon: "#AAC9F8"
  sidebar-section: "#626973"
  sidebar-active-bg: "#2D6DE0"
  success: "#22C55E"
  success-text: "#166534"
  danger: "#DC2626"
  danger-text: "#991B1B"
  warning: "#F59E0B"
  warning-text: "#92400E"
  info: "#3B82F6"
  info-text: "#1E40AF"
  overlay-scrim: "#000000"

typography:
  page-title:
    fontFamily: "GT America, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: 30px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.025em
  section-heading:
    fontFamily: "GT America, sans-serif"
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: 0
  card-heading:
    fontFamily: "GT America, sans-serif"
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: 0
  subheading:
    fontFamily: "GT America, sans-serif"
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: 0
  stat-number:
    fontFamily: "GT America, sans-serif"
    fontSize: 30px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: 0
  body:
    fontFamily: "Open Sans, system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0
  body-sm:
    fontFamily: "Open Sans, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  label:
    fontFamily: "Open Sans, sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0
  button:
    fontFamily: "Open Sans, sans-serif"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0
  nav-link:
    fontFamily: "Open Sans, sans-serif"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0
  table-header:
    fontFamily: "Open Sans, sans-serif"
    fontSize: 11px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0.06em
  badge:
    fontFamily: "Open Sans, sans-serif"
    fontSize: 11px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0.02em

rounded:
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  btn: 8px
  card: 12px
  modal: 16px
  pill: 999px
  full: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 20px
  xl: 24px
  xxl: 32px
  section: 24px
  page-x: 32px
  page-y: 24px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.btn}"
    padding: 7px 14px
  button-primary-hover:
    backgroundColor: "{colors.primary-dark}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.btn}"
  button-action:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.btn}"
    padding: 7px 14px
    fontWeight: 600
  button-secondary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.body}"
    typography: "{typography.button}"
    rounded: "{rounded.btn}"
    padding: 7px 14px
  button-outline-primary:
    backgroundColor: transparent
    textColor: "{colors.primary}"
    typography: "{typography.button}"
    rounded: "{rounded.btn}"
    padding: 7px 14px
  button-success:
    backgroundColor: "{colors.success}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.btn}"
    padding: 7px 14px
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.on-brand}"
    typography: "{typography.button}"
    rounded: "{rounded.btn}"
    padding: 7px 14px
  action-btn:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label}"
    rounded: "{rounded.btn}"
    padding: 4px 8px
  sidebar:
    backgroundColor: "{colors.sidebar-bg}"
    textColor: "{colors.sidebar-text}"
    typography: "{typography.nav-link}"
    width: 240px
  sidebar-nav-link:
    backgroundColor: transparent
    textColor: "{colors.sidebar-text}"
    typography: "{typography.nav-link}"
    rounded: "{rounded.md}"
    padding: 8px 10px
  sidebar-nav-link-active:
    backgroundColor: "{colors.sidebar-active-bg}"
    textColor: "{colors.on-brand}"
    typography: "{typography.nav-link}"
    rounded: "{rounded.md}"
    padding: 8px 10px
  card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.card}"
    padding: 20px
  card-header:
    backgroundColor: transparent
    textColor: "{colors.body}"
    typography: "{typography.button}"
    rounded: "{rounded.card}"
    padding: 16px 20px
  stat-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.stat-number}"
    rounded: "{rounded.card}"
    padding: 20px
  stat-icon:
    backgroundColor: "{colors.primary-light}"
    textColor: "{colors.primary}"
    rounded: "{rounded.lg}"
    size: 48px
  table-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.body}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.card}"
  table-header-cell:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.muted}"
    typography: "{typography.table-header}"
    padding: 10px 16px
  table-row:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.body}"
    typography: "{typography.body-sm}"
    padding: 12px 16px
  badge:
    backgroundColor: "{colors.primary-light}"
    textColor: "{colors.primary}"
    typography: "{typography.badge}"
    rounded: "{rounded.pill}"
    padding: 4px 10px
  status-completed:
    backgroundColor: "{colors.success}"
    textColor: "{colors.success-text}"
    typography: "{typography.badge}"
    rounded: "{rounded.pill}"
    padding: 4px 10px
  status-failed:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.danger-text}"
    typography: "{typography.badge}"
    rounded: "{rounded.pill}"
    padding: 4px 10px
  status-pending:
    backgroundColor: "{colors.warning}"
    textColor: "{colors.warning-text}"
    typography: "{typography.badge}"
    rounded: "{rounded.pill}"
    padding: 4px 10px
  status-processing:
    backgroundColor: "{colors.info}"
    textColor: "{colors.info-text}"
    typography: "{typography.badge}"
    rounded: "{rounded.pill}"
    padding: 4px 10px
  text-input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: 7px 12px
  text-input-focus:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
  upload-zone:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.muted}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.lg}"
    padding: 48px 32px
  progress-bar:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-brand}"
    rounded: "{rounded.lg}"
    height: 8px
  modal:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.modal}"
    padding: 24px
  alert-success:
    backgroundColor: "#F0FDF4"
    textColor: "{colors.success-text}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.lg}"
    padding: 14px 16px
  alert-danger:
    backgroundColor: "#FEF2F2"
    textColor: "{colors.danger-text}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.lg}"
    padding: 14px 16px
  dropdown-menu:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.body}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.lg}"
    padding: 6px
  footer:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.muted}"
    typography: "{typography.label}"
    padding: 16px 0
---

## Overview

Pimport is an internal tool, not a marketing site, so its design system optimizes for **legibility and calm under data density** rather than brand spectacle. The layout is a fixed deep-slate sidebar (`{colors.sidebar-bg}` — #1F2937) on the left holding all navigation, with the working area on a soft off-white body (`{colors.body-bg}` — #F8FAFC) where white cards (`{colors.canvas}`) float on barely-there shadows. There is no top nav and no hero — the sidebar is the chrome, and content is everything.

Brand voltage comes from a single trustworthy blue (`{colors.primary}` — #4386F0). It carries primary buttons, the active sidebar item, focus rings, the logo, progress bars, and links. There is no second brand color — `accent` and `primary` are the same hex by default. Everything that isn't blue or status-colored is a restrained gray: dark slate ink for text, mid-gray for muted labels, and a single hairline border tone (`{colors.hairline}` — #E2E8F0) that does almost all the structural separation work.

The whole system is **token-driven and themeable**. Every value in the front matter maps to a CSS custom property in `app/static/css/styles.css`, which is organized in three layers: ~15 *seed* tokens per theme (`[data-theme]` blocks), *derived* tokens computed from the seeds via `color-mix()` (hover/dark/light/subtle variants — never edited by hand), and *fixed* tokens (spacing, shadows, semantic colors) that never change between themes. Re-skinning the app means editing the seeds; this DESIGN.md is the human-readable mirror of those seeds plus the component vocabulary built on top of them.

**Key Characteristics:**

- Single accent: `{colors.primary}` (#4386F0) does all brand work — primary CTAs, active nav, focus, logo, links. No competing brand color.
- **Black text on blue buttons.** `{colors.on-primary}` is #000000, not white — black scores 5.91:1 on #4386F0 (WCAG AA ✓) where white fails at 3.56:1. This is the single most counterintuitive token in the system; do not "correct" it to white.
- Dark slate sidebar (`{colors.sidebar-bg}`) holds white text and a tinted-blue icon color (`{colors.sidebar-icon}` — #AAC9F8); content lives on white cards over an off-white body.
- Depth is minimal: hairline borders + `shadow-sm`-class shadows (≈ `0 1px 3px rgba(0,0,0,0.06)`). No heavy drop shadows, no gradients except a faint primary-tinted login background.
- Two-font system: **GT America** for headings (weights 600–700) and **Open Sans** for body (400–500). Headings are semibold-to-bold; body never goes heavier than 500.
- Built on **Bootstrap 5 + Bootstrap Icons**. Components are Bootstrap base classes re-skinned via CSS variables — `.btn-primary`, `.card`, `.badge`, `.table`, `.modal`, etc.
- Radius hierarchy: `{rounded.btn}` 8px on buttons, `{rounded.card}` 12px on cards, `{rounded.modal}` 16px on modals, `{rounded.pill}` 999px on badges and status chips.
- Status semantics: green/red/amber/blue (`success`/`danger`/`warning`/`info`) expressed as subtle tinted-background pill badges with a darkened readable text color — never as loud solid fills.

## Colors

> Source of truth: the `[data-theme="pimport"]` seed block and the DERIVED/FIXED token sections in `app/static/css/styles.css`. Canonical palette documented in `.claude/skills/pimport-brandguide/SKILL.md`.

### Brand & Accent

- **Primary** (`{colors.primary}` — #4386F0): The single brand blue. Primary buttons, `.btn-action`, active sidebar item, links, focus rings, progress bars, the logo mark, stat-icon glyphs.
- **Primary Dark** (`{colors.primary-dark}` — #2D6DE0): Hover state on primary elements; also the resolved active-sidebar background (`--brand-accent-dark`).
- **Primary Darker** (`{colors.primary-darker}` — #1A56C8): Deep active states and the most-accessible interactive variant.
- **Primary Light** (`{colors.primary-light}` — #E8F0FE): Tinted surfaces — `.badge.bg-primary`, `.stat-icon.bg-primary` background, subtle highlights.
- **Primary Mid** (`{colors.primary-mid}` — #C5D8FC): Hover highlight on light surfaces; the focus-ring tint base.
- **Accent** (`{colors.accent}` — #4386F0): Equal to primary by default. The token exists so a theme can introduce a distinct action color (the `saas` theme sets accent to orange #ED9A1D) without touching the primary brand hue.

### Surface

- **Canvas** (`{colors.canvas}` — #FFFFFF): Card background, modal background, the page-content floor inside cards (`--bg-page` / `--card-bg`).
- **Body Background** (`{colors.body-bg}` — #F8FAFC): The actual page floor behind the cards (`--body-bg`, which equals `--bg-surface`). Cards sit on this off-white, not on pure white.
- **Surface** (`{colors.surface}` — #F8FAFC): Sidebar-in-light-themes, alternating table rows, tinted panels (`--bg-surface`).
- **Surface Soft** (`{colors.surface-soft}` — #FAFAFA): Table header background, upload-zone background, the lightest gray step (`--gray-50`).
- **Surface Strong** (`{colors.surface-strong}` — #F4F5F7): Slightly stronger gray fill (`--gray-100`) — input-group addons, secondary chips.
- **Hairline** (`{colors.hairline}` — #E2E8F0): The 1px border tone for cards, dividers, inputs, scrollbar thumb (`--bg-border` / `--gray-200`). The highest-frequency structural token in the system.
- **Border Strong** (`{colors.border-strong}` — #D1D5DB): Heavier border on hovered secondary buttons (`--gray-300`).

### Sidebar (active `pimport` theme)

- **Sidebar Background** (`{colors.sidebar-bg}` — #1F2937): The deep slate nav rail. Because its lightness is ≤ 50%, the system flips sidebar text and icons to light tones automatically.
- **Sidebar Text** (`{colors.sidebar-text}` — #F9FAFB): Nav labels, brand name.
- **Sidebar Icon** (`{colors.sidebar-icon}` — #AAC9F8): A desaturated blue for nav icons — the one place the brand hue appears on the dark rail.
- **Sidebar Section** (`{colors.sidebar-section}` — #626973): Uppercase section dividers and dropdown headers inside the sidebar.
- **Sidebar Active** (`{colors.sidebar-active-bg}` — #2D6DE0): Active nav item fill (resolves from `--brand-accent-dark`); paired with white text.

### Text

- **Ink** (`{colors.ink}` — #333333): Headings and strongest body text in the active `pimport` theme (`--text-primary`). The `default` theme uses the slightly darker #1F2937; both are valid — `#333333` is the live value.
- **Body** (`{colors.body}` — #4B5563): Default running text in cards and tables (`--gray-600`).
- **Muted** (`{colors.muted}` — #6B7280): Secondary text, labels, placeholders, table-header text, footer (`--text-muted` / `--gray-500`).

### Semantic

Used only for their meaning — status, validation, system feedback. Never derived, never re-themed, never decorative.

- **Success** (`{colors.success}` — #22C55E), text **#166534** (7.3:1 on white): completed jobs, healthy, active.
- **Danger** (`{colors.danger}` — #DC2626), text **#991B1B** (7.6:1): failed jobs, destructive actions. Darkened from #EF4444 so white text on the solid fill reaches 4.83:1.
- **Warning** (`{colors.warning}` — #F59E0B), text **#92400E** (7.3:1): in-progress, pending, partial.
- **Info** (`{colors.info}` — #3B82F6), text **#1E40AF** (8.6:1): informational and processing states.

Status badges pair a ~10%-opacity tint background with the darkened text color — readable, quiet, never a loud solid block.

## Typography

### Font Family

The active `pimport` theme runs **GT America** for headings and **Open Sans** for body (`--font-heading` / `--font-body`). GT America covers every `h1`–`h6` and stat numbers; Open Sans covers body copy, table cells, buttons, labels, and nav. The fallback chain walks `-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif`.

The brandguide documents **Inter** as the canonical base typeface, and the `default` / `saas-*` themes use Inter throughout. GT America + Open Sans is the active pairing; Inter is the fallback identity. Treat the *roles* (heading vs. body, the weights, the scale) as fixed — only the family swaps per theme.

### Hierarchy

| Token                          | Size | Weight | Line Height | Letter Spacing | Use                                  |
| ------------------------------ | ---- | ------ | ----------- | -------------- | ------------------------------------ |
| `{typography.page-title}`      | 30px | 700    | 1.2         | -0.025em       | Page `h1`                            |
| `{typography.section-heading}` | 24px | 600    | 1.2         | 0              | Section `h2`                         |
| `{typography.card-heading}`    | 20px | 600    | 1.2         | 0              | Card `h3`                            |
| `{typography.subheading}`      | 18px | 600    | 1.2         | 0              | `h4` sub-titles                      |
| `{typography.stat-number}`     | 30px | 700    | 1.2         | 0              | Big stat-card numbers                |
| `{typography.body}`            | 16px | 400    | 1.6         | 0              | Default running text (`<body>` base) |
| `{typography.body-sm}`         | 14px | 400    | 1.5         | 0              | Card body, table cells, form fields  |
| `{typography.label}`           | 12px | 400    | 1.4         | 0              | Meta, captions, footer, form hints   |
| `{typography.button}`          | 14px | 500    | 1.4         | 0              | Button labels                        |
| `{typography.nav-link}`        | 14px | 500    | 1.4         | 0              | Sidebar nav items                    |
| `{typography.table-header}`    | 11px | 600    | 1.4         | 0.06em         | Uppercase table column headers       |
| `{typography.badge}`           | 11px | 600    | 1.4         | 0.02em         | Badges and status chips              |

### Principles

- **Headings are GT America 600–700; body is Open Sans 400–500.** Emphasis in body comes from weight 500 or color, never from going bolder than 500.
- **Only the page title gets negative tracking** (-0.025em). Everything else sits at 0 — admin copy stays neutral and legible at small sizes.
- **Table headers and badges are uppercase 11px with positive tracking** — they read as taxonomy/labels, distinct from sentence-case body content.
- **Body line-height is generous (1.6).** Dense data tables drop to 1.5 to keep rows compact without feeling cramped.

### Note on Font Substitutes

If GT America is unavailable, **Inter** is the documented substitute (and the base identity in the brandguide). For Open Sans, system-ui or Inter both work. When adding a new typeface, add it to the Google Fonts URL in `base.html`, then set `--font-heading` / `--font-body` in the theme's seed block.

## Layout

### Spacing System

- **Base unit:** 4px, expressed in rem (`--space-1` = 0.25rem … `--space-16` = 4rem).
- **Tokens:** `{spacing.xxs}` 4px · `{spacing.xs}` 8px · `{spacing.sm}` 12px · `{spacing.md}` 16px · `{spacing.lg}` 20px · `{spacing.xl}` 24px · `{spacing.xxl}` 32px.
- **Page content padding:** `{spacing.page-y}` 24px vertical · `{spacing.page-x}` 32px horizontal (`main { padding: 1.5rem 2rem }`); collapses to 16px all-round on mobile.
- **Card padding:** `{spacing.lg}` 20px in the body; `16px 20px` in headers/footers.
- **Section spacing:** `{spacing.section}` 24px — the vertical gap between major content blocks and the default card bottom margin.
- **Sidebar width:** 240px expanded, 60px collapsed.

### Grid & Container

- The content area is fluid inside the `main` padding — no fixed max-width; Bootstrap's grid (`.row` / `.col`) handles columns.
- Stat cards sit in a responsive multi-up row with a 16px gutter; they drop to fewer columns at narrower widths.
- Tables span full card width; on mobile they shrink type to 12px rather than reflowing.

### Whitespace Philosophy

Whitespace is functional, not atmospheric. Cards are separated by a uniform 24px gap; inside a card, 20px of padding gives data room to breathe. The off-white body behind white cards provides just enough contrast to define card edges together with the hairline shadow — the system never relies on large empty bands for drama the way a marketing site would.

## Elevation & Depth

| Level          | Treatment                                                                       | Use                                                       |
| -------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------- |
| 0 (flat)       | No shadow, no border                                                            | Sidebar, body sections, table rows, footer                |
| 1 (hairline)   | 1px `{colors.hairline}` border                                                  | Inputs, table dividers, dropdown edges, secondary buttons |
| 2 (card)       | `0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)`                        | Cards, stat cards (the default resting elevation)         |
| 3 (card hover) | `0 4px 12px rgba(0,0,0,0.08)`; stat cards add `translateY(-2px)`                | Hovered cards and stat cards                              |
| 4 (modal)      | `0 20px 60px rgba(0,0,0,0.18)` + scrim `rgba(0,0,0,0.4)` with 3px backdrop blur | Modals, spinner overlay                                   |

The elevation philosophy is **hairlines and whisper-soft shadows**. Depth is communicated by the white-card-on-off-white-body contrast plus a 1–3px shadow, never by heavy drop shadows or glows. The one motion accent is a 2px lift on stat-card hover.

### Decorative Depth

- **Login background gradient:** a faint primary-tinted wash (`--login-bg-start/mid/end`, primary mixed ~92–97% with white) — the only gradient in the system, reserved for the unauthenticated login screen.
- **Focus ring:** `0 0 0 3px` of `--interactive-focus` (primary at ~15% opacity) on inputs and primary buttons — a soft brand-tinted halo, not a hard outline.

## Shapes

### Border Radius Scale

| Token             | Value        | Use                                                    |
| ----------------- | ------------ | ------------------------------------------------------ |
| `{rounded.sm}`    | 6px          | Pagination links, dropdown items, small tooltips       |
| `{rounded.md}`    | 8px          | Inputs, selects, sidebar nav items, alerts-small       |
| `{rounded.btn}`   | 8px          | All buttons                                            |
| `{rounded.lg}`    | 12px         | Alerts, upload zone, dropdown menus, toasts, stat-icon |
| `{rounded.card}`  | 12px         | Cards, stat cards                                      |
| `{rounded.xl}`    | 16px         | Large containers                                       |
| `{rounded.modal}` | 16px         | Modal dialogs                                          |
| `{rounded.pill}`  | 999px        | Badges, status chips                                   |
| `{rounded.full}`  | 9999px / 50% | Avatar, sidebar toggle button, icon circles            |

### Iconography

- **Bootstrap Icons** (`bi bi-*`) exclusively. Do not mix in Font Awesome, Material, or other libraries.
- Stat-card icons sit in a 48px rounded-`{rounded.lg}` tinted square colored by semantic role (primary/success/warning/danger tint background, matching glyph color).
- The sidebar collapse toggle and user avatar are perfect circles (`{rounded.full}`).

## Components

> Components are Bootstrap 5 base classes re-skinned via CSS variables. Each entry below names the live class and the tokens it consumes. No hover-only states are documented as separate tokens except where the system defines a distinct variant.

### Buttons

**`button-primary`** (`.btn-primary`) — The signature action. Background `{colors.primary}`, text `{colors.on-primary}` (**black**, for contrast), type `{typography.button}`, padding ~7px × 14px, rounded `{rounded.btn}`. Carries a faint `0 1px 2px` primary-tinted shadow. Hover → `{colors.primary-dark}` with a slightly stronger shadow; active nudges down 1px.

**`button-action`** (`.btn-action`) — Same surface as primary but `font-weight: 600` — the emphasized "do the main thing on this page" button (e.g. *Start sync*). Disabled state drops to `--gray-300`.

**`button-secondary`** (`.btn-secondary`) — White button with a hairline border and `{colors.body}` text. The quiet companion to primary. Hover fills with `--sidebar-hover-bg` and darkens the border.

**`button-outline-primary`** (`.btn-outline-primary`) — Transparent with a `{colors.primary}` border and text; fills solid primary (black text) on hover/focus/active.

**`button-success` / `button-danger`** (`.btn-success` / `.btn-danger`) — Solid semantic buttons for confirm/destructive actions. Success uses black text (9.22:1 on green); danger uses white text on #DC2626.

**`action-btn`** (`.action-btn`) — Compact row-level icon/text button (12px type, 4px × 8px padding) used inside table rows; no resting shadow.

### Sidebar (navigation chrome)

**`sidebar`** (`.app-sidebar`) — Fixed 240px slate rail (`{colors.sidebar-bg}`), full height, collapsible to 60px. Holds the logo row, scrollable nav list, and a footer with the user avatar. Below 768px it slides off-canvas behind a hamburger + blurred overlay.

**`sidebar-nav-link`** (`.sidebar-nav-link`) — Nav item: `{colors.sidebar-text}` label + `{colors.sidebar-icon}` icon at 0.7 opacity, rounded `{rounded.md}`, 8px × 10px padding. Hover lifts the icon opacity and fills with `--sidebar-hover-bg`.

**`sidebar-nav-link-active`** (`.sidebar-nav-link.active`) — Active item fills `{colors.sidebar-active-bg}` with white text and full-opacity icon, weight 600.

### Cards & Containers

**`card`** (`.card`) — The core container. Background `{colors.canvas}`, no border, rounded `{rounded.card}`, level-2 shadow, 24px bottom margin. Hover deepens the shadow.

**`card-header`** (`.card-header`) — Transparent background, 1px `--gray-100` bottom divider, `{typography.button}`-scale semibold muted label, top corners rounded to `{rounded.card}`.

**`stat-card`** (`.stat-card`) — Dashboard metric card. Same surface as `card` plus a hover lift (`translateY(-2px)`). Holds an uppercase muted label, a `{typography.stat-number}` figure, and a `stat-icon`.

**`stat-icon`** (`.stat-icon`) — 48px rounded-`{rounded.lg}` tinted square; background + glyph color set by semantic role (`.bg-primary` → primary tint, `.bg-success` → success tint, etc.).

### Tables

**`table-card`** — A `card` wrapping a `.table`. Type `{typography.body-sm}`, `{colors.body}` text, separated borders.

**`table-header-cell`** (`.table thead th`) — `{colors.surface-soft}` background, `{colors.muted}` uppercase `{typography.table-header}` text, 1px bottom border, no top/side borders.

**`table-row`** (`.table tbody td`) — 12px × 16px cells, 1px `--gray-100` bottom divider (last row none). `.table-hover` rows tint to `--gray-50` on hover with a pointer cursor. Result rows tint by status (`results-table-success/failed/partial`) at ~4% opacity.

### Badges & Status

**`badge`** (`.badge`) — Pill (`{rounded.pill}`), `{typography.badge}` uppercase. `.bg-primary` uses a `{colors.primary-light}` tint with `{colors.primary}` text and a subtle border. Semantic variants (`.bg-success`, `.bg-warning`, `.bg-danger`, `.bg-info`) use the matching ~10% tint background, darkened readable text, and a faint border.

**`status-completed` / `status-failed` / `status-pending` / `status-processing` / `status-partial`** — Job-status chips following the same tint-background + dark-text pill recipe, mapped to success / danger / warning / info / partial-amber respectively.

### Inputs & Forms

**`text-input`** (`.form-control`, `.form-select`) — Background `{colors.canvas}`, 1px `--input-border` (`{colors.hairline}`), rounded `{rounded.md}`, ~7px × 12px padding, `{typography.body-sm}`. Placeholder in `--gray-400`.

**`text-input-focus`** — Border recolors to `{colors.primary}` and gains the 3px primary-tinted focus ring (`--input-focus-shadow`); native outline suppressed.

**`form-label`** — `{typography.button}`-scale (14px) medium weight, `--gray-700`. Hints (`.form-text`) drop to 12px muted.

**`form-check-input:checked`** — Fills `{colors.primary}`.

### Feedback & Overlays

**`upload-zone`** (`.upload-zone`) — 2px dashed `--gray-300` border on `{colors.surface-soft}`, rounded `{rounded.lg}`, generous 48px × 32px padding. Hover recolors the border to primary with a ghost-primary fill; `drag-over` switches to a solid accent border.

**`progress-bar`** (`.progress` / `.progress-bar`) — 8px-tall track on `--gray-200`, rounded `{rounded.lg}`; fill is `{colors.primary}`. A `progress-lg` variant runs 24px tall with centered semibold text for the processing page.

**`modal`** (`.modal-content`) — Background `{colors.canvas}`, rounded `{rounded.modal}` (16px), level-4 shadow, overflow hidden. Header has a 1px `--gray-100` divider; footer sits on `--gray-50`. Backdrop blurs 3px over a 40% black scrim.

**`alert-success` / `alert-danger` / `alert-warning` / `alert-info`** (`.alert-*`) — Tinted alert banners: a pale semantic background (e.g. `#F0FDF4` for success), matching subtle border, and darkened semantic text. Rounded `{rounded.lg}`, `{typography.body-sm}` medium weight.

**`dropdown-menu`** (`.dropdown-menu`) — White, 1px `--gray-200` border, rounded `{rounded.lg}`, `0 8px 24px` shadow, 6px padding. Items round to `{rounded.sm}` and tint on hover.

### Footer

**`footer`** (`.footer-ledkoning`) — White surface, 1px top border, `{colors.muted}` `{typography.label}` text. Quietly closes the page; not a content-bearing surface.

## Do's and Don'ts

### Do

- Keep `{colors.primary}` (#4386F0) as the single brand action color. Use it for one clear primary action per view; everything else stays gray or secondary.
- Use **black text on the blue primary button** (`{colors.on-primary}` = #000000). It is intentional and WCAG-AA correct.
- Re-skin by editing the **seed tokens** in the `[data-theme]` block of `styles.css` — let the `color-mix()` derived tokens recompute the hover/dark/light variants automatically.
- Reach for semantic colors only for status and validation. Pair them as tint-background + darkened-text pills, the way the existing status chips do.
- Keep depth subtle: hairline borders plus the level-2 card shadow. White card on off-white body is the separation device.
- Use Bootstrap Icons for every glyph, and Bootstrap base classes (`.btn`, `.card`, `.badge`, `.table`) re-skinned via variables — don't hand-roll component CSS that bypasses the tokens.
- Keep headings in GT America 600–700 and body in Open Sans 400–500.

### Don't

- Don't introduce a second brand color. If a theme needs a distinct action hue, set `accent` separately (as the `saas` theme does) rather than adding a new ad-hoc blue.
- Don't switch the primary button text to white — it drops below AA contrast on #4386F0.
- Don't hardcode hex values in component CSS. Reference the CSS variables so themes keep working.
- Don't use heavy drop shadows, glows, or gradients (except the login background). Depth is hairlines + whisper shadows.
- Don't bold body copy past weight 500, and don't add letter-spacing to body text — only the page title carries negative tracking.
- Don't repurpose semantic colors decoratively (e.g. success green as an accent). Status colors must keep their meaning.
- Don't use `rounded-full` on rectangular containers — pills are for badges/chips only; cards stay at `{rounded.card}`.

## Responsive Behavior

### Breakpoints

| Name    | Width   | Key Changes                                                                                                                                                                                                             |
| ------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mobile  | ≤ 768px | Sidebar slides off-canvas behind a hamburger + blurred overlay; `main` padding drops to 16px with 60px top offset; tables shrink to 12px; `h1` drops to 24px; stat-card numbers drop to 24px; stat-icons shrink to 40px |
| Desktop | > 768px | Fixed 240px sidebar (collapsible to 60px); full `main` padding 24px × 32px; tables at 14px                                                                                                                              |

### Touch Targets

- Buttons render ~32px tall (7px padding + 14px line-height); the mobile hamburger is 38px; the sidebar toggle is 26px (desktop-only, hidden on mobile).
- Sidebar nav links are full-width within the rail with 8px × 10px padding for a comfortable tap area.

### Collapsing Strategy

- The sidebar collapses to a 60px icon rail on desktop (labels fade to opacity 0; hover shows a tooltip) and goes fully off-canvas on mobile.
- Card grids reduce columns via Bootstrap's responsive grid rather than scaling cards down.
- Tables keep their columns and reduce font size rather than reflowing into stacked cards.

### Motion

- Transitions use `--transition-fast` (150ms) and `--transition-base` (200ms) cubic-bezier easing; sidebar/layout shifts use `--page-transition` (250ms).
- All motion respects `prefers-reduced-motion: reduce`, which collapses durations to ~0.

## Iteration Guide

1. Focus on ONE token or component at a time, referencing it by name (`{colors.primary}`, `{components.stat-card}`).
2. **To re-skin the whole app:** edit the seed values in the front matter of *this file*, then run `python scripts/sync_design_tokens.py`. The script writes the ~16 seed CSS custom properties into the `[data-theme="pimport"]` block of `app/static/css/styles.css`; derived tokens recompute themselves via `color-mix()`. **This file is the source of truth — edit here, not in the CSS.** Use `--dry-run` to preview the diff and `--check` to fail CI when the two drift apart.
3. **To add a theme:** write a `themes/[name].md` seed file in the brandguide skill, add a matching `[data-theme="name"]` seed block in `styles.css`, add any new font to the Google Fonts URL in `base.html`, and switch via `document.documentElement.dataset.theme = 'name'`.
4. Never edit the DERIVED tokens block by hand — it follows the seeds via `color-mix()`.
5. Keep `{colors.primary}` scarce: one primary action per view. If two `button-primary` instances share a viewport, demote one to `button-secondary`.
6. Verify contrast whenever you change `primary` — the black-vs-white button-text decision must be re-checked (black needs ≥ 4.5:1 on the new hue, else flip to white).
7. Treat `.claude/skills/pimport-brandguide/SKILL.md` as the canonical token reference and this DESIGN.md as the component-level companion; keep the two in sync.

## Known Gaps

- **Two text-color truths:** the live `pimport` theme uses `{colors.ink}` #333333 while the brandguide and `default` theme document #1F2937. Both are AA-compliant; #333333 is what currently renders.
- **Two type identities:** the active theme uses GT America + Open Sans; the brandguide canon (and the `default`/`saas-*` themes) use Inter. GT America and Open Sans are commercial — ensure they are licensed/loaded, or the stack falls back to system fonts.
- Hover/active states are encoded as derived tokens rather than documented per-component here; consult `styles.css` for exact `color-mix()` values.
- Animation/transition timings are summarized, not exhaustively tokenized per component.
- Spacing tokens follow a 4px rem scale; the `lg`/`section` values (20px/24px) overlap by design — pick by role 