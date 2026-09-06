import { describe, it, expect } from "vitest";
import { validateUniverseDetailed } from "../validation.js";

function makeTeam(overrides = {}) {
  return {
    abbreviation: "T1",
    name: "Team One",
    mascot: "Mascot",
    primaryColor: "#000000",
    secondaryColor: "#ffffff",
    zipcode: "00000",
    attributes: {
      stadium: 1,
      facilities: 1,
      collegeLife: 1,
      academics: 1,
      marketing: 1,
      prestige: 1,
      attendance: 0,
      fanbaseLevel: 1
    },
    archetype: "balanced",
    fanbaseType: "reasonable",
    rivalAbbreviation: "",
    ...overrides
  };
}

function makeValidUniverse(conferenceCount = 8) {
  return {
    name: "Test Universe",
    startingYear: 2025,
    startingMessage: "hello",
    bowlGames: [{ name: "Rose Bowl", zipcode: "91103" }],
    conferences: Array.from({ length: conferenceCount }, (_, i) => {
      const teams = Array.from({ length: 10 }, (__, t) => makeTeam({ abbreviation: `C${i}T${t}`, name: `Team ${i}-${t}` }));
      // Pair teams up as each other's rivals so the fixture satisfies the rival rules by default.
      for (let t = 0; t < teams.length; t += 2) {
        teams[t].rivalAbbreviation = teams[t + 1].abbreviation;
        teams[t + 1].rivalAbbreviation = teams[t].abbreviation;
      }
      return {
        name: `Conf${i + 1}`,
        prestigeLevel: i + 1,
        zipcode: "00000",
        divisions: [{ name: "Division A", teams }]
      };
    })
  };
}

describe("validateUniverseDetailed", () => {
  it("returns no errors for a fully valid universe", () => {
    expect(validateUniverseDetailed(makeValidUniverse())).toEqual([]);
  });

  it("flags a conference count outside 6/8/10", () => {
    const u = makeValidUniverse();
    u.conferences = u.conferences.slice(0, 7);
    expect(validateUniverseDetailed(u).some((e) => e.message.includes("6, 8, or 10"))).toBe(true);
  });

  it("flags duplicate prestige levels", () => {
    const u = makeValidUniverse();
    u.conferences[1].prestigeLevel = u.conferences[0].prestigeLevel;
    expect(validateUniverseDetailed(u).some((e) => e.message.includes("unique prestigeLevel"))).toBe(true);
  });

  it("flags duplicate team abbreviations", () => {
    const u = makeValidUniverse();
    u.conferences[0].divisions[0].teams[1].abbreviation = u.conferences[0].divisions[0].teams[0].abbreviation;
    expect(validateUniverseDetailed(u).some((e) => e.message.includes("Duplicate team abbreviations"))).toBe(true);
  });

  it("flags an invalid division/team structure", () => {
    const u = makeValidUniverse();
    u.conferences[0].divisions[0].teams = u.conferences[0].divisions[0].teams.slice(0, 3);
    expect(validateUniverseDetailed(u).some((e) => e.message.includes("invalid division/team structure"))).toBe(true);
  });

  it("requires a rival to be in the same division", () => {
    const u = makeValidUniverse();
    u.conferences[0].divisions = [
      { name: "A", teams: u.conferences[0].divisions[0].teams.slice(0, 5) },
      { name: "B", teams: u.conferences[0].divisions[0].teams.slice(5, 10) }
    ];
    u.conferences[0].divisions[0].teams[0].rivalAbbreviation = u.conferences[0].divisions[1].teams[0].abbreviation;
    expect(validateUniverseDetailed(u).some((e) => e.message.includes("same division"))).toBe(true);
  });

  it("requires the rival abbreviation to exist at all", () => {
    const u = makeValidUniverse();
    u.conferences[0].divisions[0].teams[0].rivalAbbreviation = "NOT-REAL";
    expect(validateUniverseDetailed(u).some((e) => e.message.includes("invalid rival"))).toBe(true);
  });

  it("requires archetype and fanbaseType", () => {
    const u = makeValidUniverse();
    u.conferences[0].divisions[0].teams[0].archetype = "";
    u.conferences[0].divisions[0].teams[0].fanbaseType = "";
    const errs = validateUniverseDetailed(u);
    expect(errs.some((e) => e.message.includes("archetype is required"))).toBe(true);
    expect(errs.some((e) => e.message.includes("fanbaseType is required"))).toBe(true);
  });

  it("requires a 5-digit bowl zipcode", () => {
    const u = makeValidUniverse();
    u.bowlGames[0].zipcode = "123";
    expect(validateUniverseDetailed(u).some((e) => e.message.includes("5-digit zipcode"))).toBe(true);
  });

  it("flags a tie-in conference that does not exist", () => {
    const u = makeValidUniverse();
    u.bowlGames = [{ name: "Lilac Bowl", zipcode: "91103", tieIn: { first: "Conf1", second: "NOPE" } }];
    expect(validateUniverseDetailed(u).some((e) => e.message.includes("does not exist"))).toBe(true);
  });

  it("flags a tie-in using the same conference on both sides", () => {
    const u = makeValidUniverse();
    u.bowlGames = [{ name: "Mirror Bowl", zipcode: "91103", tieIn: { first: "Conf1", second: "Conf1" } }];
    expect(validateUniverseDetailed(u).some((e) => e.message.includes("cannot use the same conference"))).toBe(true);
  });

  it("allows a tie-in with distinct conferences on each side", () => {
    const u = makeValidUniverse();
    u.bowlGames = [{ name: "Fair Bowl", zipcode: "91103", tieIn: { first: "Conf1", second: "Conf2" } }];
    expect(validateUniverseDetailed(u).some((e) => e.message.includes("cannot use the same conference"))).toBe(false);
  });

  it("handles an empty/null universe without throwing", () => {
    expect(validateUniverseDetailed(null)).toEqual([]);
    expect(() => validateUniverseDetailed({})).not.toThrow();
  });

  it("flags an out-of-conference rivalry referencing an unknown team", () => {
    const u = makeValidUniverse();
    u.oocRivalries = [{ teamA: "C0T0", teamB: "NOT-REAL", preferredSlot: 1, offset: 0, cadence: 1 }];
    expect(validateUniverseDetailed(u).some((e) => e.message.includes("unknown team 'NOT-REAL'"))).toBe(true);
  });

  it("flags an out-of-conference rivalry using the same team on both sides", () => {
    const u = makeValidUniverse();
    u.oocRivalries = [{ teamA: "C0T0", teamB: "C0T0", preferredSlot: 1, offset: 0, cadence: 1 }];
    expect(validateUniverseDetailed(u).some((e) => e.message.includes("cannot use the same team"))).toBe(true);
  });

  it("allows a valid out-of-conference rivalry between two real teams", () => {
    const u = makeValidUniverse();
    u.oocRivalries = [{ teamA: "C0T0", teamB: "C1T0", preferredSlot: 1, offset: 0, cadence: 1 }];
    expect(validateUniverseDetailed(u).some((e) => e.category === "rivals" && e.message.includes("C0T0"))).toBe(false);
  });

  it("requires a 5-digit zipcode for playoff neutral sites", () => {
    const u = makeValidUniverse();
    u.playoffNeutralSites = [{ zipcode: "abc", indoors: true }];
    expect(validateUniverseDetailed(u).some((e) => e.message.includes("neutral site #1 must have a 5-digit zipcode"))).toBe(true);
  });
});
