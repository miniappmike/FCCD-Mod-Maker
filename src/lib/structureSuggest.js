/*** Conference division-structure suggestions, derived directly from the
 * hard-limitation rules: a single division of 10, 2 divisions of equal
 * size (6+6, 7+7, or 9+9), or 4 divisions of equal size (all 4s or all
 * 5s) — the game validates on these exact per-conference totals, so a
 * mismatched split like 6+7 (totaling 13) is invalid even though 6 and 7
 * are each individually allowed sizes. Given how many teams a conference
 * currently has, this proposes the exact division-size combinations that
 * would make it valid, plus the nearest achievable totals if none fit
 * exactly. ***/

import { TWO_DIV_SIZES, FOUR_DIV_SIZES } from "./conferenceStructure.js";

function fourDivisionCombos() {
  return FOUR_DIV_SIZES.map((size) => ({ sizes: Array(4).fill(size), total: size * 4 }));
}

export function suggestStructures(totalTeams) {
  const suggestions = [];

  if (totalTeams === 10) {
    suggestions.push({ sizes: [10], label: "1 division of 10" });
  }

  for (const size of TWO_DIV_SIZES) {
    if (size * 2 === totalTeams) {
      suggestions.push({ sizes: [size, size], label: `2 divisions: ${size} + ${size}` });
    }
  }

  fourDivisionCombos().forEach(({ sizes, total }) => {
    if (total === totalTeams) {
      suggestions.push({ sizes, label: `4 divisions: ${sizes.join(" + ")}` });
    }
  });

  return suggestions;
}

export function nearestAchievableTotals(totalTeams, count = 4) {
  const achievable = new Set([10]);
  for (const size of TWO_DIV_SIZES) achievable.add(size * 2);
  fourDivisionCombos().forEach(({ total }) => achievable.add(total));

  return [...achievable]
    .filter((t) => t !== totalTeams)
    .sort((a, b) => Math.abs(a - totalTeams) - Math.abs(b - totalTeams) || a - b)
    .slice(0, count);
}

// Flattens every team currently in the conference (preserving each team object exactly)
// and redistributes them into new divisions of the given sizes, keeping existing
// division names where possible.
export function applyDivisionSizes(conference, sizes) {
  const allTeams = (conference.divisions || []).flatMap((d) => d.teams || []);
  let idx = 0;
  return sizes.map((size, i) => {
    const name = conference.divisions?.[i]?.name || `Division ${i + 1}`;
    const teams = allTeams.slice(idx, idx + size);
    idx += size;
    return { name, teams };
  });
}
