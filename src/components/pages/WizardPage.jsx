import React, { useMemo, useState } from "react";
import { useUniverse } from "../../context/UniverseContext.jsx";
import { getTeamDisplayName } from "../../lib/schema.js";
import { countAssetWarnings } from "../../lib/assetSummary.js";
import { downloadJsonFile, copyJsonToClipboard } from "../../lib/exportUtils.js";
import StatusPill from "../shared/StatusPill.jsx";
import StructureAssistant from "./StructureAssistant.jsx";

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

function StepShell({ title, description, issueCount, children }) {
  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-slate-100">{title}</h3>
          <StatusPill status={issueCount === 0 ? "success" : "warning"}>
            {issueCount === 0 ? "Looks good" : `${issueCount} issue${issueCount === 1 ? "" : "s"}`}
          </StatusPill>
        </div>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      {children}
    </div>
  );
}

function BasicsStep({ universe, updateField, issueCount }) {
  return (
    <StepShell title="Universe Basics" description="Top-level identity for your mod." issueCount={issueCount}>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="block text-xs font-medium uppercase tracking-wide text-slate-400">Universe Name</label>
          <input
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            value={universe.name ?? ""}
            onChange={(e) => updateField(["name"], e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-medium uppercase tracking-wide text-slate-400">Starting Year</label>
          <input
            type="number"
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            value={universe.startingYear ?? 0}
            onChange={(e) => updateField(["startingYear"], parseInt(e.target.value, 10) || 0)}
          />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="block text-xs font-medium uppercase tracking-wide text-slate-400">Starting Message</label>
          <textarea
            rows={2}
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            value={universe.startingMessage ?? ""}
            onChange={(e) => updateField(["startingMessage"], e.target.value)}
          />
        </div>
      </div>
    </StepShell>
  );
}

function ConferencesStep({ universe, setView, updateField, issueCount }) {
  const conferences = universe.conferences || [];
  return (
    <StepShell
      title="Conferences & Divisions"
      description="Exactly 6, 8, or 10 conferences; each conference needs 1×10, 2×[6/7/9], or 4×[4/5] divisions."
      issueCount={issueCount}
    >
      <div className="flex flex-wrap gap-2">
        <button type="button" className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800" onClick={() => setView("conferences")}>
          Open Conferences
        </button>
        <button type="button" className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800" onClick={() => setView("realignment")}>
          Open Realignment Board
        </button>
      </div>
      <div className="space-y-2">
        {conferences.map((conf, cIdx) => {
          const teamCounts = (conf.divisions || []).map((d) => (d.teams || []).length);
          const valid =
            (teamCounts.length === 1 && teamCounts[0] === 10) ||
            (teamCounts.length === 2 && teamCounts.every((c) => [6, 7, 9].includes(c))) ||
            (teamCounts.length === 4 && teamCounts.every((c) => [4, 5].includes(c)));
          return (
            <div key={cIdx} className="rounded-md border border-slate-700/60 bg-slate-950/50 p-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-200">{conf.name || `Conference #${cIdx + 1}`}</span>
                <StatusPill status={valid ? "success" : "error"}>{valid ? "Valid" : "Invalid"}</StatusPill>
              </div>
              {!valid ? <div className="mt-2"><StructureAssistant conference={conf} onApply={(divisions) => updateField(["conferences", cIdx, "divisions"], divisions)} /></div> : null}
            </div>
          );
        })}
        {conferences.length === 0 ? <div className="text-sm text-slate-500">No conferences yet — add some from the Conferences page.</div> : null}
      </div>
    </StepShell>
  );
}

function RivalriesStep({ rows, setView, issueCount }) {
  const missing = rows.filter((r) => {
    const rivalAbbr = String(r.team?.rivalAbbreviation ?? "").trim();
    if (!rivalAbbr) return true;
    const rivalRow = rows.find((o) => String(o.team?.abbreviation ?? "").trim() === rivalAbbr);
    return !rivalRow || rivalRow.cIdx !== r.cIdx || rivalRow.dIdx !== r.dIdx;
  });

  return (
    <StepShell
      title="Division Rivalries & OOC Rivalries"
      description="Every team needs a rival in the same division. Out-of-conference rivalries are optional but scheduled if present."
      issueCount={issueCount}
    >
      <button type="button" className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800" onClick={() => setView("rivalries")}>
        Open Rivalries
      </button>
      {missing.length > 0 ? (
        <div className="rounded-md border border-amber-500/30 bg-amber-500/[0.06] p-3">
          <div className="mb-1 text-xs font-semibold text-amber-400">{missing.length} team(s) need a same-division rival</div>
          <div className="flex flex-wrap gap-1.5">
            {missing.slice(0, 20).map((r) => (
              <button
                key={`${r.cIdx}-${r.dIdx}-${r.tIdx}`}
                type="button"
                className="rounded border border-amber-500/40 px-2 py-0.5 text-xs text-amber-200 hover:bg-amber-500/10"
                onClick={() => setView("team", { cIdx: r.cIdx, dIdx: r.dIdx, tIdx: r.tIdx })}
              >
                {getTeamDisplayName(r.team)}
              </button>
            ))}
            {missing.length > 20 ? <span className="text-xs text-amber-400">+{missing.length - 20} more</span> : null}
          </div>
        </div>
      ) : (
        <div className="text-sm text-emerald-400">✓ Every team has a valid same-division rival.</div>
      )}
    </StepShell>
  );
}

function BowlsStep({ universe, setView, issueCount }) {
  return (
    <StepShell title="Bowl Games" description="Bowl games, ordered by importance, with optional tie-ins." issueCount={issueCount}>
      <div className="text-sm text-slate-300">{(universe.bowlGames || []).length} bowl game(s) configured.</div>
      <button type="button" className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800" onClick={() => setView("bowls")}>
        Open Bowls
      </button>
    </StepShell>
  );
}

function LeagueStep({ universe, setView, issueCount }) {
  const filledAwards = Object.values(universe.leagueAwardNames || {}).filter((a) => a?.name && a?.abbreviation).length;
  return (
    <StepShell title="League Settings" description="Award names, playoff neutral sites, and HS grad-year adjustment." issueCount={issueCount}>
      <ul className="space-y-1 text-sm text-slate-300">
        <li>Adjust HS Grad Years: <span className="font-medium">{universe.adjustHsGradYears ? "On" : "Off"}</span></li>
        <li>Playoff neutral sites: <span className="font-medium">{(universe.playoffNeutralSites || []).length}</span></li>
        <li>Award names filled in: <span className="font-medium">{filledAwards} / {Object.keys(universe.leagueAwardNames || {}).length}</span></li>
      </ul>
      <button type="button" className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800" onClick={() => setView("league-settings")}>
        Open League Settings
      </button>
    </StepShell>
  );
}

function SummaryStep({ universe, validation, assetAudit, rows }) {
  const confCount = (universe.conferences || []).length;
  const bowlCount = (universe.bowlGames || []).length;
  const oocCount = (universe.oocRivalries || []).length;
  const assetWarnings = countAssetWarnings(assetAudit);

  const top25 = [...rows]
    .filter((r) => typeof r.team?.attributes?.prestige === "number")
    .sort((a, b) => b.team.attributes.prestige - a.team.attributes.prestige)
    .slice(0, 25);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-slate-100">Summary &amp; Export</h3>
        <p className="text-sm text-slate-500">Final overview of your custom universe before exporting.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-center">
          <div className="text-xl font-bold text-slate-50">{confCount}</div>
          <div className="text-[11px] uppercase text-slate-500">Conferences</div>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-center">
          <div className="text-xl font-bold text-slate-50">{rows.length}</div>
          <div className="text-[11px] uppercase text-slate-500">Teams</div>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-center">
          <div className="text-xl font-bold text-slate-50">{bowlCount}</div>
          <div className="text-[11px] uppercase text-slate-500">Bowls</div>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-center">
          <div className="text-xl font-bold text-slate-50">{oocCount}</div>
          <div className="text-[11px] uppercase text-slate-500">OOC Rivalries</div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
        <div className="flex flex-wrap gap-2">
          <StatusPill status={validation.length === 0 ? "success" : "warning"}>
            {validation.length === 0 ? "Validation clean" : `${validation.length} validation issue(s)`}
          </StatusPill>
          <StatusPill status={assetWarnings === 0 ? "success" : "warning"}>
            {assetWarnings === 0 ? "All assets matched" : `${assetWarnings} asset warning(s)`}
          </StatusPill>
        </div>
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Projected Top 25 <span className="normal-case text-slate-500">(ranked by Prestige attribute — not a simulated outcome)</span>
        </div>
        <ol className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-2">
          {top25.map((r, i) => (
            <li key={`${r.cIdx}-${r.dIdx}-${r.tIdx}`} className="flex items-center gap-2 truncate text-slate-300">
              <span className="w-5 shrink-0 text-right text-slate-500">{i + 1}</span>
              <span className="truncate">{getTeamDisplayName(r.team)}</span>
              <span className="ml-auto shrink-0 text-xs text-slate-500">{r.confName}</span>
              <span className="shrink-0 rounded bg-slate-800 px-1.5 text-xs text-cyan-300">{r.team.attributes.prestige}</span>
            </li>
          ))}
          {top25.length === 0 ? <li className="text-slate-500">No teams with a prestige rating yet.</li> : null}
        </ol>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          className="rounded-md border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"
          onClick={() => copyJsonToClipboard(universe)}
        >
          Copy JSON
        </button>
        <button
          type="button"
          className="rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500"
          onClick={() => downloadJsonFile(universe)}
        >
          Export JSON
        </button>
      </div>
    </div>
  );
}

const STEPS = ["basics", "conferences", "rivalries", "bowls", "league", "summary"];
const STEP_LABELS = {
  basics: "Basics",
  conferences: "Conferences",
  rivalries: "Rivalries",
  bowls: "Bowls",
  league: "League",
  summary: "Summary"
};

export default function WizardPage() {
  const { universe, setView, updateField, validation, assetAudit } = useUniverse();
  const [stepIdx, setStepIdx] = useState(0);
  const rows = useMemo(() => flattenTeams(universe), [universe]);
  const step = STEPS[stepIdx];

  const issuesByCategory = (cats) => validation.filter((e) => cats.includes(e.category)).length;
  const issueCounts = {
    basics: issuesByCategory(["structure"]),
    conferences: issuesByCategory(["conferences", "divisions"]),
    rivalries: issuesByCategory(["rivals"]),
    bowls: validation.filter((e) => e.category === "bowls" || (e.category === "zip" && e.targetId?.startsWith("bowl-"))).length,
    league: validation.filter((e) => e.targetId === "section-league-settings").length,
    summary: 0
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-100">Setup Wizard</h2>
        <p className="text-sm text-slate-500">A guided walkthrough so nothing gets missed while building a custom universe.</p>
      </div>

      <div className="flex items-center gap-1">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <button
              type="button"
              onClick={() => setStepIdx(i)}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                i === stepIdx ? "bg-cyan-500/20 text-cyan-200" : issueCounts[s] > 0 ? "text-amber-400 hover:bg-slate-800" : "text-slate-500 hover:bg-slate-800"
              }`}
            >
              <span>{i + 1}.</span>
              {STEP_LABELS[s]}
              {issueCounts[s] > 0 ? <span aria-hidden="true">⚠</span> : null}
            </button>
            {i < STEPS.length - 1 ? <div className="h-px w-4 bg-slate-800" /> : null}
          </React.Fragment>
        ))}
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
        {step === "basics" ? <BasicsStep universe={universe} updateField={updateField} issueCount={issueCounts.basics} /> : null}
        {step === "conferences" ? (
          <ConferencesStep universe={universe} setView={setView} updateField={updateField} issueCount={issueCounts.conferences} />
        ) : null}
        {step === "rivalries" ? <RivalriesStep rows={rows} setView={setView} issueCount={issueCounts.rivalries} /> : null}
        {step === "bowls" ? <BowlsStep universe={universe} setView={setView} issueCount={issueCounts.bowls} /> : null}
        {step === "league" ? <LeagueStep universe={universe} setView={setView} issueCount={issueCounts.league} /> : null}
        {step === "summary" ? <SummaryStep universe={universe} validation={validation} assetAudit={assetAudit} rows={rows} /> : null}
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          disabled={stepIdx === 0}
          className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-30"
          onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
        >
          ← Back
        </button>
        <button
          type="button"
          disabled={stepIdx === STEPS.length - 1}
          className="rounded-md bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500 disabled:opacity-30"
          onClick={() => setStepIdx((i) => Math.min(STEPS.length - 1, i + 1))}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
