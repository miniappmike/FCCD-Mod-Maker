/*** Shared constants, defaults, and small helpers for the FC:CD custom
 * universe format. Field names/shapes here are the ones actually observed
 * in real universe files (see hardlimitations.md) — nothing invented. ***/

export const ARCHETYPE_OPTIONS = [
  "academic-focused",
  "academic-powerhouse",
  "balanced",
  "campus-treasure",
  "football-focused",
  "football-second",
  "football-agnostic",
  "future-forward",
  "media-mogul",
  "party-school",
  "the-main-attraction",
  "tradition-rich"
];

export const FANBASE_TYPE_OPTIONS = ["reasonable", "stubborn", "volatile", "ride-or-die"];

export const ATTRIBUTE_FIELDS = [
  { key: "prestige", label: "Prestige", type: "range", min: 1, max: 10, description: "Overall program prestige (1-10)." },
  { key: "facilities", label: "Facilities", type: "range", min: 1, max: 10, description: "Quality of athletic facilities (1-10)." },
  { key: "stadium", label: "Stadium", type: "range", min: 1, max: 10, description: "Stadium quality/capacity rating (1-10)." },
  { key: "collegeLife", label: "College Life", type: "range", min: 1, max: 10, description: "Campus/social life appeal (1-10)." },
  { key: "academics", label: "Academics", type: "range", min: 1, max: 10, description: "Academic reputation (1-10)." },
  { key: "marketing", label: "Marketing", type: "range", min: 1, max: 10, description: "Brand/marketing reach (1-10)." },
  { key: "fanbaseLevel", label: "Fanbase Level", type: "range", min: 1, max: 10, description: "Strength/passion of the fanbase (1-10)." },
  { key: "attendance", label: "Attendance", type: "number", min: 0, description: "Average attendance as a raw number of students/fans (e.g. 45000), not a 1-10 scale." }
];

export const ATTRIBUTE_KEYS = new Set(ATTRIBUTE_FIELDS.map((f) => f.key));

// The 16 award slots observed in real universe files. A loaded file may omit some of
// these or include additional ones — both are handled: known slots get labeled rows,
// anything else still shows up (LeagueSettingsPage merges present keys with this list).
export const LEAGUE_AWARD_SLOTS = [
  { key: "poty", label: "Player of the Year" },
  { key: "dpoty", label: "Defensive Player of the Year" },
  { key: "foty", label: "Freshman/Feature Player of the Year" },
  { key: "top-qb", label: "Top Quarterback" },
  { key: "top-rb", label: "Top Running Back" },
  { key: "top-wr", label: "Top Wide Receiver" },
  { key: "top-te", label: "Top Tight End" },
  { key: "top-ol", label: "Top Offensive Lineman" },
  { key: "top-k", label: "Top Kicker" },
  { key: "top-p", label: "Top Punter" },
  { key: "top-dl", label: "Top Defensive Lineman" },
  { key: "top-lb", label: "Top Linebacker" },
  { key: "top-cb", label: "Top Cornerback" },
  { key: "top-s", label: "Top Safety" },
  { key: "top-rs", label: "Top Returner" },
  { key: "coty", label: "Coach of the Year" }
];

export const defaultAttributes = () => ({
  prestige: 1,
  facilities: 1,
  stadium: 1,
  collegeLife: 1,
  academics: 1,
  marketing: 1,
  attendance: 0,
  fanbaseLevel: 1
});

export const makeDefaultTeam = () => ({
  abbreviation: "NEW",
  name: "New Team",
  mascot: "Mascot",
  primaryColor: "#000000",
  secondaryColor: "#ffffff",
  zipcode: "00000",
  attributes: defaultAttributes(),
  archetype: "balanced",
  fanbaseType: "reasonable",
  rivalAbbreviation: ""
});

export const makeDefaultDivision = () => ({ name: "New Division", teams: [] });

export const makeDefaultConference = () => ({
  name: "New Conference",
  prestigeLevel: 1,
  zipcode: "00000",
  divisions: [makeDefaultDivision()]
});

export const makeDefaultBowl = () => ({ name: "New Bowl", zipcode: "00000" });

export const makeDefaultOocRivalry = () => ({ teamA: "", teamB: "", preferredSlot: 1, offset: 0, cadence: 1 });

export const makeDefaultNeutralSite = () => ({ zipcode: "00000", indoors: false });

export const makeDefaultLeagueAwardNames = () =>
  Object.fromEntries(LEAGUE_AWARD_SLOTS.map((s) => [s.key, { name: "", abbreviation: "" }]));

export const makeBlankUniverse = () => ({
  name: "New Universe",
  startingYear: new Date().getFullYear(),
  startingMessage: "",
  adjustHsGradYears: false,
  conferences: [],
  bowlGames: [],
  oocRivalries: [],
  playoffNeutralSites: [],
  leagueAwardNames: makeDefaultLeagueAwardNames()
});

export function getTeamDisplayName(team) {
  const name = (team?.name ?? "").trim();
  const mascot = (team?.mascot ?? "").trim();
  const abbr = (team?.abbreviation ?? "").trim();
  const fullName = `${name} ${mascot}`.trim();
  if (fullName && abbr) return `${fullName} (${abbr})`;
  if (fullName) return fullName;
  if (abbr) return abbr;
  return "(unnamed team)";
}
