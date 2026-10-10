/**
 * Arsenal, the skill cloud.
 *
 * Every entry below was supplied by you, verbatim, so `source` is `'stated'`
 * across the board. The `'derived'` value stays in the type because the
 * mechanism is worth keeping: anything added later that was inferred rather
 * than stated gets flagged in the dev only legend at the foot of the section.
 *
 * ⚠ TWO THINGS TO LOOK AT.
 *
 * 1. **`OSCP` is in the list.** It is a certification, not a technique, and
 *    sitting in a skill cloud it reads as "I hold the OSCP". If you hold it,
 *    it belongs in its own credential line where it can carry a date and a
 *    verification link. If you do not, it should come out. It is left where
 *    you put it until you say which.
 * 2. **Ten pills that used to be here are gone,** because they are not in
 *    your list: Python, Node.js, FastAPI, Threat Modeling, Cloud Security,
 *    Semgrep, Trivy, Gitleaks, YOLO, VGG19, Google ADK, Gemini API,
 *    Adversarial ML, SAST, CI/CD Pipelines, VLANs and Extended ACLs, Port
 *    Security and Network Segmentation. Several still appear on the project
 *    cards, which is not a contradiction (a stack list says what a project
 *    used, a skill cloud says what you want to be asked about) but it is
 *    worth a look.
 *
 * `full` carries the expanded form wherever a name was shortened to fit a
 * pill. Nothing is renamed, only abbreviated.
 *
 * There are no proficiency levels in this file and there should never be.
 * Nobody is 87% at Python.
 */

export const CATEGORIES = [
  'Offensive Security',
  'Defensive Operations',
  'AppSec & DevSecOps',
  'AI & LLM Engineering',
  'Cloud & Systems',
  'Engineering & Web',
  'Making & Design',
  'Governance & People',
] as const;

export type Category = (typeof CATEGORIES)[number];

export type Skill = {
  name: string;
  category: Category;
  /** 'stated' = you listed it · 'derived' = inferred from something else. */
  source: 'stated' | 'derived';
  /** Expanded form, where the pill name is an abbreviation. */
  full?: string;
};

export const SKILLS: Skill[] = [
  // ---------------------------------------------------- Offensive Security
  { name: 'Ethical Hacking', category: 'Offensive Security', source: 'stated' },
  { name: 'Penetration Testing', category: 'Offensive Security', source: 'stated' },
  { name: 'Reverse Engineering', category: 'Offensive Security', source: 'stated' },
  { name: 'Reconnaissance', category: 'Offensive Security', source: 'stated' },
  { name: 'Cryptography', category: 'Offensive Security', source: 'stated' },
  { name: 'Steganography', category: 'Offensive Security', source: 'stated' },
  { name: 'Offensive Security Tooling', category: 'Offensive Security', source: 'stated' },
  { name: 'Hacking', category: 'Offensive Security', source: 'stated' },
  { name: 'OSCP', category: 'Offensive Security', source: 'stated' },

  // -------------------------------------------------- Defensive Operations
  { name: 'Cybersecurity', category: 'Defensive Operations', source: 'stated' },
  { name: 'Defensive Security', category: 'Defensive Operations', source: 'stated' },
  { name: 'Defensive Security Tooling', category: 'Defensive Operations', source: 'stated' },
  {
    name: 'SOAR',
    category: 'Defensive Operations',
    source: 'stated',
    full: 'Security Orchestration, Automation and Response',
  },
  {
    name: 'EDR',
    category: 'Defensive Operations',
    source: 'stated',
    full: 'Endpoint Detection and Response',
  },
  { name: 'Incident Detection & Response', category: 'Defensive Operations', source: 'stated' },
  { name: 'Digital Forensics', category: 'Defensive Operations', source: 'stated' },
  { name: 'Log Management & Analysis', category: 'Defensive Operations', source: 'stated' },
  { name: 'IT Security Operations', category: 'Defensive Operations', source: 'stated' },
  { name: 'Network Security', category: 'Defensive Operations', source: 'stated' },
  { name: 'Security Principles', category: 'Defensive Operations', source: 'stated' },

  // --------------------------------------------------- AppSec & DevSecOps
  { name: 'Application Security', category: 'AppSec & DevSecOps', source: 'stated' },
  { name: 'DevSecOps', category: 'AppSec & DevSecOps', source: 'stated' },
  { name: 'OWASP Top 10', category: 'AppSec & DevSecOps', source: 'stated' },
  { name: 'GitHub Actions', category: 'AppSec & DevSecOps', source: 'stated' },

  // ------------------------------------------------- AI & LLM Engineering
  { name: 'Generative AI', category: 'AI & LLM Engineering', source: 'stated' },
  { name: 'Generative AI Security', category: 'AI & LLM Engineering', source: 'stated' },
  { name: 'Agentic AI', category: 'AI & LLM Engineering', source: 'stated' },
  { name: 'Multi-agent Systems', category: 'AI & LLM Engineering', source: 'stated' },
  {
    name: 'LLMs',
    category: 'AI & LLM Engineering',
    source: 'stated',
    full: 'Large Language Models',
  },
  { name: 'Prompt Engineering', category: 'AI & LLM Engineering', source: 'stated' },
  { name: 'LangChain', category: 'AI & LLM Engineering', source: 'stated' },
  {
    name: 'MCP',
    category: 'AI & LLM Engineering',
    source: 'stated',
    full: 'Model Context Protocol',
  },
  { name: 'AI Application Development', category: 'AI & LLM Engineering', source: 'stated' },
  { name: 'MITRE ATLAS', category: 'AI & LLM Engineering', source: 'stated' },
  { name: 'Claude Code', category: 'AI & LLM Engineering', source: 'stated' },

  // ------------------------------------------------------ Cloud & Systems
  { name: 'Amazon Bedrock', category: 'Cloud & Systems', source: 'stated' },
  { name: 'AWS SageMaker', category: 'Cloud & Systems', source: 'stated' },
  { name: 'Amazon Q', category: 'Cloud & Systems', source: 'stated' },
  { name: 'Amazon VPC', category: 'Cloud & Systems', source: 'stated' },
  { name: 'AWS KMS', category: 'Cloud & Systems', source: 'stated' },
  { name: 'AWS Systems Manager', category: 'Cloud & Systems', source: 'stated' },
  { name: 'Amazon CloudWatch', category: 'Cloud & Systems', source: 'stated' },
  { name: 'Linux System Administration', category: 'Cloud & Systems', source: 'stated' },
  { name: 'Windows System Administration', category: 'Cloud & Systems', source: 'stated' },

  // ---------------------------------------------------- Engineering & Web
  { name: 'Java', category: 'Engineering & Web', source: 'stated' },
  { name: 'Web Development', category: 'Engineering & Web', source: 'stated' },
  { name: 'Web Maintenance', category: 'Engineering & Web', source: 'stated' },
  { name: 'Web Production Management', category: 'Engineering & Web', source: 'stated' },
  { name: 'CLI', category: 'Engineering & Web', source: 'stated' },

  // ------------------------------------------------------ Making & Design
  { name: '3D Modeling', category: 'Making & Design', source: 'stated' },
  { name: '3D Printing', category: 'Making & Design', source: 'stated' },
  { name: 'CAD/CAM', category: 'Making & Design', source: 'stated' },
  { name: 'Robotics', category: 'Making & Design', source: 'stated' },
  {
    name: 'PCB Design',
    category: 'Making & Design',
    source: 'stated',
    full: 'Printed Circuit Board Design',
  },
  {
    name: 'UX Design',
    category: 'Making & Design',
    source: 'stated',
    full: 'User Experience Design',
  },
  { name: 'Graphic Design', category: 'Making & Design', source: 'stated' },
  { name: 'Video Editing', category: 'Making & Design', source: 'stated' },

  // -------------------------------------------------- Governance & People
  { name: 'Standards Development Policies', category: 'Governance & People', source: 'stated' },
  { name: 'Regulatory Compliance', category: 'Governance & People', source: 'stated' },
  { name: 'Professional Ethics', category: 'Governance & People', source: 'stated' },
  { name: 'Project Management', category: 'Governance & People', source: 'stated' },
  { name: 'Leadership', category: 'Governance & People', source: 'stated' },
  { name: 'Teaching', category: 'Governance & People', source: 'stated' },
  { name: 'Research Skills', category: 'Governance & People', source: 'stated' },
];

/**
 * Short chip labels.
 *
 * The full category names are what the data and the screen reader
 * announcement use. On the chips they do not fit: nine chips at full length
 * come to roughly 1700px against a 1152px container, so the control wrapped
 * to three rows and stopped reading as one control. The button still carries
 * the full name as its accessible name, so nothing is lost to a screen
 * reader, only to the pixel count.
 */
export const CATEGORY_LABEL: Record<Category, string> = {
  'Offensive Security': 'Offensive',
  'Defensive Operations': 'Defensive',
  'AppSec & DevSecOps': 'AppSec',
  'AI & LLM Engineering': 'AI & LLM',
  'Cloud & Systems': 'Cloud',
  'Engineering & Web': 'Web & Code',
  'Making & Design': 'Making',
  'Governance & People': 'Governance',
};

export function countIn(category: Category) {
  return SKILLS.filter((s) => s.category === category).length;
}

/**
 * Category marker colours.
 *
 * Eight steps of the mint ramp plus two neutrals, rather than eight different
 * hues. `--color-breach-*` and `--color-signal-*` are reserved for danger and
 * status semantics (Stage 0), and spending them on "this one is an ML tool"
 * would quietly break that contract everywhere else on the site.
 */
export const CATEGORY_DOT: Record<Category, string> = {
  'Offensive Security': 'var(--color-mint-200)',
  'Defensive Operations': 'var(--color-mint-300)',
  'AppSec & DevSecOps': 'var(--color-mint-400)',
  'AI & LLM Engineering': 'var(--color-mint-500)',
  'Cloud & Systems': 'var(--color-mint-600)',
  'Engineering & Web': 'var(--color-mint-700)',
  'Making & Design': 'var(--color-obsidian-400)',
  'Governance & People': 'var(--color-obsidian-500)',
};
