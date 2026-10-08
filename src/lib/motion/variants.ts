import type { Transition, Variants } from 'motion/react';
import { duration, easeMask, easeOutExpo, easeOutQuint, stagger } from './easings';

/**
 * Shared Framer Motion variants.
 *
 * Every section on the site animates from this file so the whole page moves
 * with one vocabulary. Deviating is allowed — but it should be a decision,
 * not an accident of writing a fresh `initial`/`animate` pair each time.
 *
 * Reduced motion is NOT handled here. <MotionConfig reducedMotion> in
 * MotionProvider neutralises transform/opacity animations globally, which
 * keeps these definitions free of branching.
 */

/** Viewport config for scroll reveals. Fires once, slightly before entry. */
export const revealViewport = { once: true, margin: '-12% 0px -12% 0px' } as const;

/* -------------------------------------------------------------------------
   TEXT
   ------------------------------------------------------------------------- */

/**
 * The house reveal: text slides up out of an `overflow: hidden` parent so it
 * appears to be uncovered rather than faded in. Pair with `.mask-line`.
 */
export const maskReveal: Variants = {
  hidden: { y: '115%' },
  visible: {
    y: '0%',
    transition: { duration: duration.reveal, ease: easeMask },
  },
};

/** Per-word or per-character container. Children use `maskReveal`. */
export const maskRevealGroup = (step: number = stagger.base): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: step, delayChildren: 0.05 },
  },
});

/* -------------------------------------------------------------------------
   BLOCKS
   ------------------------------------------------------------------------- */

/** Standard block entrance. Subtle — 18px, not 60px. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.slow, ease: easeOutExpo },
  },
};

/** Entrance with a focus pull. Use sparingly: `filter` is expensive. */
export const blurIn: Variants = {
  hidden: { opacity: 0, y: 12, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: duration.reveal, ease: easeOutExpo },
  },
};

/** Cards, badges, anything that should feel like it powers on. */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: duration.base, ease: easeOutQuint },
  },
};

/** Generic stagger parent for grids and lists. */
export const staggerGroup = (step: number = stagger.base, delay = 0): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: step, delayChildren: delay },
  },
});

/* -------------------------------------------------------------------------
   OVERLAYS
   ------------------------------------------------------------------------- */

export const scrim: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: duration.fast } },
  exit: { opacity: 0, transition: { duration: duration.fast } },
};

export const panel: Variants = {
  hidden: { opacity: 0, scale: 0.97, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: duration.base, ease: easeOutQuint },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: 6,
    transition: { duration: duration.instant },
  },
};

/* -------------------------------------------------------------------------
   HELPERS
   ------------------------------------------------------------------------- */

/** Common inline transition, for one-offs that don't need a full variant. */
export const tr = (d: number = duration.base, ease = easeOutExpo): Transition => ({
  duration: d,
  ease,
});
