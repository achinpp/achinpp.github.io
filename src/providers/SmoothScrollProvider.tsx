import { useEffect, type ReactNode } from 'react';
import { ReactLenis, useLenis } from 'lenis/react';
import { cancelFrame, frame } from 'motion/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import 'lenis/dist/lenis.css';

/**
 * Drive Lenis from Framer Motion's frame loop instead of its own rAF.
 *
 * Both libraries otherwise schedule independent rAF callbacks, and whichever
 * runs second wins. If Framer reads `scrollY` before Lenis has written the
 * frame's scroll position, every scroll-linked animation trails the page by
 * one frame — which is exactly the kind of micro-jitter that makes smooth
 * scrolling feel worse than no smooth scrolling. Running Lenis inside
 * Framer's loop makes the ordering deterministic: Lenis writes, Framer reads.
 */
function LenisFrameBridge() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;
    const update = (data: { timestamp: number }) => lenis.raf(data.timestamp);
    frame.update(update, true);
    return () => cancelFrame(update);
  }, [lenis]);

  return null;
}

/**
 * Inertial scrolling. Everything else on the site is timed against this —
 * the reveals, the parallax, the nav auto-hide — so it goes in at Stage 0
 * rather than being bolted on later.
 *
 * Skipped entirely under reduced motion: hijacked scroll is one of the
 * effects the preference most clearly asks you not to do, and leaving Lenis
 * mounted-but-instant still steals wheel events from the browser.
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();

  if (reduced) return <>{children}</>;

  return (
    <ReactLenis
      root
      options={{
        // Lower lerp = more glide. 0.085 is long enough to feel deliberate
        // without the "swimming in syrup" lag of the 0.05 default-chasers.
        lerp: 0.085,
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.6,
        // Native momentum on touch already feels right; smoothing it fights
        // the OS and breaks pull-to-refresh.
        syncTouch: false,
        autoRaf: false,
        anchors: true,
      }}
    >
      <LenisFrameBridge />
      {children}
    </ReactLenis>
  );
}
