import { useCallback, useEffect, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const STORAGE_KEY = 'scc.booted';
/** Short on purpose — see BootOverlay for why. */
export const BOOT_MS = 900;

/**
 * Whether to play the boot sequence.
 *
 * Once per session (`sessionStorage`, not `localStorage` — a return visit
 * tomorrow should get the full thing again, a reload five seconds later
 * shouldn't), never under reduced motion, and dismissed by any key or click.
 */
export function useBootSequence() {
  const reduced = useReducedMotion();

  const [booting, setBooting] = useState(() => {
    if (reduced) return false;
    try {
      return sessionStorage.getItem(STORAGE_KEY) !== '1';
    } catch {
      // Storage blocked: skip rather than replay the overlay on every reload.
      return false;
    }
  });

  const finish = useCallback(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // Non-fatal — worst case it plays again next reload.
    }
    setBooting(false);
  }, []);

  useEffect(() => {
    if (!booting) return;

    const timer = window.setTimeout(finish, BOOT_MS);
    // Any input at all dismisses it. Nobody should have to hunt for the
    // escape hatch on an overlay they didn't ask for.
    window.addEventListener('keydown', finish);
    window.addEventListener('pointerdown', finish);
    window.addEventListener('wheel', finish, { passive: true });

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('keydown', finish);
      window.removeEventListener('pointerdown', finish);
      window.removeEventListener('wheel', finish);
    };
  }, [booting, finish]);

  return { booting, finish };
}
