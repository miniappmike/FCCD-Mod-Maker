/*** Master Validation Function that includes scroll targets. Returns [{ message, targetId, category }]. ***/

export function validateUniverseDetailed(universe) {
  if (!universe) return [];
  const errors = [];
  const conferences = Array.isArray(universe.conferences) ? universe.conferences : [];
  const bowlGames = Array.isArray(universe.bowlGames) ? universe.bowlGames : [];

  // Top-level structure validation
  if (typeof universe.name !== "string" || !universe.name.trim()) {
    errors.push({ message: "Universe must have a 'name'.", targetId: "section-overview", category: "structure" });
  }
  if (typeof universe.startingYear !== "number" || Number.isNaN(universe.startingYear)) {
    errors.push({ message: "Universe must have a numeric 'startingYear'.", targetId: "section-overview", category: "structure" });
  }
  if (typeof universe.startingMessage !== "string") {
    errors.push({ message: "Universe must have a 'startingMessage' string.", targetId: "section-overview", category: "structure" });
  }

  // Conference count validation
  const confCount = conferences.length;
  if (![6, 8, 10].includes(confCount)) {
    errors.push({
      message: "Universe must have exactly 6, 8, or 10 conferences.",
      targetId: "section-conferences",
      category: "conferences"
    });
  }

  // Unique conference prestige level validation
  const prestigeLevels = conferences.map((c) => c?.prestigeLevel).filter((v) => v !== undefined);
  const uniquePrestige = new Set(prestigeLevels);
  if (prestigeLevels.length !== uniquePrestige.size) {
    errors.push({
      message: "Each conference must have a unique prestigeLevel.",
      targetId: "section-conferences",
      category: "conferences"
    });
  }

  // Collect all team abbreviations (global)
  const teamAbbrevs = [];
  conferences.forEach((conf) =>
    (conf?.divisions || []).forEach((div) => (div?.teams || []).forEach((t) => teamAbbrevs.push(t?.abbreviation)))
  );
  const cleanedAbbrevs = teamAbbrevs.filter(Boolean);
  const globalAbbrevSet = new Set(cleanedAbbrevs);

  // Check for duplicate abbreviations
  const dupes = cleanedAbbrevs.filter((v, i, a) => a.indexOf(v) !== i);
  if (dupes.length) {
    errors.push({
      message: `Duplicate team abbreviations found: ${[...new Set(dupes)].join(", ")}`,
      targetId: "section-conferences",
      category: "teams"
    });
  }

  // Conference format rules + rivals
  conferences.forEach((conf, cIdx) => {
    const confId = `conf-${cIdx}`;
    const divisions = Array.isArray(conf?.divisions) ? conf.divisions : [];
    const divCount = divisions.length;
    const teamCounts = divisions.map((d) => (Array.isArray(d?.teams) ? d.teams.length : 0));

    const valid =
      (divCount === 1 && teamCounts[0] === 10) ||
      (divCount === 2 && teamCounts.every((c) => [6, 7, 9].includes(c))) ||
      (divCount === 4 && teamCounts.every((c) => [4, 5].includes(c)));

    if (!valid) {
      errors.push({
        message: `Conference '${conf?.name ?? "(unnamed)"}' has an invalid division/team structure.`,
        targetId: confId,
        category: "divisions"
      });
    }

    divisions.forEach((div, dIdx) => {
      const divId = `div-${cIdx}-${dIdx}`;
      const divisionTeams = Array.isArray(div?.teams) ? div.teams : [];
      const divisionAbbrevs = new Set(divisionTeams.map((t) => t?.abbreviation).filter(Boolean));

      divisionTeams.forEach((team, tIdx) => {
        const teamId = `team-${cIdx}-${dIdx}-${tIdx}`;
        const tAbbr = String(team?.abbreviation ?? "").trim();
        const teamLabel = tAbbr || "(no abbr)";
        const rival = String(team?.rivalAbbreviation ?? "").trim();
        const archetype = String(team?.archetype ?? "").trim();
        const fanbaseType = String(team?.fanbaseType ?? "").trim();

        if (!archetype) {
          errors.push({ message: `Team '${teamLabel}' archetype is required.`, targetId: teamId, category: "teams" });
        }
        if (!fanbaseType) {
          errors.push({ message: `Team '${teamLabel}' fanbaseType is required.`, targetId: teamId, category: "teams" });
        }

        if (!rival) {
          errors.push({ message: `Team '${teamLabel}' rivalAbbreviation is required.`, targetId: teamId, category: "rivals" });
        } else if (!globalAbbrevSet.has(rival)) {
          errors.push({ message: `Team '${teamLabel}' has invalid rival '${rival}'.`, targetId: teamId, category: "rivals" });
        } else if (!divisionAbbrevs.has(rival)) {
          errors.push({
            message: `Team '${teamLabel}' rival '${rival}' must be in the same division.`,
            targetId: divId,
            category: "rivals"
          });
        }
      });
    });
  });

  // Bowl validation (+ optional tie-in)
  bowlGames.forEach((b, i) => {
    const bowlId = `bowl-${i}`;

    if (!b || typeof b !== "object") {
      errors.push({ message: `Bowl game at index ${i} is invalid.`, targetId: bowlId, category: "bowls" });
      return;
    }

    if (typeof b.name !== "string" || !b.name.trim()) {
      errors.push({ message: `Bowl game at index ${i} must have a name.`, targetId: bowlId, category: "bowls" });
    }

    if (typeof b.zipcode !== "string" || !/^[0-9]{5}$/.test(b.zipcode)) {
      errors.push({
        message: `Bowl game '${b.name ?? `#${i}`}' must have a 5-digit zipcode.`,
        targetId: bowlId,
        category: "zip"
      });
    }

    if (b.tieIn != null) {
      if (typeof b.tieIn !== "object" || Array.isArray(b.tieIn)) {
        errors.push({ message: `Bowl game '${b.name ?? `#${i}`}' tieIn must be an object.`, targetId: bowlId, category: "bowls" });
      } else {
        const firstRaw = b.tieIn.first;
        const secondRaw = b.tieIn.second;

        const normalizeToList = (v) => {
          if (v == null) return [];
          if (typeof v === "string") return [v];
          if (Array.isArray(v)) return v;
          return ["__invalid_type__"];
        };

        const firstListRaw = normalizeToList(firstRaw);
        const secondListRaw = normalizeToList(secondRaw);

        if (firstListRaw.includes("__invalid_type__")) {
          errors.push({
            message: `Bowl game '${b.name ?? `#${i}`}' tieIn.first must be a string or an array of strings.`,
            targetId: bowlId,
            category: "bowls"
          });
        }
        if (secondListRaw.includes("__invalid_type__")) {
          errors.push({
            message: `Bowl game '${b.name ?? `#${i}`}' tieIn.second must be a string or an array of strings (or omitted).`,
            targetId: bowlId,
            category: "bowls"
          });
        }

        const firstList = firstListRaw
          .filter((x) => x !== "__invalid_type__")
          .map((x) => String(x ?? "").trim())
          .filter(Boolean);

        const secondList = secondListRaw
          .filter((x) => x !== "__invalid_type__")
          .map((x) => String(x ?? "").trim())
          .filter(Boolean);

        if (firstList.length === 0) {
          errors.push({
            message: `Bowl game '${b.name ?? `#${i}`}' tieIn.first is required when tie-in is enabled.`,
            targetId: bowlId,
            category: "bowls"
          });
        }

        if (firstList.length > 5) {
          errors.push({
            message: `Bowl game '${b.name ?? `#${i}`}' tieIn.first can have at most 5 conferences.`,
            targetId: bowlId,
            category: "bowls"
          });
        }
        if (secondList.length > 5) {
          errors.push({
            message: `Bowl game '${b.name ?? `#${i}`}' tieIn.second can have at most 5 conferences.`,
            targetId: bowlId,
            category: "bowls"
          });
        }

        // A conference may not appear on both sides of the same tie-in.
        const overlap = firstList.filter((name) => secondList.includes(name));
        if (overlap.length) {
          errors.push({
            message: `Bowl game '${b.name ?? `#${i}`}' tieIn cannot use the same conference ('${overlap[0]}') on both sides.`,
            targetId: bowlId,
            category: "bowls"
          });
        }

        firstList.slice(0, 5).forEach((confName, idx) => {
          if (!conferences.some((c) => c?.name === confName)) {
            errors.push({
              message: `Bowl game '${b.name ?? `#${i}`}' tieIn.first #${idx + 1} conference '${confName}' does not exist.`,
              targetId: bowlId,
              category: "bowls"
            });
          }
        });

        secondList.slice(0, 5).forEach((confName, idx) => {
          if (!conferences.some((c) => c?.name === confName)) {
            errors.push({
              message: `Bowl game '${b.name ?? `#${i}`}' tieIn.second #${idx + 1} conference '${confName}' does not exist.`,
              targetId: bowlId,
              category: "bowls"
            });
          }
        });
      }
    }
  });

  return errors;
}

export const VALIDATION_CATEGORIES = [
  { key: "structure", label: "JSON Structure" },
  { key: "conferences", label: "Conferences" },
  { key: "divisions", label: "Divisions" },
  { key: "teams", label: "Teams" },
  { key: "rivals", label: "Rivals" },
  { key: "bowls", label: "Bowls" },
  { key: "zip", label: "ZIP Codes" }
];

export function groupValidationByCategory(errors) {
  const byCategory = new Map(VALIDATION_CATEGORIES.map((c) => [c.key, []]));
  errors.forEach((e) => {
    const cat = e.category && byCategory.has(e.category) ? e.category : "structure";
    byCategory.get(cat).push(e);
  });
  return byCategory;
}

/*** Validation Self Test Function (dev-only sanity check, kept from the original editor). ***/
export function runValidationSelfTestsOnce() {
  try {
    const u = {
      name: "Test",
      startingYear: 2025,
      startingMessage: "",
      bowlGames: [{ name: "Rose", zipcode: "00000" }],
      conferences: Array.from({ length: 6 }, (_, i) => ({
        name: `C${i + 1}`,
        prestigeLevel: i + 1,
        zipcode: "00000",
        divisions: [
          {
            name: "D1",
            teams: Array.from({ length: 10 }, (__, t) => ({
              abbreviation: `T${i}${t}`,
              name: `Team ${i}-${t}`,
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
              rivalAbbreviation: ""
            }))
          }
        ]
      }))
    };

    const errs0 = validateUniverseDetailed(u);
    console.assert(errs0.some((e) => e.message.includes("5-digit zipcode")), "Expected bowl zipcode validation error");

    const u2 = { ...u, conferences: u.conferences.slice(0, 7) };
    console.assert(
      validateUniverseDetailed(u2).some((e) => e.message.includes("6, 8, or 10")),
      "Expected conference count error"
    );

    const u3 = structuredClone(u);
    u3.bowlGames[0].zipcode = "91103";
    u3.conferences[0].divisions = [
      { name: "A", teams: u3.conferences[0].divisions[0].teams.slice(0, 5) },
      { name: "B", teams: u3.conferences[0].divisions[0].teams.slice(5, 10) }
    ];
    u3.conferences[0].divisions[0].teams[0].rivalAbbreviation = u3.conferences[0].divisions[1].teams[0].abbreviation;
    console.assert(
      validateUniverseDetailed(u3).some((e) => e.message.includes("same division")),
      "Expected rival-in-division error"
    );

    const u4 = structuredClone(u);
    u4.bowlGames = [{ name: "Lilac Bowl", zipcode: "91103", tieIn: { first: "C1", second: "NOPE" } }];
    console.assert(
      validateUniverseDetailed(u4).some((e) => e.message.includes("does not exist")),
      "Expected tie-in conference existence error"
    );

    const u5 = structuredClone(u);
    u5.bowlGames = [{ name: "Mirror Bowl", zipcode: "91103", tieIn: { first: "C1", second: "C1" } }];
    console.assert(
      validateUniverseDetailed(u5).some((e) => e.message.includes("cannot use the same conference")),
      "Expected tie-in same-conf error"
    );
  } catch (e) {
    console.warn("Validation self-tests encountered an error:", e);
  }
}
