# SHADOW COMMAND CENTER — Build Stages

Single-page portfolio for a cybersecurity student / DevSecOps engineer / AI researcher.
Built **stage by stage**. Each stage ships something runnable and reviewable. Nothing moves
to the next stage until the current one is approved.

---

## Design Direction (modernized)

The brief asked for "dark + neon + glassmorphism". That's 2021. Here's the upgrade — same
soul (edgy, secure, tech-thriller), modern execution:

| Brief said              | We're doing instead                                                                                                                                                                           |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pitch-black bg          | **Layered obsidian** — `oklch(0.14 0.01 265)` base with elevation tiers, not `#000`. True black crushes depth on OLED.                                                                        |
| Neon cyan + red + green | **One signature accent** (`#5EF6C9` toxic mint) + **one alert accent** (`#FF3B47` breach red) used _only_ for danger/status semantics. Restraint reads expensive; three neons read gamer-RGB. |
| Glassmorphism cards     | **Bento grid** with 1px hairline borders, inner top-highlight, and _selective_ backdrop blur only where content sits over motion. Blur everywhere = mush.                                     |
| Glitch on hover         | **Scramble-decrypt text** (character cycling on reveal), **magnetic cursor pull**, **spotlight gradient follow**. Glitch reserved for 1–2 deliberate moments.                                 |
| Grid background         | **Animated dot-matrix + noise grain overlay + conic scanline sweep**, parallaxed on scroll.                                                                                                   |
| Scroll reveals          | **Scroll-driven animations** (`useScroll`/`useTransform`) with staggered masked reveals — text clipped by overflow, sliding up. No generic fade-in-up.                                        |

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
> so nothing can intercept the pointer and no section has to own them. The _interactive_
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
> frame, and parallax is a compositor transform. Canvas paints _only_ the ~130 cursor-lit dots
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

## STAGE 2 — Hero + Resume CTA ✅

**Goal:** The first 3 seconds. Highest-stakes stage.

- [x] Terminal window: traffic-light chrome, path prompt, blinking block caret
- [x] Typing sequence: `> executing whoami...` → stream output → resolve to **name + title**
- [x] Name renders with mask-reveal, massive fluid display type (scramble applies to the
      mono eyebrow and role line — see note)
- [x] Rotating role sub-line: `Cybersecurity Student / DevSecOps Engineer / AI Researcher`
- [x] **Download Resume** — primary glowing button, impossible to miss:
      conic-gradient animated border, magnetic hover, shimmer sweep, haptic-feel press
- [x] Secondary ghost CTA: `View Projects ↓`
- [x] Scroll hint indicator
- [x] Boot overlay (first visit only, `sessionStorage`, any key to skip)
- [x] `src/data/profile.ts` — all personal detail in one file
- [x] Reusable `<ScrambleText />`, `<GlowButton />`, `useTypewriter`, `useMagnetic`

**Accept when:** typing sequence is skippable, resume button passes "grandma can find it" test,
LCP < 2.0s.

### Stage 2 notes

> ⚠ **CONTENT TO CONFIRM.** `src/data/profile.ts` marks every inferred field. The name
> **Achin Chandrasiri** was derived from this repo's git identity
> (`AchinP <achinchandrasiri@gmail.com>`, github.com/achinpp) — it was never stated. Location is
> `Sri Lanka`, inferred from SLIIT/IEEE Sri Lanka in the brief. Both are one-line edits.

> ⚠ **`public/resume.pdf` is a placeholder** — a real, valid, 1-page PDF that says "PLACEHOLDER —
> this is not a resume" so the download path is testable end to end. **Replace it before
> deploying.** Added to the Stage 9 checklist.

> NOTE: **The name reveals after script line 0, not after the whole transcript.** The brief wants
> `whoami` to run and _then_ the name to render, and that beat is preserved — but gating on all
> six lines would put LCP at ~3.5s, since the name is by far the largest text on the page. Cold
> load budget now: 900ms boot + 260ms lead-in + ~494ms for line 0 = **~1654ms**, 346ms inside the
> 2.0s target. A returning visitor in the same session skips the boot: ~754ms.

> NOTE: **The boot overlay is the main LCP cost and the one thing here nobody asked for.** It was
> my own addition in the Stage 2 plan. 900ms, dismissed by _any_ key, click or wheel, never
> shown under reduced motion, once per session (`sessionStorage`, not `localStorage` — a visit
> tomorrow should get it again, a reload in five seconds shouldn't). Deleting it buys ~900ms of
> LCP; say so and it goes.

> NOTE: **Scramble went on the mono text, not the display name.** Random glyphs have random
> widths in a proportional font, so a scrambling `<h1>` at 6.5rem reflows on every tick and reads
> as broken rather than encrypted. The name gets the mask-reveal (per-line, staggered); the
> `identity confirmed` eyebrow and the role rotator — both monospace, both stable-width — get
> the decrypt. `<ScrambleText />` is general (`mount` / `hover` / `manual`) for Stage 4 and 6.

> NOTE: **`<ScrambleText />` is hidden from assistive tech.** A screen reader walking `!<>-_\/[]`
> is being handed garbage, thirty times a second. The animated span is `aria-hidden` and the real
> string ships beside it in `sr-only`, so the accessible name is always the final text. Same
> pattern in the terminal: the animated transcript is `aria-hidden`, with the finished transcript
> in an `sr-only` block read once.

> NOTE: **The CTA's rotating border is a `transform: rotate()` on an oversized conic-gradient
> square**, clipped by the parent — not an animated gradient angle. Animating the gradient forces
> a re-rasterise every frame; rotating a static layer is compositor-only. Same reasoning as
> ScanlineSweep in Stage 1, at button scale. With motion off the gradient stops rotating but the
> ring, glow and hover all still read, so the affordance never depends on animation.

> NOTE: **The role rotator reserves width from its longest title** via an invisible sizer, so
> swapping titles can't reflow the line. Under reduced motion it renders all three joined by
> separators instead — no auto-advancing carousel.

> NOTE: **`useTypewriter` is a `setTimeout` chain, not rAF.** Characters land 14–34ms apart,
> which is slower than a frame, so rAF would mean waking 60×/s to act on a third of those wakeups.

> NOTE: **The role line is `min-h`-free but the hero is `min-h-svh`** — required by
> `useActiveSection`'s 1px detection band (Stage 1 note).

**Verified:** `tsc -b` clean · `eslint` clean (0 warnings) · `prettier --check` clean ·
production build 3.4s / 43.6 kB CSS (9.0 kB gzip) / 337 kB JS (107 kB gzip) · `animate-conic`,
`@keyframes conic-spin`, `animate-hint`, `@keyframes hint` all in the compiled CSS ·
`conic-gradient` present in the JS bundle · `public/resume.pdf` validates as
`PDF document, version 1.4, 1 page(s)` and serves as `application/pdf` · every module transforms
in dev.

**Not yet verified by me:** no browser here, so nothing visual and no real LCP number — the
1654ms above is arithmetic, not a measurement. Worth checking by hand:

- the whoami → name beat, and whether 900ms of boot earns its place
- **skip** button in the terminal chrome mid-type
- resume button: hover (magnetic pull + glow doubling), press, and that the PDF downloads
- role rotator cycling at 3.2s with no horizontal shift
- **Motion off**: no boot, transcript complete on arrival, all three titles listed statically,
  ring static, native cursor
- 390px width: terminal, two-line name and both CTAs without overflow

---

## STAGE 3 — Experience & Leadership Timeline ✅

**Goal:** Credibility.

- [x] Vertical timeline, animated draw-on connector line tied to scroll progress
- [x] Node markers that "arm" (one-shot ring + fill) as they enter viewport
- [x] Entries:
  - **Webmaster** — IEEE SIGHT Nenasa, Sri Lanka
  - **Vice Chair** — LeadSpring of IEEE IAS, SLIIT
- [x] Each card: role, org, period, 3 impact bullets, org tag
- [x] Alternating desktop layout → single rail on mobile
- [x] Reusable `<Section />`, `<SectionHeading />`, `<Tag />` — Stages 4–7 open the same way

**Accept when:** line draw syncs to scroll without jitter; mobile rail is clean.

### Stage 3 notes

> ⚠ **CONTENT TO CONFIRM — two kinds, both flagged in `src/data/experience.ts`.**
> **Dates:** no period was given for either role, so `period` is `null` and the card renders a
> visible `[ dates tbc ]` tag. A wrong date on a CV-shaped page is worse than a blank one.
> **Bullets:** the three bullets per role are _my wording_ for what each role ordinarily covers —
> not supplied achievements. No numbers, no claimed outcomes. **Order is also a guess**: Vice
> Chair is first as the more senior role, not because it is known to be more recent.

> NOTE: **Draft copy carries a dev-only marker.** Each card with `draftBullets: true` renders
> `⚠ draft copy` under its bullets behind `import.meta.env.DEV`, so unconfirmed wording is
> impossible to miss while reviewing. Verified absent from the production bundle (`grep` for
> "draft copy" in `dist` → 0). Setting `draftBullets: false` removes it.

> NOTE: **The rail is three layers, and the static one carries the layout.** A hairline track
> that is always present (so nothing about the layout depends on scroll position), a mint
> progress line scaled from the top, and a glowing head riding its end. The track means an
> unscrolled or JS-failed page still shows a complete timeline.

> NOTE: **No spring on the scroll progress.** Lenis already smooths the scroll position the
> rail reads from, so a spring on top would only add lag. The one case with no Lenis is reduced
> motion — where the line is drawn in full and never animates at all.

> NOTE: **The head is translated, not positioned.** Animating `top` in percent would put a
> layout pass in the scroll path every frame. Transform needs a pixel height, hence the
> ResizeObserver in `<TimelineRail />` — the rail spans the whole list, so its height changes
> whenever a card reflows.

> NOTE: **Known limitation of `useScroll({ target })`:** Framer measures the target on mount and
> on resize, but a late font swap shifts layout without firing either. Fonts are `font-display:
swap` and self-hosted, so the window is small; if the draw start ever looks off by a few dozen
> pixels on a cold load, this is why. Revisit in Stage 9.

> NOTE: **Nodes arm once, with a one-shot ring — not a permanent pulse.** The brief's plan said
> "pulse + fill"; a pulse that never stops turns the rail into a string of blinking lights. The
> ring expands and fades once at `-30% 0px -30% 0px` (a 40% band — tighter risks never firing on
> a short viewport) and the node stays filled. The ring is gated on `reduced` directly rather
> than left to `<MotionConfig>`, which would drop the scale and animate only the opacity.

> NOTE: **Cards keep left-aligned text on both sides of the rail.** Mirroring the alignment for
> the left column is the usual move and it reads worse — right-aligned bullet lists with leading
> markers fight themselves. The zigzag comes from the column alternation alone.

> NOTE: **Card hover is deliberately restrained** — border brighten, glow, a 2px lift and a
> lighting top edge. The mouse-tracking glow border is Stage 4's signature; spending it here
> would leave the projects grid with nothing of its own.

> NOTE: **`<Section />` owns `min-h-svh`**, not its callers. `useActiveSection` detects the
> active section with a 1px band through the middle of the viewport (Stage 1 note), so a short
> section can never activate and the nav indicator would skip it. Putting the height in the
> shell makes that invariant unbreakable per-stage.

> NOTE: **The `01 / SERVICE RECORD` eyebrow is `aria-hidden`.** It's in-fiction dressing; read
> aloud ahead of the real heading it is noise, and the `<h2>` already names the section.

> NOTE: **`<SectionScaffold />` now keys off a `BUILT` set** rather than an `!== 'hero'` check,
> so each stage removes its placeholder with a one-word edit.

**Verified:** `tsc -b` clean · `eslint` clean (0 warnings) · `prettier --check` clean ·
production build 5.7s / 49.1 kB CSS (9.7 kB gzip) / 345 kB JS (108.9 kB gzip) · every new
utility confirmed in the compiled CSS (`duration-400`, `inset-[0.3125rem]`,
`lg:w-[calc(50%-3rem)]` → `width:calc(50% - 3rem)`, `lg:right-1/2`, `lg:left-auto`,
`lg:ml-auto`, `-left-px`, `left-[7px]`, `top-[1.1rem]`, `top-[1.6rem]`) · the dev-only draft
marker confirmed **stripped** from the production bundle · all 7 new modules transform in dev.

**Not yet verified by me:** no browser here. Worth checking by hand:

- the line drawing in step with the scroll — start point, finish point, and no jitter
- both nodes arming as they reach the middle of the viewport, ring firing exactly once
- the alternation at `lg` and above: spur lengths, and that neither card touches the rail
- **390px**: single left rail, 16px node centred on it, cards not overflowing
- **Motion off**: rail fully drawn on arrival, no head dot, no ring, nodes filled
- that `[ dates tbc ]` and the `⚠ draft copy` marker are both as loud as they should be

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
     interactive AI tutoring/quizzing. _(feature tile)_
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

- [ ] **Replace `public/resume.pdf`** — currently a placeholder file (Stage 2)
- [ ] **Confirm every `inferred` field in `src/data/profile.ts`** (name, location)
- [ ] **Confirm `src/data/experience.ts`** — periods (currently `[ dates tbc ]`), the bullet
      wording (`draftBullets: true`), and the entry order (Stage 3)
- [ ] Lighthouse: Performance ≥ 95, A11y ≥ 95, Best Practices 100, SEO 100 — measure LCP for real
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

**Current status:** `STAGE 3 — complete, awaiting review` → next: `STAGE 4 — Mission Briefings (Projects Grid)`
