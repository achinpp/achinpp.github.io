import { useCallback, useEffect, useRef, useState } from 'react';
import type { TerminalLine } from '@/data/profile';

export type TypewriterState = {
  /** Index of the line currently being typed. Equals script.length when done. */
  lineIndex: number;
  /** Characters revealed on the current line. */
  charCount: number;
  done: boolean;
  /** Jump straight to the end. Safe to call at any point, including twice. */
  skip: () => void;
};

/** Human typing isn't metronomic; a little jitter is what sells it. */
const JITTER = 16;
/** Beat before the first character, so the window reads as "opening". */
const LEAD_IN = 260;
const DEFAULT_SPEED = 26;
const DEFAULT_PAUSE = 240;

/**
 * Types a script out line by line.
 *
 * A `setTimeout` chain rather than a rAF loop: the interval between
 * characters is 14–34ms with jitter, which is slower than a frame, so rAF
 * would just mean checking the clock 60 times a second to act on a third of
 * them. One re-render per character is the real cost, and it's bounded by the
 * script length (~150 chars) over ~2.5s.
 *
 * `enabled` gates the start so a boot overlay can hold the sequence back.
 * When motion is disabled the whole script is already complete on first
 * render — there is no animation to skip.
 */
export function useTypewriter(
  script: TerminalLine[],
  { enabled, instant }: { enabled: boolean; instant: boolean },
): TypewriterState {
  const complete = { lineIndex: script.length, charCount: 0 };

  const [state, setState] = useState(() => (instant ? complete : { lineIndex: 0, charCount: 0 }));
  const skipped = useRef(instant);

  const skip = useCallback(() => {
    skipped.current = true;
    setState(complete);
    // `complete` is derived from script.length, which is stable for a
    // module-level script.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [script.length]);

  useEffect(() => {
    if (instant) {
      skipped.current = true;
      setState({ lineIndex: script.length, charCount: 0 });
      return;
    }
    if (!enabled || skipped.current) return;

    let timer = 0;
    let line = 0;
    let char = 0;

    const step = () => {
      // skip() may have fired between timeouts.
      if (skipped.current) return;

      const current = script[line];
      if (!current) {
        setState({ lineIndex: script.length, charCount: 0 });
        return;
      }

      if (char < current.text.length) {
        char += 1;
        setState({ lineIndex: line, charCount: char });
        const speed = current.speed ?? DEFAULT_SPEED;
        timer = window.setTimeout(step, speed + Math.random() * JITTER);
        return;
      }

      // Line finished — advance and hold.
      line += 1;
      char = 0;
      setState({ lineIndex: line, charCount: 0 });
      timer = window.setTimeout(step, current.pauseAfter ?? DEFAULT_PAUSE);
    };

    timer = window.setTimeout(step, LEAD_IN);
    return () => window.clearTimeout(timer);
  }, [enabled, instant, script]);

  return {
    lineIndex: state.lineIndex,
    charCount: state.charCount,
    done: state.lineIndex >= script.length,
    skip,
  };
}
