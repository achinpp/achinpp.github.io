/**
 * Mission briefings.
 *
 * ⚠ CONFIRM BEFORE DEPLOY. Most of this is grounded: titles, the capability
 * bullets and the named tools all come straight from the brief, and `kind`
 * was set by you. Two things are still mine:
 *
 * - `status`. The brief asked for `DEPLOYED / ACTIVE / ARCHIVED` badges but
 *   never said which applies to what. The values below are my reading of each
 *   project's shape, flagged with `statusConfirmed: false`, and a dev only
 *   marker shows on any card where that is false.
 * - `tagline` and `brief`. My framing of each project, not supplied copy.
 *
 * `repo` and `demo` are `null` because no links were supplied. That renders
 * no button at all rather than a dead one.
 */

/**
 * What the briefing *is*, which is a separate question from what state it is
 * in. You classified these: three projects and one research effort. Keeping
 * it apart from `status` is the point. `RESEARCH` used to be a status value,
 * which made it impossible to say that a piece of research was also active.
 */
export type ProjectKind = 'PROJECT' | 'RESEARCH';

/**
 * `DELIVERED` is a fourth value beyond the brief's three: a costed network
 * redesign is handed over, not deployed or archived, and calling it either
 * would be wrong.
 */
export type ProjectStatus = 'ACTIVE' | 'DEPLOYED' | 'DELIVERED' | 'ARCHIVED';

/** Bento weight. The grid maps these to spans; see `<Projects />`. */
export type ProjectSpan = 'feature' | 'wide' | 'standard';

export type Project = {
  id: string;
  /** Classification stamp, e.g. `BRIEFING_01`. */
  index: string;
  title: string;
  /** Project or research. Set by you. */
  kind: ProjectKind;
  /** My framing, not supplied copy. */
  tagline: string;
  status: ProjectStatus;
  /** false renders a dev only marker warning that the badge above is a guess. */
  statusConfirmed: boolean;
  span: ProjectSpan;
  /** Named tools and techniques, all from the brief. */
  stack: string[];
  /** What the briefing actually does. From the brief. */
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
    kind: 'PROJECT',
    tagline: 'An exam prep agent that builds the schedule, then teaches from it.',
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
      'An exam preparation assistant built on Google ADK and the Gemini API, with a FastAPI backend and a custom interface. It plans what to study and when, then runs the session itself: prioritising topics, logging what was covered, and tutoring and quizzing against the plan.',
    repo: null,
    demo: null,
  },
  {
    id: 'northbridge',
    index: 'BRIEFING_02',
    title: 'Northbridge Finance Security Upgrade',
    kind: 'PROJECT',
    tagline: 'An enterprise network redesign, threat modelled and costed into phases.',
    status: 'DELIVERED',
    statusConfirmed: false,
    span: 'wide',
    stack: ['Threat Modeling', 'VLANs', 'Extended ACLs', 'Port Security', 'Network Segmentation'],
    capabilities: [
      'Layer 2 and segmentation threat modeling',
      'Extended ACLs between VLANs',
      'Switchport port security',
      'Cost analysis driving a three phase rollout',
    ],
    brief:
      'A security redesign of an enterprise finance network. Threat modeling at Layer 2 and at the segmentation boundary drove the control set, which is VLANs with extended ACLs between them plus switchport port security. A cost analysis then turned the result into a three phase rollout rather than one unaffordable cutover.',
    repo: null,
    demo: null,
  },
  {
    id: 'adaptive-surveillance',
    index: 'BRIEFING_03',
    title: 'Intelligent Adaptive Surveillance System',
    kind: 'RESEARCH',
    tagline: 'Threat detection that holds up when the attacker wears the patch.',
    status: 'ACTIVE',
    statusConfirmed: false,
    span: 'standard',
    stack: ['VGG19', 'YOLO', 'Adversarial ML', 'Computer Vision', 'Python'],
    capabilities: [
      'AI threat detection integrating VGG19 and YOLO',
      'Mitigation of physical adversarial patch attacks',
    ],
    brief:
      'An AI threat detection system combining VGG19 and YOLO, built around the failure mode that breaks most detectors in the field: a physical adversarial patch worn or carried into frame. The two models are integrated specifically to mitigate that class of attack rather than to raise clean input accuracy.',
    repo: null,
    demo: null,
  },
  {
    id: 'devsecops-pipeline',
    index: 'BRIEFING_04',
    title: 'DevSecOps CI/CD Pipeline',
    kind: 'PROJECT',
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
      'An automated security workflow wrapped around the deployment of OWASP WebGoat. Semgrep covers static analysis, Trivy covers dependencies, and Gitleaks catches committed secrets: three gates on the same pipeline, validated against an application that is vulnerable by design, so a pass that should fail is visible immediately.',
    repo: null,
    demo: null,
  },
];
