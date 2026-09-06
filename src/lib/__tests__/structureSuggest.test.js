import { describe, it, expect } from "vitest";
import { suggestStructures, nearestAchievableTotals, applyDivisionSizes } from "../structureSuggest.js";

describe("suggestStructures", () => {
  it("suggests a single division of 10 for exactly 10 teams", () => {
    expect(suggestStructures(10)).toContainEqual({ sizes: [10], label: "1 division of 10" });
  });

  it("suggests equal-size 2-division combinations only (game rejects mismatched sizes)", () => {
    expect(suggestStructures(14)).toContainEqual({ sizes: [7, 7], label: "2 divisions: 7 + 7" });
    // 13 = 6+7 is NOT suggested: the game rejects mismatched division sizes even
    // though 6 and 7 are each individually allowed.
    expect(suggestStructures(13)).toEqual([]);
  });

  it("suggests every valid 4-division combination", () => {
    expect(suggestStructures(16)).toContainEqual({ sizes: [4, 4, 4, 4], label: "4 divisions: 4 + 4 + 4 + 4" });
    expect(suggestStructures(20)).toContainEqual({ sizes: [5, 5, 5, 5], label: "4 divisions: 5 + 5 + 5 + 5" });
  });

  it("returns nothing for a total with no valid structure", () => {
    expect(suggestStructures(11)).toEqual([]);
  });
});

describe("nearestAchievableTotals", () => {
  it("excludes the current total and returns achievable neighbors", () => {
    const nearest = nearestAchievableTotals(11);
    expect(nearest).not.toContain(11);
    expect(nearest).toEqual([10, 12, 14, 16]);
  });
});

describe("applyDivisionSizes", () => {
  it("redistributes existing teams into new division sizes without inventing or dropping any", () => {
    const conference = {
      divisions: [
        { name: "A", teams: [{ abbreviation: "T1" }, { abbreviation: "T2" }, { abbreviation: "T3" }] },
        { name: "B", teams: [{ abbreviation: "T4" }, { abbreviation: "T5" }, { abbreviation: "T6" }] }
      ]
    };
    const result = applyDivisionSizes(conference, [4, 2]);
    expect(result).toHaveLength(2);
    expect(result[0].teams.map((t) => t.abbreviation)).toEqual(["T1", "T2", "T3", "T4"]);
    expect(result[1].teams.map((t) => t.abbreviation)).toEqual(["T5", "T6"]);
    expect(result[0].name).toBe("A");
    expect(result[1].name).toBe("B");
  });

  it("names new divisions generically when growing beyond the existing count", () => {
    const conference = { divisions: [{ name: "Only", teams: [{ abbreviation: "T1" }] }] };
    const result = applyDivisionSizes(conference, [1, 0]);
    expect(result[1].name).toBe("Division 2");
  });
});
