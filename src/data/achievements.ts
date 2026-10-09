import { EXPERIENCE } from '@/data/experience';
import { PROJECTS } from '@/data/projects';

/**
 * Battle Station — competition record and open-source activity.
 *
 * ⚠ THIS IS THE THINNEST SECTION IN THE BUILD, and deliberately so.
 *
 * The brief named exactly one achievement: **RED CYPHER 3.0 — Finalist**. It
 * gave no other competitions, no dates, no writeup count and no specific
 * open-source contributions. So rather than filling a badge wall with
 * plausible-looking CTF names, the wall has one real badge and the rest are
 * **locked slots** — which is both honest and the normal visual language of an
 * achievement system. Add entries below and each one takes the next slot.
 *
 * Same for the counters: every number here is either derived from data that
 * already exists on this site, or `null`. A `null` renders `--` and a
 * `[ tbc ]` label instead of counting up to a figure nobody supplied.
 */

/** Drives the frame, the glow and the unlock animation. */
export type Rarity = 'legendary' | 'rare' | 'standard';

export type Achievement = {
  id: string;
  /** Competition or programme. */
  event: string;
  /** What was won or reached. */
  result: string;
  rarity: Rarity;
  /** null → renders `[ date tbc ]`. No dates were supplied. */
  date: string | null;
  /** Shown in the detail line under the badge wall. */
  note: string | null;
  /** True once the result reached a final or better — feeds the counters. */
  reachedFinal: boolean;
};

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'red-cypher-3',
    event: 'RED CYPHER 3.0',
    result: 'Finalist',
    rarity: 'legendary',
    date: null,
    note: null,
    reachedFinal: true,
  },
];

/**
 * How many frames the wall shows. Anything beyond `ACHIEVEMENTS.length` is a
 * locked slot. Four reads as a set; one badge alone reads as an accident, and
 * a rarity system needs more than one tier on screen to be legible at all.
 */
export const BADGE_SLOTS = 4;

export type Stat = {
  label: string;
  /** null → `--`, with a `[ tbc ]` marker. Never a guessed figure. */
  value: number | null;
};

export const STATS: Stat[] = [
  { label: 'Missions logged', value: PROJECTS.length },
  { label: 'Finals reached', value: ACHIEVEMENTS.filter((a) => a.reachedFinal).length },
  { label: 'Leadership roles', value: EXPERIENCE.length },
  { label: 'Writeups published', value: null },
];

/**
 * Where each figure comes from, shown on the tile during review so no number
 * on this wall is unexplained.
 *
 * Kept out of `STATS` on purpose: a field on the data object ships whether or
 * not anything renders it, because the gate is in the component. `import.meta.env.DEV`
 * is replaced by the literal `false` at build time, so in production this
 * folds to an empty object and the strings are dropped entirely.
 */
export const STAT_SOURCES: Record<string, string> = import.meta.env.DEV
  ? {
      'Missions logged': 'derived from src/data/projects.ts',
      'Finals reached': 'derived from ACHIEVEMENTS above',
      'Leadership roles': 'derived from src/data/experience.ts',
      'Writeups published': 'not supplied',
    }
  : {};
