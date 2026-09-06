/*** The embedded base roster is a real, complete FC:CD universe (conferences,
 * teams, bowls, rivalries, awards) bundled as a starting point for "start from
 * scratch" custom-conference work: load it, then use the Realignment Board to
 * drag teams into whatever conference structure you want. Loaded lazily so it
 * never bloats the main app bundle for users who don't use this path. ***/

export async function loadBaseRosterUniverse() {
  const mod = await import("../data/baseRoster.json");
  const data = structuredClone(mod.default ?? mod);
  data.name = "New Custom Universe";
  data.startingMessage =
    "Started from the base core roster. Use the Realignment Board to drag teams into your own conferences.";
  return data;
}
