# Shadow Command Center

Single-page portfolio for a cybersecurity student, DevSecOps engineer and AI researcher.
Hand-built — no UI kit, no component library.

**Vite 6 · React 18 · TypeScript · Tailwind CSS v4 · Motion (Framer) · Lenis**

The build was done in ten reviewable stages. [`stage.md`](./stage.md) is the single source of
truth: every stage records what shipped, every deviation from the plan with its reasoning, and
what was verified versus what still needs a human with a browser.

---

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
```

| Script                  | What it does                                            |
| ----------------------- | ------------------------------------------------------- |
| `npm run dev`           | Dev server                                              |
| `npm run build`         | Typecheck, then production build into `dist/`           |
| `npm run preview`       | Serve `dist/` locally                                   |
| `npm run test`          | Fuzzy-scorer tests (esbuild → Node's built-in runner)   |
| `npm run check:browser` | Drives real Chromium over CDP against `npm run preview` |
| `npm run lint`          | ESLint, zero warnings tolerated                         |
| `npm run format`        | Prettier                                                |
| `npm run typecheck`     | `tsc --noEmit`                                          |

Requires **Node 20.15+**. Vite is pinned to 6.x — Vite 7 needs Node `^20.19 || >=22.12`.

`?tokens` (e.g. `localhost:5173/?tokens`) opens the design-system specimen sheet: colour ramps,
type scale, elevation, easing curves, and the motion and grain toggles.

---

## Before you deploy

These are the things only you can supply. All of them are one-file edits, and every one is also
tracked in the Stage 9 checklist in [`stage.md`](./stage.md).

### Required

| What                                                                            | Where                 |
| ------------------------------------------------------------------------------- | --------------------- |
| **Real résumé PDF** (currently a placeholder that says so)                      | `public/resume.pdf`   |
| **Confirm the name and location** — both inferred from this repo's git identity | `src/data/profile.ts` |
| **Confirm the email address** — same inference                                  | `src/data/profile.ts` |
| **Contact form endpoint** — without it the form is disabled in production       | `VITE_FORM_ENDPOINT`  |
| **Canonical site URL** — Open Graph needs absolute URLs                         | `VITE_SITE_URL`       |

Copy `.env.example` to `.env` and fill both variables in.

### Worth doing

| What                                                                         | Where                      |
| ---------------------------------------------------------------------------- | -------------------------- |
| Dates for the two IEEE roles (currently render `[ dates tbc ]`)              | `src/data/experience.ts`   |
| Replace the draft role bullets with your own wording                         | `src/data/experience.ts`   |
| Confirm the four project status badges                                       | `src/data/projects.ts`     |
| Add public repo / demo links per project                                     | `src/data/projects.ts`     |
| More achievements — the badge wall has one real badge and three locked slots | `src/data/achievements.ts` |
| Prune the 13 `derived` skills down to what you want to be asked about        | `src/data/skills.ts`       |
| LinkedIn and TryHackMe/HTB handles                                           | `src/data/contact.ts`      |
| A PGP fingerprint, if you have one (the footer line is omitted without it)   | `src/data/contact.ts`      |

Anything the brief did not state is marked in its data file, and most of it also shows a
**dev-only warning in the UI** — those markers are compiled out of production builds, so they
are visible while you review and invisible once you ship.

---

## Deploying

The output is a static site. `dist/` can go anywhere.

### Vercel

```bash
npm i -g vercel && vercel
```

Framework preset **Vite** (auto-detected). Build `npm run build`, output `dist`. Add
`VITE_SITE_URL` and `VITE_FORM_ENDPOINT` under _Settings → Environment Variables_, then redeploy
— Vite inlines them at build time, so changing them needs a new build, not just a restart.

Vercel serves `public/404.html` for unknown paths automatically. **Do not add an SPA rewrite to
`index.html`**: there is no client-side router here, so a rewrite would turn every typo into a
soft 200 and hide the 404 page.

### Netlify

Build `npm run build`, publish `dist`. Environment variables under _Site configuration → Build &
deploy_. `404.html` is picked up automatically. Same warning about SPA rewrites.

### GitHub Pages

The default `VITE_SITE_URL` already points at `https://achinpp.github.io/APC`. Because the site
is served from a sub-path there, set Vite's `base` to `'/APC/'` in `vite.config.ts` first —
without it every asset URL resolves to the domain root and nothing loads. Deploying to a custom
domain or to `achinpp.github.io` (no sub-path) needs no `base`.

### Custom domain

1. Point an `A`/`CNAME` record at the host, per their docs.
2. Set `VITE_SITE_URL=https://yourdomain.tld` and rebuild — otherwise `og:image`,
   `og:url` and `<link rel="canonical">` keep pointing at the old origin, which silently breaks
   every link preview.
3. Re-run the OG card if the name changed: `python scripts/generate-assets.py`.

---

## Regenerating the icons and the link-preview card

```bash
python scripts/generate-assets.py
```

Writes `favicon.ico`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` and `og.png` into
`public/`. Colours are converted from the OKLCH tokens in `src/styles/globals.css`, so the
assets cannot drift from the design system.

`public/favicon.svg` is hand-written and not generated — it is the primary favicon for every
current browser, and its geometry is matched 1:1 to the script.

The script needs **Pillow**. It renders the card with system fonts rather than the brand fonts,
because those ship as woff2 and decompressing woff2 needs Brotli; the header comment explains
how to use the real faces if you want them.

---

## The browser check

```bash
npm run build && npm run preview   # terminal 1
npm run check:browser              # terminal 2
```

`scripts/browser-check.py` drives an installed Chrome or Edge over the DevTools Protocol. It
needs **Python with `websockets`** and no npm packages at all. It measures LCP and CLS for real,
fails on any console error, asserts the DOM once React has mounted, drives the command palette
from the keyboard, and writes screenshots into `.browser-check/` — one per section, plus 1440 /
768 / 390, the palette open, reduced motion, and the 404 page.

It exits non-zero on failure, so it can gate a deploy. It is not Lighthouse: no throttling, no
TBT, no audit catalogue. Run Lighthouse on the deployed site as well.

---

## Accessibility and motion

`prefers-reduced-motion` is honoured, and there is an in-page override (⌘K → _Disable
animation_, or the toggle on `?tokens`). The switch publishes through three channels because no
single one covers everything:

- a `data-motion` attribute on `<html>`, which a global CSS rule reads to kill every keyframe
  and transition;
- Framer Motion's `<MotionConfig reducedMotion>`, for component animation;
- a React context, for the hand-rolled `rAF` and interval loops that neither of the above can
  reach.

The preference is resolved by an inline script **before first paint**, so the page never renders
animated for a frame and then snaps still.

Scroll-linked readouts — the HUD progress meter, the scroll hint's fade — keep tracking under
reduced motion. They are position indicators, not animation: freezing them would make them lie.

---

## Repo layout

```
public/            static assets, icons, 404 page, résumé
scripts/           asset generation
src/
  components/      one folder per section, plus chrome/ layout/ ui/
  data/            all content — the only files you need to edit
  hooks/           behaviour primitives
  lib/             motion tokens, fuzzy scorer
  providers/       motion, pointer, smooth scroll, toast, palette
  styles/          design tokens and @font-face
stage.md           the build log and the remaining checklist
```

Everything the site says about a person lives in `src/data/`. No component hard-codes content.

---

## Licence

MIT — see [`LICENSE`](./LICENSE).
