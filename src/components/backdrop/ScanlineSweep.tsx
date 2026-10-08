import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * A soft band of light that travels down the viewport every 11 seconds.
 *
 * Deliberately almost subliminal: at 0.04 alpha you register it as the room
 * breathing rather than as an animation. Anything brighter turns into a
 * screensaver and fights the content for attention.
 *
 * > Deviation from the brief: the plan said "conic gradient pass". A rotating
 * > conic gradient can't be composited — the browser re-rasterises the whole
 * > gradient every frame, which is a continuous main-thread paint behind the
 * > entire page. A translated linear band looks nearly identical and runs
 * > purely as a compositor transform, so it costs effectively nothing.
 */
export function ScanlineSweep() {
  const reduced = useReducedMotion();
  if (reduced) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: 'var(--z-backdrop)', contain: 'strict' }}
    >
      <div
        className="absolute inset-x-0 h-[22vh] will-change-transform motion-ok:animate-scan"
        style={{
          top: 0,
          background:
            'linear-gradient(to bottom, transparent 0%, oklch(0.888 0.145 168 / 0.04) 45%, oklch(0.888 0.145 168 / 0.055) 50%, oklch(0.888 0.145 168 / 0.04) 55%, transparent 100%)',
        }}
      />
    </div>
  );
}
