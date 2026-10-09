import { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const CHARSET = '!<>-_\\/[]{}=+*^?#01abcdef';

export type ScrambleTrigger = 'mount' | 'hover' | 'manual';

type Props = {
  text: string;
  /** mount = on first paint · hover = on pointer enter · manual = never alone. */
  trigger?: ScrambleTrigger;
  /** ms per tick. ~30 is legible; below ~20 it's just noise. */
  tickMs?: number;
  /** Characters locked per tick. Lower = longer decrypt. */
  lockPerTick?: number;
  className?: string;
  /** Delay before a `mount` run starts. */
  delay?: number;
};

/**
 * Character-cycling decrypt effect — the house hover language.
 *
 * Two things worth knowing:
 *
 * **Use it on monospace.** Random glyphs have random widths in a proportional
 * font, so every tick reflows the line and the text visibly wobbles. In mono
 * the box is stable and the effect reads as decryption rather than breakage.
 *
 * **It is hidden from assistive tech.** A screen reader walking a string of
 * `!<>-_` is being given garbage, and the value changes ~30 times a second.
 * The scrambling span is `aria-hidden` and the real text ships alongside it in
 * an `sr-only` span, so the accessible name is always the final text.
 */
export function ScrambleText({
  text,
  trigger = 'mount',
  tickMs = 30,
  lockPerTick = 0.6,
  className,
  delay = 0,
}: Props) {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(() => (reduced ? text : ''));
  const intervalRef = useRef(0);
  const timeoutRef = useRef(0);

  const stop = useCallback(() => {
    window.clearInterval(intervalRef.current);
    window.clearTimeout(timeoutRef.current);
    intervalRef.current = 0;
    timeoutRef.current = 0;
  }, []);

  const run = useCallback(() => {
    if (reduced) {
      setDisplay(text);
      return;
    }
    stop();

    let tick = 0;
    intervalRef.current = window.setInterval(() => {
      tick += 1;
      const locked = Math.floor(tick * lockPerTick);

      if (locked >= text.length) {
        setDisplay(text);
        stop();
        return;
      }

      let out = '';
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        // Keep whitespace and separators fixed: scrambling them destroys the
        // shape of the line and makes the length read as random.
        if (ch === ' ' || ch === '·' || ch === '/') out += ch;
        else if (i < locked) out += ch;
        else out += CHARSET[Math.floor(Math.random() * CHARSET.length)];
      }
      setDisplay(out);
    }, tickMs);
  }, [reduced, text, tickMs, lockPerTick, stop]);

  useEffect(() => {
    if (reduced) {
      setDisplay(text);
      return;
    }
    if (trigger !== 'mount') {
      setDisplay(text);
      return;
    }
    timeoutRef.current = window.setTimeout(run, delay);
    return stop;
  }, [trigger, run, stop, delay, reduced, text]);

  return (
    <span className={className} onPointerEnter={trigger === 'hover' ? run : undefined}>
      <span aria-hidden>{display || ' '}</span>
      <span className="sr-only">{text}</span>
    </span>
  );
}
