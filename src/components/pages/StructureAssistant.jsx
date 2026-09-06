import React from "react";
import { suggestStructures, nearestAchievableTotals, applyDivisionSizes } from "../../lib/structureSuggest.js";

/**
 * Given a conference's current team count, suggests the exact division-size
 * combinations the hard-limitation rules allow, and applies one with a
 * click by redistributing the existing teams (never inventing new ones).
 */
export default function StructureAssistant({ conference, onApply }) {
  const totalTeams = (conference.divisions || []).reduce((sum, d) => sum + (d.teams || []).length, 0);
  const suggestions = suggestStructures(totalTeams);
  const nearest = suggestions.length === 0 ? nearestAchievableTotals(totalTeams) : [];

  return (
    <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/[0.04] p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-cyan-400">Structure Assistant</span>
        <span className="text-xs text-slate-500">{totalTeams} team{totalTeams === 1 ? "" : "s"} currently</span>
      </div>

      {suggestions.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s.label}
              type="button"
              className="rounded-md border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-200 hover:bg-cyan-500/20"
              onClick={() => onApply(applyDivisionSizes(conference, s.sizes))}
              title="Redistributes current teams into these divisions, in order; nothing about any team changes."
            >
              {s.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="text-xs text-amber-400">
            No valid structure exists for exactly {totalTeams} teams.
          </div>
          <div className="text-xs text-slate-500">
            Nearest valid totals: {nearest.map((n) => `${n} (${n > totalTeams ? "+" : ""}${n - totalTeams})`).join(", ")} — move
            teams in or out via the Realignment Board, or Team Editor, to reach one of these.
          </div>
        </div>
      )}
    </div>
  );
}
