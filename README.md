# Shadow Command Center

Single-page portfolio for a cybersecurity student, DevSecOps engineer and AI researcher.
Hand built. No UI kit, no component library.

**Vite 6 · React 18 · TypeScript · Tailwind CSS v4 · Motion (Framer) · Lenis**

The build was done in sixteen reviewable stages. [`stage.md`](./stage.md) is the single source of
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

Requires **Node 20.15+**. Vite is pinned to 6.x, because Vite 7 needs Node `^20.19 || >=22.12`.

`?tokens` (e.g. `localhost:5173/?tokens`) opens the design-system specimen sheet: colour ramps,
type scale, elevation, easing curves, and the motion and grain toggles.

---

## Before you deploy

These are the things only you can supply. All of them are one-file edits, and every one is also
tracked in the Stage 9 checklist in [`stage.md`](./stage.md).

### Required

| What                                                                           | Where                 |
| ------------------------------------------------------------------------------ | --------------------- |
| **Real résumé PDF** (currently a placeholder that says so)                     | `public/resume.pdf`   |
| **Confirm the name and location**, both inferred from this repo's git identity | `src/data/profile.ts` |
| **Confirm the email address**, same inference                                  | `src/data/profile.ts` |
| **Contact form endpoint**. Without it the form is disabled in production       | `VITE_FORM_ENDPOINT`  |
| **Canonical site URL**, because Open Graph needs absolute URLs                 | `VITE_SITE_URL`       |

Copy `.env.example` to `.env` and fill both variables in.

### Worth doing

| What                                                                       | Where                      |
| -------------------------------------------------------------------------- | -------------------------- |
| Dates for all five roles (they currently render `[ dates tbc ]`)           | `src/data/experience.ts`   |
| Replace the draft role bullets on the other four roles                     | `src/data/experience.ts`   |
| Expand `SKU`, if it stands for something                                   | `src/data/experience.ts`   |
| Check the WebGoat Security framing: two capability lines are my reading    | `src/data/projects.ts`     |
| Repo and demo links for the other five (`BRIEFING_07` never gets one)      | `src/data/projects.ts`     |
| Dates for the three competition results (nothing renders without them)     | `src/data/achievements.ts` |
| Name the platform behind the Platinum League badge (my reading: TryHackMe) | `src/data/achievements.ts` |
| Check the photographer credit on the Red Cypher pictures is right          | `src/data/achievements.ts` |
| More achievements: the wall has three badges and one locked slot           | `src/data/achievements.ts` |
| Decide what to do about the `OSCP` pill (see the file header)              | `src/data/skills.ts`       |
| A PGP fingerprint, if you have one (the footer line is omitted without it) | `src/data/contact.ts`      |
| A HackTheBox handle, if you have one (the row shows the numeric id)        | `src/data/contact.ts`      |
| Dates for the four volunteering photographs, and a capture of the platform | `src/data/volunteering.ts` |

Anything you did not state is marked in its data file, and most of it also shows a **dev only
warning in the UI**. Those markers are compiled out of production builds, so they are visible
while you review and invisible once you ship.

---

## Deploying

The output is a static site. `dist/` can go anywhere.

### GitHub Pages — this is where the site lives

`.github/workflows/deploy.yml` builds and publishes on every push to `main`. It typechecks,
lints and tests before it builds, so a red gate stops the deploy rather than shipping past it.
Nothing is committed to a `gh-pages` branch: the workflow uploads `dist/` as a Pages artifact,
which is why `dist/` stays in `.gitignore`.

One-time setup, all of it in the repo's web UI:

1. The repo must be **public**. On the Free plan, Pages only publishes from public repos —
   private-repo Pages needs GitHub Enterprise Cloud.
2. The repo must be named **`achinpp.github.io`** for the root URL this is configured for.
   That name has to match the account username **exactly** — a user site is only a user site
   when the repo is `<username>.github.io`. Any other name, however much it looks the part, is
   an ordinary project repo that Pages serves from `/<repo>/`, which needs Vite's `base` set
   **and** the absolute paths in `src/data/` made base-aware. See the comment on
   `DEFAULT_SITE_URL` in `vite.config.ts`.
3. _Settings → Pages → Build and deployment → Source_ = **GitHub Actions**. Not "Deploy from a
   branch"; that setting ignores the workflow and looks for an `index.html` in the repo root.
4. _Settings → Secrets and variables → Actions → Variables_: add `VITE_FORM_ENDPOINT` to turn
   the contact form on, and `VITE_SITE_URL` only if the origin is not the default above. Both
   are **variables, not secrets** — one is a public POST target, the other a public origin, and
   a secret would be masked in the logs for no benefit. Vite inlines them at build time, so
   changing either needs a new workflow run (_Actions → Deploy → Run workflow_).

Pages serves `public/404.html` for unknown paths on its own. **Do not add an SPA rewrite to
`index.html`**: there is no client-side router here, so a rewrite would turn every typo into a
soft 200 and hide the 404 page.

### Vercel

```bash
npm i -g vercel && vercel
```

Framework preset **Vite** (auto-detected). Build `npm run build`, output `dist`. Add
`VITE_SITE_URL` and `VITE_FORM_ENDPOINT` under _Settings → Environment Variables_, then redeploy
Vite inlines them at build time, so changing them needs a new build, not just a restart.

Vercel serves `public/404.html` for unknown paths automatically. Same warning about SPA rewrites.

### Netlify

Build `npm run build`, publish `dist`. Environment variables under _Site configuration → Build &
deploy_. `404.html` is picked up automatically. Same warning about SPA rewrites.

### Custom domain

1. Point an `A`/`CNAME` record at the host, per their docs.
2. Set `VITE_SITE_URL=https://yourdomain.tld` and rebuild. Otherwise `og:image`,
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

`public/favicon.svg` is hand written and not generated. It is the primary favicon for every
current browser, and its geometry is matched 1:1 to the script.

Photographs and screenshots are two separate scripts, because they have separate sources:

```bash
python scripts/process-portrait.py   # the hero figure
python scripts/process-media.py      # briefing screenshots, event photos
```

`assets/` is the source cupboard: nothing in it is served or bundled.

`process-portrait.py` reads `assets/portrait-source.png`, the cut out with a transparent
background, trims it to its alpha bounding box and writes `public/portrait.webp` (24 kB).

`process-media.py` writes into `public/media/`, and it has two pipelines because it has two
kinds of source.

A **capture** is a screenshot, or anything else whose own shape is the point: the S.H.I.E.L.D.
CTF title card and the stamp that stands in for the classified briefing go down this path too.
It keeps its own shape, because that shape is information: the
Packet Tracer topology runs edge to edge and a crop takes a router off the end of it, and the
Red Cypher scoreboard is a table that stops being readable the moment it is cropped. That
topology also gets real work done to it. Its canvas is a flat grey with black labels, which on
an obsidian page is a slab of daylight, so the script splits the pixels by chroma, drops the
canvas to alpha 0 and redraws the achromatic ink in the site's own light grey. The coloured
device icons are left alone. The header comment explains why the two obvious alternatives, a CSS
`invert()` and a light plate, are both worse.

A **photo** is cropped to a fixed shape, because photographs of several shapes in one grid is a
ragged wall. The crop is a window placed by a per picture `focus` value rather than centred,
since the subject in a tall phone portrait almost never is, and `focus` applies to whichever
axis is being cut. The shape is per job: 4:3 for the volunteering photographs, 16:9 for the two Red
Cypher pictures, where a 4:3 window is too narrow to hold a row of three people without cutting
one of them in half. Doing this here rather than with `object-cover` in CSS is worth well over a
megabyte across the six.

Two more per job options matter. `mirror` flips a frame back: Sussex arrived mirrored from a
selfie camera and its signs read backwards without it. `trim` cuts a measured number of pixels
off each edge before anything else runs, as `(left, top, right, bottom)`. It takes the REF Media
branding bars off the Red Cypher photographs, lands the bottom edge of the scoreboard capture on
a row separator so the table ends on a row rather than through one, takes the devtools pane and
the empty white off the WebGoat frame, and takes the repository tab bar off the pipeline run so
that the clamp a card puts on that picture falls below the failing gate rather than above it. On
the EventPilot capture it does three things at once: the browser's own toolbar off the top,
which was also publishing the address and port the screenshot was taken against, the scrollbar
off the right, and the bottom edge landed just above the console mock that page puts under its
hero, because half a card reads as a screenshot taken carelessly. Those photographs are the organiser's pictures, so
the credit the bar carried moves to a readable line under the pair in
`src/data/achievements.ts` rather than disappearing.

A job marked optional is skipped with a note when its source is missing rather than failing the
run. Nothing is optional at the moment: every source has arrived.

Either way: re-run the script, then paste the `width`/`height` it prints into the matching entry
in `src/data/`.

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
from the keyboard, puts the boot overlay through its whole lifecycle, HEAD-fetches every image
on the page, and writes screenshots into `.browser-check/`: one per section, plus 1440, 768 and
390, the palette open, reduced motion, and the 404 page.

Two of those deserve a note.

**The boot overlay checks poll for the settled state, not the first frame.** React commits the
DOM, paints, and only then runs the passive effects that take the scroll lock and move focus.
Probing the instant `[data-boot]` appears catches that one frame gap and reports a modal that
never locked anything, which is how the check first failed against correct code.

**Images are fetched, not inspected.** A broken `<img>` is the one asset failure nothing else
here can see: Chrome logs no console error for an image that 404s, the alt text is still in the
DOM, and the width/height attributes still reserve the box. A lazy image below the fold has not
even been requested, so `naturalWidth` cannot answer for it either.

LCP is the **best of three cold loads** (HTTP cache off for all three), and the script prints
all three. A single measurement is not a number: the same commit measured 1776ms one day and
2488ms the next with nothing changed but what else the machine was doing, and a gate that fails
on untouched code is one you learn to ignore.

It exits non-zero on failure, so it can gate a deploy. It is not Lighthouse: no throttling, no
TBT, no audit catalogue. Run Lighthouse on the deployed site as well.

---

## Accessibility and motion

`prefers-reduced-motion` is honoured, and there is an in page override (⌘K, then _Disable
animation_, or the toggle on `?tokens`). The switch publishes through three channels because no
single one covers everything:

- a `data-motion` attribute on `<html>`, which a global CSS rule reads to kill every keyframe
  and transition;
- Framer Motion's `<MotionConfig reducedMotion>`, for component animation;
- a React context, for the hand-rolled `rAF` and interval loops that neither of the above can
  reach.

The preference is resolved by an inline script **before first paint**, so the page never renders
animated for a frame and then snaps still.

Scroll linked readouts, the HUD progress meter and the scroll hint's fade, keep tracking under
reduced motion. They are position indicators, not animation: freezing them would make them lie.

One effect is not rendered at all rather than rendered and held still: the mint dust over the
hero portrait. It is a cursor effect, and a cloud of dust that never opens would sit over the
face for no reason, so it does not mount under reduced motion or on a device with no fine
pointer. The scoreboard behind the Finalist badge is the other half of that rule read the other
way: it has a tap path, so it stays.

---

## Repo layout

```
assets/            source images, not served and not bundled
public/            static assets, icons, media/, 404 page, résumé
scripts/           asset generation, the browser check
src/
  components/      one folder per section, plus boot/ chrome/ layout/ ui/
  data/            all content, the only files you need to edit
  hooks/           behaviour primitives
  lib/             motion tokens, fuzzy scorer
  providers/       boot, motion, pointer, smooth scroll, toast, palette
  styles/          design tokens and @font-face
stage.md           the build log and the remaining checklist
```

Everything the site says about a person lives in `src/data/`. No component hard-codes content.

---

## Licence

MIT. See [`LICENSE`](./LICENSE).
