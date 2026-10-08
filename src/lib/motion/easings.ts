/**
 * Easing curves, mirrored 1:1 with the `--ease-*` tokens in globals.css.
 * CSS animations read the custom properties; Framer Motion reads these.
 * If one side changes, change the other — they are the same curves.
 */

export const easeOutExpo = [0.16, 1, 0.3, 1] as const;
export const easeOutQuint = [0.22, 1, 0.36, 1] as const;
export const easeOutBack = [0.34, 1.4, 0.64, 1] as const;
export const easeInOutCirc = [0.85, 0, 0.15, 1] as const;
export const easeMask = [0.33, 1, 0.68, 1] as const;

/**
 * Duration scale. Anything under 150ms reads as an instant state swap;
 * anything over 900ms starts to feel like the page is thinking.
 */
export const duration = {
  instant: 0.12,
  fast: 0.22,
  base: 0.38,
  slow: 0.62,
  reveal: 0.85,
  cinematic: 1.3,
} as const;

/** Stagger steps for grids, lists and split text. */
export const stagger = {
  tight: 0.025,
  base: 0.055,
  loose: 0.09,
} as const;

/** Spring presets for cursor, magnetic hover and layout morphs. */
export const spring = {
  /** Cursor follow — low mass, barely overshoots. */
  cursor: { type: 'spring', stiffness: 520, damping: 42, mass: 0.4 },
  /** Magnetic button pull — visible give, settles fast. */
  magnetic: { type: 'spring', stiffness: 260, damping: 20, mass: 0.6 },
  /** Shared-layout morph between a card and its detail panel. */
  morph: { type: 'spring', stiffness: 210, damping: 28, mass: 0.9 },
  /** Nav pill indicator. */
  indicator: { type: 'spring', stiffness: 380, damping: 32 },
} as const;
