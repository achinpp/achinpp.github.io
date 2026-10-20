import type { ReactNode } from 'react';

export type TagTone = 'neutral' | 'accent' | 'breach' | 'signal';

const TONE: Record<TagTone, string> = {
  neutral: 'border-hairline text-ink-faint',
  accent: 'border-mint-900 bg-mint-950/50 text-mint-300',
  /**
   * Danger semantics, and the one exception: the `CLASSIFIED` status badge,
   * which is red to match the stamp it sits over. Never decorative.
   */
  breach: 'border-breach-900 bg-breach-900/30 text-breach-300',
  signal: 'border-signal-900 bg-signal-900/25 text-signal-400',
};

type Props = {
  children: ReactNode;
  tone?: TagTone;
  className?: string;
};

/**
 * Small mono pill. Org tags here, tech chips and status badges in Stage 4,
 * skill tags in Stage 6 — one component so they can't drift apart.
 *
 * Static by design: these appear in clusters, and a cluster of individually
 * animated pills reads as decoration rather than data.
 */
export function Tag({ children, tone = 'neutral', className }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[0.625rem] leading-none tracking-[0.16em] whitespace-nowrap uppercase ${TONE[tone]} ${className ?? ''}`}
    >
      {children}
    </span>
  );
}
