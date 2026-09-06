import React from "react";
import { getTeamDisplayName } from "../../lib/schema.js";
import { matchTeamAsset } from "../../lib/assetSummary.js";
import StatusPill from "../shared/StatusPill.jsx";

export default function TeamCard({ team, confName, divName, prestige, hasIssue, selected, onSelectToggle, onOpen }) {
  const match = matchTeamAsset(team?.name);

  return (
    <div
      className={`group relative flex flex-col gap-2 rounded-lg border bg-slate-900/60 p-3 transition-colors ${
        selected ? "border-cyan-500/60 ring-1 ring-cyan-500/40" : "border-slate-800 hover:border-slate-700"
      }`}
    >
      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          className="mt-1 h-3.5 w-3.5 accent-cyan-500"
          checked={selected}
          onChange={onSelectToggle}
          aria-label={`Select ${getTeamDisplayName(team)}`}
        />
        <button type="button" onClick={onOpen} className="flex flex-1 items-start gap-2 text-left">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-700 bg-slate-800">
            {match.asset ? (
              <img src={match.asset.url} alt="" className="h-full w-full object-contain" />
            ) : (
              <span className="text-slate-600" aria-hidden="true">
                🖼
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-slate-100">{team?.name || "(unnamed)"}</div>
            <div className="truncate text-xs text-slate-500">{team?.mascot || "—"}</div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <span
              className="h-3.5 w-3.5 rounded-full border border-slate-600"
              style={{ backgroundColor: team?.primaryColor || "#000" }}
              title="Primary color"
            />
            <span
              className="h-3.5 w-3.5 rounded-full border border-slate-600"
              style={{ backgroundColor: team?.secondaryColor || "#fff" }}
              title="Secondary color"
            />
          </div>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
        <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-slate-300">{team?.abbreviation || "—"}</span>
        <span className="truncate">{confName}</span>
        <span aria-hidden="true">·</span>
        <span className="truncate">{divName}</span>
        <span aria-hidden="true">·</span>
        <span>Prestige {prestige ?? "—"}</span>
      </div>

      <div className="flex items-center justify-between">
        <StatusPill status={match.status}>
          {match.status === "missing" ? "No Logo" : match.status === "fuzzy" ? "Fuzzy Match" : "Logo OK"}
        </StatusPill>
        {hasIssue ? <StatusPill status="warning">Needs Attention</StatusPill> : null}
      </div>
    </div>
  );
}
