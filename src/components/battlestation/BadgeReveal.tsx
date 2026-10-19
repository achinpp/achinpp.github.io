import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import type { AchievementReveal } from '@/data/achievements';
import { usePointer } from '@/hooks/usePointer';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { duration, easeOutExpo } from '@/lib/motion/easings';

/** Widest the panel is ever drawn, before the viewport gets a say. */
const MAX_WIDTH = 640;
/** Kept clear of every viewport edge. */
const MARGIN = 16;
/** Between the badge and the panel. */
const GAP = 14;
/** The caption strip under the picture, so the height can be worked out
 *  before the panel has ever been rendered and measured. */
const CAPTION_HEIGHT = 34;

type Placement = { left: number; top: number; width: number };

/**
 * Work out where the panel goes, from the trigger's box and the picture's
 * own aspect ratio.
 *
 * Measuring the rendered panel instead would mean painting it somewhere
 * wrong for one frame and then moving it, which is visible. The picture's
 * dimensions are already in the data, so the height is arithmetic.
 *
 * Two constraints, in order: the panel never exceeds `MAX_WIDTH` or the
 * viewport width, and if that width makes it taller than the viewport it is
 * narrowed until it fits. Then it goes above the badge if there is room and
 * below if there is not, and the left edge is clamped so an outside badge
 * never pushes it off screen.
 */
function place(rect: DOMRect, image: AchievementReveal): Placement {
  const ratio = image.height / image.width;
  const maxHeight = window.innerHeight - MARGIN * 2;

  let width = Math.min(MAX_WIDTH, window.innerWidth - MARGIN * 2);
  if (width * ratio + CAPTION_HEIGHT > maxHeight) {
    width = (maxHeight - CAPTION_HEIGHT) / ratio;
  }
  const height = width * ratio + CAPTION_HEIGHT;

  const left = Math.min(
    Math.max(MARGIN, rect.left + rect.width / 2 - width / 2),
    window.innerWidth - width - MARGIN,
  );

  const above = rect.top - GAP - height >= MARGIN;
  const top = above
    ? rect.top - GAP - height
    : Math.min(rect.bottom + GAP, window.innerHeight - height - MARGIN);

  return { left, top, width };
}

/**
 * A picture kept behind a badge until somebody asks for it.
 *
 * The Red Cypher scoreboard used to sit in the field record under the wall,
 * at the same weight as the two photographs. You asked for it to live in the
 * hexagon instead, which is the better place for it: the badge says
 * `Finalist`, and the scoreboard is the receipt for that word. Putting the
 * receipt behind the claim rather than beside it means the wall stays a wall.
 *
 * **Hover on a mouse, tap on everything else.** `isFine` comes from the
 * pointer provider, which is a real media query rather than a user agent
 * guess. Where there is a hover the pointer owns the panel entirely and the
 * click does nothing: without that, hovering opens it and the click that
 * follows closes the thing the visitor was reaching for. Where there is no
 * hover, the tap is the only way in, so it toggles.
 *
 * **It is a `<button>` with `aria-expanded`, not a tooltip.** A tooltip is
 * for a short label and announces itself as one; this is a disclosure around
 * a picture. Keyboard focus opens it, Escape and blur close it, and the
 * accessible name says what is behind the badge rather than leaving a
 * keyboard user to guess that `Finalist` is operable at all.
 *
 * **The panel is portalled to `<body>`.** It is `position: fixed`, and
 * Framer leaves a `transform` on the badge's own list item after the unlock
 * animation, which would make a fixed child position against that transform
 * instead of the viewport.
 *
 * **Any scroll closes it.** Lenis moves the real scroll position, so the
 * panel would otherwise sit at coordinates that stopped being true. Closing
 * beats recomputing: on a mouse the pointer has left the badge anyway, and
 * on a touch screen a scroll is how someone dismisses things.
 */
export function BadgeReveal({
  image,
  children,
}: {
  image: AchievementReveal;
  children: ReactNode;
}) {
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const prefetched = useRef(false);
  const [placement, setPlacement] = useState<Placement | null>(null);
  const { isFine } = usePointer();
  const reduced = useReducedMotion();

  const open = placement !== null;

  const show = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) setPlacement(place(rect, image));
  }, [image]);

  const hide = useCallback(() => setPlacement(null), []);

  /**
   * Fetch the picture on approach, not on open. It is 32 kB and it is not on
   * the page, so without this the first hover opens an empty panel and fills
   * it a moment later.
   */
  const prefetch = useCallback(() => {
    if (prefetched.current) return;
    prefetched.current = true;
    new Image().src = image.src;
  }, [image.src]);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') hide();
    };
    const onResize = () => show();
    // Outside taps, for the touch path where there is no pointerleave.
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      hide();
    };

    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', hide, { passive: true });
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', hide);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open, hide, show]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onPointerEnter={() => {
          prefetch();
          if (isFine) show();
        }}
        onPointerLeave={() => {
          if (isFine) hide();
        }}
        onFocus={() => {
          prefetch();
          show();
        }}
        onBlur={hide}
        onClick={() => {
          if (isFine) return;
          if (open) hide();
          else show();
        }}
        className="group/reveal block w-full cursor-pointer rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mint-400"
      >
        {children}
        <span className="sr-only">Show {image.caption.toLowerCase()}</span>
      </button>

      {createPortal(
        <AnimatePresence>
          {placement && (
            <motion.div
              ref={panelRef}
              id={panelId}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.99 }}
              transition={{ duration: reduced ? 0.12 : duration.base, ease: easeOutExpo }}
              style={{
                position: 'fixed',
                left: placement.left,
                top: placement.top,
                width: placement.width,
                zIndex: 'var(--z-overlay)',
              }}
              // `pointer-events-none` so the panel can never sit between the
              // cursor and the badge it came from: on a mouse, moving onto it
              // would fire `pointerleave` on the trigger and shut it.
              className="pointer-events-none overflow-hidden rounded-xl border border-mint-900 bg-obsidian-950 shadow-glow-sm"
            >
              <img
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                decoding="async"
                className="block w-full"
              />
              <p className="flex items-center gap-2.5 border-t border-hairline px-4 py-2.5 font-mono text-[0.5625rem] tracking-[0.18em] text-obsidian-500 uppercase">
                <span aria-hidden className="h-px w-5 bg-hairline-strong" />
                {image.caption}
              </p>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
