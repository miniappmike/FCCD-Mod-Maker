# FOOTBALL COACH: COLLEGE DYNASTY - CUSTOM UNIVERSE / MOD MAKER

A client-only web application for creating and editing custom Football Coach: College Dynasty
universe JSON files, with full visual field coverage, mod-asset (logo) compatibility checking,
and a raw JSON editor — all without hand-editing JSON.

(No data ever leaves the browser. There is no backend.)

## Features

- **Full visual editing** for every known universe/conference/division/team/bowl field,
  including team attributes, colors, archetypes, fanbase type, rivals, and bowl tie-ins.
- **Advanced/Other Fields** — any JSON property the visual editor doesn't recognize by name is
  preserved exactly, shown, and editable rather than silently dropped.
- **Raw JSON editor** with line numbers, syntax highlighting, search, formatting, and readable
  parse errors, kept live-synced with the visual editor.
- **Asset Manager** — matches team/conference/bowl names against the real files under `Images/`
  (exact, case/punctuation-normalized, and fuzzy-suggested matches), and flags missing logos
  without ever silently substituting or renaming anything.
- **Realignment Board** — drag teams between any conference/division to rearrange custom
  conferences, or move a team via the accessible dropdown in its editor.
- **Teams overview** with search/filters (conference, division, logo status, validation status)
  and bulk edits (colors, archetype, fanbase type) across a selection.
- **Validation dashboard** covering every rule in `hardlimitations.md` (conference count and
  prestige uniqueness, division/team structure, unique abbreviations, rivals, bowl zip codes and
  tie-ins), plus asset compatibility — advisory only, so you can always export.
- **Global search** (Ctrl/Cmd+K) across teams, conferences, divisions, bowls, ZIP codes, and rivals.

## How it works

1. Upload an existing Football Coach: College Dynasty universe JSON file, or start a blank one.
2. Edit teams, conferences, divisions, and bowl games — the interface updates in real time.
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

- `src/lib/` — schema definitions, validation rules, the asset registry/matcher, ZIP cache, and
  JSON utilities (pure functions, unit-tested).
- `src/context/UniverseContext.jsx` — the single source of truth for universe state and the
  actions that mutate it.
- `src/components/` — the app shell (sidebar/bottom bar/search) and one page per section
  (Overview, Teams, Conferences, Divisions, Bowls, Assets, Validation, JSON).

This is a Free and Open Source Application created by JT Taylor.
