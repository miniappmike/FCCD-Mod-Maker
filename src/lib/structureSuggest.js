/*** Conference division-structure suggestions, derived directly from the
 * hard-limitation rules: a single division of 10, 2 divisions each 6/7/9,
 * or 4 divisions each 4/5. Given how many teams a conference currently
 * has, this proposes the exact division-size combinations that would make
 * it valid, plus the nearest achievable totals if none fit exactly. ***/

const TWO_DIV_SIZES = [6, 7, 9];
const FOUR_DIV_COUNT = 4;
const FOUR_DIV_SIZES = [4, 5];

function fourDivisionCombos() {
  const combos = [];
  for (let fours = 0; fours <= FOUR_DIV_COUNT; fours++) {
    const fives = FOUR_DIV_COUNT - fours;
    combos.push({ sizes: [...Array(fours).fill(4), ...Array(fives).fill(5)], total: fours * 4 + fives * 5 });
  }
  return combos;
}

export function suggestStructures(totalTeams) {
  const suggestions = [];

  if (totalTeams === 10) {
    suggestions.push({ sizes: [10], label: "1 division of 10" });
  }

  for (const a of TWO_DIV_SIZES) {
    for (const b of TWO_DIV_SIZES) {
      if (a <= b && a + b === totalTeams) {
        suggestions.push({ sizes: [a, b], label: `2 divisions: ${a} + ${b}` });
      }
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
  for (const a of TWO_DIV_SIZES) for (const b of TWO_DIV_SIZES) achievable.add(a + b);
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
