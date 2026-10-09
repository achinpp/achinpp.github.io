import { ArrowUp } from 'lucide-react';
import { BUILD, PGP_FINGERPRINT } from '@/data/contact';
import { PROFILE } from '@/data/profile';
import { useScrollTo } from '@/hooks/useScrollTo';

/**
 * `LAST_BUILD` is real: the commit hash and date are injected by `define` in
 * vite.config.ts at build time. Guarded anyway — if git wasn't available the
 * fallback is the build timestamp, and a malformed value should degrade to a
 * dash rather than print `Invalid Date` in the footer of a security
 * portfolio.
 */
function buildStamp() {
  const date = new Date(BUILD.date);
  const day = Number.isNaN(date.getTime()) ? '—' : date.toISOString().slice(0, 10);
  return `${day} · ${BUILD.sha}`;
}

export function Footer() {
  const scrollTo = useScrollTo();

  return (
    <footer className="relative z-[var(--z-content)] border-t border-hairline px-5 pt-12 pb-16 sm:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="font-mono text-label text-ink-muted uppercase">
            {PROFILE.name} · {PROFILE.locationShort}
          </p>
          <p className="font-mono text-[0.5625rem] tracking-[0.18em] text-obsidian-500 uppercase">
            last_build: {buildStamp()}
          </p>

          {/* Omitted unless a real fingerprint is set. A fabricated one is a
              string somebody could try to verify a signature against, so a
              wrong one is worse than none at all. */}
          {PGP_FINGERPRINT && (
            <p className="font-mono text-[0.5625rem] tracking-[0.18em] text-obsidian-500 uppercase">
              pgp: {PGP_FINGERPRINT}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => scrollTo('hero')}
          className="group inline-flex items-center gap-2.5 self-start rounded-full border border-hairline px-5 py-2.5 font-mono text-[0.625rem] tracking-[0.16em] text-ink-faint uppercase transition-colors duration-200 hover:border-mint-800 hover:text-mint-200 sm:self-auto"
        >
          <ArrowUp
            aria-hidden
            size={12}
            className="transition-transform duration-300 ease-out-expo group-hover:-translate-y-0.5"
          />
          Back to top
        </button>
      </div>
    </footer>
  );
}
