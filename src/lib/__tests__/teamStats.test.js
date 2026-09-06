import { describe, it, expect } from "vitest";
import { flattenTeams, flattenConferenceTeams, averagePrestige, formatAveragePrestige } from "../teamStats.js";

function team(abbr, prestige) {
  return { abbreviation: abbr, name: abbr, attributes: { prestige } };
}

describe("flattenTeams", () => {
  it("flattens every team across every conference/division with position and prestige", () => {
    const universe = {
      conferences: [
        { name: "A", divisions: [{ name: "D1", teams: [team("T1", 5), team("T2", 8)] }] },
        { name: "B", divisions: [{ name: "D1", teams: [team("T3", 3)] }] }
      ]
    };
    const rows = flattenTeams(universe);
    expect(rows).toHaveLength(3);
    expect(rows[0]).toMatchObject({ cIdx: 0, dIdx: 0, tIdx: 0, confName: "A", divName: "D1", prestige: 5 });
    expect(rows[2]).toMatchObject({ cIdx: 1, dIdx: 0, tIdx: 0, confName: "B", prestige: 3 });
  });

  it("handles a missing/empty universe without throwing", () => {
    expect(flattenTeams(null)).toEqual([]);
    expect(flattenTeams({})).toEqual([]);
  });
});

describe("flattenConferenceTeams", () => {
  it("flattens every team across a single conference's divisions", () => {
    const conf = { divisions: [{ teams: [team("T1", 5)] }, { teams: [team("T2", 7)] }] };
    expect(flattenConferenceTeams(conf).map((t) => t.abbreviation)).toEqual(["T1", "T2"]);
  });
});

describe("averagePrestige", () => {
  it("averages numeric prestige values", () => {
    expect(averagePrestige([team("A", 4), team("B", 8)])).toBe(6);
  });

  it("ignores teams with a missing or non-numeric prestige", () => {
    const teams = [team("A", 6), { abbreviation: "B", attributes: {} }, { abbreviation: "C" }];
    expect(averagePrestige(teams)).toBe(6);
  });

  it("returns null (not 0) when there is nothing to average", () => {
    expect(averagePrestige([])).toBeNull();
    expect(averagePrestige([{ abbreviation: "A", attributes: {} }])).toBeNull();
  });
});

describe("formatAveragePrestige", () => {
  it("formats a number to one decimal by default", () => {
    expect(formatAveragePrestige(6)).toBe("6.0");
    expect(formatAveragePrestige(6.666)).toBe("6.7");
  });

  it("renders a dash for null", () => {
    expect(formatAveragePrestige(null)).toBe("—");
  });
});
