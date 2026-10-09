/**
 * A small deterministic fuzzy scorer for the command palette.
 *
 * Higher is better; `0` means no match at all. The absolute numbers are
 * meaningless on their own — only the ordering matters — but the bands are
 * deliberate, so a prefix hit can never lose to a scattered subsequence hit
 * no matter how many bonuses the latter collects:
 *
 * | band | meaning                                  |
 * |------|------------------------------------------|
 * | 1000 | the text starts with the query           |
 * |  900 | the query starts a word inside the text  |
 * |  700 | the query appears somewhere in the text  |
 * |  ~100| the query's characters appear in order   |
 * |    0 | no match                                 |
 *
 * The subsequence pass is what makes "dsp" find "DevSecOps Pipeline" and
 * "cem" find "Copy email". Within that band, characters that land on word
 * starts and characters that land consecutively both score, because those are
 * the two things that make a loose match feel intentional rather than lucky.
 */
export function score(text: string, query: string): number {
  if (query === '') return 1;

  const haystack = fold(text);
  const needle = fold(query);

  const at = haystack.indexOf(needle);
  if (at === 0) return 1000;
  if (at > 0) return isBoundary(haystack, at) ? 900 : 700;

  let cursor = 0;
  let bonus = 0;

  for (const char of needle) {
    const found = haystack.indexOf(char, cursor);
    if (found === -1) return 0;

    if (isBoundary(haystack, found)) bonus += 14;
    // Consecutive with the previous match — "dsec" beats "d...s...e...c".
    if (found === cursor) bonus += 7;

    cursor = found + 1;
  }

  // Mild preference for shorter haystacks: with everything else equal, the
  // tighter label is the one the person meant.
  return 100 + bonus - Math.min(haystack.length, 60);
}

/**
 * Lowercase and strip diacritics.
 *
 * Caught by the scorer's own test: the resume command is labelled
 * `Download résumé`, and nobody types the accents — so `resume` scored 0 and
 * the single most important command in the palette was unreachable by its own
 * name. NFD splits `é` into `e` + a combining acute, and the range below is
 * the combining-marks block.
 *
 * Both sides are folded, and every index used afterwards is an index into the
 * folded haystack, so the length change from decomposition never leaks out.
 */
function fold(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function isBoundary(text: string, index: number): boolean {
  if (index === 0) return true;
  const prev = text[index - 1];
  return prev === ' ' || prev === '-' || prev === '/' || prev === '.' || prev === '_';
}

/**
 * Best score across a label and its hidden keywords.
 *
 * Keywords are discounted so that a direct label match always wins: searching
 * "copy" should put *Copy email* above a command that merely lists "copy" as
 * a synonym.
 */
export function scoreCommand(label: string, keywords: string | undefined, query: string): number {
  const direct = score(label, query);
  const aliased = keywords ? score(keywords, query) * 0.8 : 0;
  return Math.max(direct, aliased);
}
