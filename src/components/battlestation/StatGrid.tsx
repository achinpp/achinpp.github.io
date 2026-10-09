import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import type { Stat } from '@/data/achievements';
import { STATS, STAT_SOURCES } from '@/data/achievements';
import { useCountUp } from '@/hooks/useCountUp';
import { fadeUp, revealViewport, staggerGroup } from '@/lib/motion/variants';

/**
 * One figure.
 *
 * `useInView(… { once: true })` is what satisfies the stage's own acceptance
 * note — the counter fires on the first pass and never again, rather than
 * re-counting every time the section scrolls back through the viewport.
 *
 * A `null` value prints `--` and never animates. Every number on this wall is
 * either derived from data that already exists on the site or absent; see the
 * header of `src/data/achievements.ts`.
 */
function StatTile({ stat }: { stat: Stat }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-12% 0px -12% 0px' });
  const figure = useCountUp(stat.value, inView);

  return (
    <motion.div variants={fadeUp} ref={ref} className="rounded-lg bg-obsidian-850/40 p-5 hairline">
      <span className="block font-mono text-[2rem] leading-none tabular-nums">
        {stat.value === null ? (
          <span className="text-obsidian-600">--</span>
        ) : (
          <span ref={figure} className="text-mint-300">
            00
          </span>
        )}
      </span>

      <span className="mt-4 block font-mono text-[0.5625rem] tracking-[0.18em] text-ink-faint uppercase">
        {stat.label}
      </span>

      {stat.value === null && (
        <span className="mt-1.5 block font-mono text-[0.5625rem] tracking-[0.16em] text-obsidian-600 uppercase">
          [ tbc ]
        </span>
      )}

      {/* Review-time provenance, compiled out of production. No figure here
          should be unexplained. */}
      {import.meta.env.DEV && (
        <span className="mt-3 block font-mono text-[0.5rem] leading-relaxed tracking-[0.1em] text-signal-400 uppercase">
          {STAT_SOURCES[stat.label]}
        </span>
      )}
    </motion.div>
  );
}

export function StatGrid() {
  return (
    <motion.div
      variants={staggerGroup()}
      initial="hidden"
      whileInView="visible"
      viewport={revealViewport}
      className="grid grid-cols-2 gap-3 sm:gap-4"
    >
      {STATS.map((stat) => (
        <StatTile key={stat.label} stat={stat} />
      ))}
    </motion.div>
  );
}
