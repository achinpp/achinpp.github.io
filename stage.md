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
> keyframe demos) rather than a strip. ~~Deleted once Stage 7 lands~~ — **kept**: it is still the
> only way to reach the motion and grain toggles until Stage 8 puts them in the palette. Now on
> the Stage 9 list to lazy-load or delete.

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
> six lines would put LCP far later, since the name is by far the largest text on the page.
>
> **↳ THE ~1654ms FIGURE BELOW WAS WRONG. CORRECTED IN STAGE 10.** It was arithmetic, and it was
> arithmetic about the wrong moment: it added up `900ms boot + 260ms lead-in + ~494ms for line 0`
> and called that LCP. LCP is not "when the name starts revealing" — it is the last contentful
> paint in the hero grid, which keeps being re-reported as more of the grid becomes visible.
> Measured, the real figure was **2944ms**, not 1654ms. After removing the boot overlay it is
> **1776–1964ms across runs**. See Stage 10.

> NOTE: **The boot overlay is the main LCP cost and the one thing here nobody asked for.** It was
> my own addition in the Stage 2 plan. 900ms, dismissed by _any_ key, click or wheel, never
> shown under reduced motion, once per session (`sessionStorage`, not `localStorage` — a visit
> tomorrow should get it again, a reload in five seconds shouldn't). Deleting it buys ~900ms of
> LCP; say so and it goes.
>
> **↳ CORRECTED IN STAGE 10.** Measured in a real browser, it cost **1072ms**, not 900 — and it
> was the difference between failing and passing the 2.0s target. It is gone; `BootOverlay.tsx`
> and `useBootSequence.ts` are deleted. One `git revert` brings it back if you want it.

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

## STAGE 4 — Mission Briefings (Projects Grid) ✅

**Goal:** The depth section. Bento layout, not a uniform 3-column grid.

- [x] Bento: 1 feature tile (2×2) + 1 wide (2×1) + 2 standard tiles, responsive reflow
- [x] Card treatment: hairline border → **mouse-tracking glow border** on hover, inner
      highlight, subtle 3D tilt, classification stamp (`// BRIEFING_01`)
- [x] Tech-stack chips per card, status badge (`DEPLOYED` / `ACTIVE` / `DELIVERED` /
      `RESEARCH` / `ARCHIVED`)
- [x] Projects:
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
- [x] Click → expanded detail panel (shared-layout morph, not a jarring modal), Esc + scrim close
- [x] Reusable `useCardPointer`, `useFocusTrap`, `useScrollLock` — Stage 8's palette needs the
      last two

**Accept when:** glow-border tracking is smooth, detail morph has no layout flash,
body scroll locks correctly when open.

### Stage 4 notes

> ⚠ **CONTENT TO CONFIRM — far less than Stage 3.** Titles, every capability bullet and every
> named tool come straight from the brief. Three things don't, and all three are flagged in
> `src/data/projects.ts`: the **status badges** (the brief asked for them but never said which
> applies to what — `statusConfirmed: false` on all four, with a dev-only marker on the card and
> in the panel), the **repo/demo links** (none supplied, so `null` renders no button rather than
> a dead one), and the **taglines** (my one-line framing of each project).

> NOTE: **`DELIVERED` is a fourth status beyond the brief's three.** A costed network redesign is
> handed over, not deployed and not archived, and either of those would be wrong.

> NOTE: **The morph animates a bare frame; the content cross-fades.** The `layoutId` element is
> an empty background span, and the text is a _sibling_ of it, not a child. A layout animation
> scales its whole subtree, so content inside the morphing element would be squashed from card
> width to panel width and stretched back on the way across — the classic distorted-modal look.

> NOTE: **The content fades in on a 160ms delay, and that is what removes the layout flash.**
> The panel's text is at its final size from the first frame while the frame is still growing, so
> showing it immediately means a paragraph overflowing a card-sized box. The delay holds it at
> `opacity: 0` until the frame is most of the way there.

> NOTE: **The detail panel is portalled to `<body>`, and it has to be.** `<main>` is positioned
> with `z-index: var(--z-content)`, which makes it a stacking context — a descendant asking for
> `--z-overlay` (60) still paints under the nav at `--z-nav` (40), because the nav is a _sibling_
> of `<main>` and the whole of `<main>` is at 10. `layoutId` is unaffected: Framer measures in
> viewport coordinates, and React context carries the shared-layout registry through a portal.

> NOTE: **The spotlight is CSS custom properties written imperatively, collapsed to one write
> per frame.** `--mx` / `--my` go straight onto the card element and are read by a
> `radial-gradient`; React state would re-render the card on every mouse move, and mouse events
> outpace frames. Setting a custom property invalidates style and repaints the gradient, so a
> fast drag would otherwise queue several of those inside one frame for a single visible result.
> `useCardPointer` also serves the tilt from the same handler — two hooks would read
> `getBoundingClientRect()` twice per event for the same number.

> NOTE: **The glow really is the border, not a halo behind one.** The frame carries
> `background-clip: padding-box`, so its surface colour stops at the padding edge and the
> gradient one pixel outside shows _through_ the 1px border. With the default `border-box` clip
> the opaque background paints under the border and the effect is a faint outer bloom instead.

> NOTE: **Cards reveal with `fadeUp`, not `scaleIn`.** Framer cannot measure a layout animation
> correctly through an ancestor that is mid-`scale`, so a click during the entrance stagger would
> morph from the wrong rectangle. Opacity and translate are safe.

> NOTE: **Grid rows are `minmax(17rem, auto)`, not `grid-rows-2`.** Tailwind's `grid-rows-2`
> compiles to `repeat(2, minmax(0, 1fr))`, and a `1fr` row with a `0` floor does not grow for
> content that overflows it — a standard tile with a long title would spill out of its own frame,
> because the frame is absolutely positioned to the tile while the content is in flow.

> NOTE: **The hit target is a full-cover `<button>`, not a wrapper.** A `<button>` may only
> contain phrasing content and the card has an `<h3>` in it. The visible `open briefing →` line
> is `aria-hidden` decoration; the button carries the accessible name.

> NOTE: **`useFocusTrap` listens on `document` in the capture phase and re-reads the focusable
> list on every Tab.** A container-bound listener is silently dead the moment focus has already
> escaped, and a list cached on open traps against stale first/last elements in a panel whose
> content appears conditionally.

> NOTE: **`useScrollLock` stops Lenis as well as `<body>`.** `overflow: hidden` stops native
> scrolling, but Lenis drives the scroll position itself and would keep consuming wheel events
> behind the panel.

> NOTE: **Under reduced motion `layoutId` is dropped entirely** — no flight path, no tilt, no
> tracked glow. The panel opens centred and the cards keep a plain CSS border brighten on hover,
> which is also the touch and coarse-pointer behaviour.

> NOTE: **`<FloatingNav />` still has its own inline copy of the scroll-lock effect** from
> Stage 1 rather than using `useScrollLock`. The duplication is deliberate for now: the refactor
> is trivial but it would mean re-verifying the mobile sheet in a browser, which I can't do.
> Worth folding in during Stage 9.

**Verified:** `tsc -b` clean · `eslint` clean (0 warnings) · `prettier --check` clean ·
production build 3.7s / 52.2 kB CSS (10.2 kB gzip) / 359 kB JS (112.9 kB gzip) · bento spans,
`repeat(2,minmax(17rem,auto))`, `border-radius:1.0625rem` and `group-hover:border-mint-900` all
confirmed in the compiled CSS · `background-clip:padding-box`, `perspective:1400px`, both
`radial-gradient`s, `--mx`/`--my`, `createPortal` and `aria-modal` confirmed in the JS bundle
(inline React styles, correctly absent from the CSS) · all four project titles and every named
tool (Semgrep, Trivy, Gitleaks, VGG19, YOLO, Gemini API, Google ADK) present · **all three
dev-only markers confirmed stripped** from the production bundle · all 7 new modules transform
in dev.

**Not yet verified by me:** no browser here, and this stage has the most that can only be judged
live. Worth checking by hand:

- **the glow border tracking** — does it read as a lit edge following the cursor, or as a blob?
- the tilt: 5° maximum, which should be felt rather than seen. Too much? Say so.
- **the morph, both ways.** Open and close each of the four tiles and watch for: text at the
  wrong size during the flight, the frame arriving before/after the content, and the retraction
  after the scrim has faded
- **Esc** closes · **scrim click** closes · **Tab** stays inside the panel and wraps · focus
  returns to the card you opened
- the page behind must not scroll while a briefing is open — wheel, trackpad and touch
- **390px**: single column, four tiles, no overflow; panel at `max-h-[82svh]` scrolls internally
- **md (768px)**: first two tiles full-width, last two side by side
- **Motion off**: no tilt, no tracked glow, panel opens centred with no flight, border still
  brightens on hover

---

## STAGE 5 — Battle Station (CTF & Achievements) ✅

**Goal:** Proof of competition pedigree.

- [x] Achievement badges: hexagonal frames, rarity-tier glow, unlock animation on reveal
- [x] **RED CYPHER 3.0 — Finalist** as the hero badge
- [x] ~~Compact milestone timeline beside the badge wall~~ → the counters take that column
      instead, and the date lives under its own badge (see note)
- [x] Open-source contributions strip
- [x] Animated stat counters — count-up on in-view, once
- [x] **Locked slots** for the achievements that weren't supplied, instead of invented ones

**Accept when:** badges feel earned, not clip-art. Counters fire once, not on every scroll pass.

### Stage 5 notes

> ⚠ **THIS IS THE THINNEST SECTION IN THE BUILD, and the brief is why.** It named exactly one
> achievement — **RED CYPHER 3.0 — Finalist** — with no date, no other competitions, no writeup
> count and no specific open-source contributions. Nothing has been invented to fill the gap.
> **Send a real list and this section gets substantially better**; the machinery is already
> there and each entry takes the next slot.

> NOTE: **Unfilled frames are locked slots, and that is the design.** A rarity system needs more
> than one tier on screen to be legible, and a wall with a single badge reads as an accident. A
> dashed, padlocked frame labelled `SLOT_02 / UNASSIGNED` is the normal visual language of an
> achievement system — honest, on-theme, and it makes the gap self-evident rather than hiding it.
> `BADGE_SLOTS` in `src/data/achievements.ts` controls the count.

> NOTE: **Every counter is derived or absent — none is a guess.** `Missions logged` counts
> `PROJECTS`, `Leadership roles` counts `EXPERIENCE`, `Finals reached` counts achievements with
> `reachedFinal`. `Writeups published` was never supplied, so it prints `--` with a `[ tbc ]`
> marker rather than counting up to a figure nobody gave me. In dev each tile also shows where
> its number came from.

> NOTE: **The milestone timeline was dropped, deliberately.** With one confirmed achievement it
> would be a line with a single dot on it, which looks broken rather than compact. The counters
> fill that column properly and the date sits under its own badge. If more achievements arrive
> this is still the right shape — the wall grows, not a parallel list.

> NOTE: **The badge frame is an SVG path, not a `clip-path` hexagon.** A clipped `<div>` can't
> carry a visible border — the border box is what gets clipped, so the edge is cut at the
> diagonals — and it can't carry a dashed one at all, which the locked slots need. A stroked
> path gives both, crisp at any DPR.

> NOTE: **The rarity glow is `filter: drop-shadow()`, not `box-shadow`.** `drop-shadow` follows
> the rendered silhouette; a `box-shadow` on a hexagon traces the rectangle around it, which is
> immediately obvious and looks like a mistake.

> NOTE: **The travelling light on the legendary badge is the one knowingly expensive animation
> on the site.** An animated `stroke-dashoffset` repaints its path every frame — it can't be
> composited, unlike every other animation here. One small path on one badge is a fair price;
> the dash sum (340) equals the hexagon's perimeter so the loop is seamless. It is the deliberate
> exception to the rule set in Stage 1's scanline note, not an oversight.

> NOTE: **Counters write `textContent`, not state.** A count-up is ~70 frames, and 70 re-renders
> of a component tree to change two characters is what makes a page feel heavy for no visible
> reason. Same approach as the scroll percentage in `<StatusHUD />`. `useInView(…, { once: true })`
> is what satisfies the acceptance note — it fires on the first pass and never again. Under
> reduced motion the final figure is written immediately: the number is the content, the ticking
> is not.

> NOTE: **Caught during verification — dev-only strings were shipping.** The stat provenance
> started as a `source` field on each `Stat`, and a field on a data object ships whether or not
> anything renders it, because the gate is in the component. Moved to a `STAT_SOURCES` record
> behind `import.meta.env.DEV`, which the build replaces with the literal `false` so the whole
> object folds away. Confirmed: `derived from`, `not supplied` and `dev only` are all absent
> from the production bundle. **Worth remembering for Stages 6–7** — gating the render is not
> the same as gating the data.

> NOTE: **The open-source strip lists nothing, on purpose.** No individual contributions were
> named, so rather than an empty list or an invented one it points at the public profile — which
> is both true and the only source of truth that exists. Production copy says so plainly; the
> "nothing was supplied" warning is dev-only.

> NOTE: **No rarity labels.** The brief asked for rarity-tier _glow_, and the glow carries it.
> A `LEGENDARY` chip under the badge tips the whole section from "service record" into game UI.

**Verified:** `tsc -b` clean · `eslint` clean (0 warnings) · `prettier --check` clean ·
production build 7.1s / 54.2 kB CSS (10.5 kB gzip) / 371 kB JS (117.4 kB gzip) ·
`@keyframes trace`, `stroke-dashoffset:-340`, `animate-trace`, `aspect-ratio:100/116` and
`tabular-nums` confirmed in the compiled CSS · the hexagon path, the `52 288` dasharray and the
`drop-shadow` glow confirmed in the JS bundle · `RED CYPHER 3.0`, all four stat labels,
`[ date tbc ]`, `Slot_` and `unassigned` all present · **every dev-only string confirmed absent**
from the production bundle · all 6 new modules transform in dev.

**Not yet verified by me:** no browser here. Worth checking by hand:

- **do the badges feel earned?** That's this stage's acceptance criterion and the one thing I
  genuinely cannot judge without seeing it. The hero badge is 176px, the locked slots 128px.
- the travelling light on the hero badge — speed, thickness, and whether the loop seam shows
- the unlock animation (scale from 0.8 with a back-ease) and the event name scrambling in
- **counters fire once**: scroll past the section, back up, and past again — they must not re-run
- **390px**: four hexagons wrapping cleanly, the 2×2 counter grid, the strip stacking
- **Motion off**: badges present with no scale-in, no travelling light, figures written
  immediately, no magnetic pull on the GitHub link
- whether the locked slots read as intentional or as something broken — tell me if they don't,
  and the alternative is a single centred badge with no wall at all

---

## STAGE 6 — Arsenal (Tech Stack) ✅

**Goal:** Skills, without the tired progress-bar cliché.

- [x] Floating pill tags with idle drift, glow-on-hover, category filtering
- [x] Categories: Offensive Security · **AppSec & DevSecOps** · Development · **Cloud & Network**
      · AI / ML — five, not four (see note)
- [x] Tags: all seven from the brief, plus 13 derived from its own project descriptions,
      each marked
- [x] Filter chips re-layout the cloud with Framer layout animations
- [x] **No percentage bars** — nobody is 87% at Python

**Accept when:** filter transitions are fluid; drift animation doesn't cause CLS.

### Stage 6 notes

> ⚠ **TWO PROVENANCES, and the difference is marked in `src/data/skills.ts`.** `'stated'` is the
> seven skills the brief listed outright. `'derived'` is tools the brief names inside its
> _project_ descriptions — Semgrep/Trivy/Gitleaks from the DevSecOps pipeline, VLANs and extended
> ACLs and segmentation from Northbridge, VGG19/YOLO/adversarial ML from the surveillance system,
> Google ADK and the Gemini API from Study Coach. Listing something you built a project with is a
> derivation, not an invention, but it is still my call rather than a stated one. A dev-only
> legend under the cloud counts both and names every derived pill. **Prune anything you would not
> want to be asked about in an interview.**

> NOTE: **Five categories, not the four in my plan.** "Cloud & Infra" had no home for Semgrep,
> Trivy or Gitleaks, and filing SAST tooling under "Offensive Security" is wrong — those are
> defensive. The split is now Offensive Security · AppSec & DevSecOps · Development ·
> Cloud & Network · AI / ML, which also happens to mirror the brief's own three pillars
> (cybersecurity, DevSecOps, AI research) rather than cutting across them.

> NOTE: **The drift and the layout animation are on different elements, and have to be.**
> Framer's `layout` writes to `transform`, and so does the `drift` keyframe — and a running CSS
> animation beats an inline style in the cascade, so on a single element the re-layout would be
> silently overwritten every frame and the filter would simply not animate. The `<li>` moves;
> the `<span>` inside it floats.

> NOTE: **`layout="position"`, not `layout`, and entry/exit are opacity-only.** Pills never
> change size, so there is nothing to measure — and Framer's own guidance is that size
> measurement and `scale` interfere. A `scale` on an element that is also being laid out is the
> documented route to morphing from the wrong rectangle (same reason the project cards reveal
> with `fadeUp`, Stage 4).

> NOTE: **`mode="popLayout"` is what makes it read as a re-layout rather than a redraw.** An
> exiting pill is pulled out of flow immediately — Framer absolutely positions it — so the pills
> that remain start sliding on the same frame instead of waiting for a gap to collapse. The
> container carries `layout` so its height animates with them rather than snapping.

> NOTE: **Drift seeds are deterministic, from the pill's index in the full `SKILLS` array.**
> `Math.random()` would re-roll on every render, so a pill would jump to a new point in its
> cycle whenever the filter changed. Seeding from the _full_ list rather than the filtered one
> keeps it stable while pills come and go. The animation delay is **negative**, which starts each
> pill partway through its own cycle — otherwise all twenty begin at keyframe zero and the cloud
> pulses in unison.

> NOTE: **No CLS from the drift**, which is this stage's acceptance criterion: `@keyframes drift`
> only ever writes `transform`, which is not a layout property.

> NOTE: **Found while verifying — the CSS minifier rewrites `translate3d(x, y, 0)` as
> `translate(x, y)`.** That drops the 3D hint which, on legacy engines, was what forced
> compositor promotion. Current Chrome, Firefox and Safari promote any animated transform
> regardless, so behaviour is unchanged — but it means Stage 1's `translate3d only` phrasing
> describes the source, not the shipped CSS. The scanline is unaffected either way because it
> also carries an explicit `will-change: transform`. The pills deliberately **do not**: twenty
> `will-change` elements is twenty compositor layers of GPU memory to composite a ±5px wobble,
> which is the wrong trade.

> NOTE: **Pills are all the same size.** Varying them by implied strength is a proficiency claim
> with no number attached to argue with — the same thing a percentage bar does, just harder to
> pin down. The only visual differentiation is a category dot.

> NOTE: **Category dots are five steps of the mint ramp plus one neutral, not five hues.**
> `--color-breach-*` and `--color-signal-*` are reserved for danger and status semantics
> (Stage 0); spending them on "this one is an ML tool" would quietly break that contract
> everywhere else on the site.

> NOTE: **Clicking the active chip clears the filter.** Without it the only way back to the full
> cloud is to find the `All` chip again, which is a dead end people hit constantly in filter UIs.

> NOTE: **An `aria-live` region reports the count.** Filtering changes the list without moving
> focus, so a screen reader otherwise gets no indication that anything happened at all.

> NOTE: **`source` still ships to production, unlike Stage 5's `STAT_SOURCES`** — deliberately.
> It is a one-word enum that is part of the content model (it could legitimately drive production
> UI later), and it costs 13 copies of an interned string, against Stage 5's four full
> explanatory sentences. The lesson from Stage 5 stands; this is a judged exception, not an
> oversight.

**Verified:** `tsc -b` clean · `eslint` clean (0 warnings) · `prettier --check` clean ·
production build 2.8s / 55.7 kB CSS (10.6 kB gzip) / 376 kB JS (118.6 kB gzip) ·
`@keyframes drift`, `animate-drift`, `shadow-glow-xs` and the composite
`transition-property: color, border-color, box-shadow` all confirmed in the compiled CSS ·
all seven stated skills, every derived skill, all five category names, `arsenal-filter` and
`popLayout` confirmed in the JS bundle · **the whole `<ProvenanceLegend />` confirmed absent**
from the production bundle · all 4 new modules transform in dev.

**Not yet verified by me:** no browser here. Worth checking by hand:

- **the filter transition** — this stage's acceptance criterion. Click through all six chips and
  watch for pills teleporting instead of sliding, or the container height snapping
- **click the active chip** to clear, and check the indicator slides back to `All`
- the idle drift: is ±5px over 7–12s too much, too little, or distracting? It is the one thing
  here running continuously
- **no layout shift** while the drift runs — nothing below the cloud should twitch
- **390px**: the chip row wraps into a rounded block rather than a pill, and the cloud wraps
  without a pill overflowing
- **Motion off**: pills completely still, filter snaps with no slide, hover glow still works
- the dev-only provenance legend at the bottom of the section — that is your prune list

---

## STAGE 7 — Secure Channel (Contact + Footer) ✅

**Goal:** Close the loop.

- [x] Contact form styled as an encrypted comms terminal: monospace labels, `>`-prefixed fields,
      inline validation, `TRANSMITTING... → ✓ MESSAGE ENCRYPTED & SENT` success state
- [x] Form handler — **Formspree** chosen (reasoning below), honeypot + two rate guards
- [x] Social links with magnetic hover — GitHub and Email live; LinkedIn and TryHackMe/HTB
      render nothing because no handle exists
- [x] Footer: `LAST_BUILD` (real commit sha + date), back-to-top. **PGP line omitted** — see note
- [x] Copy-email-to-clipboard with toast
- [x] `<ToastProvider />`, `useToast`, `useCopy` — Stage 8's palette needs all three
- [x] `<SectionScaffold />` deleted — every section is now real

**Accept when:** form submits end-to-end, validation + error states all styled, no console errors.

### Stage 7 notes

> ⚠ **THE FORM HAS NO ENDPOINT, AND THIS IS THE ONE ITEM I COULD NOT FINISH.** It needs a
> Formspree form id, which only you can create. Until `VITE_FORM_ENDPOINT` is set:
> **in dev** the submit runs the real validation and then _simulates_ the round-trip so the
> TRANSMITTING → SENT states are reviewable, with a banner saying so in as many words;
> **in production** the submit button is disabled with a `CHANNEL NOT PROVISIONED` notice and
> the email address beside it is the working path. The form never tells a real visitor a message
> was delivered when it wasn't. See `.env.example`.

> NOTE: **Formspree over Resend, and the reason is architectural.** This is a static SPA — there
> is no server to put an API key on. Resend needs a secret, which means a serverless function,
> which means a backend to deploy and maintain for one contact form. Formspree takes a POST
> straight from the browser, filters spam server-side, and its endpoint is not a secret, so it
> lives in deploy config with no function wrapper.

> NOTE: **The honeypot is deliberately not checked client-side.** `_gotcha` is Formspree's own
> convention and is dropped on their side. Branching on it here would be worse than useless:
> password managers do sometimes fill hidden fields, and a client-side honeypot check would show
> a real person a false "sent". The two local guards — a 3s minimum fill time and a 30s minimum
> gap, both in `sessionStorage` — only stop the trivial case of a script that fills every field
> and posts instantly. The real filtering is Formspree's.

> NOTE: **`MESSAGE ENCRYPTED & SENT` is the brief's wording and it is true in exactly one
> sense:** the POST is TLS-encrypted in transit. It is not end-to-end encrypted and nothing here
> claims a key exchange. Flagging it because it is the kind of phrase a security reviewer will
> read literally.

> NOTE: **No PGP fingerprint, and none invented.** The plan called for a PGP line in the footer.
> A fabricated fingerprint is not decoration — it is a string somebody could try to verify a
> signature against, so a wrong one is actively worse than none. Set `PGP_FINGERPRINT` in
> `src/data/contact.ts` and the line appears; leave it `null` and it is omitted entirely.

> NOTE: **`LAST_BUILD` is real.** `vite.config.ts` injects the short commit sha and committer
> date through `define` at build time. Both calls are wrapped in try/catch — a deploy may run
> from a tarball with no `.git`, and a build that dies because it couldn't find a hash for a
> footer label would be an absurd way to fail. Shallow clones (the CI default) still answer
> `rev-parse` and `log -1`, so it works on Vercel and Netlify as-is. Verified: `1b0e2b3` and the
> ISO date are both literally present in the production bundle.

> NOTE: **Inputs have `outline: none` and the _wrapper_ shows focus** — border to mint plus a
> glow. Removing an input's outline without replacing the indicator leaves keyboard users with
> no idea where they are; the default ring also draws inside a border it doesn't match, which is
> what tempts people to remove it and stop there.

> NOTE: **Errors appear on blur or on submit, never while first typing.** Validating mid-keystroke
> means the message "needs at least 10 characters" is on screen for everyone who has typed four,
> which reads as the form arguing with you.

> NOTE: **The email pattern is deliberately loose** (`/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/`). Strict
> patterns reject valid addresses — plus-tags, long new TLDs, quoted locals — and the only check
> that proves an address works is sending to it.

> NOTE: **This is the first real use of `--color-breach-*`.** Stage 0 reserved it for danger
> semantics only; field errors and the transmission-failure alert are exactly that, and it has
> been unused on the site until now. That was the point of reserving it.

> NOTE: **Social links are rows, not icon buttons** — a deviation from the plan. With only two
> live channels, two bare icons is a worse answer than two rows showing the label and the actual
> handle. If LinkedIn and TryHackMe/HTB arrive, the icon-grid version becomes the right call
> again.

> NOTE: **One toast at a time, replaced rather than queued.** Everything that raises one is a
> single deliberate act, so two can only overlap if someone clicks twice — and then the second
> message is the one they want. The `key` is a counter, not the message: `AnimatePresence` keys
> off identity, so with the message as the key a second click on the same copy button would be a
> silent no-op.

> NOTE: **The form sits beside the channel list, not above it.** The form is the thing that may
> not be wired to an inbox, and when it isn't the working alternative has to be visible at the
> same moment as the notice saying so — not a scroll away.

> NOTE: **`<main>` lost its `pb-7`.** The footer is now the last thing in the flow and its own
> `pb-16` clears the fixed HUD strip.

> NOTE: **`?tokens` still ships the Stage 0 specimen sheet in the main bundle.** It is the only
> way to reach the motion and grain toggles until Stage 8 puts them in the palette. Added to the
> Stage 9 list to lazy-load or delete.

**Verified:** `tsc -b` clean · `eslint` clean (0 warnings) · `prettier --check` clean ·
production build 3.4s / 59.3 kB CSS (11.0 kB gzip) / 389 kB JS (122.2 kB gzip) · all four
breach-colour error classes confirmed in the compiled CSS · the injected commit sha `1b0e2b3`
and ISO date confirmed in the JS bundle · `Secure Channel`, `Message encrypted`, `Transmitting`,
`Channel not provisioned`, `_gotcha`, `scc.lastSend` and the email address all present ·
**every dev-only string and the entire simulate-mode branch confirmed stripped** from
production · `motion.output` / `motion.form` / `motion.dl` confirmed to resolve through Framer's
tag proxy · all 9 new modules transform in dev · no references to the deleted
`<SectionScaffold />` remain.

**Not yet verified by me:** no browser, and this stage is the one where that matters most —
"no console errors" is in the acceptance criteria and I cannot open a console.

Worth checking by hand:

- **submit the form in dev.** Empty submit → three inline errors. Fill it badly → errors on
  blur. Fill it properly and submit → `TRANSMITTING...` then the success panel, then
  `Send another`
- **both rate guards**: submit within 3s of load (should refuse), then send twice in 30s
- **Copy address** → toast appears above the HUD, and click it twice in a row to confirm the
  toast restarts rather than ignoring the second click
- **back-to-top** from the footer, and that `LAST_BUILD` shows a sane date and `1b0e2b3`
- **keyboard only**: Tab through the whole form — focus must be visible on every field via the
  wrapper border, and the honeypot must never receive focus
- **390px**: form, channel rows and footer all stacking without overflow
- **Motion off**: no magnetic pull on the channel rows, toast appears with no slide

---

## STAGE 8 — Command Palette (⌘K) ✅

**Goal:** The signature interaction. Built last so it can index everything.

- [x] Overlay with `⌘K` / `Ctrl+K` / `/` to open — **hand-rolled, not `cmdk`** (see note)
- [x] Commands: jump to each of the 5 nav sections, download résumé, copy email, compose email,
      open GitHub, toggle motion, toggle grain, open the token sheet, and `sudo`
- [x] Fuzzy search, keyboard-only navigable, recent-commands memory
- [x] Discoverable hint chip in nav + HUD

**Accept when:** fully keyboard-driven, focus trap correct, Esc restores focus to trigger.

### Stage 8 notes

> NOTE: **Hand-rolled instead of `cmdk` — the one plan deviation worth arguing about.** `cmdk`'s
> entry point pulls in `@radix-ui/react-dialog` and its transitive tree, and what it would have
> provided beyond that is a fuzzy scorer and a keydown handler. The overlay, scrim, focus trap
> and scroll lock already exist here from Stage 4 — `useFocusTrap` and `useScrollLock` were
> written partly for this stage. Confirmed: zero occurrences of `cmdk`, `command-score` or
> `radix` in the production bundle, and no Radix package in `node_modules`. **The real thing
> cmdk would have bought is a correct combobox**, so that part is implemented to the ARIA 1.2
> pattern rather than approximated.

> NOTE: **Focus never leaves the input, and the rows are deliberately not focusable.** The arrow
> keys move `aria-activedescendant`, not focus — that is what lets someone keep typing while the
> selection moves. The input is the `combobox` with `aria-controls` pointing at the `listbox`;
> each row is an `option` with `aria-selected`. A focusable option inside a combobox is the
> single most common way this pattern is got wrong, and it is why the rows are `<div>`s with a
> click handler rather than `<button>`s.

> NOTE: **Selection is tracked by command id, not list index.** The two toggles keep the palette
> open _and_ change their own label, and running any command promotes it into `Recent` — so the
> list reorders underneath the selection. An index would silently end up pointing at a different
> command; an id follows the command through the reorder.

> NOTE: **Both `Meta+K` and `Ctrl+K` are accepted on every platform.** Detecting the OS to decide
> which to honour means being wrong for anyone on a Mac with a PC keyboard, on Linux, or in a VM,
> and accepting both costs nothing. Only the chip's _label_ is platform-specific, and it reads
> the user agent because `navigator.platform` is deprecated. `preventDefault` is required:
> Ctrl+K is "focus the search bar" in Chrome and Firefox.

> NOTE: **`/` is ignored while typing.** Without the editable-target check, the slash in an email
> address, a URL or any sentence in the contact form opens the palette mid-word. The palette's
> own input is caught by the same test, so a slash typed into a search stays a slash.

> NOTE: **⚠ A real bug, found by testing the scorer rather than by reading it.** The résumé
> command is labelled `Download résumé`, and nobody types the accents — so `resume` scored 0 and
> the single most important command in the palette was unreachable by its own name. Fixed by
> folding diacritics (`NFD` + stripping the combining-marks block) on both sides. Prettier then
> rewrote the escape sequence into _literal_ invisible combining characters in the source, which
> works but renders as garbage in an editor and would break silently on any encoding mishap — so
> that was put back to `\u0300-\u036f` explicitly.

> NOTE: **The scorer has a test, and it is the only thing in this build I have actually been able
> to run.** 18 assertions over the real command labels: ranking (`proj` → Projects, `resume` →
> Download résumé, `bs` → Battle Station, `dfg` → Disable film grain), the score bands, case
> insensitivity, and that a label match always beats a keyword match. The bands are deliberately
> far apart so a prefix hit can never lose to a scattered subsequence hit no matter how many
> bonuses the latter collects. The test lives in the scratchpad, not the repo — there is no test
> runner configured, and adding one is a Stage 9 decision, not something to smuggle in here.

> NOTE: **`Recent` is `localStorage`; the boot overlay is `sessionStorage`.** Opposite intents:
> the point of a recents list is that it survives until tomorrow, and the point of the boot
> overlay is that tomorrow counts as a new visit. The stored value is also validated on read
> rather than trusted — anything could be under that key, from another tab, an older version, or
> someone with devtools open.

> NOTE: **The toggles use `keepOpen`.** Flipping grain or motion and watching the palette vanish
> means reopening it to undo it; staying open lets the effect be seen and reversed in place. The
> label and the `on`/`off` hint both flip immediately.

> NOTE: **`sudo` is hidden until the query is at least 3 characters and prefixes it.** A single
> `s` revealing an easter egg makes it furniture; `sud` is a deliberate request. It raises a
> toast with the real sudo refusal rather than doing anything.

> NOTE: **The hint chips are desktop-only (`sm:` and up), in both the nav and the HUD.** A
> keyboard shortcut is not an affordance on a phone, and the mobile nav pill has no room. Mobile
> keeps the nav sheet for navigation, and the résumé button, email link and GitHub link are all
> present in the page itself — so nothing is only reachable through the palette.

> NOTE: **Downloading uses a detached `<a download>` click, not `window.location`.** A navigation
> to a PDF is a navigation, and some browsers render it in place and lose the page.

> NOTE: **The palette sits at `--z-palette` (70), above the overlay tier (60)** — so the project
> detail panel can be open behind it without a stacking fight. Portalled to `<body>` for the same
> reason as that panel: `<main>` is a stacking context at `--z-content`.

> NOTE: **`HOTKEY_LABEL` lives in `src/lib/hotkey.ts`, not beside the chip.** A module that
> exports both a component and a constant breaks React Fast Refresh — every edit would full-reload
> instead of hot-swapping. ESLint caught this one.

**Verified:** `tsc -b` clean · `eslint` clean (0 warnings) · `prettier --check` clean ·
production build 4.3s / 60.9 kB CSS (11.3 kB gzip) / 401 kB JS (125.8 kB gzip) ·
**18/18 scorer assertions pass** (run against the real command labels via esbuild + node) ·
`palette-list`, `palette-opt-`, `combobox`, `listbox`, `aria-activedescendant`, every command
label, `scc.recent` and the `sudoers` string all confirmed in the JS bundle ·
`var(--z-palette)` confirmed wired · **`cmdk` / `command-score` / `radix` all confirmed absent**
from both the bundle and `node_modules` · all 9 new modules transform in dev.

**Not yet verified by me:** no browser and no screen reader. The ARIA wiring is written to the
spec and reasoned through attribute by attribute, but **I cannot confirm how NVDA or VoiceOver
actually announces it** — that is the one claim in this stage I am not able to stand behind from
here, and it matters more than usual because I chose to hand-roll the combobox.

Worth checking by hand:

- **⌘K / Ctrl+K** opens from anywhere, and again to close. **`/`** opens — then confirm it does
  _not_ while the caret is in a contact-form field
- **arrows wrap** top-to-bottom, `Home` / `End` jump, `↵` runs, `Esc` closes
- **Esc restores focus to whatever opened it** — this stage's acceptance criterion. Test from
  the nav chip, the HUD chip, and from the keyboard with focus somewhere in the page
- **Tab must stay inside the palette** and never reach the page behind it
- **fuzzy search**: try `resume`, `dfg`, `bs`, `cem`, `zzz` (should show "no matching command")
- **recents**: run two commands, close, reopen — they should be at the top, and still there
  after a full reload
- **the toggles stay open** and their `on`/`off` hint flips in place
- **`sud`** reveals `sudo`; `s` alone must not
- **Motion off**: palette appears with no slide or scale, and the motion toggle reads `off`

---

## STAGE 9 — Polish, Performance, Ship 🟡

**Goal:** Make it fast and make it real.

**Status: everything that does not need you, a browser, or a deploy target is done.** The
remaining boxes are grouped by who can actually tick them.

### Done in Stage 9

- [x] **Code splitting** — `TokenSheet`, `CommandPalette` and `ProjectDetail` lazy-loaded.
      Main bundle **400.6 → 372.3 kB** (125.8 → **119.2 kB gzip**); four chunks split out
- [x] **Full `<head>`** — title, description, canonical, Open Graph (absolute URLs), Twitter
      card, `profile:*`, JSON-LD `Person`
- [x] **Favicon set** — `favicon.svg` (hand-written, primary), `favicon.ico` (16/32/48),
      `icon-192`, `icon-512` (maskable padding), `apple-touch-icon`, `site.webmanifest`,
      corrected `theme-color`
- [x] **OG card** — a real 1200×630 PNG, generated from the OKLCH tokens
- [x] **404 page in-theme** — standalone, no React, no bundle, no webfont
- [x] **`<noscript>` fallback** — name, role, résumé link and GitHub link without JS
- [x] **Test runner + the scorer's tests moved into the repo** — `npm run test`, 8/8 passing
- [x] **`prefers-reduced-motion` full audit** — every path re-verified, results below
- [x] **Fold `<FloatingNav />`'s inline scroll-lock into `useScrollLock`** (carried from Stage 4),
      and replace its manual focus handling with `useFocusTrap` — which also fixes a real gap:
      the mobile sheet could be Tabbed out of
- [x] **`.gitattributes`** — ends the `LF will be replaced by CRLF` warning on every commit
- [x] **README** — scripts, the pre-deploy checklist, Vercel/Netlify/Pages notes, custom-domain
      steps, repo layout, the motion contract
- [x] Lazy-load `<TokenSheet />` (carried from Stage 7)

### Only you can do these

- [ ] **Replace `public/resume.pdf`** — still the placeholder that says it is one (Stage 2)
- [ ] **Confirm the inferred fields in `src/data/profile.ts`** — name, location, email
- [ ] **Confirm `src/data/experience.ts`** — periods (`[ dates tbc ]`), bullet wording
      (`draftBullets: true`), entry order (Stage 3)
- [ ] **Confirm `src/data/projects.ts`** — the four status badges, the taglines, and any public
      `repo` / `demo` links (Stage 4)
- [ ] **Supply real achievements** for `src/data/achievements.ts` — until then the wall is one
      badge and three locked slots (Stage 5)
- [ ] **Prune `src/data/skills.ts`** — 13 of 20 pills are `derived`, not stated (Stage 6)
- [ ] **Set `VITE_FORM_ENDPOINT`** — the contact form is disabled in production without it
- [ ] **Set `VITE_SITE_URL`** — defaults to the GitHub Pages URL; wrong value silently breaks
      every link preview
- [ ] **Supply LinkedIn and TryHackMe/HTB handles**, and a `PGP_FINGERPRINT` if one exists
- [ ] **Deploy** (Vercel / Netlify / Pages) — see the README

### Needs a browser I don't have

- [ ] **Lighthouse: Performance ≥ 95, A11y ≥ 95, Best Practices 100, SEO 100** — and **measure
      LCP for real**. Every LCP figure in this document is arithmetic, never a measurement
- [ ] **Responsive sweep**: 360 / 390 / 768 / 1024 / 1440 / 1920 / ultrawide
- [ ] **Cross-browser**: Chrome, Firefox, Safari — particularly `backdrop-filter`, OKLCH, and
      `aspect-ratio` on the hex badges
- [ ] **Screen-reader pass on the command palette** — the combobox is hand-rolled to the ARIA 1.2
      pattern and has never been heard out loud (Stage 8)
- [ ] **No console errors** — Stage 7's acceptance criterion, still unverified

### Stage 9 notes

> NOTE: **Code splitting, with the numbers.** `TokenSheet` (15.6 kB) is dev-only behind
> `?tokens`; `CommandPalette` (10.3 kB) is opened by a minority of visitors; `ProjectDetail`
> (4.2 kB) only ever renders after a click. None of the three can affect first paint, and all
> three were being paid for by everyone. The page sections are deliberately **not** split — they
> are below the fold but they are also the content, and a section that pops in on scroll is a
> worse experience than 20 kB.

> NOTE: **`fallback={null}` everywhere.** A spinner that flashes for 40ms on a same-origin chunk
> is worse than the thing simply appearing a frame later. The palette and the detail panel both
> animate in anyway, which covers the gap.

> NOTE: **The detail panel's morph survives being lazy.** The shared-layout animation measures
> the card's live position at click time, so a chunk arriving a frame late changes nothing about
> where the flight starts from.

> NOTE: **Open Graph needs absolute URLs, so `%SITE_URL%` is substituted at build time** by a
> small `transformIndexHtml` plugin, with `order: 'pre'` so the placeholders are gone before
> Vite's own HTML pass walks the document for assets. A relative `og:image` is the classic way to
> ship a link preview that silently renders blank on half the platforms that read it. The default
> is this repo's GitHub Pages URL — a working value, not a placeholder.

> NOTE: **The assets are generated from the OKLCH tokens, not from hex I typed in.**
> `scripts/generate-assets.py` converts OKLab → linear sRGB → gamma, so the icons and the OG card
> cannot drift from `globals.css`. Worth knowing what that conversion actually produces:
> `--color-obsidian-900` is **#07090f** — considerably darker than the "not `#000`" framing in
> the Stage 0 design notes implies, though still not black. `--color-mint-400` is **#65f9c8**,
> within rounding of the `#5EF6C9` the design direction named.

> NOTE: **⚠ The OG card uses system fonts, not the brand fonts.** The brand faces ship as woff2
> and decompressing woff2 needs Brotli, which is not installable here (see the npm note below).
> Consolas stands in for JetBrains Mono and Segoe UI Semibold for Space Grotesk. At the size a
> link preview is actually rendered the difference is not perceptible, but it is a substitution
> and the script's header says how to use the real faces.

> NOTE: **The monogram is geometry, not a glyph.** A hand-placed chevron and bar stay identical
> whatever fonts a machine has, and survive being scaled to 16px in a way a rasterised glyph does
> not. Drawn at 8× and downsampled, which beats any stroke antialiasing PIL offers. The SVG and
> the Python script carry the same coordinates.

> NOTE: **⚠ A real bug, caught by validating the favicon instead of trusting it.**
> `public/favicon.svg` had a comment naming the `--color-*` tokens — and **XML forbids `--`
> inside a comment**, so the file was not well-formed. Browsers are lenient enough that it may
> well have rendered anyway, which is exactly why it would have gone unnoticed. The comment now
> says why it cannot name the tokens.

> NOTE: **The 404 page deliberately shares nothing with the app.** No React, no bundle, no
> webfont — it is the one page that renders when something has already gone wrong, so it must not
> depend on the thing that might be broken. It also echoes the failed path with `textContent`,
> never `innerHTML`: a URL is attacker-controlled, and writing one as markup on a 404 page is a
> textbook reflected-XSS hole.

> NOTE: **No SPA rewrite, on purpose.** There is no client-side router here, so rewriting unknown
> paths to `index.html` would turn every typo into a soft 200 and hide the 404 page entirely. The
> README says this for both Vercel and Netlify.

> NOTE: **⚠ `npm install` cannot reach the registry from this machine** —
> `UNABLE_TO_VERIFY_LEAF_SIGNATURE`, i.e. TLS interception. **Vitest is therefore not installed**,
> and the fix for that error is to disable certificate verification, which is not a thing to do
> to a security portfolio to save a dependency. The tests instead use Node's built-in `node:test`
> with esbuild (already a Vite dependency) for the TypeScript — no new packages, `npm run test`,
> 8/8 passing. If `npm i -D vitest` works for you, the assertions port over almost unchanged.

> NOTE: **The JSON-LD block duplicates `src/data/profile.ts`, and cannot not.** `index.html` is
> static and parsed before any module runs, and moving the block into React would make structured
> data depend on JS execution. The duplication is called out in a comment at both ends.

#### Reduced-motion audit — the full sweep

Every animated path in the codebase, re-checked rather than assumed:

| Path                                                                    | Covered by                                                                                  | Verdict                                                                     |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| **17 CSS keyframe animations**                                          | all `motion-ok:` gated + the global `[data-motion='off']` rule                              | ✅ zero ungated                                                             |
| CSS `transition-*`                                                      | global `[data-motion='off']` → `transition-duration: 1ms !important`                        | ✅                                                                          |
| Framer `animate` / `whileInView` / `whileHover` / `whileTap` / `layout` | `<MotionConfig reducedMotion>`                                                              | ✅                                                                          |
| `GridBackdrop` rAF canvas + parallax + glow springs                     | canvas and glow render only when `!reduced && isFine`; parallax is `reduced ? 0 : parallax` | ✅                                                                          |
| `CustomCursor` springs                                                  | component mounts only when `isFine && !reduced`                                             | ✅                                                                          |
| `useTypewriter` setTimeout chain                                        | `instant` flag starts it complete                                                           | ✅                                                                          |
| `ScrambleText` setInterval                                              | writes the final text and returns                                                           | ✅                                                                          |
| `RoleRotator` setInterval                                               | not started; renders all three titles instead                                               | ✅                                                                          |
| `useBootSequence`                                                       | never shows the overlay at all                                                              | ✅                                                                          |
| `useCountUp`                                                            | writes the final figure immediately                                                         | ✅                                                                          |
| `useCardPointer` tilt + spotlight                                       | `rotateX`/`rotateY` are `undefined`, layers not rendered                                    | ✅                                                                          |
| `useMagnetic`                                                           | `x`/`y` are `undefined`                                                                     | ✅                                                                          |
| `TimelineRail` draw-on                                                  | `scaleY: reduced ? 1 : progress`, head not rendered                                         | ✅                                                                          |
| `ProjectDetail` / `ProjectCard` morph                                   | `layoutId` dropped entirely                                                                 | ✅                                                                          |
| Lenis smooth scroll                                                     | provider mounts no instance                                                                 | ✅                                                                          |
| `SkillPill` idle drift                                                  | inline `animationDelay`/`Duration` not applied; class is `motion-ok:`                       | ✅                                                                          |
| **HUD clock** (`setInterval`, 1Hz)                                      | _not gated_                                                                                 | ✅ **correct** — a clock is content; freezing it makes it lie               |
| **Toast auto-dismiss** (`setTimeout`)                                   | _not gated_                                                                                 | ✅ **correct** — a lifetime, not an animation                               |
| **HUD scroll meter** (`scaleX` ← `scrollYProgress`)                     | _not gated_                                                                                 | ✅ **correct** — a position readout; it only moves because the user scrolls |
| **ScrollHint fade** (`opacity` ← `scrollY`)                             | _not gated_                                                                                 | ✅ **correct** — same reason                                                |

Four deliberate non-gates, all of them content or position rather than motion. Nothing else is
ungated.

**Verified:** `tsc -b` clean · `eslint` clean (0 warnings) · `prettier --check` clean across
`src`, `index.html`, `vite.config.ts`, `package.json`, `README.md` and this file ·
`npm run test` **8/8** · production build 5.5s / 60.9 kB CSS (11.3 kB gzip) / **372.3 kB JS
(119.2 kB gzip)** plus four lazy chunks · `favicon.ico` validates as a 3-icon ICO (16/32/48) ·
all five PNGs validate at their declared sizes · `favicon.svg` parses as well-formed XML ·
`site.webmanifest` parses as JSON · the JSON-LD block parses and contains no placeholders ·
`%SITE_URL%` confirmed fully substituted in `dist/index.html` with absolute `og:url`,
`og:image` and `canonical` · `dist/` contains `404.html`, both favicons, all icons, `og.png`,
`site.webmanifest` and `resume.pdf` · the test file confirmed absent from the production bundle.

**Accept when:** all boxes checked and the site is live.

---

## STAGE 10 — Browser Verification Pass ✅

**Not in the original plan.** Stages 0–9 all shipped with the same caveat — _"not verified by me:
anything visual, and no real LCP number"_ — because I had no browser. Chrome and Edge turned out
to be installed, and Python's `websockets` can drive the DevTools Protocol with no npm packages
at all. This stage closes that gap and turns it into a repeatable check.

**Goal:** stop claiming and start measuring.

- [x] `scripts/browser-check.py` — drives real Chromium over CDP, `npm run check:browser`
- [x] **Console**: zero errors, warnings or exceptions (Stage 7's criterion, never checked)
- [x] **LCP measured** (Stage 2's criterion, previously arithmetic)
- [x] **CLS measured** (Stage 6's criterion — the idle drift)
- [x] Screenshots at 1440 / 768 / 390, per section, palette open, reduced motion, 404
- [x] Keyboard-driven palette test, including that `aria-activedescendant` resolves
- [x] DOM assertions: landmarks, heading order, duplicate ids, accessible names
- [x] Reduced-motion verified by `getAnimations()`, with a positive counterpart
- [x] Four real defects found and fixed

**Accept when:** the check passes and its findings are fixed. ✅

### What it found

> ⚠ **1. LCP was 2944ms — it had never passed.** Stage 2 claimed ~1654ms from arithmetic, and
> the arithmetic was about the wrong moment: it measured when the name _starts_ revealing. LCP
> is the last contentful paint in the hero grid, and the grid keeps being re-reported as more of
> it becomes visible. **Fix: the boot overlay is gone** — measured at 1072ms of pure delay, and
> it was my own addition that nobody asked for. Now **1776–1964ms across runs** (±~90ms of
> measurement noise). It passes, but see the caveat below.

> ⚠ **2. The ⌘K chip was showing at 390px.** `PaletteHint` set a base `inline-flex`, and
> Tailwind emits `.inline-flex` _after_ `.hidden` — so the caller's `hidden sm:inline-flex` lost
> the cascade and the site advertised a keyboard shortcut on a phone. Display is now the
> caller's to set, and the check asserts the visibility at all three widths so it cannot come
> back.

> ⚠ **3. One of my own reduced-motion assertions was vacuous.** It queried `[data-boot]` — an
> attribute that never existed — so it passed unconditionally. **A check that cannot fail is
> worse than no check**: it reports confidence it has not earned. Replaced with
> `getAnimations().filter(playState === 'running')`, which is the real question, plus the
> positive counterpart with motion _on_ — because if that one reports zero, the kill switch is
> stuck and the reduced-motion pass proves nothing.

> ⚠ **4. The badge wall wrapped.** At `lg:col-span-7` the column is 655px and the four hexagons
> need 656px, so `SLOT_04` dropped onto a row of its own and read as broken rather than as a
> second row. Now 8/4 instead of 7/5, which leaves ~100px of slack.

### Stage 10 notes

> NOTE: **Three of four LCP "optimisations" were reverted, because they did nothing.** After
> removing the boot overlay I trimmed the lead-in, the CTA delay, the CTA fade duration and the
> name's reveal duration. Measuring each: the boot overlay was worth ~1100ms, the lead-in and CTA
> delay together ~100ms, and **the other two were worth nothing at all** — the number moved less
> than the ±90ms noise floor. They were reverted. A change that does not move the metric should
> not cost design quality, and the whole point of measuring is to be able to tell the difference.

> NOTE: **Chrome 155 rejects `Host: 127.0.0.1` on the DevTools endpoint.** DNS-rebinding
> hardening: it closes the connection with no response, which reads exactly like "the port never
> opened" and cost a debugging detour. Only `localhost` works. Noted in the script.

> NOTE: **The check is not Lighthouse and does not pretend to be.** It measures the three things
> that were actually written into the stage acceptance criteria and never checked, and it exits
> non-zero, so it can gate a deploy. Lighthouse is still worth running — it covers throttling,
> TBT and the audit catalogue, none of which this touches.

> NOTE: **Per-section screenshots are the point, not a bonus.** A full-page capture of a site
> this tall is unreadable. One frame per section, after a 1.4s settle so the in-view reveals have
> finished, is what makes the build reviewable without opening a browser — and it is how defect
> 4 was found.

> NOTE: **Measurements are localhost and headless.** They carry no network latency and no CPU
> throttling, so they are a floor, not a forecast.

**⚠ THE LCP CAVEAT, STATED PLAINLY.** The worst of three consecutive runs was **1964ms** against
a 2000ms target — 36ms of headroom, on localhost, with no throttling. **On a real connection
this will exceed 2s.** The remaining time is almost entirely the hero's own choreography: lead-in,
then line 0 of the terminal typing, then the name's mask reveal. The decisive fix is to stop
gating the name on the typing at all, which would put LCP near first paint — but it costs the
brief's `whoami` → name beat, so it is a design call rather than a bug, and it is yours.
Lighthouse on the deployed site is the real number.

**Verified:** `tsc -b` clean · `eslint` clean (0 warnings) · `prettier --check` clean ·
`npm run test` 8/8 · `npm run check:browser` **all checks pass** · production build
370.6 kB JS (118.8 kB gzip) / 60.9 kB CSS (11.3 kB gzip) · LCP 1776–1964ms · CLS 0.0152 ·
console clean on the site, under reduced motion, and on the 404 page.

**Still needs a human:** Lighthouse on the deployed site, Safari and Firefox (this pass is
Chromium only), and a screen reader on the palette combobox. Everything else that was open at
the end of Stage 9 is content you supply — see the Stage 9 checklist.

---

## STAGE 11 — The Portrait ✅

**Not in the plan either.** You dropped `devfest_photo.png` into the repo and asked for it near
the name. It is now the figure standing to the right of the headline, in the one large empty
area the hero had.

- [x] `assets/portrait-source.png` — the source cut-out, not served and not bundled
- [x] `scripts/process-portrait.py` — trims to the alpha box, writes `public/portrait.webp`
- [x] `src/components/hero/Portrait.tsx` — four layers, documented in the file
- [x] `PORTRAIT` in `src/data/profile.ts`, nullable: set it to `null` and the figure, the
      caption and the layout slot all disappear with no other edit
- [x] Measured against a build without it, interleaved, to see what it costs
- [x] Two regression guards and one harness fix in `scripts/browser-check.py`

**Accept when:** it looks deliberate rather than pasted on, and it does not cost the hero its
performance budget. ✅

### What it actually is

**236 kB → 24 kB.** Trimmed to its alpha bounding box (the source carried 40px of transparent
padding across the top, which would have meant the layout box and the subject were different
shapes) and encoded as WebP with `exact=True` — without that flag the encoder rewrites the RGB
under fully transparent pixels to whatever compresses best, and those invented colours bleed
back out through the semi-opaque pixels along the cut-out edge as a halo.

**Desaturated, with the colour on hover.** The palette is obsidian and mint; the shirt is covered
in primary-coloured shapes. Untouched it reads as a screenshot pasted onto the page.

**The glow follows the person, not a box.** `drop-shadow` respects the alpha silhouette where
`box-shadow` would trace the rectangle. The mint sheen is masked by the image's own alpha so the
tint lands on the subject rather than on the transparent air around them — which is also why the
asset is a single WebP URL and not a `<picture>`: the same file is the image and the mask, so it
is one fetch and one decode. (WebP with alpha: Chrome 32+, Firefox 65+, Safari 14+.)

**The bottom dissolves.** The source is a hard torso crop. A fade on the wrapper turns the cut
into a horizon instead of an edge.

### Stage 11 notes

> NOTE: **The figure is last in the DOM, and that is a mobile decision.** Beside the name it
> wants to come before it; at 390px the grid collapses and putting it before the name pushed the
> name itself below the fold, which is the one thing the first screen has to contain. It is
> placed explicitly into row 2 on `lg`, so the desktop layout pays nothing for the source order
> and the visual order still matches the DOM — no `order` utility, nothing for a screen reader
> to disagree with.

> NOTE: **The caption is inferred, and flagged as such.** `DevFest Sri Lanka · 2025` is read off
> the shirt in the photograph and the filename it arrived under. That says where the picture was
> taken, which is not a claim about what you did there — but it is still not something you told
> me, so `captionConfirmed: false` puts a dev-only ⚠ under the figure until you say otherwise.
> Setting `caption: null` renders the figure with no caption at all.

> NOTE: **`<link rel="preload">` was written, measured, and deleted.** It is the textbook move
> for a hero image, and it is wrong here: the LCP element is the `<h1>`, which is gated on the
> bundle executing, so a preload spends early bandwidth on something that is not the metric.
> Twelve cold loads could not separate it from the noise either way, so the tie was broken on the
> thing that is not a measurement — the preload duplicates `PORTRAIT.src` into `index.html`,
> where nothing would catch the two drifting apart.

> NOTE: **The JSON-LD `Person.image` now points at the portrait rather than the OG card.** A
> `Person`'s image should be a picture of the person. The OG tags still use `og.png`, which is
> the share card and a different job.

### ⚠ What the measurement actually said

The figure was measured against a build without it, **interleaved** — A, B, A, B — because the
first attempt compared two blocks taken ten minutes apart and the machine drifted more between
the blocks than the change did within them.

|                       | min    | median | max    |
| --------------------- | ------ | ------ | ------ |
| **A** — no portrait   | 1988ms | 2020ms | 2488ms |
| **B** — with portrait | 1912ms | 2376ms | 2404ms |

Per-pair delta: **+212, +288, +392, −84, −100 ms.** Mean +142ms, and two of five runs negative.
**That is not a result.** The spread inside the control arm alone is 500ms, so the honest
statement is that the portrait's LCP cost is somewhere between "nothing" and "a few hundred
milliseconds" and this machine cannot tell which. CLS went 0.0152 → 0.0157, which is nothing;
both dimensions ship on the `<img>`, so the box is reserved before the bytes arrive.

> NOTE: **The far more alarming number in that table is the control arm.** Stage 10 recorded
> 1776–1964ms for code that now measures **1988–2488ms, unchanged**. Nothing regressed; the
> machine is simply slower today than it was then. Everything Stage 10 said about LCP — including
> the caveat that it will exceed 2s on a real connection — holds, and this is one more reason the
> real number is Lighthouse on the deployed site.

### Harness changes

> **LCP is now the best of three cold loads**, with the HTTP cache disabled before the _first_
> navigation so all three are genuinely cold, and all three are printed. Stage 10 gated on a
> single measurement; this stage is what that turned out to be worth. The best is the right
> statistic, because every source of noise on a localhost measurement only ever makes it slower.
> The spread is printed because hiding it would repeat the mistake the change exists to fix.

> **Two new assertions.** `hero portrait decoded` reads `naturalWidth`, which is the only thing
> that tells the truth about a broken image: Chrome logs no console error for an `<img>` that
> 404s, the alt text is still there, and the layout box is still reserved by the width/height
> attributes — the rest of this script would have passed a hero with a hole in it. And
> `hero still fits one 900px viewport`, because adding anything to the hero pushes the scroll
> hint into the HUD strip and nothing else here would notice. That one caught the first version
> of this figure, at 16.5rem.

**Verified:** `tsc -b` clean · `eslint` clean (0 warnings) · `prettier --check` clean ·
`npm run test` 8/8 · `npm run check:browser` **all checks pass** — LCP **1704ms** best of
1704–2312ms, CLS 0.0157 · production build 372.7 kB JS (119.4 kB gzip) / 62.3 kB CSS (11.7 kB
gzip) · `portrait.webp` 24.2 kB in `dist/` · the dev-only caption warning confirmed absent from
the production bundle · figure reviewed in-browser at 1440, 768 and 390 and under reduced motion.

**Still yours:** confirm or clear the caption. Everything else open is unchanged from Stage 10.

---

## STAGE 12 — Your Content ✅

The first stage where the content is yours rather than placeholders with warnings attached.
Skills, two new profiles, a second competition result, an open source contribution, three more
roles, and a classification on every briefing.

- [x] **64 skills**, all supplied, across 8 categories, replacing the 20 that were half inferred
- [x] **LinkedIn, TryHackMe and HackTheBox** live in the contact panel and in the structured data
- [x] **CryptX 2.0 CTF, Top Performer** on the badge wall, with Team Cipher and the organiser
- [x] **IEEE Sri Lanka Section, Contributor** in the open source strip, deliberately unlinked
- [x] **Three more roles**: SKU IoT Club, SKU IoT Challenge 26, Research Club at Dharamaraja
      College. Five entries on the timeline, up from two
- [x] **`kind` on every briefing**: three `PROJECT`, one `RESEARCH`
- [x] **No em dashes and no hyphens in prose**, across every string the site renders

**Accept when:** nothing on the page is a guess that you did not ask for. ✅

### Four things that had to change shape, not just content

> NOTE: **`RESEARCH` was a status, and it should never have been.** It sat in the same union as
> `ACTIVE` and `DEPLOYED`, which made it impossible to say that a piece of research was also
> active. It is now `kind`, a separate axis, and the surveillance system carries `RESEARCH` and
> `ACTIVE` at once. The status union lost a member and gained nothing.
>
> It renders as a second line under the index stamp rather than beside it. Beside it was the
> first attempt and the two narrow bento tiles are 235px of inner width against a 180px stamp
> and a 60px status chip, so `// BRIEFING_03 · RESEARCH` wrapped mid stamp and read as a bug. A
> second chip next to the status was the other option and it is worse: `PROJECT` says nothing on
> three cards out of four, where under the index it is quiet enough to ignore until the one that
> says `RESEARCH` catches the eye.

> NOTE: **`Finals reached` was deleted, because the second achievement broke it.** The counter
> was backed by a `reachedFinal` flag, which worked while the only entry was a Finalist placing.
> A Top Performer recognition is an honour and not literally a final, so the flag would have
> been a small lie either way it was set. The tile now reads `Competition results` and counts
> the wall, which is a claim that cannot drift away from what the wall shows.

> NOTE: **The organiser moved out of the badge and under the wall.** `note` renders in a 128px
> badge column, and `Team Cipher. Organised by the ICT Society (ICTS), Faculty of Technology,
University of Sri Jayewardenepura.` wrapped to six lines and knocked the whole row out of
> alignment. It is now two fields: `note` for the three words that belong under the badge, and
> `organiser` for a footnote under the wall. The footnote is the better home anyway, since a
> competition is worth more with the body that ran it named in full.

> NOTE: **Nine filter chips do not fit on one line.** At full length the category names come to
> roughly 1700px against a 1152px container, so the control wrapped to three rows and stopped
> reading as one control. The chips now show short labels (`Offensive`, `AI & LLM`, `Web & Code`)
> and carry the full category name as the button's accessible name, so nothing is lost to a
> screen reader. The container also lost `sm:rounded-full`: a pill shaped box with two rows of
> chips inside it reads as a mistake at every width where it happens.

### Stage 12 notes

> NOTE: **The IEEE Sri Lanka Section row has no link, and that is a choice rather than a gap.**
> Every other empty URL on this site is something I had nothing to link. This one you asked not
> to link. `CONTRIBUTIONS[].href` is `null` and the row renders as plain text; give it a URL and
> it becomes a link with no other change. The distinction is written into the component so it
> survives someone later "fixing" it.

> NOTE: **⚠ `OSCP` is in the skill list and it is the one entry worth arguing about.** It is a
> certification, not a technique, and in a cloud of skills it reads as "I hold the OSCP". If you
> hold it, it belongs on a credential line with a date and a verification link, where it is
> worth far more. If you do not, it should come out. It is left exactly where you put it, with
> the question recorded in the file header.

> NOTE: **Ten pills were removed because they are not in your list**, including Python, FastAPI,
> Node.js, Semgrep, Trivy, Gitleaks, YOLO and VGG19. Several still appear on the project cards.
> That is not a contradiction: a stack list says what a project used, a skill cloud says what you
> want to be asked about in an interview. Worth a look all the same.

> NOTE: **Long names are abbreviated on the pill and expanded in a `title`.** SOAR, EDR, MCP,
> LLMs, UX Design and PCB Design. Nothing is renamed, only shortened, and the abbreviations are
> the forms people use anyway.

> NOTE: **The pills are smaller below `sm`.** Sixty four of them at desktop padding come to one
> per row on a 390px screen and roughly 3000px of scrolling. One size down and the short names
> pair up, which roughly halves the section.

> NOTE: **`sameAs` and `knowsAbout` in the JSON-LD were updated too.** Structured data that
> claims a different set of skills from the page is worse than none. `sameAs` now carries all
> four profiles, which is the single highest value thing in that block for an identity query.

> NOTE: **`SKU` is unexpanded and `Dharamaraja College` is spelled as you wrote it.** Neither is
> something to guess at on a page about you.

### The dash rule

Every string the site renders was swept for `—` and for hyphens used inside sentences, including
the page title, the meta description, the Open Graph tags, the 404 page, the section ledes, the
form messages and the dev only warnings. `README.md` was swept as well. The footer's invalid date
glyph changed from `—` to `--`, which also gives the site one glyph for a missing value instead
of two, since the stat tiles already used `--`.

Not swept: code comments written before this stage, and Stages 0 to 11 of this document. They are
full of them. Everything written from here on follows the rule, and the rest is a mechanical pass
away if you want it.

**Verified:** `tsc -b` clean · `eslint` clean (0 warnings) · `prettier --check` clean ·
`npm run test` 8/8 · `npm run check:browser` **all checks pass**, LCP 1712ms best of 1712–1880ms,
CLS 0.0214 · production build 380.0 kB JS (121.2 kB gzip) / 65.7 kB CSS · Arsenal, Battle
Station, Mission Briefings, Experience and Secure Channel all reviewed in browser at 1440, 768
and 390.

---

## STAGE 13 — The Boot Sequence ✅

The terminal leaves the landing page and becomes the loading screen. The hero loses its meta
rail. Screenshots arrive on two briefings, Red Cypher gets its details, and two review only
markers come out.

- [x] **The `root@shadow` terminal is a boot overlay**, with a real progress bar, four ways to
      skip it, and a reduced motion path that does not show it at all
- [x] **The hero is the name and the portrait**, nothing else
- [x] **No caption on the portrait**, and no caption mechanism either
- [x] **Screenshots on BRIEFING_01 and BRIEFING_02**, in the card and at full size in the panel
- [x] **Red Cypher 3.0** carries Team LO49 and its organisers
- [x] **The dev only markers are gone** from Arsenal and from Experience & Leadership
- [x] Boot overlay, scroll lock, focus and every image on the page are now asserted by
      `npm run check:browser`

**Accept when:** the terminal runs once, in front, and the page it hands over to is the page. ✅

### What the boot screen had to be, and what it costs

> NOTE: **The page is already behind the glass.** The whole site renders on the first frame and
> the overlay sits on top of it, opaque. It is not a gate holding anything back. So the lift is
> a fade with nothing to wait for, and anyone who skips lands on a page that is already laid
> out and decoded. That keeps the cost honest: the boot screen adds time to the first thing a
> visitor can **read**, and there is no way around that, but it adds nothing to the work the
> browser has to do.

> NOTE: **The script was retuned, because the old one measured 5.0s.** That was fine when it
> ran beside the name and you could read the page while it typed. As the only thing on screen
> it is five seconds of nobody being able to do anything. Two of its six lines also repeated
> what the page says better anyway: `cat ./role` against the role rotator directly under the
> name, and `status --availability` against the availability pill in the HUD. Both are gone,
> the rest is faster, and the sequence now runs ~1.8s with the page revealed by ~2.3s.
>
> `whoami` stays. The eyebrow over the name reads `identity confirmed`, and that is the command
> it is confirming.

> NOTE: **It replays on every load.** Remembering in `sessionStorage` would spare a returning
> visitor the wait, and it would also mean a reload during review shows something different
> from a reload in a fresh tab. Predictable won. One read in the `useState` initialiser in
> `<BootProvider>` reverses it if you would rather have the other trade.

> NOTE: **Reduced motion skips it outright**, rather than showing a still of it for the same
> duration. A loading screen over an already loaded page is decoration, and that is the one
> thing the preference unambiguously asks for less of. The preference is known synchronously on
> the first render, so nothing flashes.

> NOTE: **Four ways out:** the button in the window chrome, Escape, a click anywhere on the
> glass, and the preference above. All four go through one `dismiss` callback, which jumps to
> the end of the script while it is running and takes the page immediately once it is done.

> NOTE: **LCP now reads better and means less.** The measured figure went from 1764ms to
> 1244ms, and that is not an improvement anybody can feel: the largest paint is now the overlay,
> which is a big opaque box that arrives early. Time to the name is about 2.3s. The metric is
> still worth keeping because a regression in it is still a regression, but this stage's number
> should not be compared to Stage 12's.

### Two defects the browser pass found, both in this stage's own work

> NOTE: **Focus dropped onto `<body>` for the last 700ms of the sequence.** The skip button was
> gated on `!done`, so it unmounted the moment the script finished, and the focus trap had
> nothing left to hold. A keyboard user's place on the page quietly disappeared behind glass
> they could not see past. It stays mounted now, which is also the better control: once the
> transcript is done it skips the hold and the fade instead of skipping nothing.

> NOTE: **My own new check failed against correct code.** It probed the instant `[data-boot]`
> appeared, which is one frame before React runs the passive effects that take the scroll lock
> and move focus, so it reported a modal that never locked anything. The check polls for the
> settled state now. This is the same class of mistake as the phantom `[data-boot]` selector
> recorded at Stage 10, from the other direction: that one could never fail, this one could
> never pass.

### The hero, after

> NOTE: **The `FOCUS / BASED / AFFILIATION` rail is gone and nothing went with it.** The roles
> are in the rotator directly under the name. The location is in the HUD along the bottom edge
> and in the contact panel. The IEEE chapters are on the experience timeline, where they come
> with a role and a date instead of sitting as three bare words. The rail was a summary of
> things the page already says, placed above the thing it was summarising.

> NOTE: **The portrait caption is gone, and so is the caption field.** `DevFest Sri Lanka 2025`
> was inferred from the shirt in the photograph and the filename it arrived under. A `caption`
> sitting at `null` would have been an empty slot, and an empty slot is an invitation to fill
> it with a guess, so the whole mechanism went. The figure is also 16rem to 18rem wider now the
> terminal has vacated the hero, which is still inside the band where a 451px source is sharp.

### The briefing captures

> NOTE: **The Packet Tracer diagram needed real work, not a filter.** It arrived as a flat grey
> canvas with black labels on it, which on an obsidian page is a slab of daylight. A CSS
> `invert()` turns mid grey into mid grey and the thing still glares; a light plate turns the
> card into a window with the lights on. So `scripts/process-media.py` splits the pixels by
> chroma: achromatic pixels are the canvas, the labels and the white screens, and their alpha
> becomes their distance from the canvas lightness while their colour becomes the site's own
> ink; coloured pixels are the Cisco icons and the green link lights, and those are the diagram,
> so they are kept exactly as they are. The result is a schematic drawn in the site's ink on the
> site's background, which is what a network diagram in a portfolio should look like anyway.

> NOTE: **Natural aspect ratio, no crop.** A fixed band with `object-cover` was the first
> attempt and it is wrong for these two in particular: the topology runs edge to edge, so any
> crop takes a router off the end of it, and a diagram missing its ISP link is not a smaller
> diagram but a wrong one.

> NOTE: **The capture sits under the copy, not in the card's bottom block.** In the bottom block
> it was pushed to the foot of a card that stretches to match its row, which on the feature tile
> opened a 200px hole between the capability list and the screenshot. Under the copy the slack
> collects below the picture instead, where it reads as a margin above a footer.

### The markers that came out

> NOTE: **The Arsenal legend and the `DRAFT COPY` marker are gone, and so are the fields behind
> them.** `source: 'stated' | 'derived'` held the same value sixty four times once the skill
> list became wholly yours, and `draftBullets` was `true` on all five roles. A warning that
> fires on everything has stopped warning about anything. What they were saying now lives in the
> file headers: the bullets are still my wording for what each role ordinarily covers, and that
> is worth replacing with something you actually did.
>
> The markers on the **project status badges** and on the **contact form** stay. Those still
> point at one specific unconfirmed thing each.

### Red Cypher 3.0

> NOTE: **⚠ `Red_Cypher_3.0.jpeg` is not in the project folder,** and nothing by that name is
> anywhere on this machine. The panel that would show it is built, wired and currently rendering
> nothing, which costs the layout nothing at all. Drop the file into `assets/` as
> `red-cypher-source.jpeg`, run `python scripts/process-media.py`, and paste the two numbers it
> prints into `ACHIEVEMENTS[0].image`.
>
> The nearest thing on this machine is
> `Pictures\Linkedin\redcypher 3.0\WhatsApp Image 2026-09-16 at 21.37.04.jpeg`. It is the
> qualifier round announcement poster, listing twenty qualifying teams with LO49 among them. It
> was not used: it is the organiser's marketing graphic with nineteen other teams on it, and it
> says `Online Qualifier Round` under a badge that says Finalist. Say the word if it is the one
> you meant.

> NOTE: **⚠ The date is still blank.** Your message read "date is" and stopped.

> NOTE: **The organiser line is yours, not the poster's.** You wrote `IEEE SB of UOR & HackSL`
> and the footnote expands that to `IEEE Student Branch of the University of Ruhuna and HackSL`.
> Worth knowing: the poster above credits `Organized By` to the IEEE Computer Society (UoR
> Student Branch Chapter) and the University of Ruhuna IEEE Student Branch, and lists HackSL as
> `Media Partner`. You are the authority on your own competition, so it stands as you wrote it.

**Verified:** `tsc -b` clean · `eslint` clean (0 warnings) · `prettier --check` clean ·
`npm run test` 8/8 · `npm run check:browser` **all checks pass**, LCP 1244ms best of
1244-1744ms, CLS 0.0064 · production build 382.5 kB JS (122.1 kB gzip) / 63.3 kB CSS · boot
overlay, hero, briefings and Battle Station all reviewed in browser at 1440 and 390.

## STAGE 14 — In The Field ✅

Four volunteering photographs land under the experience timeline, cut down to a title, a place
and at most one line each. The IoT Challenge role finally gets real bullets.

- [x] **A new block under the timeline**, four cards, no seventh nav entry
- [x] **Four photographs processed**, cropped to one shape and dimmed to sit on the page
- [x] **The Sussex photograph is unmirrored**, so the signs in it read forwards
- [x] **`sku-iot-challenge-26` carries your own account** of the platform instead of my draft
- [x] `npm run check:browser` counts seven images now and fetches every one of them

**Accept when:** the block reads as evidence for the roles above it, not as a photo gallery. ✅

### What was cut, and why that was the job

> NOTE: **You sent four write ups and asked for the important parts only.** They run several
> paragraphs each. What went in is a title, a place and at most one line; what came out was
> every pleasantry ("it was a rewarding experience", "proud to have led"), every restatement of
> the title, and every detail that belongs to a role rather than to a photograph. A portfolio is
> not a feed. Four paragraphs under four pictures would bury the one thing a visitor takes from
> this block, which is that the teaching happened and here is what it looked like.

> NOTE: **The IoT Challenge stack was not cut, it was moved.** Node.js endpoints, Google Apps
> Script, the Sheets API, token validation, duplicate prevention, rate limiting, the automated
> confirmations, the glassmorphism frontend and the Canvas particle grid are now three bullets
> on `sku-iot-challenge-26` in `src/data/experience.ts`, which is where a hiring reader looks
> for a stack. That entry had my invented draft wording until now, so this is the first of the
> five roles to carry your own account. Four to go.

> NOTE: **The embedded systems lecture has no note and no venue**, because your line named
> neither. `Embedded Systems Lecture / First year students` is the whole card. It leaves a gap
> under the mono line where the other three carry a sentence, and that gap is correct: the card
> is quieter because there is less that is actually known.

### Why it is not a seventh section

> NOTE: **A nav entry promises a destination.** Four photographs are not one. They are also
> literally what the roles above them did on the day: the IoT Club entry ran the workshop, the
> dev team entry built the platform. Directly under the rail they read as evidence for the list
> they follow; two sections away they would read as a gallery. The rail's scroll range stops at
> the last role, so the line still finishes before the photographs start.

### The photographs

> NOTE: **Cropped in the asset, not with `object-cover`.** Three of the four arrived as tall
> phone portraits. Letting CSS crop them to 4:3 would have shipped most of a megabyte of pixels
> the page never draws. `scripts/process-media.py` now has a second pipeline for photographs:
> one 4:3 window, placed by a per picture `focus` value rather than centred, since the subject
> in a phone portrait is almost never in the middle. Captures keep their own shape, because for
> a screenshot the shape is information.

> NOTE: **⚠ The Sussex photograph arrived mirrored.** Every sign in it reads backwards, which is
> what a phone does when it saves a selfie camera frame the way the viewfinder showed it. It is
> flipped back, so the room is the room that was there and `SMART BOARD ROOM` is readable. One
> flag in the job list reverses that if you would rather ship it exactly as it came.

> NOTE: **Dimmed harder than the first attempt.** They went in at the Battle Station treatment,
> `saturate(0.5)` over 80% opacity, and four photographs at that strength were the brightest
> thing on the page: the lecture hall in particular is a white ceiling under fluorescent light.
> They sit at `saturate(0.4) brightness(0.86)` over 70% now, full colour on hover. 146 kB for
> all four, lazy loaded, below the fold.

> NOTE: **⚠ The IoT Challenge photograph is you at a lectern**, not the platform your write up
> describes. It is the one picture that came with that story, so it is the one on the card, and
> the card says what the photograph is rather than claiming to show a screen. A capture of the
> platform itself would be a better card if you have one.

### Housekeeping

> NOTE: **`README.md` and `stage.md` were CRLF on disk** and had been failing `prettier --check`
> since Stage 13, because the patch scripts that wrote them used `write_text`, which translates
> newlines on Windows. `core.autocrlf` is `true` here, so git normalised them on the way in and
> `git status` showed nothing wrong. Both are back to LF.

**Verified:** `tsc -b` clean · `eslint` clean (0 warnings) · `prettier --check` clean ·
`npm run test` 8/8 · `npm run check:browser` **all checks pass**, LCP 1040ms best of
1040-1220ms, CLS 0.0064 · production build 386.1 kB JS (123.3 kB gzip) / 63.4 kB CSS · 0 em
dashes and 0 dev only strings in the bundle · the new block reviewed in browser at 1440 and
390, top and bottom.

## STAGE 15 — Red Cypher, With Evidence ✅

The two finals photographs arrive, the organiser line is corrected, and the result finally says
what field it was drawn from.

- [x] **Two photographs under the badge wall**, team portrait and finals floor
- [x] **REF Media branding bars trimmed** out of both in the asset
- [x] **The credit moved to a readable line** under the pair rather than a 9px strip
- [x] **The organiser line corrected** to the form burnt into your own photographs
- [x] **`Finalist from more than 100 teams`**, phrased as you asked for it
- [x] An achievement can now carry more than one picture

**Accept when:** the hexagon says Finalist and the panel under it shows why. ✅

### The result line

> NOTE: **Your placing is deliberately not on the site.** You said 19th of more than 100, and
> then said to put it as reaching the finals from that field. So the line reads
> `Finalist from more than 100 teams, and one of the 40 at the physical finals.` Both halves are
> your own numbers. Say the word and the second clause comes off, leaving the single sentence
> you actually dictated.

> NOTE: **It had to go above the pictures, not under the badge.** The hexagon column is 128px
> and the note under it has to survive at that width. `Team LO49` fits; a sentence with two
> numbers in it wraps to six lines and knocks the badge row out of alignment, which is the exact
> failure recorded at Stage 5. The field record panel is the first place on this wall with a
> full measure of text in it.

> NOTE: **⚠ The date is still blank**, asked for twice now. Neither photograph carries EXIF to
> read it off; both have been stripped, which is what a download from a social platform does.

### The organiser

> NOTE: **Corrected to the form on your own photographs.** You first wrote `IEEE SB of UOR &
HackSL`, and at Stage 13 I kept that and flagged that the qualifier poster disagreed. Your
> correction says `IEEE of Ruhuna university`, and the footer burnt into both of these photos
> says `ORGANIZED BY IEEE COMPUTER SOCIETY OF THE UNIVERSITY OF RUHUNA`. The footnote now reads
> `Organised by the IEEE Computer Society of the University of Ruhuna.` HackSL is gone from it,
> because your correction did not name them.

### The photographs

> NOTE: **The branding bars came off in the asset.** Both sources carry a REF Media strip, and
> one is boxed in by a second white sponsor bar across the top. A white logo strip on an
> obsidian page is the same slab of daylight as the Packet Tracer canvas, so `trim` cuts the
> measured rows off before anything else runs.

> NOTE: **The credit did not come off with it.** These are the organiser's official
> photographs, not yours or mine, so the names move to a line under the pair where they are
> readable instead of 9px tall: REF Media, University of Ruhuna, and the two photographers the
> bar names. If that line is wrong in any particular, it is the one thing on this page worth
> fixing before the site is public.

> NOTE: **16:9, not the 4:3 the field photographs use.** A 4:3 window on the team portrait is
> 1399px wide against a row of three people spanning 1510px, so somebody loses an arm. The crop
> shape is per job now, and `focus` works on whichever axis is being cut rather than only the
> vertical one.

> NOTE: **An achievement carries a list of pictures now**, not one. Two photographs of the same
> event fill the two column grid exactly, and the alternative was inventing a second achievement
> to hang the second picture on.

> NOTE: **Both sources were swapped for tighter frames at your request**, `red_cypher4` for the
> finals floor and `red_cypher3` for the team portrait. Same two scenes, shot closer, so the
> faces carry at card size instead of being three small figures across a wide room. The bar
> depths were measured again off the new files rather than assumed: 102 rows on one and 101 on
> the other. Nothing else changed, and the output dimensions came out the same bar a single
> pixel of height.

### Housekeeping

> NOTE: **The last two commits were rewritten to drop a stray `@`.** A PowerShell here string
> went into a Bash command, so the quoting leaked and `@` landed as the first line of two commit
> messages, which made it the subject. One was caught before it was pushed, one was not.
> Rewriting it meant a force push over `main`, done at your request. The trees are byte for byte
> what they were; only the messages and therefore the hashes changed. If you have a clone of
> this repo anywhere else, it needs a fresh fetch.

**Verified:** `tsc -b` clean · `eslint` clean (0 warnings) · `prettier --check` clean ·
`npm run test` 8/8 · `npm run check:browser` **all checks pass**, 9 images fetched, LCP 1412ms
best of 1412-2404ms, CLS 0.0064 · Battle Station reviewed in browser at 1440 and 390, on both
sets of photographs.

---

## STAGE 16 — Volunteering Is A Section ✅

`In the field` becomes `Volunteering`, leaves the experience timeline, and takes its own place
below the Arsenal with a real section heading and a nav entry.

- [x] **A seventh section**, `05 / FIELD OPS`, between Arsenal and Contact
- [x] **The heading is the display face**, the same treatment as `Secure Channel`
- [x] **Nav, HUD, palette and the active indicator all picked it up** from one array
- [x] **Everything renamed from `outreach` to `volunteering`**, files and assets included
- [x] **The Sussex photograph replaced** with the frame you sent

**Accept when:** it reads as somewhere to go rather than something under something else. ✅

> NOTE: **This reverses the call made one stage ago, and the new one is better.** Stage 14 put
> the photographs under the timeline on the argument that a nav entry promises a destination and
> four pictures are not one. That was a judgement about layout. The judgement that matters is
> about weight: volunteering you have to scroll past on the way to something else is
> volunteering nobody counted. It now has a heading in the display face, an index, a codename
> and a line in the palette, and it costs the nav bar about 110px at 1440, which it has.

> NOTE: **Everything came from one array.** `src/data/sections.ts` gained a row and Contact's
> index went from `05` to `06`. The floating nav, the HUD readout, the active section indicator
> and the command palette all read that file, so none of them were touched. The palette went
> from 12 options to 13 on its own, which is the whole point of the single list.

> NOTE: **`outreach` is gone as a word.** The data file, the type, the constant, the component,
> the four source photographs and the four generated assets were all named `outreach`, and
> leaving half of them while the section on screen says `Volunteering` is the kind of split that
> makes a codebase lie to the next person reading it. One word, one thing.

> NOTE: **The Sussex frame is the one you sent**, and it is still mirrored at the source, so it
> is still flipped back. The crop sits lower in the frame than the old one, at `focus=0.55`,
> because this version puts the adults near the top and the children working near the bottom and
> a centred window would have cut the circuit on the table.

> NOTE: **The experience lede lost its last sentence.** It pointed at photographs that are no
> longer underneath it.

**Verified:** `tsc -b` clean · `eslint` clean (0 warnings) · `prettier --check` clean ·
`npm run test` 8/8 · `npm run check:browser` **all checks pass**, seven sections in order, 13
palette options, 9 images, LCP 1200ms best of 1200-1884ms, CLS 0.0064 · the new section and the
nav reviewed in browser at 1440 and 390.

---

## STAGE 17 — No Placeholder, No Skip ✅

Two small removals. The badge wall stops announcing a date nobody gave it, and the loading
screen stops offering a way out of itself.

- [x] **`[ date tbc ]` is gone** from under every badge
- [x] **The organiser moved into that caption**, out of the footnote list under the wall
- [x] **The footnote block is deleted**, along with the code that built it
- [x] **The `skip` button is gone** from the boot terminal chrome
- [x] **The overlay takes focus itself**, now that it has no focusable child

**Accept when:** nothing under a badge points at a gap, and the loading screen does not come
with an exit sign. ✅

> NOTE: **A placeholder is not the same thing as honesty.** `[ date tbc ]` was there so the site
> would never imply a date it did not have, which was the right instinct and the wrong control:
> it put a small grey note under every badge drawing attention to something no reader had asked
> about. A date renders when there is a date. The field is still on the type, so giving me one
> is a one line edit.

> NOTE: **The organiser belongs with its badge.** It was a list under the wall, which asked a
> reader to carry an event name down the page and match it against two rows of small type for a
> fact that takes four words. In the caption it is simply the last thing the badge says. The
> phrase `Organised by the` went with the move, because under a title and a team name the line
> reads as the organiser without being told; it survives as `sr-only` text so a screen reader
> still gets the relationship.

> NOTE: **The organiser sets at 10px.** It is the longest line on a 128px column, and the
> University of Sri Jayewardenepura entry runs to about five words per line at that size. The
> alternative was widening the caption past the hexagon, which pushes the four badge row over
> the width of its column at anything under about a 1200px window and wraps it into two rows.
> Small type on the existing grid beats a wider grid that breaks earlier.

> NOTE: **The `skip` button is gone at your request, and three exits remain.** Escape, a click
> anywhere on the glass, and the reduced motion preference, which never shows the overlay at
> all. The argument for the button was that nobody should have to sit through a typing animation
> to read a name. The argument against it is yours and it is better: a loading screen that
> advertises its own exit is a loading screen admitting it is in the way, and this one is 1.8
> seconds over a page that has already rendered behind it.

> NOTE: **Losing the button cost the overlay its only focusable child.** It was carrying more
> than its label: the focus trap seeded focus from it, so without it focus would have stayed on
> `<body>` behind glass nobody can see past, the dialog would never be announced, and the trap
> would have had nothing to hold. The overlay now takes `tabIndex={-1}` and focuses itself on
> mount, and an `sr-only` line says how to leave, since there is no longer a control to find.

**Verified:** `tsc -b` clean · `eslint` clean (0 warnings) · `prettier --check` clean ·
`npm run test` 8/8 · production build clean at 386.15 kB JS (123.54 kB gzip), 0 em dashes and
0 occurrences of `date tbc` left in the bundle. ⚠ **No browser pass on this one yet.** The
preview server was stopped while the session was idle because the machine was low on memory,
and it is not restarted without you asking.

---

## STAGE 18 — The Scoreboard ✅

The finals leaderboard joins the two photographs, and the field note loses its second clause.

- [x] **`and one of the 40 at the physical finals.` removed** from the Red Cypher note
- [x] **`red_cypher3.png` processed** into `public/media/red-cypher-leaderboard.webp`
- [x] **A third picture on the Red Cypher record**, below the pair
- [x] **Photographs and captures now render differently**, because they are different things

**Accept when:** the scoreboard is readable and the pair above it still reads as a pair. ✅

> NOTE: **This puts your placing on the site, and that reverses an instruction.** You asked for
> the result to be framed as reaching the finals from a field of more than 100 and for 19th to
> stay off, and the field note still says exactly that. The scoreboard says `#19` in red at the
> top of the frame and highlights the LO49 row. Both can be true on one page and the screenshot
> is the stronger evidence, but it is your call to make deliberately rather than by accident, so
> it is flagged in `src/data/achievements.ts` too. Delete that one entry and the placing is gone
> again with nothing else to change.

> NOTE: **It is a capture, not a photograph, and the code now knows the difference.**
> `AchievementImage` gained a `kind`. A photograph is cropped to a shared shape, desaturated at
> rest, captioned over the picture and laid two to a row. A capture keeps its own shape, keeps
> its colour, runs the full width and is captioned underneath. A scoreboard at half width is a
> table nobody can read, and the gradient caption the photographs use would have sat on top of
> the last row of it.

> NOTE: **The credit line moved up, above the capture.** `Photographs: REF Media…` sits under
> the two photographs it actually credits. Left where it was, it would have ended up under a
> screenshot of a web page, which is nobody's photograph.

> NOTE: **28 rows came off the bottom of the capture.** The source stops part way through rank
> 22, and half a table row reads as a screenshot taken carelessly rather than as a list that
> continues. The cut lands on the row separator at y=796, measured off the file. The rest of the
> frame is untouched: it is already a dark interface, so it needs nothing but an encode.

**Verified:** `tsc -b` clean · `eslint` clean (0 warnings) · `prettier --check` clean ·
`npm run test` 8/8 · asset 1171x797 at 31.6 kB · production build clean at 387.22 kB JS
(123.76 kB gzip), 0 em dashes and 0 occurrences of the removed clause. ⚠ **Still no browser
pass.** The preview server was stopped for low memory while the session was idle and is not
restarted without you asking, so this and Stage 17 are both waiting on one.

---

## STAGE 19 — The Pipeline, Proved ✅

Two captures land on `BRIEFING_04`, and a briefing can hold more than one picture now.

- [x] **`devsecops_CICD.png`** processed into `media/devsecops-pipeline.webp`, 956x820
- [x] **`devsecops_CICD2.png`** processed into `media/devsecops-webgoat.webp`, 1032x250
- [x] **`media` is a list**, not one picture or none
- [x] **The card shows the first, the briefing panel shows both**
- [x] **`trim` cuts all four edges**, not just the top and the bottom

**Accept when:** the briefing shows the gate firing and the app it fires against. ✅

> NOTE: **The first capture is the best thing on this briefing.** It is a run of the workflow in
> which build, Semgrep, Trivy filesystem and Trivy container all pass and the Gitleaks gate
> fails, on a commit whose own message says it adds a dummy AWS key to prove the gate. That is
> not a screenshot of a pipeline, it is a screenshot of a pipeline working, and the difference
> is the whole project. The alt text says so for anyone who cannot see it.

> NOTE: **The card shows one picture and the panel shows both.** A card is a thumbnail of a
> briefing rather than a gallery, and `BRIEFING_04` is a standard tile sharing a row with
> another one, so a stack of screenshots in it would set the height of that row against its
> neighbour. The dark GitHub Actions frame is the one on the card; the WebGoat frame is a bright
> band and it waits until someone has opened the briefing.

> NOTE: **The captions name the picture now.** They read `capture · briefing_04`, which was fine
> while a briefing had one picture and useless the moment one had two, so `ProjectMedia` carries
> a short `label` and the caption uses it. The other two briefings got labels as well, which is
> a small improvement in its own right: `the segmented topology` says more than the index
> already printed at the top of the panel.

> NOTE: **592 columns and 173 rows came off the WebGoat frame.** The source is a 1624x423 strip,
> of which the right third is a devtools pane repeating the response text that is already
> readable in the page, and the bottom is empty white. What is left is the two things that are
> actually the evidence: the traversal payload in the address bar and the directory listing it
> returned, with `path-traversal-secret.jpg` highlighted in it. `trim` grew from two numbers to
> four to do it, and the three jobs that used it were updated.

> NOTE: ⚠ **It is still a white frame on an obsidian page.** The page body in that capture is a
> plain WebGoat response, so there is no equivalent of the Packet Tracer canvas trick available
> here without misrepresenting what the browser showed. It is dimmed at rest like every other
> capture and it only appears inside the briefing panel, which I think is enough. If it reads as
> a slab of daylight when you look at it, say so and it can be cropped to the address bar and
> the first three lines.

**Verified:** `tsc -b` clean · `eslint` clean (0 warnings) · `prettier --check` clean ·
`npm run test` 8/8 · assets 32.7 kB and 46.6 kB · production build clean at 387.88 kB JS
(123.99 kB gzip) · both generated files reviewed directly. ⚠ **Still no browser pass.** Stages
17, 18 and 19 are all waiting on one: the preview server was stopped for low memory while the
session was idle and is not restarted without you asking.

---

## STAGE 20 — The Badge Opens ✅

The finals scoreboard goes behind the Finalist hexagon. Hover it on a mouse, tap it on a phone.

- [x] **The hexagon is the control**, not a link beside it
- [x] **Hover opens it on a mouse**, tap toggles it where there is no hover
- [x] **Keyboard opens it too**, with Escape to close and `aria-expanded` to say which
- [x] **The scoreboard leaves the field record**, so the two photographs are a pair again
- [x] **A `scoreboard` sub label inside the hexagon**, so the badge looks operable

**Accept when:** the badge says `Finalist` and can prove it. ✅

> NOTE: **This is a better home for that picture than the one it had.** The scoreboard was in
> the field record at the same weight as the two photographs, which made three pictures of
> roughly equal importance under a wall that only claims one thing. A scoreboard is not a
> picture of the day, it is the receipt for the word on the hexagon, and a receipt belongs
> behind the claim. The two photographs are a pair again, which is the shape that grid was
> built for.

> NOTE: **Hover owns the panel, and the click does nothing where there is a hover.** `isFine`
> comes from the pointer provider, which is a `(hover: hover) and (pointer: fine)` media query
> rather than a user agent guess. Without that split, hovering opens the panel and the click
> that follows closes the thing the visitor was reaching for. Where there is no hover, the tap
> is the only way in, so it toggles, and a tap anywhere else closes it.

> NOTE: **It is a `<button>` with `aria-expanded`, not a tooltip.** A tooltip is for a short
> label and announces itself as one; this is a disclosure wrapped around a picture. Focus opens
> it, blur and Escape close it, and the accessible name reads `Finalist Show the finals
scoreboard` rather than leaving a keyboard user to guess that a hexagon is operable. Badges
> with no reveal are not buttons at all, so nothing lands on a focus stop that does nothing.

> NOTE: **The hint is inside the hexagon.** Under it, the extra line pushed this badge's title
> lower than the one beside it and broke the top alignment of the row. Inside, it costs no
> height and reads as a sub label on the badge, which is what it is. Without any hint the
> hexagon is a picture nobody knows to touch: `cursor: pointer` cannot be seen from across a
> page.

> NOTE: **The panel is portalled to `<body>` and positioned by arithmetic.** It is
> `position: fixed`, and Framer leaves a transform on the badge's list item after the unlock
> animation, which would make a fixed child position against that transform instead of the
> viewport. The placement is computed from the trigger's box and the picture's own aspect ratio
> rather than measured after a render, because measuring means painting it in the wrong place
> for one frame first. It goes above the badge when there is room, below when there is not,
> narrows itself when the viewport is too short, and clamps 16px clear of every edge.

> NOTE: **Any scroll closes it.** Lenis moves the real scroll position, so the panel would
> otherwise sit at coordinates that stopped being true. Closing beats recomputing: on a mouse
> the pointer has left the badge anyway, and on a phone a scroll is how people dismiss things.

> NOTE: **The picture is fetched on approach, not on open.** It is 32 kB and no longer on the
> page, so without a prefetch on the first `pointerenter` the first hover opens an empty frame
> and fills it a beat later.

> NOTE: **`check:browser` gained six assertions** for this: that the picture is not on the page
> until it is asked for, that `aria-expanded` starts false, that focusing the badge mounts the
> panel and loads the right file, that `aria-expanded` follows, that the button says what is
> behind it, and that Escape closes it. The page image count went from 11 back to 10, because
> the scoreboard is no longer among them.

**Verified:** `tsc -b` clean · `eslint` clean (0 warnings) · `prettier --check` clean ·
`npm run test` 8/8 · production build clean at 389.92 kB JS (124.55 kB gzip), the reveal costing
about 2 kB. ⚠ **Still no browser pass.** Stages 17 to 20 are all waiting on one, and this is the
stage that most wants it: hover, tap and keyboard are three paths that only a browser can
settle. The preview server was stopped for low memory while the session was idle and is not
restarted without you asking.

---

## STAGE 21 — Four Cards, One Size ✅

The IASS console joins the wall, and the briefings stop stretching.

- [x] **The surveillance console is in** as the research briefing's capture
- [x] **The bento is gone**, and with it the 340px hole in the feature tile
- [x] **Four cards of one size**, two columns from `md`, one below it
- [x] **Every capture clamped to 240px**, so no picture sets the row height
- [x] **The pipeline run lost its tab bar**, so the clamp falls below the failing gate
- [x] **A keyboard bug in the Stage 20 reveal**, found by the first browser pass, fixed

**Accept when:** no card in a row is more than about 50px shorter than the one beside it. ✅
Measured in a browser at 1440: row one 655 and 655, row two 655 and 655, with 55px of slack
above one tag block and 6px, 0px and 0px above the other three. It was about 340px and 250px.

> NOTE: **The bento was the stretch.** The feature tile stood two rows tall beside a column of
> two stacked cards, so its height was whatever those two came to: about 1060px against 720px of
> content. A grid row is as tall as its tallest cell whatever the cell would have liked, so the
> slack had nowhere to go but into a hole between the screenshot and the tags. The fourth card,
> with no picture at all, sat 250px short of the one next to it. The weighting was designed for
> a set of briefings where one had a screenshot and three did not, and the one with the picture
> had to be the big tile for the grid to balance. All four carry one now, so there is nothing
> left for the weighting to say and `ProjectSpan` is gone from the data.

> NOTE: **The capture moved above the title, and that is what lines the row up.** The
> classification stamp is the only fixed height thing in a card, so a picture directly under it
> starts on the same line on every card in the row. Under the copy, which is where it used to
> sit, each picture started wherever its own title and tagline happened to end and four cards
> read as four unrelated tiles.

> NOTE: **Clamped, not cropped to a shape.** A fixed band would have to pick between `cover`,
> which takes a router off the end of the Packet Tracer topology, and `contain`, which puts
> 190px of dead plate either side of the near square pipeline run. A clamp needs neither: a
> picture keeps its own aspect ratio until it passes 240px and then the overflow comes off the
> bottom. 240 is set where it is because only one capture of the four reaches it. A clamp that
> bites three pictures is a crop pretending to be a clamp.

> NOTE: **49 rows off the pipeline run.** With the repository tab bar still on it, the clamp
> landed 17px above the row that says the secrets gate failed, which is the only reason that
> picture is on the card and what its label claims it shows. The cut is on the tab bar's own
> bottom border, measured rather than guessed.

> NOTE: **The capabilities and the whole stack are on every card now.** Three of the four used
> to carry a title, one line and three pills with a `+2` after them, which is a card that makes
> you open it to learn anything. Four cards of one size have the room, and `+2` is a worse thing
> to read than the two words it hides.

> NOTE: ⚠ **The first browser pass on Stage 20 found a real keyboard bug.** The reveal closed on
> any scroll, and the browser scrolls a focused element into view, so tabbing to the Finalist
> badge opened the panel and the scroll that focus itself caused shut it again within a frame.
> The panel now follows the badge while the badge is on screen and closes when it leaves, which
> is the honest behaviour anyway, since it is anchored to the badge rather than to the page.
> `check:browser` drives that probe from the keyboard, so it would have caught this at Stage 20
> had the pass been run.

**Verified in a browser this time.** `npm run check:browser` all checks passed: LCP 1020ms (best
of three cold loads, 1020 to 1192ms), CLS 0.0062, no console errors, no horizontal overflow at
1440, 768 or 390, 11 images served and all with a reserved box. `tsc -b` clean · `eslint` clean
(0 warnings) · `prettier --check` clean · `npm run test` 8/8 · production build clean at
390.39 kB JS (124.65 kB gzip). Screenshots at 1440, 768 and 390 reviewed. Stages 17 to 19 are
covered by the same pass.

---

## STAGE 22 — The Rim Leaves The Box ✅

The green rectangle drawn around the portrait is gone.

- [x] **The rim glow moved outside the fade**, which was clipping it
- [x] **No hard edge down either arm**, and none along the bottom
- [x] **The fade, the sheen and the horizon line are untouched**
- [x] **The asset is unchanged**, so the face is still drawn at the same size

**Accept when:** the halo ends where the blur ends, not where the picture does. ✅

> NOTE: **A mask clips to its own border box.** The bottom fade is a mask on the wrapper, the rim
> was a `drop-shadow` on the `<img>` inside it, and the asset is trimmed to the alpha bounding
> box, so the figure touches all four edges of the picture by construction. Half of that glow
> belongs outside the box, and the mask cut it off square: a straight green line down both arms,
> another along the bottom, and the curve of the shoulders turning the pair into a rounded
> rectangle drawn around the photograph. Proved rather than guessed: setting `mask-image: none`
> in the browser made the edges vanish and the halo round itself out.

> NOTE: **The padded portrait would not have fixed it.** You sent one with transparent space
> added at the corners, which is the right instinct and the wrong lever. The hover glow is 26px
> at a render scale of about 0.64, so it wants roughly 60px of source margin on every side, and
> every one of those pixels comes off the size the face is drawn at. `process-portrait.py` also
> trims to the alpha box on the way through, so the padding never reached the page. The clip is
> the bug: the filter moved out to a wrapper the mask does not govern, and a filter paints
> wherever its blur reaches. The photograph in the file you sent is the same photograph that was
> already shipping, pixel for pixel after the trim, so `public/portrait.webp` is untouched.

**Verified in a browser.** `npm run check:browser` all checks passed: LCP 1044ms (best of three
cold loads), CLS 0.0062, no console errors. The portrait inspected at 2x at 1440 at rest and on
hover, and at 390. `tsc -b` clean · `eslint` clean (0 warnings) · `prettier --check` clean ·
`npm run test` 8/8 · production build clean at 390.51 kB JS (124.65 kB gzip).

---

## Working Agreement

1. One stage at a time. I build it, you review it, we iterate, then we advance.
2. Every stage leaves the app in a **runnable** state — `npm run dev` always works.
3. Checkboxes in this file get ticked as we go; this doc is the single source of truth.
4. Design decisions that deviate from this plan get noted inline with a `> NOTE:` line.
5. Content I don't have (real name, email, social URLs, resume PDF, CTF details, dates) goes in
   as clearly-marked placeholders — collected in `src/data/` so swapping is a one-file edit.

---

## Open Inputs Needed

> This list was written before Stage 2 and **none of it ever arrived**, so every item became a
> marked placeholder in `src/data/` instead of a blocker. The live version is now the
> **"Only you can do these"** checklist in Stage 9 — this section is kept for the record of what
> was asked for and when.

- [ ] Full name + preferred title line — _inferred from the repo git identity; Stage 2_
- [ ] Resume PDF — _placeholder PDF that says so; Stage 2_
- [ ] Email, GitHub, LinkedIn, TryHackMe/HTB handles — _GitHub known, email inferred, other two
      render nothing; Stages 2 and 7_
- [ ] Dates/periods for the two IEEE roles — _render `[ dates tbc ]`; Stage 3_
- [ ] Project repo/demo links — _`null`, so no button renders; Stage 4_
- [ ] Additional CTFs / achievements beyond RED CYPHER 3.0 — _three locked slots; Stage 5_
- [ ] Headshot or avatar — _never needed; the design does not use one_

---

**Current status:** `STAGE 22 — the rim leaves the box` → remaining: **dates**, **four sets
of role bullets**, the **OSCP question**, **project links**, a **PGP fingerprint**, **Lighthouse
on the deployed site**, **Safari and Firefox**, a **screen reader pass**, and the **deploy**.
See the README table.
