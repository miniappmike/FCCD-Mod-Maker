/*** Shared helpers for flattening/aggregating teams across the conference
 * tree — used anywhere a page needs every team with its position (Teams
 * list, Rivalries, Wizard, Team Editor's switcher) or a prestige average
 * (Overview, Conferences). ***/

export function flattenTeams(universe) {
  const rows = [];
  (universe?.conferences || []).forEach((conf, cIdx) => {
    (conf.divisions || []).forEach((div, dIdx) => {
      (div.teams || []).forEach((team, tIdx) => {
        rows.push({
          team,
          cIdx,
          dIdx,
          tIdx,
          confName: conf.name,
          divName: div.name,
          prestige: team?.attributes?.prestige
        });
      });
    });
  });
  return rows;
}

export function flattenConferenceTeams(conf) {
  return (conf?.divisions || []).flatMap((d) => d?.teams || []);
}

// Average of attributes.prestige across a list of teams, ignoring any team
// missing a numeric prestige. Returns null (not 0) when there's nothing to average.
export function averagePrestige(teams) {
  const values = (teams || []).map((t) => t?.attributes?.prestige).filter((v) => typeof v === "number" && !Number.isNaN(v));
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function formatAveragePrestige(value, digits = 1) {
  return value === null ? "—" : value.toFixed(digits);
}
