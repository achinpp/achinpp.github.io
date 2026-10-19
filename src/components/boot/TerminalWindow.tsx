import { TERMINAL_SCRIPT, type TerminalLine } from '@/data/profile';
import type { TypewriterState } from '@/hooks/useTypewriter';

const KIND_COLOR: Record<TerminalLine['kind'], string> = {
  cmd: 'var(--color-mint-300)',
  out: 'var(--color-obsidian-200)',
  ok: 'var(--color-mint-400)',
};

function Prompt() {
  return (
    <span className="text-mint-700 select-none" aria-hidden>
      ${' '}
    </span>
  );
}

/**
 * The stylised terminal. Presentation only: the typing state is owned by the
 * boot overlay, which also needs it to know when to hand the page over.
 *
 * The whole transcript is mirrored into an `sr-only` block and the animated
 * copy is `aria-hidden`: a live region that appends a character at a time
 * would make a screen reader announce the same line thirty times.
 */
export function TerminalWindow({ typing }: { typing: TypewriterState }) {
  const { lineIndex, charCount, done } = typing;

  return (
    <div className="relative overflow-hidden pane">
      {/* Chrome */}
      <div className="flex items-center gap-2 border-b border-hairline bg-obsidian-900/60 px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-breach-500/70" />
          <span className="size-2.5 rounded-full bg-signal-400/70" />
          <span className="size-2.5 rounded-full bg-mint-400/70" />
        </span>
        <span className="ml-2 truncate font-mono text-[0.625rem] tracking-[0.12em] text-ink-faint uppercase">
          root@shadow:~
        </span>
        {/* There was a `skip` button here. It is gone at your request: a
            loading screen that advertises its own exit is a loading screen
            admitting it is in the way. The sequence is still dismissible by
            Escape and by a click anywhere on the glass, and reduced motion
            never shows it at all. See `<BootScreen>`. */}
      </div>

      {/* Transcript */}
      <div
        aria-hidden
        className="space-y-1.5 px-4 py-4 font-mono text-[0.8125rem] leading-relaxed sm:px-5 sm:text-sm"
      >
        {TERMINAL_SCRIPT.map((line, i) => {
          if (i > lineIndex) return null;

          const isCurrent = i === lineIndex;
          const text = isCurrent ? line.text.slice(0, charCount) : line.text;

          return (
            <div key={i} className="flex min-w-0 items-start gap-1.5">
              {line.kind === 'cmd' && <Prompt />}
              {line.kind === 'ok' && <span className="shrink-0 text-mint-400 select-none">●</span>}
              <span className="min-w-0 break-words" style={{ color: KIND_COLOR[line.kind] }}>
                {text}
                {isCurrent && (
                  <span className="ml-0.5 inline-block h-[0.95em] w-[0.5em] translate-y-[0.1em] bg-mint-400 align-middle motion-ok:animate-caret" />
                )}
              </span>
            </div>
          );
        })}

        {/* Resting caret once the script has finished. */}
        {done && (
          <div className="flex items-start gap-1.5">
            <Prompt />
            <span className="inline-block h-[0.95em] w-[0.5em] translate-y-[0.1em] bg-mint-400 motion-ok:animate-caret" />
          </div>
        )}
      </div>

      {/* The accessible version: the finished transcript, read once. */}
      <div className="sr-only">
        {TERMINAL_SCRIPT.map((line, i) => (
          <p key={i}>{line.text}</p>
        ))}
      </div>
    </div>
  );
}
