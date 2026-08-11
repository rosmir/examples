function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .replace(/[''`\u2018\u2019]/g, "'")
    .replace(/["""\u201C\u201D]/g, '"')
    .replace(/[^a-z0-9\s'"%]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Brand name, class/type, bottler — case and punctuation insensitive, 85% similarity threshold. */
export function fuzzyMatch(
  expected: string,
  actual: string
): { match: boolean; similarity: number } {
  const a = normalizeText(expected);
  const b = normalizeText(actual);
  if (a === b) return { match: true, similarity: 1.0 };
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return { match: true, similarity: 1.0 };
  const similarity = 1 - levenshtein(a, b) / maxLen;
  return { match: similarity >= 0.85, similarity };
}

/** Government warning — whitespace-normalized exact match. */
export function strictMatch(expected: string, actual: string): { match: boolean } {
  const collapse = (s: string) => s.replace(/\s+/g, ' ').trim();
  return { match: collapse(expected) === collapse(actual) };
}

/** ABV — extracts numeric percentage; also converts proof to %. Tolerance ±0.5%. */
export function abvMatch(
  expected: string,
  actual: string
): { match: boolean; expectedVal: number | null; actualVal: number | null } {
  const parse = (s: string): number | null => {
    const pct = s.match(/(\d+(?:\.\d+)?)\s*%/);
    if (pct) return parseFloat(pct[1]);
    const proof = s.match(/(\d+(?:\.\d+)?)\s*proof/i);
    if (proof) return parseFloat(proof[1]) / 2;
    return null;
  };
  const expectedVal = parse(expected);
  const actualVal = parse(actual);
  if (expectedVal === null || actualVal === null) {
    return { match: false, expectedVal, actualVal };
  }
  return {
    match: Math.abs(expectedVal - actualVal) <= 0.5,
    expectedVal,
    actualVal,
  };
}

/** Net contents — normalizes units and whitespace before comparing. */
export function netContentsMatch(expected: string, actual: string): { match: boolean } {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/milliliters?/g, 'ml')
      .replace(/liters?/g, 'l')
      .replace(/fl\.?\s*oz\.?/g, 'floz')
      .replace(/ounces?/g, 'oz');
  return { match: normalize(expected) === normalize(actual) };
}
