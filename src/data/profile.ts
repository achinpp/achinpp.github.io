/**
 * Everything about the person. One file, so swapping in real details is a
 * single edit rather than a search across components.
 *
 * ⚠ CONFIRM BEFORE DEPLOY — items marked `inferred` were derived from the git
 * identity on this repo (AchinP <achinchandrasiri@gmail.com>, github.com/achinpp)
 * and from the brief, not stated outright. They are placeholders with a good
 * guess behind them, not facts.
 */

export const PROFILE = {
  /** inferred — from the git author name + email on this repository. */
  name: 'Achin Chandrasiri',
  /** inferred — used where the full name is too long. */
  firstName: 'Achin',
  /** Lowercase, for terminal output. */
  handle: 'achinpp',

  /** From the brief, verbatim. Order drives the rotator. */
  titles: ['Cybersecurity Student', 'DevSecOps Engineer', 'AI Researcher'],

  /** inferred — SLIIT and IEEE Sri Lanka in the brief. */
  location: 'Sri Lanka',
  locationShort: 'LK',

  /** Must match the timezone used by the HUD clock. */
  timezone: 'Asia/Colombo',

  /** Shown on the availability pill. */
  availability: 'Open to opportunities',

  /**
   * ⚠ public/resume.pdf is currently a PLACEHOLDER file. Replace it with the
   * real résumé before deploying — see the Stage 9 checklist in stage.md.
   */
  resumePath: '/resume.pdf',
  resumeFileName: 'achin-chandrasiri-resume.pdf',

  github: 'https://github.com/achinpp',
} as const;

/* -------------------------------------------------------------------------
   Terminal boot script
   Kept deliberately short: every character is typed, so a long script means
   the visitor watches a cursor instead of reading the page. ~2.5s total.
   ------------------------------------------------------------------------- */

export type TerminalLine = {
  text: string;
  /** cmd = typed at a prompt · out = program output · ok = success status */
  kind: 'cmd' | 'out' | 'ok';
  /** ms to hold before the next line starts. */
  pauseAfter?: number;
  /** ms per character. Output streams faster than a human types. */
  speed?: number;
};

export const TERMINAL_SCRIPT: TerminalLine[] = [
  { text: 'executing whoami...', kind: 'cmd', speed: 18, pauseAfter: 200 },
  {
    text: PROFILE.name.toLowerCase().replace(/\s+/g, '.'),
    kind: 'out',
    speed: 34,
    pauseAfter: 380,
  },
  { text: 'cat ./role', kind: 'cmd', speed: 26, pauseAfter: 180 },
  { text: 'cybersecurity · devsecops · ai research', kind: 'out', speed: 14, pauseAfter: 340 },
  { text: 'status --availability', kind: 'cmd', speed: 26, pauseAfter: 180 },
  { text: PROFILE.availability.toUpperCase(), kind: 'ok', speed: 18 },
];
