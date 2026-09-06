/*** Builds the full asset-compatibility picture for a universe: one match
 * result per team/conference/bowl, plus aggregate counts for the Asset
 * Manager and Validation dashboard. Playoff assets are filesystem-only (no
 * corresponding JSON entities exist per hardlimitations.md) so they are
 * reported separately as available assets, never matched against anything. ***/

import { teamAssets, conferenceAssets, bowlAssets, playoffAssets } from "./assetRegistry.js";
import { matchAsset, summarizeMatches, findUnusedAssets } from "./assetMatcher.js";

export function buildAssetAudit(universe) {
  const teamEntries = [];
  (universe?.conferences || []).forEach((conf, cIdx) => {
    (conf?.divisions || []).forEach((div, dIdx) => {
      (div?.teams || []).forEach((team, tIdx) => {
        const match = matchAsset(team?.name, teamAssets, "Images/Teams");
        teamEntries.push({
          kind: "team",
          entityLabel: team?.name || "(unnamed team)",
          confName: conf?.name,
          divName: div?.name,
          params: { cIdx, dIdx, tIdx },
          match
        });
      });
    });
  });

  const conferenceEntries = (universe?.conferences || []).map((conf, cIdx) => ({
    kind: "conference",
    entityLabel: conf?.name || `Conference #${cIdx + 1}`,
    params: { cIdx },
    match: matchAsset(conf?.name, conferenceAssets, "Images/Conferences")
  }));

  const bowlEntries = (universe?.bowlGames || []).map((bowl, bIdx) => ({
    kind: "bowl",
    entityLabel: bowl?.name || `Bowl #${bIdx + 1}`,
    params: { bIdx },
    match: matchAsset(bowl?.name, bowlAssets, "Images/Bowls")
  }));

  const teamSummary = summarizeMatches(teamEntries.map((e) => e.match));
  const conferenceSummary = summarizeMatches(conferenceEntries.map((e) => e.match));
  const bowlSummary = summarizeMatches(bowlEntries.map((e) => e.match));

  const unusedTeamAssets = findUnusedAssets(
    teamAssets,
    teamEntries.map((e) => e.entityLabel)
  );
  const unusedConferenceAssets = findUnusedAssets(
    conferenceAssets,
    conferenceEntries.map((e) => e.entityLabel)
  );
  const unusedBowlAssets = findUnusedAssets(
    bowlAssets,
    bowlEntries.map((e) => e.entityLabel)
  );

  return {
    teams: { entries: teamEntries, summary: teamSummary, unused: unusedTeamAssets },
    conferences: { entries: conferenceEntries, summary: conferenceSummary, unused: unusedConferenceAssets },
    bowls: { entries: bowlEntries, summary: bowlSummary, unused: unusedBowlAssets },
    playoffs: { assets: playoffAssets }
  };
}

// Canonical "needs attention" count used consistently across the sidebar badge,
// Overview, and the Validation dashboard: every missing or fuzzy match, in any category.
export function countAssetWarnings(audit) {
  const cats = [audit.teams.summary, audit.conferences.summary, audit.bowls.summary];
  return cats.reduce((sum, s) => sum + s.missing + s.fuzzy, 0);
}

export function matchTeamAsset(teamName) {
  return matchAsset(teamName, teamAssets, "Images/Teams");
}
export function matchConferenceAsset(confName) {
  return matchAsset(confName, conferenceAssets, "Images/Conferences");
}
export function matchBowlAsset(bowlName) {
  return matchAsset(bowlName, bowlAssets, "Images/Bowls");
}
