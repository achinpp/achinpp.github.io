import { useEffect, useRef } from 'react';
import { cancelFrame, frame } from 'motion/react';
import { usePointer } from '@/hooks/usePointer';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/** CSS pixels between one mote and the next, on both axes. */
const STEP = 3.4;
/** The side of one mote, in CSS pixels, before the device ratio. */
const DOT = 2;
/** How far off the grid a mote is allowed to sit, as a share of `STEP`. */
const JITTER = 0.75;
/** Source alpha at or under this is air, and gets no mote. */
const ALPHA_FLOOR = 26;
/** The brightest a mote is ever drawn. Under 1 so the face reads through. */
const MAX_ALPHA = 0.9;

/** CSS pixels around the cursor that feel the push. */
const RADIUS = 92;
/** Acceleration at the very centre of that circle, in px per frame squared. */
const PUSH = 1.15;
/** Pull back to the mote's own place on the grid. */
const SPRING = 0.045;
const FRICTION = 0.85;
/** Under this much movement per frame, the cloud counts as settled. */
const SETTLED = 0.02;

/** Room around the picture for pushed motes, in CSS pixels. Matches `-inset-10`. */
const PAD = 40;
/** Two is enough for a mote. Past that it is bytes for nothing. */
const MAX_DPR = 2;

/**
 * `--color-mint-600` and `--color-mint-200`, resolved to sRGB. A mote is
 * somewhere between them depending on how bright the photograph is under it,
 * which is what keeps the cloud readable as a face rather than as a stencil.
 */
const DIM = [36, 191, 147];
const LIT = [174, 252, 221];

/** Deterministic noise, so a reload does not reshuffle the dust. */
function hash(a: number, b: number): number {
  const s = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453;
  return s - Math.floor(s);
}

/**
 * How the picture dissolves at the bottom. The wrapper in `<Portrait />`
 * masks the photograph with this same curve, and the motes carry it in their
 * own alpha instead of under a mask of their own. A mask clips to its border
 * box, and clipping is the one thing this layer cannot have: a mote pushed
 * past the edge of the picture has to keep going. Stage 22 was the same bug
 * one layer down.
 */
function fadeAt(y: number, height: number): number {
  const t = y / height;
  if (t <= 0.6) return 1;
  if (t <= 0.87) return 1 - 0.7 * ((t - 0.6) / 0.27);
  if (t <= 0.99) return 0.3 * (1 - (t - 0.87) / 0.12);
  return 0;
}

/**
 * Mint dust over the portrait, which the cursor pushes out of its way.
 *
 * The picture is sampled on a grid, one mote per cell that is not
 * transparent, coloured from the pixel under it. At rest the cloud sits
 * exactly on that grid and nothing moves or costs anything. Inside `RADIUS`
 * of the cursor each mote takes an acceleration straight away from it, with
 * a linear falloff, while a spring pulls it home. So the dust opens around
 * the cursor, the photograph underneath shows clean through the hole, and the
 * cloud closes again behind it.
 *
 * **It is a canvas, not elements.** About 7,000 motes at this size; 7,000
 * absolutely positioned divs would be 7,000 style recalculations a frame.
 * The frame is written into one `ImageData` buffer as packed 32 bit pixels
 * and blitted in a single `putImageData`, which is a few hundred microseconds
 * and leaves the GPU out of it entirely.
 *
 * **It runs inside Framer's frame loop**, like Lenis does, so the physics
 * land in the same ordered pass as everything else that moves on this page
 * rather than in a second rAF racing it.
 *
 * **It stops when there is nothing to do.** No cursor nearby and every mote
 * home means the loop returns on its first line, and an `IntersectionObserver`
 * takes the callback off the loop entirely once the hero has scrolled away.
 *
 * **It never mounts for a visitor who cannot use it:** no fine pointer, no
 * dust, because a cloud that hides the face and never opens is worse than no
 * effect at all. Reduced motion is the same answer for the same reason.
 */
export function PortraitDust({ src }: { src: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { posRef, isFine } = usePointer();
  const reduced = useReducedMotion();
  const on = isFine && !reduced;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!on || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Pixels are written as one 32 bit word each, which means byte order
    // matters. Every platform this ships to is little endian; the probe is
    // four lines and removes the question.
    const probe = new Uint8Array(4);
    new Uint32Array(probe.buffer)[0] = 0x01020304;
    const littleEndian = probe[0] === 0x04;

    /** x, y, homeX, homeY, vx, vy for each mote. */
    let motes = new Float32Array(0);
    let colours = new Uint32Array(0);
    let count = 0;
    let pixels: ImageData | null = null;
    let buffer: Uint32Array | null = null;
    let dpr = 1;
    let dot = 2;
    let boxW = 0;
    let boxH = 0;
    let rect = canvas.getBoundingClientRect();
    let dirty = true;
    let running = false;

    const image = new Image();
    image.decoding = 'async';

    function build() {
      const canvasEl = canvas;
      if (!canvasEl || !image.complete || !image.naturalWidth) return;

      // The canvas is PAD larger than the picture on every side, so the
      // picture's own box is what the grid is laid out in.
      boxW = canvasEl.clientWidth - PAD * 2;
      boxH = canvasEl.clientHeight - PAD * 2;
      if (boxW <= 0 || boxH <= 0) return;

      dpr = Math.min(MAX_DPR, window.devicePixelRatio || 1);
      canvasEl.width = Math.round(canvasEl.clientWidth * dpr);
      canvasEl.height = Math.round(canvasEl.clientHeight * dpr);
      dot = Math.max(1, Math.round(DOT * dpr));

      const cols = Math.max(1, Math.round(boxW / STEP));
      const rows = Math.max(1, Math.round(boxH / STEP));

      // Sample by drawing the picture at grid resolution and reading that
      // back. The browser's own downscale averages each cell for free, which
      // is both faster and smoother than walking the full size pixels.
      const sampler = document.createElement('canvas');
      sampler.width = cols;
      sampler.height = rows;
      const sctx = sampler.getContext('2d', { willReadFrequently: true });
      if (!sctx) return;
      sctx.drawImage(image, 0, 0, cols, rows);
      const data = sctx.getImageData(0, 0, cols, rows).data;

      count = 0;
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] > ALPHA_FLOOR) count++;
      }

      motes = new Float32Array(count * 6);
      colours = new Uint32Array(count);

      const cellW = boxW / cols;
      const cellH = boxH / rows;
      let p = 0;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = (r * cols + c) * 4;
          const a = data[i + 3];
          if (a <= ALPHA_FLOOR) continue;

          const lum = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
          const t = Math.pow(lum, 0.85);

          const x = PAD + (c + 0.5 + (hash(c, r) - 0.5) * JITTER) * cellW;
          const y = PAD + (r + 0.5 + (hash(r + 97, c) - 0.5) * JITTER) * cellH;

          const k = p * 6;
          motes[k] = x;
          motes[k + 1] = y;
          motes[k + 2] = x;
          motes[k + 3] = y;

          const cr = (DIM[0] + (LIT[0] - DIM[0]) * t) | 0;
          const cg = (DIM[1] + (LIT[1] - DIM[1]) * t) | 0;
          const cb = (DIM[2] + (LIT[2] - DIM[2]) * t) | 0;
          const al = ((a / 255) * (0.2 + 0.8 * t) * MAX_ALPHA * fadeAt(y - PAD, boxH) * 255) | 0;

          colours[p] = littleEndian
            ? ((al << 24) | (cb << 16) | (cg << 8) | cr) >>> 0
            : ((cr << 24) | (cg << 16) | (cb << 8) | al) >>> 0;
          p++;
        }
      }

      pixels = ctx!.createImageData(canvasEl.width, canvasEl.height);
      buffer = new Uint32Array(pixels.data.buffer);
      dirty = true;
    }

    function draw() {
      const canvasEl = canvas;
      if (!buffer || !pixels || !canvasEl) return;
      buffer.fill(0);

      const w = canvasEl.width;
      const h = canvasEl.height;

      for (let p = 0; p < count; p++) {
        const k = p * 6;
        const px = Math.round(motes[k] * dpr);
        const py = Math.round(motes[k + 1] * dpr);
        const value = colours[p];

        for (let dy = 0; dy < dot; dy++) {
          const yy = py + dy;
          if (yy < 0 || yy >= h) continue;
          const row = yy * w;
          for (let dx = 0; dx < dot; dx++) {
            const xx = px + dx;
            if (xx < 0 || xx >= w) continue;
            buffer[row + xx] = value;
          }
        }
      }

      ctx!.putImageData(pixels, 0, 0);
    }

    // `delta` is the frame loop's own millisecond step. The type is inlined
    // because `FrameData` is not exported, the same as in the Lenis bridge.
    function step({ delta }: { delta: number }) {
      if (!count) return;

      // A 120Hz display would otherwise settle the cloud twice as fast as a
      // 60Hz one. Clamped, because a dropped frame must not launch the dust.
      const scale = Math.min(2, Math.max(0.5, delta / 16.667));
      const friction = Math.pow(FRICTION, scale);

      const pointer = posRef.current;
      const mx = pointer.x - rect.left;
      const my = pointer.y - rect.top;
      const near =
        pointer.inside &&
        mx > -RADIUS &&
        my > -RADIUS &&
        mx < rect.width + RADIUS &&
        my < rect.height + RADIUS;

      let moving = false;

      for (let p = 0; p < count; p++) {
        const k = p * 6;
        const x = motes[k];
        const y = motes[k + 1];
        let vx = motes[k + 4];
        let vy = motes[k + 5];

        if (near) {
          const dx = x - mx;
          const dy = y - my;
          const d2 = dx * dx + dy * dy;
          if (d2 < RADIUS * RADIUS) {
            const d = Math.sqrt(d2) || 0.0001;
            const force = (1 - d / RADIUS) * PUSH * scale;
            vx += (dx / d) * force;
            vy += (dy / d) * force;
          }
        }

        vx += (motes[k + 2] - x) * SPRING * scale;
        vy += (motes[k + 3] - y) * SPRING * scale;
        vx *= friction;
        vy *= friction;

        if (vx > SETTLED || vx < -SETTLED || vy > SETTLED || vy < -SETTLED) moving = true;

        motes[k] = x + vx;
        motes[k + 1] = y + vy;
        motes[k + 4] = vx;
        motes[k + 5] = vy;
      }

      if (!moving && !dirty) return;
      draw();
      dirty = moving;
    }

    const measure = () => {
      rect = canvas.getBoundingClientRect();
    };

    const start = () => {
      if (running) return;
      running = true;
      measure();
      frame.update(step, true);
    };

    const stop = () => {
      if (!running) return;
      running = false;
      cancelFrame(step);
    };

    const resize = new ResizeObserver(() => {
      build();
      measure();
      draw();
    });
    resize.observe(canvas);

    const visible = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { rootMargin: '120px' },
    );
    visible.observe(canvas);

    image.onload = () => {
      build();
      measure();
      draw();
    };
    image.src = src;

    // Lenis moves the real scroll position, so the picture's box moves with
    // it. One read per scroll event beats one per frame.
    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);

    return () => {
      stop();
      resize.disconnect();
      visible.disconnect();
      image.onload = null;
      window.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, [on, src, posRef]);

  if (!on) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      // Wider than the picture on every side, so a mote pushed off the edge
      // has somewhere to go. The size is written out rather than left to
      // `-inset-10`: a canvas is a replaced element, so opposite insets do
      // not stretch it, it keeps its intrinsic 300x150, and the rebuild then
      // doubles the backing store on every pass of the ResizeObserver.
      // `pointer-events-none` because it reaches into the name column's
      // margin and must not eat a click meant for the page.
      className="pointer-events-none absolute -top-10 -left-10 size-[calc(100%+5rem)]"
    />
  );
}
