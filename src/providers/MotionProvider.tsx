import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { MotionConfig } from 'motion/react';
import {
  GRAIN_STORAGE_KEY,
  MOTION_STORAGE_KEY,
  MotionPrefsContext,
  type MotionPrefs,
} from './motion-context';
import { duration, easeOutExpo } from '@/lib/motion/easings';

const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';

function readStoredBool(key: string): boolean | null {
  try {
    const raw = localStorage.getItem(key);
    if (raw === 'on') return true;
    if (raw === 'off') return false;
    return null;
  } catch {
    // Private mode / storage disabled. Fall back to the OS preference.
    return null;
  }
}

function writeStoredBool(key: string, value: boolean | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value ? 'on' : 'off');
  } catch {
    // Non-fatal: the preference just won't survive a reload.
  }
}

/**
 * The global motion switch.
 *
 * Resolves the OS `prefers-reduced-motion` setting against an optional
 * in-page override, then publishes the result three ways so nothing can
 * animate behind the switch's back:
 *
 *   1. `data-motion` on <html>  → CSS animations/transitions (globals.css)
 *   2. <MotionConfig reducedMotion> → every Framer Motion component
 *   3. React context → components that need to branch in JS (canvas loops,
 *      typing sequences, Lenis)
 *
 * `data-grain` rides along here because it is the same kind of decision:
 * an ambient effect the user may want gone.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  const [systemReducedMotion, setSystemReducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(REDUCED_QUERY).matches,
  );
  const [motionOverride, setMotionOverride] = useState<boolean | null>(() =>
    readStoredBool(MOTION_STORAGE_KEY),
  );
  const [grainEnabled, setGrainEnabled] = useState<boolean>(
    () => readStoredBool(GRAIN_STORAGE_KEY) ?? true,
  );

  // Track live OS changes — someone can flip the setting with the tab open.
  useEffect(() => {
    const mql = window.matchMedia(REDUCED_QUERY);
    const onChange = (e: MediaQueryListEvent) => setSystemReducedMotion(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  const motionEnabled = motionOverride ?? !systemReducedMotion;

  // Publish to <html>. The inline script in index.html sets these before
  // first paint; this keeps them in sync afterwards.
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.motion = motionEnabled ? 'on' : 'off';
    root.dataset.grain = grainEnabled ? 'on' : 'off';
  }, [motionEnabled, grainEnabled]);

  const toggleMotion = useCallback(() => {
    setMotionOverride((prev) => {
      const next = !(prev ?? !systemReducedMotion);
      writeStoredBool(MOTION_STORAGE_KEY, next);
      return next;
    });
  }, [systemReducedMotion]);

  const toggleGrain = useCallback(() => {
    setGrainEnabled((prev) => {
      writeStoredBool(GRAIN_STORAGE_KEY, !prev);
      return !prev;
    });
  }, []);

  const resetMotion = useCallback(() => {
    writeStoredBool(MOTION_STORAGE_KEY, null);
    setMotionOverride(null);
  }, []);

  const value = useMemo<MotionPrefs>(
    () => ({
      motionEnabled,
      grainEnabled,
      systemReducedMotion,
      motionOverride,
      toggleMotion,
      toggleGrain,
      resetMotion,
    }),
    [
      motionEnabled,
      grainEnabled,
      systemReducedMotion,
      motionOverride,
      toggleMotion,
      toggleGrain,
      resetMotion,
    ],
  );

  return (
    <MotionPrefsContext.Provider value={value}>
      <MotionConfig
        reducedMotion={motionEnabled ? 'never' : 'always'}
        transition={{ duration: duration.base, ease: easeOutExpo }}
      >
        {children}
      </MotionConfig>
    </MotionPrefsContext.Provider>
  );
}
