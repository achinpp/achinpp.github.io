import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AnimatePresence } from 'motion/react';
import { BootScreen } from '@/components/boot/BootScreen';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { BootContext, type BootState } from './boot-context';

/**
 * Owns the boot sequence and the overlay that performs it.
 *
 * **Reduced motion skips it outright**, rather than showing a still frame of
 * it for the same duration. A loading screen over an already loaded page is
 * decoration, and the one thing the preference unambiguously asks for is less
 * of that. `useReducedMotion` resolves the OS setting and the in page toggle
 * together and both are known synchronously, so the first render already
 * knows whether to boot at all. Nothing flashes.
 *
 * **It replays on every load**, with no `sessionStorage` memory of having run
 * before. That was a deliberate coin flip: remembering spares a returning
 * visitor the wait, and it also means a reload during a review shows
 * something different from a reload in a fresh tab, which is a confusing
 * thing to debug. Predictable won. One `sessionStorage` read in the
 * `useState` initialiser below reverses it.
 *
 * The overlay renders after `children` so the page behind it is mounted,
 * laid out and decoded before the glass ever lifts.
 */
export function BootProvider({
  children,
  enabled = true,
}: {
  children: ReactNode;
  /** False on the `?tokens` specimen sheet: a developer tool should open. */
  enabled?: boolean;
}) {
  const reduced = useReducedMotion();
  const [booting, setBooting] = useState(() => enabled && !reduced);

  const finish = useCallback(() => setBooting(false), []);

  // Someone can turn motion off from the HUD while the overlay is up.
  useEffect(() => {
    if (reduced || !enabled) setBooting(false);
  }, [reduced, enabled]);

  const value = useMemo<BootState>(
    () => ({ booting, booted: !booting, finish }),
    [booting, finish],
  );

  return (
    <BootContext.Provider value={value}>
      {children}
      <AnimatePresence>{booting && <BootScreen onDone={finish} />}</AnimatePresence>
    </BootContext.Provider>
  );
}
