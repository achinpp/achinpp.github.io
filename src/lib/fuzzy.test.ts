import { test } from 'node:test';
import assert from 'node:assert/strict';
import { score, scoreCommand } from './fuzzy';

/**
 * Tests for the command-palette scorer.
 *
 * **Why `node:test` and not Vitest.** Vitest is the right tool and the
 * `npm run test` script would be one line shorter with it — but `npm install`
 * cannot reach the registry from this machine (TLS interception:
 * `UNABLE_TO_VERIFY_LEAF_SIGNATURE`), and the fix for that is to turn off
 * certificate verification, which is not a thing to do to a security
 * portfolio to save a dependency. Node's built-in runner needs no install,
 * and esbuild — already present as a Vite dependency — handles the
 * TypeScript. If Vitest installs cleanly for you, these assertions port over
 * almost unchanged.
 *
 * The labels below are the real ones from `src/data/commands.ts`. That is the
 * point: the accent bug these tests caught (`resume` matching nothing,
 * because the label is `Download résumé`) only exists against real data.
 */

const LABELS = [
  'Experience',
  'Projects',
  'Battle Station',
  'Arsenal',
  'Contact',
  'Download résumé',
  'Copy email address',
  'Compose email',
  'Open GitHub profile',
  'Disable animation',
  'Disable film grain',
  'Open design token sheet',
  'sudo',
];

function topMatch(query: string): string | undefined {
  return LABELS.map((label) => ({ label, rank: score(label, query) }))
    .filter((entry) => entry.rank > 0)
    .sort((a, b) => b.rank - a.rank)[0]?.label;
}

test('ranks the obvious query at the top', () => {
  const cases: [string, string][] = [
    ['proj', 'Projects'],
    ['copy', 'Copy email address'],
    ['github', 'Open GitHub profile'],
    ['grain', 'Disable film grain'],
    ['cont', 'Contact'],
    ['battle', 'Battle Station'],
    ['sudo', 'sudo'],
  ];
  for (const [query, expected] of cases) {
    assert.equal(topMatch(query), expected, `"${query}" should find "${expected}"`);
  }
});

test('finds commands by initials, through the subsequence pass', () => {
  assert.equal(topMatch('bs'), 'Battle Station');
  assert.equal(topMatch('dfg'), 'Disable film grain');
});

test('ignores diacritics on both sides', () => {
  // The regression that started all of this: nobody types `résumé`.
  assert.equal(topMatch('resume'), 'Download résumé');
  assert.ok(score('Download résumé', 'resume') > 0);
  assert.ok(score('Download resume', 'résumé') > 0);
});

test('score bands do not overlap', () => {
  assert.equal(score('Projects', 'proj'), 1000, 'prefix');
  assert.equal(score('Battle Station', 'station'), 900, 'word start');
  assert.ok(score('Arsenal', 'sena') === 700, 'mid-word substring');
  // A scattered subsequence must never outrank a real substring, however
  // many word-boundary bonuses it collects.
  assert.ok(score('Battle Station', 'btl') < 700);
});

test('empty query matches everything, nonsense matches nothing', () => {
  assert.equal(score('Projects', ''), 1);
  assert.equal(score('Projects', 'zzz'), 0);
  assert.equal(topMatch('zzzqqq'), undefined);
});

test('matching is case insensitive', () => {
  assert.equal(score('Projects', 'PROJ'), 1000);
  assert.equal(score('PROJECTS', 'proj'), 1000);
});

test('a label match outranks a keyword match', () => {
  const direct = scoreCommand('Copy email address', 'clipboard contact', 'copy');
  const viaKeyword = scoreCommand('Contact', 'jump scroll copy', 'copy');
  assert.ok(direct > viaKeyword, `label ${direct} should beat keyword ${viaKeyword}`);
});

test('shorter labels win when everything else is equal', () => {
  // Both match `ar` as a subsequence; the tighter label is the one meant.
  assert.ok(score('Arsenal', 'arl') > score('Open design token sheet', 'oes'));
});
