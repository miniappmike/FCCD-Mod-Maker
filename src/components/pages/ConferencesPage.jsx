import React from "react";
import { useUniverse } from "../../context/UniverseContext.jsx";
import { makeDefaultConference } from "../../lib/schema.js";
import { matchConferenceAsset } from "../../lib/assetSummary.js";
import StatusPill from "../shared/StatusPill.jsx";

function conferenceIsValid(conf) {
  const divisions = Array.isArray(conf?.divisions) ? conf.divisions : [];
  const counts = divisions.map((d) => (Array.isArray(d?.teams) ? d.teams.length : 0));
  return (
    (divisions.length === 1 && counts[0] === 10) ||
    (divisions.length === 2 && counts.every((c) => [6, 7, 9].includes(c))) ||
    (divisions.length === 4 && counts.every((c) => [4, 5].includes(c)))
  );
}

export default function ConferencesPage() {
  const { universe, insertAt, setView } = useUniverse();
  const conferences = universe.conferences || [];
  const validCount = ![6, 8, 10].includes(conferences.length) ? null : conferences.length;

  return (
    <div id="section-conferences" className="mx-auto max-w-5xl space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Conferences</h2>
          <p className="text-sm text-slate-500">
            {conferences.length} conference{conferences.length === 1 ? "" : "s"}
            {validCount === null ? " — must be exactly 6, 8, or 10" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800"
            onClick={() => setView("realignment")}
          >
            Open Realignment Board
          </button>
          <button
            type="button"
            className="rounded-md bg-cyan-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-cyan-500"
            onClick={() => insertAt(["conferences"], conferences.length, makeDefaultConference())}
          >
            + Add Conference
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {conferences.map((conf, cIdx) => {
          const teamCount = (conf.divisions || []).reduce((s, d) => s + (d.teams || []).length, 0);
          const match = matchConferenceAsset(conf.name);
          const valid = conferenceIsValid(conf);
          return (
            <button
              id={`conf-${cIdx}`}
              key={cIdx}
              type="button"
              onClick={() => setView("conference", { cIdx })}
              className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-900/60 p-4 text-left transition-colors hover:border-cyan-500/40"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-700 bg-slate-800">
                  {match.asset ? <img src={match.asset.url} alt="" className="h-full w-full object-contain" /> : <span aria-hidden="true">🏆</span>}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-slate-100">{conf.name || `Conference #${cIdx + 1}`}</div>
                  <div className="text-xs text-slate-500">Prestige {conf.prestigeLevel ?? "—"}</div>
                </div>
              </div>
              <div className="text-xs text-slate-500">
                {teamCount} teams · {(conf.divisions || []).length} division{(conf.divisions || []).length === 1 ? "" : "s"}
              </div>
              <div className="flex flex-wrap gap-1.5">
                <StatusPill status={valid ? "success" : "error"}>{valid ? "Structure OK" : "Invalid Structure"}</StatusPill>
                <StatusPill status={match.status}>{match.status === "missing" ? "No Logo" : "Logo OK"}</StatusPill>
              </div>
            </button>
          );
        })}
        {conferences.length === 0 ? (
          <div className="col-span-full py-16 text-center text-sm text-slate-500">No conferences yet. Add one to get started.</div>
        ) : null}
      </div>
    </div>
  );
}
