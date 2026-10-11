import { useCallback, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { TERMINAL_LENGTH, TERMINAL_SCRIPT } from '@/data/profile';
import { TerminalWindow } from '@/components/boot/TerminalWindow';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useScrollLock } from '@/hooks/useScrollLock';
import { useTypewriter } from '@/hooks/useTypewriter';
import { duration, easeOutExpo } from '@/lib/motion/easings';

/** Beat between the last character and the lift, so the end is readable. */
const HOLD_MS = 380;

/**
 * The boot overlay.
 *
 * The terminal used to sit in the hero, beside the name. It is a loading
 * screen now, which is a different job with different rules.
 *
 * **The page is already underneath.** The whole site renders behind this on
 * the first frame; the overlay is opaque glass over a finished page, not a
 * gate holding one back. So the lift is a fade with nothing to wait for, and
 * anyone who skips lands on a page that is already laid out and decoded.
 * That also keeps the cost honest: the boot screen adds time to the first
 * thing a visitor can *read*, and there is no way around that, but it adds
 * nothing to the work the browser has to do.
 *
 * **It is skippable four ways:** the button in the window chrome, Escape, a
 * click anywhere on the glass, and the reduced motion preference, which skips
 * the overlay entirely rather than showing a still of it. See
 * `<BootProvider>` for that last one.
 *
 * **Focus is trapped and the page is scroll locked** while it is up. Both are
 * what make it a layer rather than a decoration: without the trap, Tab walks
 * into a page nobody can see, and without the lock a trackpad scrolls the
 * hero out of frame behind the glass.
 *
 * **The progress bar is real.** It is characters typed over characters in the
 * script, not a timed animation pretending to measure something. A fake
 * progress bar on a loading screen is a small lie told to every visitor.
 */
export function BootScreen({ onDone }: { onDone: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const typing = useTypewriter(TERMINAL_SCRIPT, { enabled: true, instant: false });

  useScrollLock(true);
  useFocusTrap(true, ref);

  /**
   * One dismiss path for all four controls.
   *
   * Before the script finishes it jumps to the end, which then runs the hold
   * and the lift normally. After it finishes there is nothing left to skip,
   * so it takes the page straight away rather than doing nothing for the
   * remaining 380ms.
   */
  const dismiss = useCallback(() => {
    if (typing.done) onDone();
    else typing.skip();
  }, [typing, onDone]);

  // Hold on the finished transcript, then hand the page over.
  useEffect(() => {
    if (!typing.done) return;
    const id = window.setTimeout(onDone, HOLD_MS);
    return () => window.clearTimeout(id);
  }, [typing.done, onDone]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [dismiss]);

  const typed =
    TERMINAL_SCRIPT.slice(0, typing.lineIndex).reduce((n, line) => n + line.text.length, 0) +
    typing.charCount;
  const progress = Math.min(1, typed / TERMINAL_LENGTH);

  return (
    <motion.div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label="Boot sequence"
      // The handle `scripts/browser-check.py` drives the whole boot section
      // from. It ships in production on purpose: a test hook that only exists
      // in the build nobody visits is testing a different page.
      data-boot=""
      initial={{ opacity: 1 }}
      // Scaling up a touch on the way out reads as the glass lifting off the
      // page rather than the page fading in from nothing.
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: duration.slow, ease: easeOutExpo }}
      onClick={dismiss}
      style={{ zIndex: 'var(--z-boot)' }}
      className="fixed inset-0 flex flex-col items-center justify-center gap-10 bg-obsidian-950 dot-matrix px-5"
    >
      {/* A mint wash from below, so the glass is lit rather than flat. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(60%_100%_at_50%_100%,oklch(0.888_0.145_168/0.10),transparent_70%)]"
      />

      <div className="relative w-full max-w-lg">
        <p className="mb-5 flex items-center gap-2.5 font-mono text-[0.5625rem] tracking-[0.3em] text-obsidian-500 uppercase">
          <span
            aria-hidden
            className="size-1.5 rounded-full bg-mint-400 motion-ok:animate-pulse-dot"
          />
          shadow command center
        </p>

        <TerminalWindow typing={typing} onSkip={dismiss} />

        {/* ------------------------------------------------------ progress */}
        <div className="mt-6 flex items-center gap-4">
          <div
            role="progressbar"
            aria-label="Boot progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress * 100)}
            className="h-px flex-1 bg-hairline"
          >
            {/* A plain transform, not a Framer animation. The value changes
                once per typed character, which is every ~20ms, so animating
                between the steps would be queueing an animation per frame to
                smooth a line that is already smooth. */}
            <span
              aria-hidden
              style={{ transform: `scaleX(${progress})` }}
              className="block h-px origin-left bg-mint-400 shadow-glow-xs transition-transform duration-100 ease-linear"
            />
          </div>
          {/* Right aligned in a fixed box rather than zero padded. The rest
              of the site pads its numbers (`SLOT_03`, `04 MISSIONS`) because
              they are identifiers and counts; `070%` just reads as a typo. */}
          <span className="w-10 text-right font-mono text-[0.5625rem] tracking-[0.2em] text-mint-600 tabular-nums">
            {Math.round(progress * 100)}%
          </span>
        </div>
      </div>
    </motion.div>
  );
}
