/*** Data-driven schema definitions for the FC:CD custom universe format.
 * This is the single source of truth for which JSON fields the visual
 * editor understands. Anything on a real entity that is NOT listed here
 * is treated as an "advanced / unknown" field: preserved, shown, and
 * editable, but never silently discarded. Do not invent fields that are
 * not backed by hardlimitations.md / the existing format. ***/

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

export const TEAM_FIELDS = [
  { key: "abbreviation", label: "Abbreviation", type: "text", description: "Short unique code for the team. Must be unique across the entire universe." },
  { key: "name", label: "Team Name", type: "text", description: "The team's school/city name. Used to match Images/Teams/{name}.png." },
  { key: "mascot", label: "Mascot", type: "text", description: "The team's mascot/nickname (e.g. \"Crimson Tide\")." },
  { key: "primaryColor", label: "Primary Color", type: "color", description: "Primary brand color, hex #RRGGBB." },
  { key: "secondaryColor", label: "Secondary Color", type: "color", description: "Secondary brand color, hex #RRGGBB." },
  { key: "zipcode", label: "Zip Code", type: "zip", description: "5-digit ZIP code of the team's home location." },
  { key: "attributes", label: "Attributes", type: "attributes", description: "Team ratings; all 1-10 except attendance." },
  { key: "archetype", label: "Archetype", type: "select", options: ARCHETYPE_OPTIONS, description: "The team's campus/program identity archetype." },
  { key: "fanbaseType", label: "Fanbase Type", type: "select", options: FANBASE_TYPE_OPTIONS, description: "How the fanbase reacts to program performance." },
  { key: "rivalAbbreviation", label: "Rival", type: "rival", description: "Abbreviation of this team's rival. Must exist and be in the same division." }
];

export const TEAM_KNOWN_KEYS = new Set(TEAM_FIELDS.map((f) => f.key));

export const DIVISION_FIELDS = [
  { key: "name", label: "Division Name", type: "text", description: "Name of the division within its conference." },
  { key: "teams", label: "Teams", type: "teamArray", description: "Teams belonging to this division." }
];
export const DIVISION_KNOWN_KEYS = new Set(DIVISION_FIELDS.map((f) => f.key));

export const CONFERENCE_FIELDS = [
  { key: "name", label: "Conference Name", type: "text", description: "Conference name. Used to match Images/Conferences/{name}.png." },
  { key: "prestigeLevel", label: "Prestige Level", type: "range", min: 1, max: 10, description: "1-10; must be unique across every conference in the universe (required for realignment)." },
  { key: "zipcode", label: "Zip Code", type: "zip", description: "5-digit ZIP code of where the conference championship game is played." },
  { key: "divisions", label: "Divisions", type: "divisionArray", description: "Single division of 10 teams, 2 divisions of 6/7/9, or 4 divisions of 4/5." },
  { key: "playCcgIndoors", label: "CCG Played Indoors", type: "boolean", description: "Whether the conference championship game venue is indoors." },
  { key: "playCcgAsHomeGame", label: "CCG At Higher Seed's Home", type: "boolean", description: "Play the championship game at the higher seed's home stadium instead of a neutral site." }
];
export const CONFERENCE_KNOWN_KEYS = new Set(CONFERENCE_FIELDS.map((f) => f.key));

export const BOWL_FIELDS = [
  { key: "name", label: "Bowl Name", type: "text", description: "Bowl game name. Used to match Images/Bowls/{name}.png." },
  { key: "zipcode", label: "Zip Code", type: "zip", description: "5-digit ZIP code of where the bowl is played." },
  { key: "indoors", label: "Indoors", type: "boolean", description: "Whether the bowl is played in an indoor/domed venue." },
  { key: "tieIn", label: "Tie-In", type: "tieIn", description: "Optional conference tie-in(s); up to 5 conferences per side." }
];
export const BOWL_KNOWN_KEYS = new Set(BOWL_FIELDS.map((f) => f.key));

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
export const LEAGUE_AWARD_KNOWN_KEYS = new Set(LEAGUE_AWARD_SLOTS.map((s) => s.key));

export const OOC_RIVALRY_FIELDS = [
  { key: "teamA", label: "Team A", type: "teamRef", description: "Abbreviation of the first team in the rivalry." },
  { key: "teamB", label: "Team B", type: "teamRef", description: "Abbreviation of the second team in the rivalry." },
  { key: "preferredSlot", label: "Preferred Slot", type: "number", description: "Preferred week slot for scheduling this rivalry." },
  { key: "offset", label: "Offset", type: "number", description: "Scheduling offset used alongside cadence." },
  { key: "cadence", label: "Cadence", type: "number", description: "How often (in years) the rivalry is scheduled." }
];
export const OOC_RIVALRY_KNOWN_KEYS = new Set(OOC_RIVALRY_FIELDS.map((f) => f.key));

export const NEUTRAL_SITE_FIELDS = [
  { key: "zipcode", label: "Zip Code", type: "zip", description: "5-digit ZIP code of the neutral playoff site." },
  { key: "indoors", label: "Indoors", type: "boolean", description: "Whether the site is an indoor/domed venue." }
];
export const NEUTRAL_SITE_KNOWN_KEYS = new Set(NEUTRAL_SITE_FIELDS.map((f) => f.key));

export const UNIVERSE_FIELDS = [
  { key: "name", label: "Universe Name", type: "text", description: "Name of the custom universe/mod." },
  { key: "startingYear", label: "Starting Year", type: "number", description: "The year the save/universe begins." },
  { key: "startingMessage", label: "Starting Message", type: "textarea", description: "Flavor text shown at the start of the save." },
  { key: "adjustHsGradYears", label: "Adjust HS Grad Years", type: "boolean", description: "Whether recruit high-school graduation years are auto-adjusted." },
  { key: "conferences", label: "Conferences", type: "conferenceArray", description: "Exactly 6, 8, or 10 conferences." },
  { key: "bowlGames", label: "Bowl Games", type: "bowlArray", description: "Bowl games, ordered by importance." },
  { key: "oocRivalries", label: "Out-of-Conference Rivalries", type: "oocRivalryArray", description: "Scheduled rivalries between teams outside their conference." },
  { key: "playoffNeutralSites", label: "Playoff Neutral Sites", type: "neutralSiteArray", description: "Neutral-site venues used for playoff rounds." },
  { key: "leagueAwardNames", label: "League Award Names", type: "awardMap", description: "Display name and abbreviation for each league award." }
];
export const UNIVERSE_KNOWN_KEYS = new Set(UNIVERSE_FIELDS.map((f) => f.key));

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
