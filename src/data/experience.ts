/**
 * Experience & leadership entries, newest first.
 *
 * ⚠ CONFIRM BEFORE DEPLOY.
 *
 * Only two things here came from the brief: the **role titles** and the
 * **organisations**. Everything else is marked:
 *
 * - `period: null` — no dates were given for either role. It renders as a
 *   visible `dates tbc` tag rather than a plausible-looking guess, because a
 *   wrong date on a CV-shaped page is worse than a blank one.
 * - `draftBullets: true` — the bullets are my wording for what each role
 *   ordinarily covers, not supplied achievements. No numbers, no claimed
 *   outcomes. In dev they render under a `DRAFT COPY` marker so they can't be
 *   mistaken for confirmed content; the marker is compiled out of production.
 * - **Order is a guess too.** Vice Chair is listed first as the more senior
 *   role, not because it is known to be more recent.
 */

export type ExperienceEntry = {
  id: string;
  /** Verbatim from the brief. */
  role: string;
  /** Verbatim from the brief. */
  org: string;
  /** Parent body or campus, where the brief named one. */
  orgNote?: string;
  location: string;
  /** null → renders a `dates tbc` tag. See the file header. */
  period: string | null;
  /** Short mono tag on the card. */
  tag: string;
  bullets: string[];
  /** true = the bullets are draft wording, not supplied content. */
  draftBullets: boolean;
};

export const EXPERIENCE: ExperienceEntry[] = [
  {
    id: 'ieee-ias-leadspring',
    role: 'Vice Chair',
    org: 'LeadSpring of IEEE IAS',
    orgNote: 'SLIIT',
    location: 'Sri Lanka',
    period: null,
    tag: 'Leadership',
    draftBullets: true,
    bullets: [
      'Second chair on the committee — planning, delegation and keeping initiatives on schedule.',
      'Coordinate the team running sessions and member-facing programmes.',
      'Act as the link between the membership and the parent IAS chapter.',
    ],
  },
  {
    id: 'ieee-sight-nenasa',
    role: 'Webmaster',
    org: 'IEEE SIGHT Nenasa',
    location: 'Sri Lanka',
    period: null,
    tag: 'Web & Infra',
    draftBullets: true,
    bullets: [
      "Own the chapter's web presence — builds, content publishing and deployment.",
      'Keep the stack patched and the publish path repeatable rather than a manual ritual.',
      'Point of contact for anything touching the domain, hosting or analytics.',
    ],
  },
];
