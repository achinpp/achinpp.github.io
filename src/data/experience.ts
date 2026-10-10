/**
 * Experience and leadership entries, newest first.
 *
 * ⚠ CONFIRM BEFORE DEPLOY.
 *
 * What came from you: the **role titles** and the **organisations**, for all
 * five. Everything else is marked:
 *
 * - `period: null` means no dates were given. It renders as a visible
 *   `dates tbc` tag rather than a plausible looking guess, because a wrong
 *   date on a CV shaped page is worse than a blank one.
 * - `draftBullets: true` means the bullets are my wording for what the role
 *   ordinarily covers, not supplied achievements. No numbers, no claimed
 *   outcomes. In dev they render under a `DRAFT COPY` marker so they cannot
 *   be mistaken for confirmed content, and the marker is compiled out of
 *   production.
 * - **Order is a guess too.** University roles are listed above the school
 *   one, and Vice Chair above Webmaster as the more senior of the two IEEE
 *   positions. Neither is known to be more recent.
 *
 * ⚠ `SKU` is left exactly as you wrote it, unexpanded. If it stands for
 * something, say so and both entries can carry it as an `orgNote` the way the
 * IEEE roles do.
 */

export type ExperienceEntry = {
  id: string;
  /** Verbatim from you. */
  role: string;
  /** Verbatim from you. */
  org: string;
  /** Parent body or campus, where one was named. */
  orgNote?: string;
  location: string;
  /** null renders a `dates tbc` tag. See the file header. */
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
      'Second chair on the committee: planning, delegation and keeping initiatives on schedule.',
      'Coordinate the team running sessions and member facing programmes.',
      'Act as the link between the membership and the parent IAS chapter.',
    ],
  },
  {
    id: 'ieee-sight-nenasa',
    role: 'Webmaster',
    org: 'IEEE SIGHT Nenasa',
    orgNote: 'IEEE Sri Lanka Section',
    location: 'Sri Lanka',
    period: null,
    tag: 'Web & Infra',
    draftBullets: true,
    bullets: [
      "Own the chapter's web presence: builds, content publishing and deployment.",
      'Keep the stack patched and the publish path repeatable rather than a manual ritual.',
      'Point of contact for anything touching the domain, hosting or analytics.',
    ],
  },
  {
    id: 'sku-iot-club',
    role: 'Event Coordinator',
    org: 'SKU IoT Club',
    location: 'Sri Lanka',
    period: null,
    tag: 'Events',
    draftBullets: true,
    bullets: [
      'Plan and run the club calendar, from scheduling through to the day itself.',
      'Coordinate speakers, venues and the volunteers working each session.',
    ],
  },
  {
    id: 'sku-iot-challenge-26',
    role: 'Dev Team Member',
    org: 'SKU IoT Challenge 26',
    location: 'Sri Lanka',
    period: null,
    tag: 'Engineering',
    draftBullets: true,
    bullets: [
      'Build and maintain the technical side of the competition platform.',
      'Work with the organising team to turn the event format into something that runs.',
    ],
  },
  {
    id: 'dharmaraja-research-club',
    role: 'Media Coordinator',
    org: 'Research Club',
    orgNote: 'Dharamaraja College',
    location: 'Sri Lanka',
    period: null,
    tag: 'Media',
    draftBullets: true,
    bullets: [
      "Produce and publish the club's visual and written material.",
      'Keep the public facing channels current across the research programme.',
    ],
  },
];
