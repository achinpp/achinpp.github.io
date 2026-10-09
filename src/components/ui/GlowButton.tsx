import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { useMagnetic } from '@/hooks/useMagnetic';

type Props = {
  href: string;
  children: ReactNode;
  icon?: ReactNode;
  /** Passed through to the anchor — a filename forces a download. */
  download?: string;
  className?: string;
};

/**
 * The primary call to action. There is exactly one of these per page.
 *
 * Four things stack to make it unmissable: a rotating conic border, a mint
 * glow that doubles on hover, a shimmer sweep across the face, and magnetic
 * pull toward the cursor.
 *
 * The rotating border is a `transform: rotate()` on an oversized
 * conic-gradient square clipped by the parent, *not* an animated
 * `background-image` angle. Animating the gradient itself forces the browser
 * to re-rasterise it every frame; rotating a static layer is pure compositor
 * work. (Same reasoning as ScanlineSweep, applied at button scale.)
 *
 * With motion disabled the gradient simply stops rotating — the ring, the
 * glow and the hover state all still read, so nothing about the affordance
 * depends on animation.
 */
export function GlowButton({ href, children, icon, download, className }: Props) {
  const { ref, x, y, handlers } = useMagnetic(0.2);

  return (
    <motion.a
      ref={ref as React.Ref<HTMLAnchorElement>}
      href={href}
      download={download}
      {...handlers}
      style={{
        x,
        y,
        // Shows through the 1px gap left by `p-px`, so the ring never fully
        // disappears in the dark arcs of the conic gradient.
        backgroundColor: 'var(--color-mint-950)',
      }}
      whileTap={{ scale: 0.97 }}
      className={`group relative inline-flex rounded-full p-px shadow-glow-md transition-shadow duration-300 hover:shadow-glow-lg ${className ?? ''}`}
    >
      {/* Rotating border light */}
      <span aria-hidden className="absolute inset-0 overflow-hidden rounded-full">
        <span
          className="absolute top-1/2 left-1/2 aspect-square w-[300%] motion-ok:animate-conic"
          style={{
            transform: 'translate(-50%, -50%)',
            background:
              'conic-gradient(from 0deg, transparent 0deg, var(--color-mint-400) 40deg, transparent 95deg, transparent 185deg, var(--color-mint-200) 220deg, transparent 280deg, transparent 360deg)',
          }}
        />
      </span>

      {/* Face */}
      <span className="relative z-10 flex items-center gap-3 overflow-hidden rounded-full bg-obsidian-900 px-7 py-4 sm:px-8">
        <span
          aria-hidden
          className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-mint-400/20 to-transparent motion-ok:animate-shimmer"
        />
        {icon && <span className="relative shrink-0 text-mint-300">{icon}</span>}
        <span className="relative font-mono text-label-lg text-mint-100 uppercase">{children}</span>
      </span>
    </motion.a>
  );
}
