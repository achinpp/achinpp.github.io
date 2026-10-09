import { useEffect, useState } from 'react';
import { PROFILE } from '@/data/profile';
import { ScrambleText } from '@/components/ui/ScrambleText';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const HOLD_MS = 3200;

/** The longest title reserves the width, so swapping never reflows the line. */
const WIDEST = [...PROFILE.titles].sort((a, b) => b.length - a.length)[0];

/**
 * Cycles the three titles, each arriving through a decrypt.
 *
 * Under reduced motion it renders all three joined by separators instead —
 * the information is the point, and a static list carries it without anything
 * moving or auto-advancing.
 */
export function RoleRotator({ start }: { start: boolean }) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduced || !start) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % PROFILE.titles.length), HOLD_MS);
    return () => window.clearInterval(id);
  }, [reduced, start]);

  if (reduced) {
    return (
      <p className="font-mono text-label-lg text-ink-muted uppercase">
        {PROFILE.titles.join('  ·  ')}
      </p>
    );
  }

  return (
    <p className="font-mono text-label-lg text-ink-muted uppercase">
      <span className="relative inline-block align-top">
        {/* Width sizer — never shown, never read. */}
        <span className="invisible" aria-hidden>
          {WIDEST}
        </span>
        <span className="absolute inset-0">
          {/* key remounts the scramble so each title decrypts in. */}
          <ScrambleText
            key={index}
            text={PROFILE.titles[index]}
            trigger="mount"
            tickMs={28}
            lockPerTick={0.9}
            className="text-mint-300"
          />
        </span>
      </span>
    </p>
  );
}
