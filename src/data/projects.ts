/**
 * Mission briefings — the four projects.
 *
 * ⚠ CONFIRM BEFORE DEPLOY. Unlike `experience.ts`, almost everything here is
 * grounded: titles, the capability bullets and the named tools all come
 * straight from the brief. Three things do not:
 *
 * - `status` — the brief asked for `DEPLOYED / ACTIVE / ARCHIVED` badges but
 *   never said which applies to what. The values below are my reading of each
 *   project's shape, flagged with `statusConfirmed: false`, and a dev-only
 *   marker shows on any card where that is false.
 * - `repo` / `demo` — no links were supplied. `null` renders no button at all
 *   rather than a dead one.
 * - `taglines` — my one-line framing of each project, not supplied copy.
 */

/**
 * `DELIVERED` is a fourth value beyond the brief's three: a costed network
 * redesign is handed over, not deployed or archived, and calling it either
 * would be wrong.
 */
export type ProjectStatus = 'ACTIVE' | 'DEPLOYED' | 'DELIVERED' | 'RESEARCH' | 'ARCHIVED';

/** Bento weight. The grid maps these to spans; see `<Projects />`. */
export type ProjectSpan = 'feature' | 'wide' | 'standard';

export type Project = {
  id: string;
  /** Classification stamp, e.g. `BRIEFING_01`. */
  index: string;
  title: string;
  /** My framing, not supplied copy. */
  tagline: string;
  status: ProjectStatus;
  /** false → a dev-only marker warns that the badge above is a guess. */
  statusConfirmed: boolean;
  span: ProjectSpan;
  /** Named tools and techniques, all from the brief. */
  stack: string[];
  /** What the project actually does. From the brief. */
  capabilities: string[];
  /** One paragraph for the expanded briefing. */
  brief: string;
  repo: string | null;
  demo: string | null;
};

export const PROJECTS: Project[] = [
  {
    id: 'study-coach',
    index: 'BRIEFING_01',
    title: 'Study Coach AI Agent',
    tagline: 'An exam-prep agent that builds the schedule, then teaches from it.',
    status: 'ACTIVE',
    statusConfirmed: false,
    span: 'feature',
    stack: ['Google ADK', 'Gemini API', 'FastAPI', 'Python', 'Custom UI'],
    capabilities: [
      'Dynamic study schedule generation',
      'Topic prioritization',
      'Study session logging',
      'Interactive AI tutoring and quizzing',
    ],
    brief:
      'An exam-preparation assistant built on Google ADK and the Gemini API, with a FastAPI backend and a custom interface. It plans what to study and when, then runs the session itself — prioritising topics, logging what was covered, and tutoring and quizzing against the plan.',
    repo: null,
    demo: null,
  },
  {
    id: 'northbridge',
    index: 'BRIEFING_02',
    title: 'Northbridge Finance Security Upgrade',
    tagline: 'An enterprise network redesign, threat-modelled and costed into phases.',
    status: 'DELIVERED',
    statusConfirmed: false,
    span: 'wide',
    stack: [
      'Threat Modeling',
      'VLAN / Inter-VLAN',
      'Extended ACLs',
      'Port Security',
      'Network Segmentation',
    ],
    capabilities: [
      'Layer 2 and segmentation threat modeling',
      'VLAN and inter-VLAN extended ACLs',
      'Switchport port security',
      'Cost analysis driving a three-phase rollout',
    ],
    brief:
      'A security redesign of an enterprise finance network. Threat modeling at Layer 2 and at the segmentation boundary drove the control set — VLANs with inter-VLAN extended ACLs and switchport port security — and a cost analysis turned the result into a three-phase rollout rather than one unaffordable cutover.',
    repo: null,
    demo: null,
  },
  {
    id: 'adaptive-surveillance',
    index: 'BRIEFING_03',
    title: 'Intelligent Adaptive Surveillance System',
    tagline: 'Threat detection that holds up when the attacker wears the patch.',
    status: 'RESEARCH',
    statusConfirmed: false,
    span: 'standard',
    stack: ['VGG19', 'YOLO', 'Adversarial ML', 'Computer Vision', 'Python'],
    capabilities: [
      'AI threat detection integrating VGG19 and YOLO',
      'Mitigation of physical adversarial-patch attacks',
    ],
    brief:
      'An AI threat-detection system combining VGG19 and YOLO, built around the failure mode that breaks most detectors in the field: a physical adversarial patch worn or carried into frame. The two models are integrated specifically to mitigate that class of attack rather than to raise clean-input accuracy.',
    repo: null,
    demo: null,
  },
  {
    id: 'devsecops-pipeline',
    index: 'BRIEFING_04',
    title: 'DevSecOps CI/CD Pipeline',
    tagline: 'Security gates on every commit, proved against a deliberately broken app.',
    status: 'DEPLOYED',
    statusConfirmed: false,
    span: 'standard',
    stack: ['Semgrep', 'Trivy', 'Gitleaks', 'CI/CD', 'OWASP WebGoat'],
    capabilities: [
      'Semgrep static analysis (SAST)',
      'Trivy dependency and image scanning',
      'Gitleaks secret detection',
      'Automated security workflow for OWASP WebGoat deployment',
    ],
    brief:
      'An automated security workflow wrapped around the deployment of OWASP WebGoat. Semgrep covers static analysis, Trivy covers dependencies, and Gitleaks catches committed secrets — three gates on the same pipeline, validated against an application that is known-vulnerable by design, so a pass that should fail is visible immediately.',
    repo: null,
    demo: null,
  },
];
