import React, { useMemo, useState } from "react";
import { useUniverse } from "../../context/UniverseContext.jsx";
import { ARCHETYPE_OPTIONS, FANBASE_TYPE_OPTIONS } from "../../lib/schema.js";
import { matchTeamAsset } from "../../lib/assetSummary.js";
import TeamCard from "./TeamCard.jsx";

function flattenTeams(universe) {
  const rows = [];
  (universe.conferences || []).forEach((conf, cIdx) => {
    (conf.divisions || []).forEach((div, dIdx) => {
      (div.teams || []).forEach((team, tIdx) => {
        rows.push({ team, cIdx, dIdx, tIdx, confName: conf.name, divName: div.name, prestige: team?.attributes?.prestige });
      });
    });
  });
  return rows;
}

export default function TeamsPage() {
  const { universe, setUniverse, setView, validation } = useUniverse();
  const [query, setQuery] = useState("");
  const [confFilter, setConfFilter] = useState("all");
  const [divFilter, setDivFilter] = useState("all");
  const [logoFilter, setLogoFilter] = useState("all");
  const [issueFilter, setIssueFilter] = useState("all");
  const [selected, setSelected] = useState(() => new Set());
  const [bulkColor, setBulkColor] = useState("#000000");
  const [bulkSecondaryColor, setBulkSecondaryColor] = useState("#ffffff");
  const [bulkArchetype, setBulkArchetype] = useState("");
  const [bulkFanbase, setBulkFanbase] = useState("");

  const allRows = useMemo(() => flattenTeams(universe), [universe]);

  const issueTeamKeys = useMemo(() => {
    const set = new Set();
    validation.forEach((e) => {
      const m = /^team-(\d+)-(\d+)-(\d+)$/.exec(e.targetId);
      if (m) set.add(`${m[1]}-${m[2]}-${m[3]}`);
    });
    return set;
  }, [validation]);

  const conferenceOptions = useMemo(() => (universe.conferences || []).map((c) => c.name).filter(Boolean), [universe]);
  const divisionOptions = useMemo(() => {
    const names = new Set();
    (universe.conferences || []).forEach((c) => (c.divisions || []).forEach((d) => d.name && names.add(d.name)));
    return [...names];
  }, [universe]);

  const rows = allRows.filter((r) => {
    if (confFilter !== "all" && r.confName !== confFilter) return false;
    if (divFilter !== "all" && r.divName !== divFilter) return false;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      const hay = `${r.team?.name} ${r.team?.mascot} ${r.team?.abbreviation} ${r.team?.rivalAbbreviation}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (logoFilter !== "all") {
      const status = matchTeamAsset(r.team?.name).status;
      if (logoFilter === "matched" && !(status === "exact" || status === "normalized")) return false;
      if (logoFilter === "missing" && status !== "missing") return false;
      if (logoFilter === "fuzzy" && status !== "fuzzy") return false;
    }
    const key = `${r.cIdx}-${r.dIdx}-${r.tIdx}`;
    if (issueFilter === "issues" && !issueTeamKeys.has(key)) return false;
    if (issueFilter === "clean" && issueTeamKeys.has(key)) return false;
    return true;
  });

  function rowKey(r) {
    return `${r.cIdx}-${r.dIdx}-${r.tIdx}`;
  }

  function toggleSelect(r) {
    const key = rowKey(r);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function applyBulk(field, value) {
    setUniverse((prev) => {
      const clone = structuredClone(prev);
      rows.forEach((r) => {
        if (!selected.has(rowKey(r))) return;
        const team = clone.conferences[r.cIdx].divisions[r.dIdx].teams[r.tIdx];
        if (field === "primaryColor" || field === "secondaryColor" || field === "archetype" || field === "fanbaseType") {
          team[field] = value;
        }
      });
      return clone;
    });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Teams</h2>
          <p className="text-sm text-slate-500">{rows.length} of {allRows.length} teams</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 rounded-lg border border-slate-800 bg-slate-900/60 p-3">
        <input
          className="min-w-[180px] flex-1 rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-100"
          placeholder="Search name, mascot, abbreviation, rival…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-300" value={confFilter} onChange={(e) => setConfFilter(e.target.value)}>
          <option value="all">All Conferences</option>
          {conferenceOptions.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-300" value={divFilter} onChange={(e) => setDivFilter(e.target.value)}>
          <option value="all">All Divisions</option>
          {divisionOptions.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-300" value={logoFilter} onChange={(e) => setLogoFilter(e.target.value)}>
          <option value="all">Any Logo Status</option>
          <option value="matched">Logo Matched</option>
          <option value="fuzzy">Fuzzy Match</option>
          <option value="missing">Logo Missing</option>
        </select>
        <select className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-300" value={issueFilter} onChange={(e) => setIssueFilter(e.target.value)}>
          <option value="all">Any Validation Status</option>
          <option value="issues">Needs Attention</option>
          <option value="clean">No Issues</option>
        </select>
      </div>

      {selected.size > 0 ? (
        <div className="flex flex-wrap items-end gap-3 rounded-lg border border-cyan-500/30 bg-cyan-500/[0.06] p-3">
          <span className="text-sm font-medium text-cyan-300">{selected.size} selected</span>

          <div className="flex items-end gap-1">
            <input type="color" className="h-8 w-9 rounded border border-slate-600" value={bulkColor} onChange={(e) => setBulkColor(e.target.value)} />
            <button type="button" className="rounded-md border border-slate-600 px-2 py-1.5 text-xs text-slate-200 hover:bg-slate-800" onClick={() => applyBulk("primaryColor", bulkColor)}>
              Set Primary Color
            </button>
          </div>

          <div className="flex items-end gap-1">
            <input type="color" className="h-8 w-9 rounded border border-slate-600" value={bulkSecondaryColor} onChange={(e) => setBulkSecondaryColor(e.target.value)} />
            <button type="button" className="rounded-md border border-slate-600 px-2 py-1.5 text-xs text-slate-200 hover:bg-slate-800" onClick={() => applyBulk("secondaryColor", bulkSecondaryColor)}>
              Set Secondary Color
            </button>
          </div>

          <div className="flex items-end gap-1">
            <select className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-slate-300" value={bulkArchetype} onChange={(e) => setBulkArchetype(e.target.value)}>
              <option value="" disabled>Archetype…</option>
              {ARCHETYPE_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
            <button type="button" disabled={!bulkArchetype} className="rounded-md border border-slate-600 px-2 py-1.5 text-xs text-slate-200 hover:bg-slate-800 disabled:opacity-40" onClick={() => applyBulk("archetype", bulkArchetype)}>
              Apply
            </button>
          </div>

          <div className="flex items-end gap-1">
            <select className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-slate-300" value={bulkFanbase} onChange={(e) => setBulkFanbase(e.target.value)}>
              <option value="" disabled>Fanbase Type…</option>
              {FANBASE_TYPE_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
            <button type="button" disabled={!bulkFanbase} className="rounded-md border border-slate-600 px-2 py-1.5 text-xs text-slate-200 hover:bg-slate-800 disabled:opacity-40" onClick={() => applyBulk("fanbaseType", bulkFanbase)}>
              Apply
            </button>
          </div>

          <button type="button" className="ml-auto rounded-md px-2 py-1.5 text-xs text-slate-400 hover:text-slate-200" onClick={() => setSelected(new Set())}>
            Clear selection
          </button>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {rows.map((r) => (
          <TeamCard
            key={rowKey(r)}
            team={r.team}
            confName={r.confName}
            divName={r.divName}
            prestige={r.prestige}
            hasIssue={issueTeamKeys.has(rowKey(r))}
            selected={selected.has(rowKey(r))}
            onSelectToggle={() => toggleSelect(r)}
            onOpen={() => setView("team", { cIdx: r.cIdx, dIdx: r.dIdx, tIdx: r.tIdx })}
          />
        ))}
        {rows.length === 0 ? <div className="col-span-full py-16 text-center text-sm text-slate-500">No teams match these filters.</div> : null}
      </div>
    </div>
  );
}
