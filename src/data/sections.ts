/**
 * The site's section map — the single list of anchors.
 *
 * Nav links, the active-section indicator, the HUD readout and (from Stage 8)
 * the command palette all read this. Adding a section means editing one array.
 */

export type Section = {
  /** DOM id of the <section>, and the URL hash. */
  id: string;
  /** Nav label. */
  label: string;
  /** Mono index shown in the nav sheet and the HUD. */
  index: string;
  /** The in-fiction name, used for the HUD readout. */
  codename: string;
  /** False for the hero — it's reached by the monogram, not a nav link. */
  inNav: boolean;
};

export const SECTIONS: Section[] = [
  { id: 'hero', label: 'Home', index: '00', codename: 'ROOT', inNav: false },
  { id: 'experience', label: 'Experience', index: '01', codename: 'SERVICE RECORD', inNav: true },
  { id: 'projects', label: 'Projects', index: '02', codename: 'MISSION BRIEFINGS', inNav: true },
  {
    id: 'battlestation',
    label: 'Battle Station',
    index: '03',
    codename: 'COMMENDATIONS',
    inNav: true,
  },
  { id: 'arsenal', label: 'Arsenal', index: '04', codename: 'LOADOUT', inNav: true },
  {
    id: 'volunteering',
    label: 'Volunteering',
    index: '05',
    codename: 'FIELD OPS',
    inNav: true,
  },
  { id: 'contact', label: 'Contact', index: '06', codename: 'SECURE CHANNEL', inNav: true },
];

export const SECTION_IDS = SECTIONS.map((s) => s.id);
export const NAV_SECTIONS = SECTIONS.filter((s) => s.inNav);

export function getSection(id: string): Section | undefined {
  return SECTIONS.find((s) => s.id === id);
}
