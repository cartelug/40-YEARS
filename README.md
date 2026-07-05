# Forty Years of Transformation · Republic of Uganda · 1986–2026

The official 40-year legacy website of the Republic of Uganda — one continuous
cinematic scroll, ten chapters, told as **evidence, not decoration**. Swiss /
International Typographic Style at national-institution grade: navy ground,
cream ledger, one gold accent, one typeface, a hard grid, and a gold
**transformation spine** that draws itself from 1986 to 2026 as you scroll.

**Live site source:** `/site` (Astro 7, statically exported)
**Asset intake report:** [`ASSETS.md`](./ASSETS.md) — inventory, rename map, optimisation, gap report
**Concept source of truth:** Notion — “Forty Years of Transformation” section plan (mirrored in `/content-notion`)

---

## The ten chapters

| # | Chapter | Treatment |
|---|---|---|
| 01 | Opening | Dark hero (portrait fused with gold national topography), word-by-word title reveal, five-figure strip, scroll-spy rail, spine origin |
| 02 | The Inheritance | Sober archival evidence: letterboxed 1986 title card, the three ruins as ledger rows ($330 · 60 MW · 56%) |
| 03 | The National Ledger | Cream paper plate, five approved figures as giant tabular numerals with gold rules, count-up once on enter, each linked to `/sources` |
| 04 | The Journey | Pinned, scrub-driven era sequence — era imagery masked **inside the accurate national silhouette**; six eras 1986 → Beyond |
| 05 | Achievements | Six editorial pillar bands, alternating alignment, facts as hairline rows (never icon cards) |
| 06 | The Regions | Accurate SVG map as interface; four keyboard-selectable regional nodes; gold district lines draw on selection |
| 07 | Voices | Museum testimony at display size, engraved-portrait plate, disclosed as representative pending PPU attribution |
| 08 | In Pictures | Archive filmstrip: letterbox bars, `FRAME 001 · UGANDA · 1986–2026` stamps, drag + wheel + arrow keys, Ken Burns on the active frame only |
| 09 | What’s Next | Dawn plate; eight capacities as a numbered ledger; Vision 2040 quote |
| 10 | The Record Continues | Cream ceremonial close; 40-tick seal draws on enter; spine terminates at 2026 |

Plus: `/sources` (provenance ledger for every figure and image), `/accessibility`
(statement + language slots), `/downloads` (print-edition PDF + media pack), and
a ceremonial 404.

## Stack

- **Astro 7** static export · **Tailwind 4** (tokens as CSS vars in `site/src/styles/global.css`)
- **Islands:** React-compatible JSX via `@astrojs/preact` (`compat: true`) — chosen over React to hold the island-JS budget (~4KB vs ~46KB gz runtime). The Regions map is a hydrated island; spine/ledger/journey/filmstrip are zero-hydration vanilla TS modules.
- **GSAP + ScrollTrigger** (pinned journey, scrubbed spine) · **Lenis** (lerp 0.1, one shared rAF)
- **Type:** TeX Gyre Heros + Heros Cn (GUST Font Licence — the URW Nimbus Sans lineage of Helvetica), subset to ~22KB WOFF2 each, self-hosted; platform Helvetica Neue takes over where the OS provides it. No commercial font files are distributed.
- **Content:** typed collections in `site/src/content/en/*.json` (zod schemas in `content.config.ts`). i18n-ready — add `lg/` or `sw/` sibling directories to publish Luganda/Swahili editions.

## Performance (measured at build)

- Island JS **≈63KB gz** total (budget <90KB) · CSS ≈8KB gz · HTML ≈28KB gz
- Hero AVIF **57KB** at 1672w (budget <120KB); photos ≤90KB at served widths
- Home initial transfer ≈**230KB** on desktop (budget <500KB) — fonts 3×22KB, hero AVIF, CSS/JS/HTML
- Zero CLS: every image ships explicit `width/height` + LQIP blur-up
- Full `prefers-reduced-motion` fallback (verified): drawn spine, final figures, static journey, no pin/parallax/Ken-Burns. The page is complete without JavaScript.

## Working on the site

```bash
cd site
npm install
npm run dev          # local dev
npm run build        # static build → dist/
npm run assets       # re-run the image pipeline from /assets (sharp)
node scripts/subset-fonts.mjs   # regenerate font subsets from fonts-src/
node scripts/make-pdf.mjs       # re-render the print PDF (needs a prior build)
node scripts/shoot.mjs out/     # screenshot every chapter, desktop+mobile
```

Order of operations when assets or copy change:
`npm run assets` → `npm run build` → `node scripts/make-pdf.mjs` → `npm run build`.

### Publishing to the live branch

The live site is served from the **repository root of `main`**. The built
output (`index.html`, `_astro/`, `images/`, `fonts/`, `sources/`, …) is
committed there; the raw sources stay in `/assets` and `/site`. To republish
after any change:

```bash
cd site
bash scripts/publish-root.sh   # build + PDF + OG card, then copy dist/ → repo root
git add -A && git commit && git push origin main
```

The previous single-file legacy site that lived at the root is preserved in
git history (pre-2026-07 commits) and its full copy extract in
`content-notion/legacy-index-copy.md`.

## Editing content

All copy lives in `site/src/content/en/`:
`stats.json` (the five approved figures — **fixed**; change only with sources
sign-off), `eras.json`, `pillars.json`, `regions.json`, `voices.json`,
`frames.json`, `next.json`, `sources.json`. Every entry carries an explicit
`order` field (the loader sorts by id otherwise). Chapter shells are in
`site/src/components/Ch*.astro`.

## Deploy runbook

1. **Domain:** `astro.config.mjs → site` is set to `https://fortyyears.go.ug` (placeholder — confirm with the State House digital team). Update it, then regenerate `public/sitemap.xml` and `robots.txt` hostnames to match, and rebuild.
2. **Host:** any static host. `public/_headers` carries the CSP + security headers in Netlify/Cloudflare format — mirror on nginx/Apache if used. Immutable cache is set for `/images`, `/fonts`, `/assets`.
3. **Analytics:** privacy-first, first-party only. The page sends `navigator.sendBeacon('/collect', …)` **only after explicit consent** (no cookies, no identifiers). Point `/collect` at any first-party endpoint (or self-hosted Plausible/umami equivalent); with nothing configured the beacon is a silent no-op.
4. **Before public launch** (from the gap report): confirm rights for the 13 landscape photographs with the Presidential Press Unit; replace representative testimonies with attributed ones; supply human-capital photography (schools/clinics) for Pillar 04 and Voices.

## Licences

- TeX Gyre Heros: GUST Font Licence (`site/fonts-src/LICENSE-TeX-Gyre-Heros.txt`) — free to embed and distribute.
- Uganda outline: derived from public-domain Natural Earth country geometry.
- Landscape photography: supplied production archive — **rights to be confirmed before launch** (tracked on `/sources`).
- Illustrative plates: commissioned AI-assisted generations, treated as artwork and disclosed on `/sources`; two rejected at intake (see `ASSETS.md`).
