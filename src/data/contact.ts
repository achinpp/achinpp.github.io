import { PROFILE } from '@/data/profile';

/**
 * Secure Channel configuration.
 *
 * ⚠ **The form has no endpoint yet, and that is a deliberate dead stop.**
 *
 * **Formspree** is the choice, and the reason is that this is a static SPA:
 * there is no server to put an API key on. Resend (the other candidate from
 * the Stage 7 plan) needs a secret, which means a serverless function, which
 * means a backend to deploy and maintain for one form. Formspree takes a POST
 * from the browser, handles spam filtering server-side, and its endpoint is
 * not a secret — so it can live in deploy config without a function wrapper.
 *
 * To turn it on: create a form at formspree.io, then set
 * `VITE_FORM_ENDPOINT=https://formspree.io/f/<your-id>` (see `.env.example`).
 *
 * Until it is set:
 * - **in dev**, submitting runs the real validation and then *simulates* the
 *   round-trip so the TRANSMITTING → SENT states are reviewable. A banner says
 *   so in as many words.
 * - **in production**, the submit button is disabled with a visible notice and
 *   the email link beside it is the working path. The form never tells a real
 *   visitor a message was delivered when it wasn't.
 */
export const FORM_ENDPOINT: string | null = import.meta.env.VITE_FORM_ENDPOINT ?? null;

/** No endpoint + dev → simulate, so the states can be reviewed. */
export const SIMULATE_SEND = FORM_ENDPOINT === null && import.meta.env.DEV;

/**
 * Anti-spam, both halves client-side and both only a speed bump — the real
 * filtering is Formspree's. Together they stop the trivial case (a script
 * that fills every field and posts instantly) at zero cost to a human.
 */
export const GUARD = {
  /** Formspree's own convention: a filled `_gotcha` is dropped server-side. */
  honeypotName: '_gotcha',
  /** A human cannot read the form, type a message and submit in under this. */
  minFillMs: 3_000,
  /** Minimum gap between two submissions from the same tab. */
  minGapMs: 30_000,
  /** sessionStorage, not local: a new visit tomorrow should not be throttled. */
  storageKey: 'scc.lastSend',
} as const;

export type Social = {
  label: string;
  /** Lucide icon name is resolved in the component, so data stays serialisable. */
  icon: 'github' | 'linkedin' | 'mail' | 'shield' | 'target';
  /** null is not rendered. Nothing here is a guessed URL. */
  href: string | null;
  /** Shown instead of the URL on the copyable row. */
  display: string;
};

/**
 * All five channels are live. Every URL here was supplied; none is inferred.
 *
 * ⚠ The HackTheBox URL is a CTF platform profile and carries a numeric id
 * rather than a handle, so the row shows the id. If you have a main HTB
 * profile name, that reads better and is a one line change.
 */
export const SOCIALS: Social[] = [
  { label: 'GitHub', icon: 'github', href: PROFILE.github, display: `@${PROFILE.handle}` },
  {
    label: 'Email',
    icon: 'mail',
    href: `mailto:${PROFILE.email}`,
    display: PROFILE.email,
  },
  {
    label: 'LinkedIn',
    icon: 'linkedin',
    href: 'https://www.linkedin.com/in/achin-pasindu/',
    display: 'in/achin-pasindu',
  },
  {
    label: 'TryHackMe',
    icon: 'shield',
    href: 'https://tryhackme.com/p/Archlin',
    display: 'Archlin',
  },
  {
    label: 'HackTheBox',
    icon: 'target',
    href: 'https://ctf.hackthebox.com/user/profile/1083170',
    display: 'ctf profile 1083170',
  },
];

/**
 * ⚠ No PGP key, and none has been invented.
 *
 * The Stage 7 plan called for a PGP fingerprint line in the footer. A
 * fabricated fingerprint is not decoration — it is a string someone could try
 * to verify a signature against, so a wrong one is worse than none. Set a real
 * fingerprint here and the footer line appears; leave it `null` and the line
 * is omitted entirely.
 */
export const PGP_FINGERPRINT: string | null = null;

/** Injected by vite.config.ts at build time. */
export const BUILD = {
  sha: __COMMIT_SHA__,
  date: __COMMIT_DATE__,
} as const;
