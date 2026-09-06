/*** Shared conference division-structure rule: a single division of 10
 * teams, 2 divisions of equal size (6+6, 7+7, or 9+9), or 4 divisions of
 * equal size (all 4s or all 5s). The game validates on these exact totals
 * per conference (10, 12, 14, 18, 16, 20) — mismatched division sizes
 * like 6+7 total to 13, which the game rejects even though 6 and 7 are
 * each individually allowed sizes. ***/

export const TWO_DIV_SIZES = [6, 7, 9];
export const FOUR_DIV_SIZES = [4, 5];

export function isValidConferenceStructure(divisions) {
  const teamCounts = (divisions || []).map((d) => (Array.isArray(d?.teams) ? d.teams.length : 0));
  if (teamCounts.length === 1) return teamCounts[0] === 10;
  if (teamCounts.length === 2) return teamCounts[0] === teamCounts[1] && TWO_DIV_SIZES.includes(teamCounts[0]);
  if (teamCounts.length === 4) return teamCounts.every((c) => c === teamCounts[0]) && FOUR_DIV_SIZES.includes(teamCounts[0]);
  return false;
}
