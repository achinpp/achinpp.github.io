import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { Lock, Trophy } from 'lucide-react';
import type { Achievement, Rarity } from '@/data/achievements';
import { ScrambleText } from '@/components/ui/ScrambleText';
import { duration, easeOutBack } from '@/lib/motion/easings';

/**
 * The frame is an SVG path, not a `clip-path` hexagon.
 *
 * A clipped `<div>` can't carry a visible border — the border box is what
 * gets clipped, so the edge is cut at the diagonals — and it can't carry a
 * dashed one at all, which the locked slots need. A stroked path gives both,
 * plus a crisp outline at any DPR. The glow is a `drop-shadow` filter on the
 * wrapper rather than a `box-shadow`, because `drop-shadow` follows the
 * rendered silhouette and a box-shadow would trace a rectangle.
 *
 * Inset by 1 unit on every side so the 1.5-wide stroke isn't half-clipped by
 * the viewBox.
 */
const HEX_PATH = 'M50 1 L99 29.2 L99 86.8 L50 115 L1 86.8 L1 29.2 Z';

/**
 * Matched to the viewBox rather than to √3/2 (≈0.866), so the `none`
 * preserveAspectRatio never stretches the stroke unevenly. 100/116 ≈ 0.862,
 * which is a regular hexagon to within half a pixel at this size.
 */
const HEX_ASPECT = 'aspect-[100/116]';

const GLOW: Record<Rarity, string | undefined> = {
  legendary:
    'drop-shadow(0 0 14px oklch(0.888 0.145 168 / 0.5)) drop-shadow(0 0 40px oklch(0.888 0.145 168 / 0.26))',
  rare: 'drop-shadow(0 0 10px oklch(0.888 0.145 168 / 0.28))',
  standard: undefined,
};

const STROKE: Record<Rarity, string> = {
  legendary: 'var(--color-mint-400)',
  rare: 'var(--color-mint-700)',
  standard: 'var(--color-hairline-strong)',
};

/** Scale, then settle. `easeOutBack` is what makes it read as locking in. */
const unlock = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: duration.slow, ease: easeOutBack },
  },
};

function HexFrame({
  stroke,
  dashed,
  children,
  glow,
}: {
  stroke: string;
  dashed?: boolean;
  glow?: string;
  children: ReactNode;
}) {
  return (
    <div className={`relative w-full ${HEX_ASPECT}`} style={{ filter: glow }}>
      <svg
        aria-hidden
        viewBox="0 0 100 116"
        preserveAspectRatio="none"
        className="absolute inset-0 size-full"
      >
        <path
          d={HEX_PATH}
          fill="var(--color-obsidian-850)"
          stroke={stroke}
          strokeWidth={1.5}
          strokeDasharray={dashed ? '5 5' : undefined}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
        {children}
      </div>
    </div>
  );
}

export function AchievementBadge({
  achievement,
  hero,
}: {
  achievement: Achievement;
  hero: boolean;
}) {
  const { rarity } = achievement;

  return (
    <motion.li
      variants={unlock}
      className={`flex flex-col items-center ${hero ? 'w-40 sm:w-44' : 'w-28 sm:w-32'}`}
    >
      <HexFrame stroke={STROKE[rarity]} glow={GLOW[rarity]}>
        {/* The travelling light. One element on the page gets this: the stroke
            repaints its path every frame, unlike a compositor transform. */}
        {rarity === 'legendary' && (
          <svg
            aria-hidden
            viewBox="0 0 100 116"
            preserveAspectRatio="none"
            className="absolute inset-0 size-full"
          >
            <path
              d={HEX_PATH}
              fill="none"
              stroke="var(--color-mint-200)"
              strokeWidth={2}
              strokeDasharray="52 288"
              className="motion-ok:animate-trace"
            />
          </svg>
        )}

        <Trophy
          aria-hidden
          size={hero ? 20 : 16}
          className={rarity === 'standard' ? 'text-ink-faint' : 'text-mint-400'}
        />
        <span
          className={`font-mono tracking-[0.14em] uppercase ${
            hero ? 'text-[0.6875rem]' : 'text-[0.5625rem]'
          } ${rarity === 'standard' ? 'text-ink-muted' : 'text-mint-200'}`}
        >
          {achievement.result}
        </span>
      </HexFrame>

      <div className="mt-5 text-center">
        <p className={`font-mono text-ink uppercase ${hero ? 'text-label-lg' : 'text-label'}`}>
          <ScrambleText text={achievement.event} tickMs={28} lockPerTick={0.9} />
        </p>
        <p className="mt-2 font-mono text-[0.5625rem] tracking-[0.16em] text-obsidian-500 uppercase">
          {/* Honest blank — no dates were supplied. See data/achievements.ts. */}
          {achievement.date ?? '[ date tbc ]'}
        </p>
        {achievement.note && (
          <p className="mt-2 max-w-[14rem] text-[0.75rem] leading-relaxed text-ink-faint">
            {achievement.note}
          </p>
        )}
      </div>
    </motion.li>
  );
}

/**
 * An unfilled frame on the wall.
 *
 * This is the honest alternative to inventing three more competition names:
 * the brief supplied one achievement, and a locked slot is the normal visual
 * language for "there is room here" without claiming anything. Fill
 * `ACHIEVEMENTS` and each entry takes the next slot automatically.
 */
export function LockedSlot({ index }: { index: number }) {
  return (
    <motion.li variants={unlock} className="flex w-28 flex-col items-center sm:w-32">
      <HexFrame stroke="var(--color-obsidian-700)" dashed>
        <Lock aria-hidden size={15} className="text-obsidian-600" />
      </HexFrame>

      <div className="mt-5 text-center">
        <p className="font-mono text-label text-obsidian-500 uppercase">
          Slot_{String(index).padStart(2, '0')}
        </p>
        <p className="mt-2 font-mono text-[0.5625rem] tracking-[0.16em] text-obsidian-600 uppercase">
          unassigned
        </p>
      </div>
    </motion.li>
  );
}
