import { useMotionPrefs } from './useMotionPrefs';

/**
 * Should this component skip its animation?
 *
 * Deliberately shadows Framer Motion's own `useReducedMotion`: that hook only
 * sees the OS media query, which would ignore the in-page toggle. Import this
 * one everywhere instead — hand-rolled animation (canvas loops, typing
 * sequences, `setInterval` tickers) must check it manually, since
 * <MotionConfig> can only neutralise Framer-driven animation.
 */
export function useReducedMotion(): boolean {
  return !useMotionPrefs().motionEnabled;
}
