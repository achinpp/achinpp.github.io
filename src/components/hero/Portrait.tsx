import { motion } from 'motion/react';
import { PORTRAIT } from '@/data/profile';
import { PortraitDust } from '@/components/hero/PortraitDust';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { duration, easeOutExpo } from '@/lib/motion/easings';

/**
 * The cut-out figure that stands beside the name in the hero.
 *
 * **Why the photograph is desaturated by default.** The palette here is two
 * colours — obsidian and mint — and the shirt in the picture is covered in
 * primary-coloured shapes. Dropped in untouched it reads as a screenshot
 * pasted onto the page. Desaturated it reads as part of the system, and the
 * colour comes back on hover, which is also when someone is looking at it
 * closely enough to want the detail.
 *
 * **Four layers, each doing one job:**
 *
 * 1. a radial mint bloom *behind* the figure, so it is lit by the page rather
 *    than floating on it — this one sits outside the masked box on purpose,
 *    because it has to bleed past the silhouette;
 * 2. the image, under a `drop-shadow` rim. `drop-shadow` follows the alpha
 *    silhouette; `box-shadow` would trace the rectangle and give the whole
 *    thing away as a photo in a box. The rim is on a wrapper *outside* the
 *    fade, not on the `<img>`, for the reason under the fade below;
 * 3. a mint sheen masked by the image's own alpha, so the tint lands on the
 *    person and not on the transparent air around them — which is the whole
 *    reason the asset is a single WebP URL and not a `<picture>`;
 * 4. a bottom fade on the wrapper. The source is a hard torso crop; without
 *    the fade the figure looks sliced off mid-chest.
 *
 * The fade lives on the wrapper rather than as a second mask layer on each
 * child, so nothing here needs `mask-composite` — which is the one part of
 * the masking spec with genuinely divergent prefixed semantics.
 *
 * **Why the rim sits outside the fade.** A mask clips to its own border box,
 * and the asset is trimmed to the alpha bounding box, which means the figure
 * touches all four edges of the picture by construction. With the rim on the
 * `<img>`, the half of the glow that belongs outside the box was cut off
 * square: a hard green line down both arms and along the bottom, with the
 * curve of the shoulders turning it into a rounded rectangle drawn around the
 * photograph. You spotted it and sent a portrait padded with transparent
 * space to cure it. Padding would have worked only up to a point, and the
 * point is low: the hover glow is 26px at a render scale of about 0.64, so it
 * wants roughly 60px of source margin on every side, and every one of those
 * pixels comes off the size the face is drawn at. The clip is the bug, so the
 * filter moved out to a wrapper the mask does not govern. A filter paints
 * wherever its blur reaches; it is only ever a clip that stops it.
 *
 * **There is no caption.** There was one, inferred from the shirt in the
 * photograph and the filename it arrived under, and you asked for it gone.
 * The whole mechanism went with it rather than just the string: a `caption`
 * field sitting at `null` is an empty slot, and an empty slot is an
 * invitation to fill it with a guess.
 *
 * **Nothing here is allowed to delay first paint.** No `loading="lazy"`, both
 * dimensions on the element so the box is reserved before the bytes land (CLS
 * measured at 0.0157 against a 0.0151 baseline — i.e. nothing), and an
 * entrance that starts immediately rather than one gated on the terminal the
 * way the name is.
 *
 * **And no `<link rel="preload">`, which was tried and removed.** It is the
 * textbook move for a hero image and it is wrong here: the LCP element is the
 * `<h1>`, which is gated on the bundle executing, so a preload spends early
 * bandwidth on something that is not the metric. Twelve cold measurements
 * could not separate it from the noise either way — the floor on this machine
 * is ±150ms with occasional 700ms outliers — so the tie was broken on the
 * thing that is not a measurement: the preload duplicates `PORTRAIT.src` into
 * `index.html`, where nothing would catch the two drifting apart. The file is
 * 24 kB and has the whole typing animation to arrive in.
 */
export function Portrait() {
  const reduced = useReducedMotion();

  if (!PORTRAIT) return null;

  const fade =
    'linear-gradient(to bottom, #000 0%, #000 60%, rgba(0,0,0,0.3) 87%, transparent 99%)';

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: duration.slow, ease: easeOutExpo, delay: 0.2 }}
      // 16rem -> 18rem now the terminal has vacated the hero. The source is
      // 451px wide, so 18rem renders at 1.57x on a 2x display, still inside
      // the band where the photograph is sharp, and the cap is what keeps it
      // there rather than letting it fill a column that is now much wider.
      className="group relative w-full max-w-[13rem] sm:max-w-[14.5rem] lg:max-w-[18rem]"
    >
      <div className="relative">
        {/* 1 — ambient bloom, outside the fade so it can spill. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-[-24%] top-[4%] bottom-[-6%] rounded-[50%] bg-[radial-gradient(58%_50%_at_50%_58%,oklch(0.888_0.145_168/0.20),transparent_72%)] blur-xl"
        />

        {/* 2 — the rim, on its own wrapper so the mask below cannot clip it. */}
        <div className="[filter:drop-shadow(0_0_18px_oklch(0.888_0.145_168/0.24))] transition-[filter] duration-500 ease-out-expo group-hover:[filter:drop-shadow(0_0_26px_oklch(0.888_0.145_168/0.36))]">
          {/* 4 — the fade, owning the picture and the sheen. */}
          <div className="relative" style={{ maskImage: fade, WebkitMaskImage: fade }}>
            <img
              src={PORTRAIT.src}
              alt={PORTRAIT.alt}
              width={PORTRAIT.width}
              height={PORTRAIT.height}
              decoding="async"
              className="block w-full [filter:saturate(0.42)_contrast(1.16)_brightness(1.12)] transition-[filter] duration-500 ease-out-expo group-hover:[filter:saturate(1)_contrast(1.04)_brightness(1.08)]"
            />

            {/* 3 */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(158deg,oklch(0.888_0.145_168/0.55)_0%,transparent_17%)] transition-opacity duration-500 group-hover:opacity-40"
              style={{
                maskImage: `url(${PORTRAIT.src})`,
                WebkitMaskImage: `url(${PORTRAIT.src})`,
                maskSize: '100% 100%',
                WebkitMaskSize: '100% 100%',
              }}
            />
          </div>
        </div>

        {/* 5 — the dust, over the photograph and outside both the fade and
            the rim. Outside the fade because a mote pushed past the edge of
            the picture has to keep going and a mask would cut it off there;
            outside the rim because a `drop-shadow` over a canvas that
            repaints every frame is a full reblur every frame, for a glow the
            figure under it already has. It carries the fade curve in its own
            alpha instead. */}
        <PortraitDust src={PORTRAIT.src} />

        {/* The line the fade dissolves into: a horizon, not an edge. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,var(--color-mint-800),transparent)]"
        />
      </div>
    </motion.div>
  );
}
