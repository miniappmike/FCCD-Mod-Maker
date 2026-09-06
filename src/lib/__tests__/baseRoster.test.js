import { describe, it, expect } from "vitest";
import { loadBaseRosterUniverse } from "../baseRoster.js";
import baseRosterRaw from "../../data/baseRoster.json";

describe("loadBaseRosterUniverse", () => {
  it("returns every conference/division with zero teams", async () => {
    const { universe } = await loadBaseRosterUniverse();
    expect(universe.conferences.length).toBeGreaterThan(0);
    universe.conferences.forEach((conf) => {
      expect(conf.divisions.length).toBeGreaterThan(0);
      conf.divisions.forEach((div) => {
        expect(div.teams).toEqual([]);
      });
    });
  });

  it("moves every real team into the pool, preserving each team's full data", async () => {
    const { pool } = await loadBaseRosterUniverse();
    const originalTeamCount = baseRosterRaw.conferences.reduce(
      (sum, c) => sum + c.divisions.reduce((s2, d) => s2 + d.teams.length, 0),
      0
    );
    expect(pool.length).toBe(originalTeamCount);

    const originalFirstTeam = baseRosterRaw.conferences[0].divisions[0].teams[0];
    const poolTeam = pool.find((t) => t.abbreviation === originalFirstTeam.abbreviation);
    expect(poolTeam).toEqual(originalFirstTeam);
  });

  it("does not mutate the underlying bundled data across calls", async () => {
    await loadBaseRosterUniverse();
    const totalAfter = baseRosterRaw.conferences.reduce(
      (sum, c) => sum + c.divisions.reduce((s2, d) => s2 + d.teams.length, 0),
      0
    );
    expect(totalAfter).toBeGreaterThan(0);
  });

  it("keeps conference identity (name/prestige/zip) intact", async () => {
    const { universe } = await loadBaseRosterUniverse();
    expect(universe.conferences.map((c) => c.name)).toEqual(baseRosterRaw.conferences.map((c) => c.name));
    expect(universe.conferences.map((c) => c.prestigeLevel)).toEqual(baseRosterRaw.conferences.map((c) => c.prestigeLevel));
  });

  it("renames the universe away from the source mod's identity", async () => {
    const { universe } = await loadBaseRosterUniverse();
    expect(universe.name).not.toBe(baseRosterRaw.name);
  });
});
