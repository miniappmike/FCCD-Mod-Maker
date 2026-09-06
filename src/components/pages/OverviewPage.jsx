import React from "react";
import { useUniverse } from "../../context/UniverseContext.jsx";
import { UNIVERSE_KNOWN_KEYS } from "../../lib/schema.js";
import { countAssetWarnings } from "../../lib/assetSummary.js";
import AdvancedFieldsEditor from "../shared/AdvancedFieldsEditor.jsx";

function StatCard({ label, value, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 text-left transition-colors hover:border-cyan-500/40 hover:bg-slate-900"
    >
      <div className="text-2xl font-bold text-slate-50">{value}</div>
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
    </button>
  );
}

export default function OverviewPage() {
  const { universe, updateField, deleteField, setView, validation, assetAudit } = useUniverse();

  const teamCount = (universe.conferences || []).reduce(
    (sum, c) => sum + (c.divisions || []).reduce((s2, d) => s2 + (d.teams || []).length, 0),
    0
  );
  const confCount = (universe.conferences || []).length;
  const bowlCount = (universe.bowlGames || []).length;
  const assetWarnings = countAssetWarnings(assetAudit);

  return (
    <div id="section-overview" className="mx-auto max-w-4xl space-y-6 p-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-100">Universe</h2>
        <p className="text-sm text-slate-500">Top-level details for your custom mod.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-lg border border-slate-800 bg-slate-900/40 p-4 sm:grid-cols-4">
        <StatCard label="Conferences" value={confCount} onClick={() => setView("conferences")} />
        <StatCard label="Teams" value={teamCount} onClick={() => setView("teams")} />
        <StatCard label="Bowl Games" value={bowlCount} onClick={() => setView("bowls")} />
        <StatCard label="Open Issues" value={validation.length} onClick={() => setView("validation")} />
      </div>

      <div className="grid gap-4 rounded-lg border border-slate-800 bg-slate-900/60 p-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="block text-xs font-medium uppercase tracking-wide text-slate-400" htmlFor="uni-name">
            Universe Name
          </label>
          <input
            id="uni-name"
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/60"
            value={universe.name ?? ""}
            onChange={(e) => updateField(["name"], e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-medium uppercase tracking-wide text-slate-400" htmlFor="uni-year">
            Starting Year
          </label>
          <input
            id="uni-year"
            type="number"
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/60"
            value={universe.startingYear ?? 0}
            onChange={(e) => updateField(["startingYear"], parseInt(e.target.value, 10) || 0)}
          />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="block text-xs font-medium uppercase tracking-wide text-slate-400" htmlFor="uni-msg">
            Starting Message
          </label>
          <textarea
            id="uni-msg"
            rows={3}
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/60"
            value={universe.startingMessage ?? ""}
            onChange={(e) => updateField(["startingMessage"], e.target.value)}
            placeholder="Custom universe with a mix of FBS and FCS teams"
          />
        </div>
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200">Mod Status</h3>
          <button type="button" className="text-xs text-cyan-400 hover:underline" onClick={() => setView("validation")}>
            View full dashboard →
          </button>
        </div>
        <ul className="space-y-1 text-sm">
          <li className={validation.length === 0 ? "text-emerald-400" : "text-amber-400"}>
            {validation.length === 0 ? "✓ Universe passes all known validation rules" : `⚠ ${validation.length} validation issue(s)`}
          </li>
          <li className={assetWarnings === 0 ? "text-emerald-400" : "text-amber-400"}>
            {assetWarnings === 0 ? "✓ All team/conference/bowl logos matched" : `⚠ ${assetWarnings} asset compatibility warning(s)`}
          </li>
        </ul>
      </div>

      <AdvancedFieldsEditor
        entity={universe}
        knownKeys={UNIVERSE_KNOWN_KEYS}
        onSet={(key, val) => updateField([key], val)}
        onDelete={(key) => deleteField([key])}
      />
    </div>
  );
}
