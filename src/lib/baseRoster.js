/*** The embedded base roster is a real, complete FC:CD universe (conferences,
 * teams, bowls, rivalries, awards) bundled as a starting point for "start from
 * scratch" custom-conference work. Every conference/division loads in empty —
 * all 138 real teams instead go into an in-app-only pool, so building your own
 * alignment means dragging each team from the pool into a division on the
 * Realignment Board rather than starting from the real-world conferences.
 * Loaded lazily so it never bloats the main app bundle for users who don't use
 * this path. ***/

export async function loadBaseRosterUniverse() {
  const mod = await import("../data/baseRoster.json");
  const data = structuredClone(mod.default ?? mod);
  data.name = "New Custom Universe";
  data.startingMessage = "Started from the base core roster — drag teams from the pool into your own conferences.";

  const pool = [];
  data.conferences.forEach((conf) => {
    conf.divisions.forEach((div) => {
      pool.push(...div.teams);
      div.teams = [];
    });
  });

  return { universe: data, pool };
}
