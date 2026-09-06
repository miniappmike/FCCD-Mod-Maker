/*** Asset compatibility matching between JSON entity names and repository
 * image filenames. Never auto-renames an entity or silently substitutes an
 * asset — it only classifies the relationship and, where useful, proposes a
 * suggestion for the user to accept or ignore. ***/

function normalizeBasic(s) {
  return String(s ?? "").trim();
}

function normalizeCaseTrim(s) {
  return normalizeBasic(s).toLowerCase();
}

// Normalize punctuation, apostrophes (straight/curly), and hyphen variants.
function normalizeStrong(s) {
  return normalizeCaseTrim(s)
    .replace(/[‘’ʼ`]/g, "'")
    .replace(/[‐‑‒–—-]/g, "-")
    .replace(/[.,]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = new Array(n + 1);
  for (let j = 0; j <= n; j++) dp[j] = j;
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const temp = dp[j];
      dp[j] = a[i - 1] === b[j - 1] ? prev : 1 + Math.min(prev, dp[j], dp[j - 1]);
      prev = temp;
    }
  }
  return dp[n];
}

function similarity(a, b) {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a, b) / maxLen;
}

/**
 * Match a JSON entity name against a list of registry assets ({ baseName, filename, url, ... }).
 * Returns:
 *   { status: 'exact' | 'normalized' | 'fuzzy' | 'missing', asset, suggestions, expectedFilename }
 */
export function matchAsset(name, assets, dirLabel) {
  const cleanName = normalizeBasic(name);
  const expectedFilename = `${cleanName}.png`;

  if (!cleanName) {
    return { status: "missing", asset: null, suggestions: [], expectedFilename, expectedPath: `${dirLabel}/${expectedFilename}` };
  }

  const exact = assets.find((a) => a.baseName === cleanName);
  if (exact) {
    return { status: "exact", asset: exact, suggestions: [], expectedFilename, expectedPath: `${dirLabel}/${expectedFilename}` };
  }

  const caseInsensitive = assets.find((a) => normalizeCaseTrim(a.baseName) === normalizeCaseTrim(cleanName));
  if (caseInsensitive) {
    return {
      status: "normalized",
      asset: caseInsensitive,
      suggestions: [],
      reason: "case-insensitive match",
      expectedFilename,
      expectedPath: `${dirLabel}/${expectedFilename}`
    };
  }

  const strongTarget = normalizeStrong(cleanName);
  const strongMatch = assets.find((a) => normalizeStrong(a.baseName) === strongTarget);
  if (strongMatch) {
    return {
      status: "normalized",
      asset: strongMatch,
      suggestions: [],
      reason: "normalized punctuation/apostrophe/hyphen match",
      expectedFilename,
      expectedPath: `${dirLabel}/${expectedFilename}`
    };
  }

  // Fuzzy suggestions: never auto-applied.
  const scored = assets
    .map((a) => ({ asset: a, score: similarity(strongTarget, normalizeStrong(a.baseName)) }))
    .filter((s) => s.score >= 0.6)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (scored.length) {
    return {
      status: "fuzzy",
      asset: null,
      suggestions: scored.map((s) => s.asset),
      expectedFilename,
      expectedPath: `${dirLabel}/${expectedFilename}`
    };
  }

  return { status: "missing", asset: null, suggestions: [], expectedFilename, expectedPath: `${dirLabel}/${expectedFilename}` };
}

export function summarizeMatches(matches) {
  const summary = { exact: 0, normalized: 0, fuzzy: 0, missing: 0, total: matches.length };
  matches.forEach((m) => {
    summary[m.status] += 1;
  });
  return summary;
}

export function findUnusedAssets(assets, usedBaseNames) {
  const used = new Set(usedBaseNames.map((n) => normalizeStrong(n)));
  return assets.filter((a) => !used.has(normalizeStrong(a.baseName)));
}
