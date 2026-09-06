# FOOTBALL COACH: COLLEGE DYNASTY - CUSTOM UNIVERSE / MOD MAKER

A client-only web application for creating and editing custom Football Coach: College Dynasty
universe JSON files, with full visual field coverage, mod-asset (logo) compatibility checking,
and a raw JSON editor — all without hand-editing JSON.

(No data ever leaves the browser. There is no backend.)

## Features

- **Full visual editing** for every known universe/conference/division/team/bowl field, plus
  out-of-conference rivalries, playoff neutral sites, league award names, HS-grad-year
  adjustment, bowl/CCG indoor flags, and CCG-at-home — the complete field set observed across
  real universe files, not just `hardlimitations.md`.
- **Advanced/Other Fields** — any JSON property the visual editor still doesn't recognize by name
  is preserved exactly, shown, and editable rather than silently dropped.
- **Raw JSON editor** with line numbers, syntax highlighting, search, formatting, and readable
  parse errors, kept live-synced with the visual editor. Export always matches the same key
  order and structure as the source data — nothing is reshuffled.
- **Asset Manager** — matches team/conference/bowl names against the real files under `Images/`
  (exact, case/punctuation-normalized, and fuzzy-suggested matches), and flags missing logos
  without ever silently substituting or renaming anything.
- **Realignment Board** — drag teams between any conference/division to rearrange custom
  conferences, or move a team via the accessible dropdown in its editor. **Start from Base
  Roster** seeds a full real 138-team/10-conference roster so custom-conference building starts
  from something real instead of nothing.
- **Structure Assistant** — for any conference, suggests the exact division-size combinations
  (1×10, 2×[6/7/9], 4×[4/5]) that fit its current team count, and applies one with a click.
- **Rivalries page** — in-division rivalry summary (flags missing/mismatched rivals) plus a full
  CRUD editor for out-of-conference rivalries.
- **League Settings page** — league award names, playoff neutral sites, and HS-grad-year toggle.
- **Teams overview** with search/filters (conference, division, logo status, validation status)
  and bulk edits (colors, archetype, fanbase type) across a selection.
- **Validation dashboard** covering every rule in `hardlimitations.md` (conference count and
  prestige uniqueness, division/team structure, unique abbreviations, rivals, bowl zip codes and
  tie-ins) plus referential checks for OOC rivalries and neutral sites, and asset compatibility —
  advisory only, so you can always export.
- **Setup Wizard** — a guided step-by-step walkthrough (basics → conferences → rivalries → bowls
  → league settings → summary) ending in a dashboard with a Prestige-ranked Top 25 and export.
- **Global search** (Ctrl/Cmd+K) across teams, conferences, divisions, bowls, ZIP codes, and rivals.

## How it works

1. Upload an existing Football Coach: College Dynasty universe JSON file, start a blank one, or
   load the base roster to realign real teams into your own conferences.
2. Edit teams, conferences, divisions, bowl games, rivalries, and league settings — the interface
   updates in real time. The Setup Wizard can walk you through all of it in order.
3. Check the Validation and Assets pages for known game-rule and logo issues.
4. Export the updated universe as JSON (copy or download).

## Development

```
npm install
npm run dev      # local dev server
npm run build    # production build
npm run lint     # eslint
npm run test     # vitest unit tests for validation/asset-matching/JSON utilities
```

The app is organized as:

- `src/lib/` — schema definitions, validation rules, the asset registry/matcher, ZIP cache,
  conference structure-suggestion, export helpers, and JSON utilities (pure functions, unit-tested).
- `src/data/baseRoster.json` — a real, complete universe bundled as the "Start from Base Roster"
  seed (loaded lazily, code-split out of the main bundle).
- `src/context/UniverseContext.jsx` — the single source of truth for universe state and the
  actions that mutate it.
- `src/components/` — the app shell (sidebar/bottom bar/search) and one page per section
  (Overview, Teams, Conferences, Divisions, Bowls, Rivalries, League Settings, Assets, Validation,
  JSON, Setup Wizard).

This is a Free and Open Source Application created by JT Taylor.
