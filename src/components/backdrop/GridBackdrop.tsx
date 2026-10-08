import { useEffect, useRef } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'motion/react';
import { usePointer } from '@/hooks/usePointer';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/** Must match `--grid-cell` in globals.css. */
const CELL = 32;
/** Oversize the tiled grid by whole cells so the parallax never shows an edge. */
const OVERSIZE = CELL * 3;
/** Scroll-to-grid movement ratio. Above ~0.2 it stops reading as depth. */
const PARALLAX = 0.12;
/** Cursor-light falloff radius, in CSS px. */
const LIGHT_RADIUS = 185;
/** Cap DPR: a 3x backing store on a phone buys nothing visible. */
const MAX_DPR = 2;
/** Per-frame lerp toward the real cursor — the light trails the pointer. */
const EASE = 0.12;

const MINT_FALLBACK = '#5EF6C9';

/**
 * Resolve a theme token for canvas use, so the token stays the one source of
 * truth rather than being duplicated as a hex literal.
 *
 * Canvas `fillStyle` accepts `oklch()` in current Chrome/Safari/Firefox, but
 * an unsupported colour is *silently ignored* — the context keeps its previous
 * fill and every dot paints black. So we assign, read back, and fall back to
 * hex if the assignment didn't take.
 */
function resolveCanvasColor(ctx: CanvasRenderingContext2D, token: string, fallback: string) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  if (!raw) return fallback;

  ctx.fillStyle = '#000000';
  ctx.fillStyle = raw;
  // Still black after asking for a non-black colour => the parse failed.
  return ctx.fillStyle === '#000000' ? fallback : raw;
}

/**
 * The ambient layer: a dot matrix that drifts against the scroll and
 * brightens under the cursor, plus a soft accent glow.
 *
 * Split deliberately across three technologies, by cost:
 *
 *   - the base grid is a **tiled CSS background** on a transformed div. Dots
 *     that never change shouldn't cost anything per frame, and parallax is a
 *     compositor transform.
 *   - only the **cursor-lit dots** go on canvas — about 130 of them inside
 *     `LIGHT_RADIUS`, not the ~2000 on screen. Per-dot brightness is the one
 *     thing CSS genuinely can't express.
 *   - the **glow** is a CSS radial gradient moved by a spring. Painting a
 *     760px gradient into canvas every frame would cost far more than letting
 *     the compositor translate one static layer.
 *
 * Under reduced motion only the static grid renders: no canvas, no rAF, no
 * glow, no parallax.
 */
export function GridBackdrop() {
  const reduced = useReducedMotion();
  const { posRef, isFine, x, y } = usePointer();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { scrollY } = useScroll();

  // Modulo one cell: the pattern repeats every CELL px, so wrapping is
  // invisible and the value never grows unbounded on a long page.
  const parallax = useTransform(scrollY, (v) => -((v * PARALLAX) % CELL));

  // The glow lags the cursor — a hard-locked gradient reads as a cheap
  // mouse-follower, a trailing one reads as a light source.
  const glowX = useSpring(x, { stiffness: 110, damping: 26, mass: 0.7 });
  const glowY = useSpring(y, { stiffness: 110, damping: 26, mass: 0.7 });

  const lightOn = !reduced && isFine;

  useEffect(() => {
    if (!lightOn) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let dpr = 1;
    let width = 0;
    let height = 0;
    let colour = MINT_FALLBACK;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      colour = resolveCanvasColor(ctx, '--color-mint-400', MINT_FALLBACK);
    };

    resize();

    // Smoothed cursor + an intensity that fades the light out when the
    // pointer leaves the window, instead of snapping it off.
    let cx = posRef.current.x;
    let cy = posRef.current.y;
    let intensity = 0;

    let raf = 0;

    const draw = () => {
      raf = requestAnimationFrame(draw);

      const target = posRef.current;
      cx += (target.x - cx) * EASE;
      cy += (target.y - cy) * EASE;
      const wanted = target.inside ? 1 : 0;
      intensity += (wanted - intensity) * 0.08;

      ctx.clearRect(0, 0, width, height);

      // Below this the light is invisible; skip the whole pass.
      if (intensity < 0.01) return;

      const offset = parallax.get();
      ctx.fillStyle = colour;

      // Walk only the cells inside the light radius, not the whole viewport.
      const minCol = Math.floor((cx - LIGHT_RADIUS) / CELL);
      const maxCol = Math.ceil((cx + LIGHT_RADIUS) / CELL);
      const minRow = Math.floor((cy - LIGHT_RADIUS - offset) / CELL);
      const maxRow = Math.ceil((cy + LIGHT_RADIUS - offset) / CELL);

      for (let col = minCol; col <= maxCol; col++) {
        const dotX = col * CELL + 1;
        if (dotX < -CELL || dotX > width + CELL) continue;

        for (let row = minRow; row <= maxRow; row++) {
          const dotY = row * CELL + 1 + offset;
          if (dotY < -CELL || dotY > height + CELL) continue;

          const dx = dotX - cx;
          const dy = dotY - cy;
          const distSq = dx * dx + dy * dy;
          if (distSq > LIGHT_RADIUS * LIGHT_RADIUS) continue;

          // Quadratic falloff: a linear one leaves a visible hard rim.
          const t = 1 - Math.sqrt(distSq) / LIGHT_RADIUS;
          const eased = t * t;

          ctx.globalAlpha = eased * 0.6 * intensity;
          ctx.beginPath();
          ctx.arc(dotX, dotY, 1 + eased * 1.3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
    };

    const start = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };

    const stop = () => {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
      ctx.clearRect(0, 0, width, height);
    };

    // A background tab shouldn't burn a frame loop.
    const onVisibility = () => (document.hidden ? stop() : start());

    start();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stop();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [lightOn, posRef, parallax]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{
        zIndex: 'var(--z-backdrop)',
        // Viewport-relative vignette: the grid is always densest at the top
        // of the screen and dissolves toward the bottom, at every scroll
        // position, because the whole layer is fixed.
        // Prefixed too — Safari only dropped -webkit- for mask-image in 15.4.
        maskImage: 'radial-gradient(ellipse 125% 100% at 50% 0%, black 10%, transparent 85%)',
        WebkitMaskImage: 'radial-gradient(ellipse 125% 100% at 50% 0%, black 10%, transparent 85%)',
      }}
    >
      <motion.div
        className="absolute inset-x-0 dot-matrix"
        style={{ top: -OVERSIZE, bottom: -OVERSIZE, y: reduced ? 0 : parallax }}
      />

      {lightOn && (
        <>
          <canvas ref={canvasRef} className="absolute inset-0" />
          <motion.div
            className="absolute size-[760px] rounded-full"
            style={{
              x: glowX,
              y: glowY,
              left: -380,
              top: -380,
              background:
                'radial-gradient(circle, oklch(0.888 0.145 168 / 0.07) 0%, transparent 62%)',
            }}
          />
        </>
      )}
    </div>
  );
}
