import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useMotionValueEvent, useScroll } from 'motion/react';
import { PaletteHint } from '@/components/palette/PaletteHint';
import { SECTION_IDS, getSection } from '@/data/sections';
import { useActiveSection } from '@/hooks/useActiveSection';

/**
 * Live clock in the subject's own timezone — the detail that makes the HUD
 * read as telemetry rather than decoration.
 *
 * Its own component so the 1Hz tick re-renders twelve characters instead of
 * the whole status bar.
 */
function Clock() {
  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Colombo',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }),
    [],
  );

  const [now, setNow] = useState(() => formatter.format(new Date()));

  useEffect(() => {
    const id = window.setInterval(() => setNow(formatter.format(new Date())), 1000);
    return () => window.clearInterval(id);
  }, [formatter]);

  // tabular-nums stops the width jittering as the digits change.
  return <span className="tabular-nums">{now}</span>;
}

/**
 * Scroll progress: a meter plus a percentage.
 *
 * Both are driven straight off the MotionValue — the bar via `scaleX`, the
 * number by writing `textContent` on a ref. Putting the percentage in React
 * state would re-render the HUD on every frame of every scroll.
 */
function ScrollMeter() {
  const { scrollYProgress } = useScroll();
  const readout = useRef<HTMLSpanElement>(null);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const el = readout.current;
    if (el) el.textContent = String(Math.round(v * 100)).padStart(3, '0');
  });

  return (
    <div className="flex items-center gap-2">
      <div className="relative h-px w-16 overflow-hidden bg-obsidian-700 sm:w-24">
        <motion.div
          className="absolute inset-0 origin-left bg-mint-400"
          style={{ scaleX: scrollYProgress }}
        />
      </div>
      <span ref={readout} className="text-mint-500 tabular-nums">
        000
      </span>
      <span className="text-obsidian-600">%</span>
    </div>
  );
}

/**
 * The persistent bottom status strip.
 *
 * Fixed, 28px tall, and never animates on scroll — it's the one element that
 * stays put while everything else moves, which is what sells the "instrument
 * panel" framing.
 *
 * Almost everything here is a readout. The one exception is the ⌘K chip added
 * in Stage 8 — a second, more discoverable home for the palette shortcut than
 * the nav alone. It is an ordinary button, so it needs no focus management of
 * its own.
 */
export function StatusHUD() {
  const active = useActiveSection(SECTION_IDS);
  const section = getSection(active);

  return (
    <div
      className="fixed inset-x-0 bottom-0 border-t border-hairline"
      style={{
        zIndex: 'var(--z-hud)',
        backgroundColor: 'oklch(0.105 0.012 265 / 0.82)',
        backdropFilter: 'blur(var(--blur-veil))',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex h-7 items-center gap-3 px-3 font-mono text-[0.625rem] tracking-[0.1em] text-ink-faint uppercase sm:gap-5 sm:px-5">
        {/* Availability */}
        <div className="flex shrink-0 items-center gap-2">
          <span className="size-1.5 rounded-full bg-mint-400 motion-ok:animate-pulse-dot" />
          <span className="hidden text-mint-500 sm:inline">Available</span>
        </div>

        <span className="hidden h-3 w-px bg-hairline sm:block" />

        {/* Current section — the only part that changes with position */}
        <span className="min-w-0 flex-1 truncate text-obsidian-500">
          {section ? `${section.index} / ${section.codename}` : ''}
        </span>

        <ScrollMeter />

        <span className="hidden h-3 w-px bg-hairline sm:block" />

        <PaletteHint className="hidden shrink-0 text-obsidian-500 hover:text-mint-300 sm:inline-flex" />

        <span className="hidden h-3 w-px bg-hairline sm:block" />

        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden text-obsidian-500 sm:inline">Colombo</span>
          <Clock />
        </div>
      </div>
    </div>
  );
}
