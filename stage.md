# SHADOW COMMAND CENTER — Build Stages

Single-page portfolio for a cybersecurity student / DevSecOps engineer / AI researcher.
Built **stage by stage**. Each stage ships something runnable and reviewable. Nothing moves
to the next stage until the current one is approved.

---

## Design Direction (modernized)

The brief asked for "dark + neon + glassmorphism". That's 2021. Here's the upgrade — same
soul (edgy, secure, tech-thriller), modern execution:

| Brief said | We're doing instead |
|---|---|
| Pitch-black bg | **Layered obsidian** — `oklch(0.14 0.01 265)` base with elevation tiers, not `#000`. True black crushes depth on OLED. |
| Neon cyan + red + green | **One signature accent** (`#5EF6C9` toxic mint) + **one alert accent** (`#FF3B47` breach red) used *only* for danger/status semantics. Restraint reads expensive; three neons read gamer-RGB. |
| Glassmorphism cards | **Bento grid** with 1px hairline borders, inner top-highlight, and *selective* backdrop blur only where content sits over motion. Blur everywhere = mush. |
| Glitch on hover | **Scramble-decrypt text** (character cycling on reveal), **magnetic cursor pull**, **spotlight gradient follow**. Glitch reserved for 1–2 deliberate moments. |
| Grid background | **Animated dot-matrix + noise grain overlay + conic scanline sweep**, parallaxed on scroll. |
| Scroll reveals | **Scroll-driven animations** (`useScroll`/`useTransform`) with staggered masked reveals — text clipped by overflow, sliding up. No generic fade-in-up. |

### Additional modern layers (not in the original brief)

- **⌘K Command Palette** — the literal "command center". Fuzzy-jump to any section, download
  resume, copy email, open GitHub. This is the signature interaction of the whole site.
- **Persistent HUD status bar** — fixed bottom strip: `UPTIME`, `LOCATION: LK`, `STATUS: AVAILABLE`,
  live clock, scroll-progress meter. Sells the "console" fiction without being a gimmick.
- **OKLCH design tokens** via Tailwind v4 `@theme` — perceptually uniform accent ramps.
- **Variable-font type scale** — display weight animating on scroll, `clamp()` fluid sizing.
- **Lenis smooth scroll** — inertia that makes every other animation feel intentional.
- **Terminal boot sequence** on first load (session-cached, skippable, never blocks LCP).
- **Full a11y pass** — `prefers-reduced-motion` kills every animation path, visible focus rings,
  keyboard-navigable palette, semantic landmarks.

### Typography
- Display / headings: **Space Grotesk** (geometric, slightly odd — not another Inter site)
- Body: **Inter Variable**
- Mono / terminal / labels: **JetBrains Mono** (ligatures on)

### Tech Stack
`Vite` · `React 18 + TypeScript` · `Tailwind CSS v4` · `Framer Motion (motion)` · `Lenis` ·
`lucide-react` · `cmdk`. No UI kit — every component hand-built.

---

## STAGE 0 — Foundation & Design System ✅
**Goal:** Scaffold + tokens. Zero content. Proves the visual language before any section exists.

- [x] Vite + React + TS scaffold, path aliases (`@/`), ESLint/Prettier
- [x] Tailwind v4 with `@theme` tokens: color ramps (obsidian 50–950, mint, breach, signal),
      semantic aliases, radii, elevation + glow shadows, blur tiers, easing curves, z-index scale
- [x] Fonts self-hosted — no FOUT, no Google CDN round-trip
- [x] `globals.css`: noise grain overlay, dot matrix, custom scrollbar, selection color,
      focus-visible ring
- [x] Motion primitives: `easings.ts`, `variants.ts` (maskReveal, fadeUp, blurIn, scaleIn,
      staggerGroup, scrim, panel)
- [x] `useReducedMotion` wrapper — single switch that disables all motion globally
- [x] Lenis provider + Framer Motion scroll bridge

**Deliverable:** `npm run dev` → a styled token sheet with grain, grid and live motion demos.
**Accept when:** tokens render correctly, reduced-motion toggle verified in devtools.

### Stage 0 notes

> NOTE: **Vite 6, not 7.** The local Node is 20.15.1; Vite 7 requires ^20.19 or >=22.12.
> Vite 6.4.4 + Tailwind 4.3.3 + React 18.3.1 + motion 11.18.2 + lenis 1.3.26.

> NOTE: **`@theme static`.** Tailwind v4 tree-shakes theme variables it can't see a utility
> using, which silently broke `--blur-shroud` (referenced only from a runtime-composed inline
> style). `static` emits every token. Design-system tokens are a public contract; +0.8 kB.

> NOTE: **Hand-rolled `@font-face` in `src/styles/fonts.css`** instead of importing the
> Fontsource index. The index ships Cyrillic/Greek/Vietnamese for all three families — 16 woff2
> into `dist/`. Latin + Latin-Ext, normal only, weight axis only: 6 files.

> NOTE: **The swatch strip became `src/components/dev/TokenSheet.tsx`** — a real specimen
> sheet (ramps, semantic table, type scale, radii, elevation, glow, blur tiers, easing lab,
> keyframe demos) rather than a strip. It is dev-only scaffolding and gets deleted once Stage 7
> lands.

> NOTE: **The dot matrix and grain live on `body::before` / `body::after`**, not in a component,
> so nothing can intercept the pointer and no section has to own them. The *interactive*
> mouse-reactive canvas backdrop is still Stage 1.

> NOTE: **`frame`-driven Lenis.** Lenis runs with `autoRaf: false` inside Framer Motion's frame
> loop (`src/providers/SmoothScrollProvider.tsx`). Two independent rAF loops race, and if Framer
> reads `scrollY` before Lenis writes it, every scroll-linked animation trails by a frame.

**Verified:** `tsc -b` clean · `eslint` clean · `prettier --check` clean · production build
2.4s / 33 kB CSS (7.3 kB gzip) / 298 kB JS (95 kB gzip) · dev server resolves every module,
`motion/react` exports `frame`/`cancelFrame`, Vite rewrites the font URLs.

**Not yet verified by me:** the rendered pixels and the 60fps claim — both need a human with a
browser. Open http://localhost:5173 and check the three toggles in section `00`.

---

## STAGE 1 — Shell: Background, Nav, HUD ✅
**Goal:** The frame everything else lives inside.

- [x] `<GridBackdrop />` — dot matrix, mouse-reactive spotlight, scroll parallax, canvas-based
      (not 300 DOM nodes)
- [x] `<ScanlineSweep />` — slow gradient pass, `will-change` isolated
- [x] Floating pill nav — blurred, auto-hides on scroll-down / reveals on scroll-up,
      active-section indicator with layout animation, plus a full mobile sheet
- [x] `<StatusHUD />` — fixed bottom bar: clock, availability dot (pulsing), scroll progress,
      current-section readout
- [x] Custom cursor: dot + lagging ring, scales on interactive hover (desktop only, pointer:fine)
- [x] `src/data/sections.ts` — the one section map (nav, indicator, HUD, later the palette)
- [x] `<SectionScaffold />` — six full-height placeholder anchors so the shell is navigable

**Accept when:** 60fps on scroll with the backdrop running; nav state correct at all scroll positions.

### Stage 1 notes

> NOTE: **The backdrop is split across three technologies, by cost.** The base dot matrix is a
> tiled CSS background on a transformed div — dots that never change shouldn't cost anything per
> frame, and parallax is a compositor transform. Canvas paints *only* the ~130 cursor-lit dots
> inside the light radius, not the ~2000 on screen; per-dot brightness is the one thing CSS
> can't express. The 760px glow is a CSS radial gradient moved by a spring, because painting a
> gradient that size into canvas every frame costs far more than translating one static layer.

> NOTE: **The dot matrix moved off `body::before`** (where Stage 0 put it) into `<GridBackdrop />`
> — a pseudo-element can't parallax independently or respond to the cursor. Grain stays on
> `body::after`: it's the topmost layer and must cover everything.

> NOTE: **Scanline is a translated linear band, not a rotating conic gradient** (which is what my
> own Stage 1 plan said). A rotating conic can't be composited — the browser re-rasterises the
> whole gradient every frame, which is a continuous main-thread paint behind the entire page. The
> linear band looks nearly identical and runs purely as a compositor transform.

> NOTE: **`useActiveSection` is a 1px detection band**, not a ratio comparison —
> `rootMargin: '-50% 0px -50% 0px'` collapses the observer root to a line through the middle of
> the viewport, so at most one section can be active and the state is never ambiguous. Comparing
> `intersectionRatio` would let a tall section beat a short one that's genuinely centred. The
> cost: a section shorter than half the viewport would never activate, so every section must stay
> `min-h-svh`.

> NOTE: **One pointer listener for the whole site** (`<PointerProvider />`). The canvas, the glow
> and the cursor all need the position; three `pointermove` handlers means three callbacks per
> event, and mouse events outpace frames. Published as MotionValues (no re-render) plus a plain
> ref for the rAF loop.

> NOTE: **The native cursor is hidden only while `<CustomCursor />` is mounted**, via
> `data-cursor="custom"` on `<html>`. It mounts only for a fine pointer with motion enabled, so
> touch devices and reduced-motion users keep their ordinary cursor. Unmounting can never leave
> the page with no cursor at all.

> NOTE: **Nav auto-hide has a jitter threshold** (8px). Without it the inertia at the end of a
> Lenis glide produces tiny alternating deltas and the nav flickers. It also never hides in the
> top 90px.

> NOTE: **The scroll percentage is written via `textContent` on a ref**, not React state —
> state would re-render the HUD on every frame of every scroll. Same reason the clock is its own
> component: a 1Hz tick should re-render twelve characters, not the whole bar.

> NOTE: **Known duplication:** `FloatingNav` and `StatusHUD` each run their own
> `useActiveSection`, so there are two IntersectionObservers over the same six elements. Cheap
> enough to leave, and it keeps the components independent — worth lifting to context if a third
> consumer appears.

> NOTE: **Nav clicks don't write a URL hash.** Deep links would be nice, but setting the hash
> triggers a native jump that fights Lenis. Revisit in Stage 9.

> NOTE: `?tokens` still renders the Stage 0 specimen sheet — http://localhost:5173/?tokens

**Verified:** `tsc -b` clean · `eslint` clean (0 warnings) · `prettier --check` clean ·
production build 2.9s / 36.8 kB CSS (8.1 kB gzip) / 324 kB JS (103 kB gzip) · every module
transforms in dev · `.scroll-lock`, `.dot-matrix`, `animate-scan`, `@keyframes scan` and the
`data-cursor=custom` rule all present in the compiled CSS · `useLenis()` confirmed to fall back
safely to `undefined` with no provider (the reduced-motion path).

**Not yet verified by me:** the 60fps claim, and anything about how it actually looks — no
browser here. Worth checking by hand:
- scroll down / up repeatedly and watch the nav for flicker at the hide/reveal boundary
- the nav indicator's `layoutId` slide between sections
- cursor light on the grid, and the ring opening over buttons
- **mobile sheet** at 390px: open it, Esc to close, confirm focus returns to the menu button
- **Motion off** (`/?tokens`, section 00) then back to the site: no canvas, no glow, no
  parallax, no scanline, native cursor restored

---

## STAGE 2 — Hero + Resume CTA
**Goal:** The first 3 seconds. Highest-stakes stage.

- [ ] Terminal window: traffic-light chrome, path prompt, blinking block caret
- [ ] Typing sequence: `> executing whoami...` → stream output → resolve to **name + title**
- [ ] Name renders with scramble-decrypt + mask-reveal, massive fluid display type
- [ ] Rotating role sub-line: `Cybersecurity Student / DevSecOps Engineer / AI Researcher`
- [ ] **Download Resume** — primary glowing button, impossible to miss:
      conic-gradient animated border, magnetic hover, shimmer sweep, haptic-feel press
- [ ] Secondary ghost CTA: `View Projects ↓`
- [ ] Scroll hint indicator
- [ ] Boot overlay (first visit only, `sessionStorage`, Esc to skip)

**Accept when:** typing sequence is skippable, resume button passes "grandma can find it" test,
LCP < 2.0s.

---

## STAGE 3 — Experience & Leadership Timeline
**Goal:** Credibility.

- [ ] Vertical timeline, animated draw-on connector line tied to scroll progress
- [ ] Node markers that "arm" (pulse + fill) as they enter viewport
- [ ] Entries:
  - **Webmaster** — IEEE SIGHT Nenasa, Sri Lanka
  - **Vice Chair** — LeadSpring of IEEE IAS, SLIIT
- [ ] Each card: role, org, period, 2–3 impact bullets, org tag
- [ ] Alternating desktop layout → single rail on mobile

**Accept when:** line draw syncs to scroll without jitter; mobile rail is clean.

---

## STAGE 4 — Mission Briefings (Projects Grid)
**Goal:** The depth section. Bento layout, not a uniform 3-column grid.

- [ ] Bento: 1 feature tile (2×2) + 3 standard tiles, responsive reflow
- [ ] Card treatment: hairline border → **mouse-tracking glow border** on hover, inner
      highlight, subtle 3D tilt, classification stamp (`// BRIEFING_01`)
- [ ] Tech-stack chips per card, status badge (`DEPLOYED` / `ACTIVE` / `ARCHIVED`)
- [ ] Projects:
  1. **Study Coach AI Agent** — Google ADK + Gemini API exam-prep assistant, FastAPI backend,
     custom UI. Dynamic schedule generation, topic prioritization, session logging,
     interactive AI tutoring/quizzing. *(feature tile)*
  2. **Northbridge Finance Security Upgrade** — enterprise network security redesign;
     L2 + segmentation threat modeling, VLAN/inter-VLAN extended ACLs, switchport port
     security, cost analysis driving a three-phase rollout
  3. **Intelligent Adaptive Surveillance System** — VGG19 + YOLO threat detection,
     mitigating physical adversarial-patch attacks
  4. **DevSecOps CI/CD Pipeline** — OWASP WebGoat deployment with Semgrep SAST,
     Trivy dependency scanning, Gitleaks secret detection
- [ ] Click → expanded detail panel (shared-layout morph, not a jarring modal), Esc + scrim close

**Accept when:** glow-border tracking is smooth, detail morph has no layout flash,
body scroll locks correctly when open.

---

## STAGE 5 — Battle Station (CTF & Achievements)
**Goal:** Proof of competition pedigree.

- [ ] Achievement badges: hexagonal/shield frames, rarity-tier glow, unlock animation on reveal
- [ ] **RED CYPHER 3.0 — Finalist** as the hero badge
- [ ] Compact milestone timeline beside the badge wall
- [ ] Open-source contributions strip
- [ ] Animated stat counters (CTFs entered, writeups, contributions) — count-up on in-view

**Accept when:** badges feel earned, not clip-art. Counters fire once, not on every scroll pass.

---

## STAGE 6 — Arsenal (Tech Stack)
**Goal:** Skills, without the tired progress-bar cliché.

- [ ] Floating pill tags with idle drift, glow-on-hover, category filtering
- [ ] Categories: Offensive Security · Development · Cloud & Infra · AI/ML
- [ ] Tags: Penetration Testing, Node.js, Java, Python, FastAPI, Cloud Security, Threat Modeling
      (+ room to extend)
- [ ] Filter chips re-layout the cloud with Framer layout animations
- [ ] **No percentage bars** — nobody is 87% at Python

**Accept when:** filter transitions are fluid; drift animation doesn't cause CLS.

---

## STAGE 7 — Secure Channel (Contact + Footer)
**Goal:** Close the loop.

- [ ] Contact form styled as an encrypted comms terminal: monospace labels, prefixed fields,
      inline validation, `TRANSMITTING... → ✓ MESSAGE ENCRYPTED & SENT` success state
- [ ] Form handler (Formspree or Resend — decide at this stage), honeypot + rate guard
- [ ] Social links: GitHub, LinkedIn, TryHackMe/HTB, Email — icon buttons with magnetic hover
- [ ] Footer: PGP-key line, `LAST_BUILD: <commit-date>`, back-to-top
- [ ] Copy-email-to-clipboard with toast

**Accept when:** form submits end-to-end, validation + error states all styled, no console errors.

---

## STAGE 8 — Command Palette (⌘K)
**Goal:** The signature interaction. Built last so it can index everything.

- [ ] `cmdk`-powered overlay, `⌘K` / `Ctrl+K` / `/` to open
- [ ] Commands: jump to section, download resume, copy email, open socials, toggle motion,
      toggle grain, easter-egg `sudo` command
- [ ] Fuzzy search, keyboard-only navigable, recent-commands memory
- [ ] Discoverable hint chip in nav + HUD

**Accept when:** fully keyboard-driven, focus trap correct, Esc restores focus to trigger.

---

## STAGE 9 — Polish, Performance, Ship
**Goal:** Make it fast and make it real.

- [ ] Lighthouse: Performance ≥ 95, A11y ≥ 95, Best Practices 100, SEO 100
- [ ] Route-level code splitting, lazy-load below-fold heavy components
- [ ] OG image + Twitter card, full meta, JSON-LD `Person` schema
- [ ] Favicon set, `site.webmanifest`, theme-color
- [ ] Responsive sweep: 360 / 390 / 768 / 1024 / 1440 / 1920 / ultrawide
- [ ] Cross-browser: Chrome, Firefox, Safari (check `backdrop-filter` + OKLCH fallbacks)
- [ ] `prefers-reduced-motion` full audit — every stage re-verified
- [ ] 404 page in-theme
- [ ] Deploy (Vercel/Netlify) + custom domain notes in README

**Accept when:** all boxes checked and the site is live.

---

## Working Agreement

1. One stage at a time. I build it, you review it, we iterate, then we advance.
2. Every stage leaves the app in a **runnable** state — `npm run dev` always works.
3. Checkboxes in this file get ticked as we go; this doc is the single source of truth.
4. Design decisions that deviate from this plan get noted inline with a `> NOTE:` line.
5. Content I don't have (real name, email, social URLs, resume PDF, CTF details, dates) goes in
   as clearly-marked placeholders — collected in `src/data/` so swapping is a one-file edit.

---

## Open Inputs Needed (gather before Stage 2)

- [ ] Full name + preferred title line
- [ ] Resume PDF (drop at `public/resume.pdf`)
- [ ] Email, GitHub, LinkedIn, TryHackMe/HTB handles
- [ ] Dates/periods for the two IEEE roles
- [ ] Project repo/demo links (any that are public)
- [ ] Additional CTFs / achievements beyond RED CYPHER 3.0
- [ ] Headshot or avatar (optional — design works without one)

---

**Current status:** `STAGE 1 — complete, awaiting review` → next: `STAGE 2 — Hero + Resume CTA`
