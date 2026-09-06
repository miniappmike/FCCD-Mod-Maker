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
  { key: "divisions", label: "Divisions", type: "divisionArray", description: "Single division of 10 teams, 2 divisions of 6/7/9, or 4 divisions of 4/5." }
];
export const CONFERENCE_KNOWN_KEYS = new Set(CONFERENCE_FIELDS.map((f) => f.key));

export const BOWL_FIELDS = [
  { key: "name", label: "Bowl Name", type: "text", description: "Bowl game name. Used to match Images/Bowls/{name}.png." },
  { key: "zipcode", label: "Zip Code", type: "zip", description: "5-digit ZIP code of where the bowl is played." },
  { key: "tieIn", label: "Tie-In", type: "tieIn", description: "Optional conference tie-in(s); up to 5 conferences per side." }
];
export const BOWL_KNOWN_KEYS = new Set(BOWL_FIELDS.map((f) => f.key));

export const UNIVERSE_FIELDS = [
  { key: "name", label: "Universe Name", type: "text", description: "Name of the custom universe/mod." },
  { key: "startingYear", label: "Starting Year", type: "number", description: "The year the save/universe begins." },
  { key: "startingMessage", label: "Starting Message", type: "textarea", description: "Flavor text shown at the start of the save." },
  { key: "conferences", label: "Conferences", type: "conferenceArray", description: "Exactly 6, 8, or 10 conferences." },
  { key: "bowlGames", label: "Bowl Games", type: "bowlArray", description: "Bowl games, ordered by importance." }
];
export const UNIVERSE_KNOWN_KEYS = new Set(UNIVERSE_FIELDS.map((f) => f.key));

export const defaultAttributes = () => ({
  stadium: 1,
  facilities: 1,
  collegeLife: 1,
  academics: 1,
  marketing: 1,
  prestige: 1,
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

export const makeBlankUniverse = () => ({
  name: "New Universe",
  startingYear: new Date().getFullYear(),
  startingMessage: "",
  conferences: [],
  bowlGames: []
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
