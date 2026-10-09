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
- [ ] **Confirm `src/data/projects.ts`** — the four status badges (`statusConfirmed: false`),
      the taglines, and add any public `repo` / `demo` links (Stage 4)
- [ ] Fold `<FloatingNav />`'s inline scroll-lock effect into `useScrollLock` (Stage 4)
- [ ] **Supply real achievements for `src/data/achievements.ts`** — other CTFs, dates, a writeup
      count, and any named open-source contributions. Until then the badge wall is one badge and
      three locked slots (Stage 5)
- [ ] **Prune `src/data/skills.ts`** — 13 of the 20 pills are `source: 'derived'`, taken from the
      brief's project descriptions rather than stated outright (Stage 6)
- [ ] **Set `VITE_FORM_ENDPOINT`** to a Formspree endpoint — until then the contact form is
      disabled in production (Stage 7)
- [ ] **Supply LinkedIn and TryHackMe/HTB handles** for `src/data/contact.ts`, and a
      `PGP_FINGERPRINT` if one exists (Stage 7)
- [ ] **Confirm `PROFILE.email`** — inferred from the commit email on this repo (Stage 7)
- [ ] Lazy-load or delete `<TokenSheet />` (`?tokens`), which is still in the main bundle
      (Stage 7)
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

**Current status:** `STAGE 7 — complete, awaiting review` → next: `STAGE 8 — Command Palette (⌘K)`
