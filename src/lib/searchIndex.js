/*** Global search index across every entity in the universe. ***/

import { getTeamDisplayName } from "./schema.js";

export function buildSearchIndex(universe) {
  if (!universe) return [];
  const items = [];

  (universe.conferences || []).forEach((conf, cIdx) => {
    items.push({
      type: "Conference",
      label: conf?.name || `Conference #${cIdx + 1}`,
      sublabel: `Prestige ${conf?.prestigeLevel ?? "?"}`,
      view: "conference",
      params: { cIdx },
      keywords: [conf?.name, conf?.zipcode].filter(Boolean).join(" ")
    });

    (conf?.divisions || []).forEach((div, dIdx) => {
      items.push({
        type: "Division",
        label: div?.name || `Division #${dIdx + 1}`,
        sublabel: conf?.name || "",
        view: "conference",
        params: { cIdx, dIdx },
        keywords: [div?.name].filter(Boolean).join(" ")
      });

      (div?.teams || []).forEach((team, tIdx) => {
        items.push({
          type: "Team",
          label: getTeamDisplayName(team),
          sublabel: `${conf?.name || ""} • ${div?.name || ""}`,
          view: "team",
          params: { cIdx, dIdx, tIdx },
          keywords: [
            team?.name,
            team?.mascot,
            team?.abbreviation,
            team?.zipcode,
            team?.rivalAbbreviation,
            team?.archetype,
            team?.fanbaseType
          ]
            .filter(Boolean)
            .join(" ")
        });
      });
    });
  });

  (universe.bowlGames || []).forEach((bowl, bIdx) => {
    items.push({
      type: "Bowl",
      label: bowl?.name || `Bowl #${bIdx + 1}`,
      sublabel: bowl?.zipcode || "",
      view: "bowls",
      params: { bIdx },
      keywords: [bowl?.name, bowl?.zipcode].filter(Boolean).join(" ")
    });
  });

  return items;
}

export function searchItems(index, query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return index
    .filter((item) => `${item.label} ${item.sublabel} ${item.keywords}`.toLowerCase().includes(q))
    .slice(0, 40);
}
