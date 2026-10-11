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
 * - **The bullets are still my wording** for what each role ordinarily
 *   covers, not supplied achievements. No numbers, no claimed outcomes.
 *   They used to render under a review only `DRAFT COPY` marker; that marker
 *   is gone at your request, along with the flag that drove it, so this
 *   header is now the only place that says so. Replace a bullet with
 *   something you actually did and it stops being draft.
 * - **Order is yours now.** It was a guess until you reordered the entries
 *   and added the dates; what is on screen is the order in this file.
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
};

export const EXPERIENCE: ExperienceEntry[] = [
  {
    id: 'ieee-sight-nenasa',
    role: 'Webmaster',
    org: 'IEEE SIGHT Nenasa',
    orgNote: 'IEEE Sri Lanka Section',
    location: 'Sri Lanka',
    period: '2025-2026',
    tag: 'Web & Infra',
    bullets: [
      "Own the chapter's web presence: builds, content publishing and deployment.",
      'Keep the stack patched and the publish path repeatable rather than a manual ritual.',
      'Point of contact for anything touching the domain, hosting or analytics.',
    ],
  },
  {
    id: 'sku-iot-challenge-26',
    role: 'Dev Team Member',
    org: 'SKU IoT Challenge 26',
    orgNote: 'SLIIT',
    location: 'Kandy Uni',
    period: '2026',
    tag: 'Engineering',
    bullets: [
      'Build and maintain the technical side of the competition platform.',
      'Work with the organising team to turn the event format into something that runs.',
    ],
  },
  {
    id: 'ieee-ias-leadspring',
    role: 'Vice Chair',
    org: 'LeadSpring of IEEE IAS',
    orgNote: 'SLIIT',
    location: 'Malabe',
    period: '2026',
    tag: 'Leadership',
    bullets: [
      'Second chair on the committee: planning, delegation and keeping initiatives on schedule.',
      'Coordinate the team running sessions and member facing programmes.',
      'Act as the link between the membership and the parent IAS chapter.',
    ],
  },
  {
    id: 'sku-iot-club',
    role: 'Event Coordinator',
    org: 'SKU IoT Club',
    orgNote: 'SLIIT',
    location: 'Kandy Uni',
    period: '2025-2026',
    tag: 'Events',
    bullets: [
      'Plan and run the club calendar, from scheduling through to the day itself.',
      'Coordinate speakers, venues and the volunteers working each session.',
    ],
  },
  {
    id: 'dharmaraja-research-club',
    role: 'Media Coordinator',
    org: 'Research Club',
    orgNote: 'Dharamaraja College',
    location: 'Sri Lanka',
    period: '2024',
    tag: 'Media',
    bullets: [
      "Produce and publish the club's visual and written material.",
      'Keep the public facing channels current across the research programme.',
    ],
  },
];
