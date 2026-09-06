import React from "react";
import { useUniverse } from "../../context/UniverseContext.jsx";
import { makeDefaultOocRivalry, getTeamDisplayName } from "../../lib/schema.js";
import ConfirmButton from "../shared/ConfirmButton.jsx";
import StatusPill from "../shared/StatusPill.jsx";

function flattenTeams(universe) {
  const rows = [];
  (universe.conferences || []).forEach((conf, cIdx) => {
    (conf.divisions || []).forEach((div, dIdx) => {
      (div.teams || []).forEach((team, tIdx) => {
        rows.push({ team, cIdx, dIdx, tIdx, confName: conf.name, divName: div.name });
      });
    });
  });
  return rows;
}

function InDivisionRivalries({ rows, setView }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">In-Division Rivalries</h3>
      <p className="mb-3 text-xs text-slate-500">
        Every team's <span className="font-mono text-slate-400">rivalAbbreviation</span>. Edit a team's rival from its own editor —
        this is a read-only summary for spotting gaps after realigning conferences.
      </p>
      <div className="max-h-80 space-y-1 overflow-y-auto">
        {rows.map((r) => {
          const rivalAbbr = String(r.team?.rivalAbbreviation ?? "").trim();
          const rivalRow = rows.find((o) => String(o.team?.abbreviation ?? "").trim() === rivalAbbr);
          const sameDivision = rivalRow && rivalRow.cIdx === r.cIdx && rivalRow.dIdx === r.dIdx;
          const status = !rivalAbbr ? "missing" : !rivalRow ? "missing" : sameDivision ? "exact" : "fuzzy";

          return (
            <button
              key={`${r.cIdx}-${r.dIdx}-${r.tIdx}`}
              type="button"
              onClick={() => setView("team", { cIdx: r.cIdx, dIdx: r.dIdx, tIdx: r.tIdx })}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-slate-800/60"
            >
              <span className="w-40 truncate text-slate-200">{getTeamDisplayName(r.team)}</span>
              <span className="text-slate-600">→</span>
              <span className="flex-1 truncate text-slate-400">
                {rivalRow ? getTeamDisplayName(rivalRow.team) : rivalAbbr || "(none set)"}
              </span>
              <StatusPill status={status}>
                {status === "exact" ? "OK" : !rivalAbbr ? "Not set" : !rivalRow ? "Unknown team" : "Different division"}
              </StatusPill>
            </button>
          );
        })}
        {rows.length === 0 ? <div className="py-6 text-center text-xs text-slate-500">No teams yet.</div> : null}
      </div>
    </div>
  );
}

function OocRivalries({ universe, rows, updateField, insertAt, removeAt }) {
  const oocRivalries = universe.oocRivalries || [];
  const teamOptions = rows
    .map((r) => ({ abbr: String(r.team?.abbreviation ?? "").trim(), label: getTeamDisplayName(r.team) }))
    .filter((o) => o.abbr)
    .sort((a, b) => a.label.localeCompare(b.label));
  const abbrSet = new Set(teamOptions.map((o) => o.abbr));

  return (
    <div id="section-rivalries" className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Out-of-Conference Rivalries</h3>
          <p className="text-xs text-slate-500">Scheduled rivalries between teams outside their conference.</p>
        </div>
        <button
          type="button"
          className="rounded-md bg-cyan-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-cyan-500"
          onClick={() => insertAt(["oocRivalries"], oocRivalries.length, makeDefaultOocRivalry())}
        >
          + Add Rivalry
        </button>
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-[1fr_1fr_5rem_5rem_5rem_2.5rem] gap-2 px-1 text-[10px] uppercase tracking-wide text-slate-500">
          <span>Team A</span>
          <span>Team B</span>
          <span>Slot</span>
          <span>Offset</span>
          <span>Cadence</span>
          <span />
        </div>
        {oocRivalries.map((r, i) => {
          const aKnown = !r.teamA || abbrSet.has(r.teamA);
          const bKnown = !r.teamB || abbrSet.has(r.teamB);
          return (
            <div key={i} className="grid grid-cols-[1fr_1fr_5rem_5rem_5rem_2.5rem] items-center gap-2">
              <select
                className={`rounded-md border bg-slate-950 px-2 py-1.5 text-sm text-slate-100 ${aKnown ? "border-slate-700" : "border-rose-500"}`}
                value={r.teamA ?? ""}
                onChange={(e) => updateField(["oocRivalries", i, "teamA"], e.target.value)}
              >
                <option value="" disabled>Select…</option>
                {!aKnown && r.teamA ? <option value={r.teamA}>{r.teamA} (unknown)</option> : null}
                {teamOptions.map((o) => (
                  <option key={o.abbr} value={o.abbr}>{o.label}</option>
                ))}
              </select>
              <select
                className={`rounded-md border bg-slate-950 px-2 py-1.5 text-sm text-slate-100 ${bKnown ? "border-slate-700" : "border-rose-500"}`}
                value={r.teamB ?? ""}
                onChange={(e) => updateField(["oocRivalries", i, "teamB"], e.target.value)}
              >
                <option value="" disabled>Select…</option>
                {!bKnown && r.teamB ? <option value={r.teamB}>{r.teamB} (unknown)</option> : null}
                {teamOptions.map((o) => (
                  <option key={o.abbr} value={o.abbr}>{o.label}</option>
                ))}
              </select>
              <input
                type="number"
                className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-100"
                value={r.preferredSlot ?? 0}
                onChange={(e) => updateField(["oocRivalries", i, "preferredSlot"], parseInt(e.target.value, 10) || 0)}
              />
              <input
                type="number"
                className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-100"
                value={r.offset ?? 0}
                onChange={(e) => updateField(["oocRivalries", i, "offset"], parseInt(e.target.value, 10) || 0)}
              />
              <input
                type="number"
                className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-100"
                value={r.cadence ?? 0}
                onChange={(e) => updateField(["oocRivalries", i, "cadence"], parseInt(e.target.value, 10) || 0)}
              />
              <ConfirmButton size="xs" label="✕" confirmLabel="✓" onConfirm={() => removeAt(["oocRivalries"], i)} />
            </div>
          );
        })}
        {oocRivalries.length === 0 ? <div className="py-6 text-center text-xs text-slate-500">No out-of-conference rivalries yet.</div> : null}
      </div>
    </div>
  );
}

export default function RivalriesPage() {
  const { universe, setView, updateField, insertAt, removeAt } = useUniverse();
  const rows = flattenTeams(universe);

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-100">Rivalries</h2>
        <p className="text-sm text-slate-500">In-division rivalries plus scheduled out-of-conference rivalries.</p>
      </div>
      <InDivisionRivalries rows={rows} setView={setView} />
      <OocRivalries universe={universe} rows={rows} updateField={updateField} insertAt={insertAt} removeAt={removeAt} />
    </div>
  );
}
