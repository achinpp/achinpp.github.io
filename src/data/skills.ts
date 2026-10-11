/**
 * Arsenal, the skill cloud.
 *
 * Every entry below was supplied by you, verbatim.
 *
 * Each skill used to carry a provenance field feeding a review only legend at
 * the foot of the section. Both are gone. Once the list became wholly yours
 * that field held the same value sixty four times and the legend said so in a
 * box you had to look past on every reload, which is a warning that has
 * stopped warning about anything. If something inferred is ever added here,
 * the honest fix is not to rebuild that machinery but to not add it.
 *
 * ⚠ `OSCP` is in the list and it is the one entry worth arguing about. It is
 * a certification, not a technique, and sitting in a skill cloud it reads as
 * "I hold the OSCP". If you hold it, it belongs in its own credential line
 * where it can carry a date and a verification link. If you do not, it should
 * come out. It is left where you put it until you say which.
 *
 * ⚠ Ten pills that used to be here are gone, because they are not in your
 * list: Python, Node.js, FastAPI, Threat Modeling, Cloud Security, Semgrep,
 * Trivy, Gitleaks, YOLO, VGG19, Google ADK, Gemini API, Adversarial ML, SAST,
 * CI/CD Pipelines, VLANs and Extended ACLs, Port Security and Network
 * Segmentation. Several still appear on the project cards, which is not a
 * contradiction (a stack list says what a project used, a skill cloud says
 * what you want to be asked about) but it is worth a look.
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
  /** Expanded form, where the pill name is an abbreviation. */
  full?: string;
};

export const SKILLS: Skill[] = [
  // ---------------------------------------------------- Offensive Security
  { name: 'Ethical Hacking', category: 'Offensive Security' },
  { name: 'Penetration Testing', category: 'Offensive Security' },
  { name: 'Reverse Engineering', category: 'Offensive Security' },
  { name: 'Reconnaissance', category: 'Offensive Security' },
  { name: 'Cryptography', category: 'Offensive Security' },
  { name: 'Steganography', category: 'Offensive Security' },
  { name: 'Offensive Security Tooling', category: 'Offensive Security' },
  { name: 'Hacking', category: 'Offensive Security' },
  { name: 'OSCP', category: 'Offensive Security' },

  // -------------------------------------------------- Defensive Operations
  { name: 'Cybersecurity', category: 'Defensive Operations' },
  { name: 'Defensive Security', category: 'Defensive Operations' },
  { name: 'Defensive Security Tooling', category: 'Defensive Operations' },
  {
    name: 'SOAR',
    category: 'Defensive Operations',
    full: 'Security Orchestration, Automation and Response',
  },
  {
    name: 'EDR',
    category: 'Defensive Operations',
    full: 'Endpoint Detection and Response',
  },
  { name: 'Incident Detection & Response', category: 'Defensive Operations' },
  { name: 'Digital Forensics', category: 'Defensive Operations' },
  { name: 'Log Management & Analysis', category: 'Defensive Operations' },
  { name: 'IT Security Operations', category: 'Defensive Operations' },
  { name: 'Network Security', category: 'Defensive Operations' },
  { name: 'Security Principles', category: 'Defensive Operations' },

  // --------------------------------------------------- AppSec & DevSecOps
  { name: 'Application Security', category: 'AppSec & DevSecOps' },
  { name: 'DevSecOps', category: 'AppSec & DevSecOps' },
  { name: 'OWASP Top 10', category: 'AppSec & DevSecOps' },
  { name: 'GitHub Actions', category: 'AppSec & DevSecOps' },

  // ------------------------------------------------- AI & LLM Engineering
  { name: 'Generative AI', category: 'AI & LLM Engineering' },
  { name: 'Generative AI Security', category: 'AI & LLM Engineering' },
  { name: 'Agentic AI', category: 'AI & LLM Engineering' },
  { name: 'Multi-agent Systems', category: 'AI & LLM Engineering' },
  {
    name: 'LLMs',
    category: 'AI & LLM Engineering',
    full: 'Large Language Models',
  },
  { name: 'Prompt Engineering', category: 'AI & LLM Engineering' },
  { name: 'LangChain', category: 'AI & LLM Engineering' },
  {
    name: 'MCP',
    category: 'AI & LLM Engineering',
    full: 'Model Context Protocol',
  },
  { name: 'AI Application Development', category: 'AI & LLM Engineering' },
  { name: 'MITRE ATLAS', category: 'AI & LLM Engineering' },
  { name: 'Claude Code', category: 'AI & LLM Engineering' },

  // ------------------------------------------------------ Cloud & Systems
  { name: 'Amazon Bedrock', category: 'Cloud & Systems' },
  { name: 'AWS SageMaker', category: 'Cloud & Systems' },
  { name: 'Amazon Q', category: 'Cloud & Systems' },
  { name: 'Amazon VPC', category: 'Cloud & Systems' },
  { name: 'AWS KMS', category: 'Cloud & Systems' },
  { name: 'AWS Systems Manager', category: 'Cloud & Systems' },
  { name: 'Amazon CloudWatch', category: 'Cloud & Systems' },
  { name: 'Linux System Administration', category: 'Cloud & Systems' },
  { name: 'Windows System Administration', category: 'Cloud & Systems' },

  // ---------------------------------------------------- Engineering & Web
  { name: 'Java', category: 'Engineering & Web' },
  { name: 'Web Development', category: 'Engineering & Web' },
  { name: 'Web Maintenance', category: 'Engineering & Web' },
  { name: 'Web Production Management', category: 'Engineering & Web' },
  { name: 'CLI', category: 'Engineering & Web' },

  // ------------------------------------------------------ Making & Design
  { name: '3D Modeling', category: 'Making & Design' },
  { name: '3D Printing', category: 'Making & Design' },
  { name: 'CAD/CAM', category: 'Making & Design' },
  { name: 'Robotics', category: 'Making & Design' },
  {
    name: 'PCB Design',
    category: 'Making & Design',
    full: 'Printed Circuit Board Design',
  },
  {
    name: 'UX Design',
    category: 'Making & Design',
    full: 'User Experience Design',
  },
  { name: 'Graphic Design', category: 'Making & Design' },
  { name: 'Video Editing', category: 'Making & Design' },

  // -------------------------------------------------- Governance & People
  { name: 'Standards Development Policies', category: 'Governance & People' },
  { name: 'Regulatory Compliance', category: 'Governance & People' },
  { name: 'Professional Ethics', category: 'Governance & People' },
  { name: 'Project Management', category: 'Governance & People' },
  { name: 'Leadership', category: 'Governance & People' },
  { name: 'Teaching', category: 'Governance & People' },
  { name: 'Research Skills', category: 'Governance & People' },
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
