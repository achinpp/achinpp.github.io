import { useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { Film, RotateCcw, Zap, ZapOff } from 'lucide-react';
import { useMotionPrefs } from '@/hooks/useMotionPrefs';
import {
  duration,
  easeInOutCirc,
  easeMask,
  easeOutBack,
  easeOutExpo,
  easeOutQuint,
} from '@/lib/motion/easings';
import { fadeUp, maskReveal, maskRevealGroup, revealViewport } from '@/lib/motion/variants';

/* -------------------------------------------------------------------------
   Token tables.
   Values are read as `var(--token)` through inline styles rather than
   composed class names, because Tailwind can only generate utilities it
   sees as literal strings at build time — `bg-obsidian-${step}` produces
   nothing.
   ------------------------------------------------------------------------- */

type Ramp = { name: string; prefix: string; steps: number[]; note: string };

const RAMPS: Ramp[] = [
  {
    name: 'Obsidian',
    prefix: '--color-obsidian',
    steps: [950, 900, 850, 800, 700, 600, 500, 400, 300, 200, 100, 50],
    note: 'Base + elevation tiers. 900 is the canvas.',
  },
  {
    name: 'Mint',
    prefix: '--color-mint',
    steps: [100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
    note: 'Signature accent. 400 is the one true #5EF6C9.',
  },
  {
    name: 'Breach',
    prefix: '--color-breach',
    steps: [300, 400, 500, 600, 900],
    note: 'Danger semantics only. Never decorative.',
  },
  {
    name: 'Signal',
    prefix: '--color-signal',
    steps: [400, 900],
    note: 'Warning and in progress status badges.',
  },
];

const SEMANTICS = [
  ['--color-canvas', 'page background'],
  ['--color-surface', 'cards, panes'],
  ['--color-surface-raised', 'hover / nested surface'],
  ['--color-hairline', '1px borders'],
  ['--color-hairline-strong', 'emphasised borders'],
  ['--color-ink', 'headings'],
  ['--color-ink-muted', 'body copy'],
  ['--color-ink-faint', 'metadata, captions'],
  ['--color-accent', 'interactive'],
  ['--color-accent-dim', 'inactive accent'],
] as const;

const RADII = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;

const ELEVATION = [
  ['--shadow-elev-1', 'elev-1'],
  ['--shadow-elev-2', 'elev-2'],
  ['--shadow-elev-3', 'elev-3'],
] as const;

const GLOWS = [
  ['--shadow-glow-xs', 'glow-xs'],
  ['--shadow-glow-sm', 'glow-sm'],
  ['--shadow-glow-md', 'glow-md'],
  ['--shadow-glow-lg', 'glow-lg'],
  ['--shadow-glow-breach', 'glow-breach'],
] as const;

const EASINGS = [
  { label: 'out-expo', curve: easeOutExpo, use: 'block reveals, the default' },
  { label: 'out-quint', curve: easeOutQuint, use: 'cards, overlays' },
  { label: 'out-back', curve: easeOutBack, use: 'badges, button release' },
  { label: 'in-out-circ', curve: easeInOutCirc, use: 'looping ambience' },
  { label: 'mask', curve: easeMask, use: 'masked text reveal' },
] as const;

/* Literal classes — the whole point of a type scale is seeing it rendered. */
const TYPE_SPECIMENS = [
  { token: 'display-2xl', cls: 'text-display-2xl', sample: 'Breach' },
  { token: 'display-xl', cls: 'text-display-xl', sample: 'Mission brief' },
  { token: 'display-lg', cls: 'text-display-lg', sample: 'Threat intelligence' },
  { token: 'display-md', cls: 'text-display-md', sample: 'Battle station' },
] as const;

/* -------------------------------------------------------------------------
   Layout helpers for this sheet
   ------------------------------------------------------------------------- */

function Section({
  index,
  title,
  children,
}: {
  index: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={revealViewport}
      className="border-t border-hairline py-14"
    >
      <header className="mb-8 flex items-baseline gap-4">
        <span className="font-mono text-label text-mint-700">{index}</span>
        <h2 className="text-gradient-ink text-display-md">{title}</h2>
      </header>
      {children}
    </motion.section>
  );
}

function Caption({ children }: { children: ReactNode }) {
  return <p className="mt-2 font-mono text-[0.6875rem] text-ink-faint">{children}</p>;
}

/* -------------------------------------------------------------------------
   TokenSheet
   ------------------------------------------------------------------------- */

export function TokenSheet() {
  const {
    motionEnabled,
    grainEnabled,
    systemReducedMotion,
    motionOverride,
    toggleMotion,
    toggleGrain,
    resetMotion,
  } = useMotionPrefs();
  const [replay, setReplay] = useState(0);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-32 sm:px-8">
      {/* ------------------------------------------------------------- HEAD */}
      <header className="flex min-h-[70svh] flex-col justify-center py-20">
        <motion.div key={replay} variants={maskRevealGroup()} initial="hidden" animate="visible">
          <span className="mask-line">
            <motion.span variants={maskReveal} className="block font-mono text-label text-mint-400">
              STAGE 00 · FOUNDATION
            </motion.span>
          </span>
          <h1 className="mt-5">
            <span className="mask-line">
              <motion.span
                variants={maskReveal}
                className="block text-gradient-ink text-display-xl"
              >
                Shadow
              </motion.span>
            </span>
            <span className="mask-line">
              <motion.span
                variants={maskReveal}
                className="block text-gradient-accent text-display-xl"
              >
                Command Center
              </motion.span>
            </span>
          </h1>
          <span className="mask-line mt-6 max-w-xl">
            <motion.span variants={maskReveal} className="block text-ink-muted">
              Design system proof. No content, no sections, just the tokens, the type scale and the
              motion vocabulary everything after this is built from.
            </motion.span>
          </span>
        </motion.div>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setReplay((n) => n + 1)}
            className="pane px-4 py-2.5 font-mono text-label-lg text-mint-300 uppercase transition-all duration-200 ease-out-expo hover:border-mint-800 hover:text-mint-100 hover:shadow-glow-sm"
          >
            Replay reveal
          </button>
          <span className="font-mono text-[0.6875rem] text-ink-faint">mask-line + maskReveal</span>
        </div>
      </header>

      {/* ---------------------------------------------------------- CONTROLS */}
      <Section index="00" title="The switch">
        <div className="flex flex-wrap items-center gap-3 pane p-4">
          <button
            type="button"
            onClick={toggleMotion}
            aria-pressed={motionEnabled}
            className="inline-flex items-center gap-2 rounded-md border border-hairline bg-obsidian-800 px-3.5 py-2 font-mono text-label uppercase transition-colors duration-200 hover:border-hairline-strong"
            style={{ color: motionEnabled ? 'var(--color-mint-300)' : 'var(--color-ink-faint)' }}
          >
            {motionEnabled ? <Zap size={13} /> : <ZapOff size={13} />}
            Motion {motionEnabled ? 'on' : 'off'}
          </button>

          <button
            type="button"
            onClick={toggleGrain}
            aria-pressed={grainEnabled}
            className="inline-flex items-center gap-2 rounded-md border border-hairline bg-obsidian-800 px-3.5 py-2 font-mono text-label uppercase transition-colors duration-200 hover:border-hairline-strong"
            style={{ color: grainEnabled ? 'var(--color-mint-300)' : 'var(--color-ink-faint)' }}
          >
            <Film size={13} />
            Grain {grainEnabled ? 'on' : 'off'}
          </button>

          <button
            type="button"
            onClick={resetMotion}
            disabled={motionOverride === null}
            className="inline-flex items-center gap-2 rounded-md border border-hairline px-3.5 py-2 font-mono text-label text-ink-faint uppercase transition-colors duration-200 enabled:hover:text-ink disabled:opacity-35"
          >
            <RotateCcw size={13} />
            Follow OS
          </button>

          <div className="ml-auto flex items-center gap-2 font-mono text-[0.6875rem] text-ink-faint">
            <span
              className="size-1.5 rounded-full motion-ok:animate-pulse-dot"
              style={{
                backgroundColor: systemReducedMotion
                  ? 'var(--color-signal-400)'
                  : 'var(--color-mint-400)',
              }}
            />
            OS prefers-reduced-motion: {systemReducedMotion ? 'REDUCE' : 'NO-PREFERENCE'}
          </div>
        </div>
        <Caption>
          One toggle drives three channels: data-motion on &lt;html&gt; for CSS, MotionConfig for
          Framer, and React context for hand-rolled loops. Flip it and every animation on this page
          stops, including the pulsing dot above.
        </Caption>
      </Section>

      {/* ------------------------------------------------------------ COLOUR */}
      <Section index="01" title="Colour">
        <div className="space-y-9">
          {RAMPS.map((ramp) => (
            <div key={ramp.name}>
              <div className="mb-3 flex items-baseline gap-3">
                <h3 className="font-mono text-label-lg text-ink uppercase">{ramp.name}</h3>
                <span className="font-mono text-[0.6875rem] text-ink-faint">{ramp.note}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {ramp.steps.map((step) => (
                  <div key={step} className="group">
                    <div
                      className="size-16 rounded-md border border-hairline transition-transform duration-200 ease-out-expo group-hover:scale-105 sm:size-20"
                      style={{ backgroundColor: `var(${ramp.prefix}-${step})` }}
                    />
                    <div className="mt-1.5 font-mono text-[0.625rem] text-ink-faint">{step}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div>
            <h3 className="mb-3 font-mono text-label-lg text-ink uppercase">Semantic aliases</h3>
            <div className="grid gap-px overflow-hidden rounded-lg border border-hairline bg-hairline sm:grid-cols-2">
              {SEMANTICS.map(([token, use]) => (
                <div key={token} className="flex items-center gap-3 bg-obsidian-850 px-3.5 py-3">
                  <span
                    className="size-5 shrink-0 rounded-xs border border-hairline"
                    style={{ backgroundColor: `var(${token})` }}
                  />
                  <code className="text-[0.6875rem] text-ink-muted">{token}</code>
                  <span className="ml-auto font-mono text-[0.625rem] text-ink-faint">{use}</span>
                </div>
              ))}
            </div>
            <Caption>
              Components reference these, never the raw ramp steps. Retheming is one block.
            </Caption>
          </div>
        </div>
      </Section>

      {/* -------------------------------------------------------- TYPOGRAPHY */}
      <Section index="02" title="Typography">
        <div className="space-y-8">
          {TYPE_SPECIMENS.map(({ token, cls, sample }) => (
            <div key={token} className="border-b border-hairline pb-6 last:border-0">
              <div className="font-mono text-label text-mint-700">text-{token}</div>
              <div className={`${cls} mt-2 text-gradient-ink`}>{sample}</div>
            </div>
          ))}

          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <div className="font-mono text-label text-mint-700">font-display</div>
              <p className="mt-2 font-display text-xl text-ink">Space Grotesk Variable</p>
              <Caption>Headings. Geometric, slightly odd, not another Inter site.</Caption>
            </div>
            <div>
              <div className="font-mono text-label text-mint-700">font-sans</div>
              <p className="mt-2 font-sans text-xl text-ink">Inter Variable</p>
              <Caption>Body copy. Boring on purpose.</Caption>
            </div>
            <div>
              <div className="font-mono text-label text-mint-700">font-mono</div>
              <p className="mt-2 font-mono text-xl text-ink">JetBrains Mono</p>
              <Caption>
                Terminal, HUD, labels. Ligatures on:{' '}
                <code className="text-mint-400">{'!= => ->'}</code>
              </Caption>
            </div>
          </div>

          <div className="pane p-5">
            <div className="font-mono text-label text-mint-400 uppercase">text-label</div>
            <p className="mt-3 max-w-prose text-ink-muted">
              Body copy sits at <code className="text-mint-400">--color-ink-muted</code>, never full
              white, because pure white on obsidian is roughly 18:1 and reads as glare across a
              paragraph. Headings get the full <code className="text-mint-400">--color-ink</code>.
            </p>
          </div>
        </div>
      </Section>

      {/* --------------------------------------------- RADII / DEPTH / GLOW */}
      <Section index="03" title="Depth">
        <div className="space-y-10">
          <div>
            <h3 className="mb-3 font-mono text-label-lg text-ink uppercase">Radii</h3>
            <div className="flex flex-wrap items-end gap-3">
              {RADII.map((r) => (
                <div key={r}>
                  <div
                    className="size-20 border border-hairline-strong bg-obsidian-800"
                    style={{ borderRadius: `var(--radius-${r})` }}
                  />
                  <div className="mt-1.5 font-mono text-[0.625rem] text-ink-faint">{r}</div>
                </div>
              ))}
            </div>
            <Caption>Tighter than Tailwind defaults. Instrument panel, not app store.</Caption>
          </div>

          <div>
            <h3 className="mb-3 font-mono text-label-lg text-ink uppercase">Elevation</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              {ELEVATION.map(([token, label]) => (
                <div
                  key={token}
                  className="rounded-xl border border-hairline bg-obsidian-850 p-6"
                  style={{ boxShadow: `var(${token})` }}
                >
                  <div className="font-mono text-label text-ink-muted uppercase">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-mono text-label-lg text-ink uppercase">Glow</h3>
            <div className="grid gap-5 sm:grid-cols-3 lg:grid-cols-5">
              {GLOWS.map(([token, label]) => (
                <div
                  key={token}
                  className="rounded-lg border bg-obsidian-850 p-5"
                  style={{
                    boxShadow: `var(${token})`,
                    borderColor: token.includes('breach')
                      ? 'var(--color-breach-900)'
                      : 'var(--color-mint-900)',
                  }}
                >
                  <div className="font-mono text-[0.625rem] tracking-[0.14em] text-ink-muted uppercase">
                    {label}
                  </div>
                </div>
              ))}
            </div>
            <Caption>
              Dark UI gets depth from glow and hairlines. Drop shadows alone just make things muddy.
            </Caption>
          </div>

          <div>
            <h3 className="mb-3 font-mono text-label-lg text-ink uppercase">Blur tiers</h3>
            <div className="relative overflow-hidden rounded-xl border border-hairline">
              {/* Something worth blurring, so the tiers are actually legible. */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 20% 30%, var(--color-mint-700), transparent 45%), radial-gradient(circle at 75% 60%, var(--color-breach-600), transparent 40%)',
                }}
              />
              <div className="relative grid gap-px bg-hairline sm:grid-cols-3">
                {(['veil', 'pane', 'shroud'] as const).map((tier) => (
                  <div
                    key={tier}
                    className="bg-obsidian-900/40 p-8"
                    style={{ backdropFilter: `blur(var(--blur-${tier}))` }}
                  >
                    <div className="font-mono text-label text-ink uppercase">blur-{tier}</div>
                  </div>
                ))}
              </div>
            </div>
            <Caption>
              Three tiers, used deliberately. Not &ldquo;everything is glass&rdquo;.
            </Caption>
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------------ MOTION */}
      <Section index="04" title="Motion">
        <div className="space-y-8">
          <div className="overflow-hidden pane p-5">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h3 className="font-mono text-label-lg text-ink uppercase">Easing lab</h3>
              <button
                type="button"
                onClick={() => setReplay((n) => n + 1)}
                className="rounded-md border border-hairline px-3 py-1.5 font-mono text-label text-mint-300 uppercase transition-colors duration-200 hover:border-mint-800 hover:text-mint-100"
              >
                Run
              </button>
            </div>
            <div key={`ease-${replay}`} className="space-y-4">
              {EASINGS.map(({ label, curve, use }, i) => (
                <div key={label} className="flex items-center gap-4">
                  <code className="w-24 shrink-0 text-[0.6875rem] text-ink-muted">{label}</code>
                  <div className="relative h-1.5 flex-1 rounded-full bg-obsidian-800">
                    <motion.div
                      initial={{ left: '0%' }}
                      animate={{ left: 'calc(100% - 0.75rem)' }}
                      transition={{ duration: duration.cinematic, ease: curve, delay: 0.08 * i }}
                      className="absolute top-1/2 size-3 -translate-y-1/2 rounded-full bg-mint-400 shadow-glow-sm"
                    />
                  </div>
                  <span className="hidden w-48 shrink-0 font-mono text-[0.625rem] text-ink-faint sm:block">
                    {use}
                  </span>
                </div>
              ))}
            </div>
            <Caption>
              No ease-in-out anywhere. Everything is decisive out of the gate, then settles.
            </Caption>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="pane p-5">
              <div className="font-mono text-label text-ink-muted uppercase">animate-caret</div>
              <div className="mt-4 font-mono text-lg text-mint-300">
                &gt; whoami
                <span className="ml-0.5 inline-block h-[1.1em] w-[0.55em] translate-y-[0.14em] bg-mint-400 motion-ok:animate-caret" />
              </div>
            </div>
            <div className="pane p-5">
              <div className="font-mono text-label text-ink-muted uppercase">animate-pulse-dot</div>
              <div className="mt-4 flex items-center gap-2.5 font-mono text-sm text-ink">
                <span className="size-2 rounded-full bg-mint-400 motion-ok:animate-pulse-dot" />
                AVAILABLE
              </div>
            </div>
            <div className="relative overflow-hidden pane p-5">
              <div className="font-mono text-label text-ink-muted uppercase">animate-shimmer</div>
              <div className="relative mt-4 h-9 overflow-hidden rounded-md border border-mint-900 bg-obsidian-800">
                <div className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-mint-400/25 to-transparent motion-ok:animate-shimmer" />
              </div>
            </div>
          </div>
        </div>
      </Section>

      <footer className="border-t border-hairline pt-8 font-mono text-[0.6875rem] text-ink-faint">
        STAGE 00 COMPLETE · tokens · fonts · motion primitives · reduced-motion switch · lenis
        bridge
      </footer>
    </div>
  );
}
