/**
 * Arsenal — the skill cloud.
 *
 * ⚠ TWO PROVENANCES, and the difference matters.
 *
 * `'stated'` — the seven skills the brief listed outright: Penetration
 * Testing, Node.js, Java, Python, FastAPI, Cloud Security, Threat Modeling.
 *
 * `'derived'` — tools and techniques the brief names inside its *project*
 * descriptions. Semgrep, Trivy and Gitleaks are in the DevSecOps pipeline;
 * VLANs, extended ACLs and segmentation are in the Northbridge redesign;
 * VGG19, YOLO and the adversarial-patch work are in the surveillance system;
 * Google ADK and the Gemini API are in Study Coach. Listing something you
 * built a project with is a derivation, not an invention — but it is still my
 * call rather than a stated one, so each is marked and a dev-only legend
 * counts them. **Prune anything you would not want to be asked about in an
 * interview.**
 *
 * There are no proficiency levels in this file, and there should never be:
 * see the note in `stage.md`. Nobody is 87% at Python.
 */

export const CATEGORIES = [
  'Offensive Security',
  'AppSec & DevSecOps',
  'Development',
  'Cloud & Network',
  'AI / ML',
] as const;

export type Category = (typeof CATEGORIES)[number];

export type Skill = {
  name: string;
  category: Category;
  /** 'stated' = listed in the brief · 'derived' = named in a brief project. */
  source: 'stated' | 'derived';
};

export const SKILLS: Skill[] = [
  // ---------------------------------------------------- Offensive Security
  { name: 'Penetration Testing', category: 'Offensive Security', source: 'stated' },
  { name: 'Threat Modeling', category: 'Offensive Security', source: 'stated' },

  // --------------------------------------------------- AppSec & DevSecOps
  { name: 'Semgrep', category: 'AppSec & DevSecOps', source: 'derived' },
  { name: 'Trivy', category: 'AppSec & DevSecOps', source: 'derived' },
  { name: 'Gitleaks', category: 'AppSec & DevSecOps', source: 'derived' },
  { name: 'CI/CD Pipelines', category: 'AppSec & DevSecOps', source: 'derived' },
  { name: 'SAST', category: 'AppSec & DevSecOps', source: 'derived' },

  // ------------------------------------------------------------ Development
  { name: 'Python', category: 'Development', source: 'stated' },
  { name: 'Java', category: 'Development', source: 'stated' },
  { name: 'Node.js', category: 'Development', source: 'stated' },
  { name: 'FastAPI', category: 'Development', source: 'stated' },

  // -------------------------------------------------------- Cloud & Network
  { name: 'Cloud Security', category: 'Cloud & Network', source: 'stated' },
  { name: 'Network Segmentation', category: 'Cloud & Network', source: 'derived' },
  { name: 'VLANs & Extended ACLs', category: 'Cloud & Network', source: 'derived' },
  { name: 'Port Security', category: 'Cloud & Network', source: 'derived' },

  // ---------------------------------------------------------------- AI / ML
  { name: 'Google ADK', category: 'AI / ML', source: 'derived' },
  { name: 'Gemini API', category: 'AI / ML', source: 'derived' },
  { name: 'YOLO', category: 'AI / ML', source: 'derived' },
  { name: 'VGG19', category: 'AI / ML', source: 'derived' },
  { name: 'Adversarial ML', category: 'AI / ML', source: 'derived' },
];

export function countIn(category: Category) {
  return SKILLS.filter((s) => s.category === category).length;
}

/**
 * Category marker colours.
 *
 * Five steps of the mint ramp plus one neutral, rather than five different
 * hues. `--color-breach-*` and `--color-signal-*` are reserved for danger and
 * status semantics (Stage 0), and spending them on "this one is an ML tool"
 * would quietly break that contract everywhere else on the site.
 */
export const CATEGORY_DOT: Record<Category, string> = {
  'Offensive Security': 'var(--color-mint-200)',
  'AppSec & DevSecOps': 'var(--color-mint-400)',
  Development: 'var(--color-obsidian-400)',
  'Cloud & Network': 'var(--color-mint-600)',
  'AI / ML': 'var(--color-mint-800)',
};
