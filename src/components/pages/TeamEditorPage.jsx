import React, { useMemo, useState } from "react";
import { useUniverse } from "../../context/UniverseContext.jsx";
import { ATTRIBUTE_FIELDS, ARCHETYPE_OPTIONS, FANBASE_TYPE_OPTIONS, getTeamDisplayName } from "../../lib/schema.js";
import { matchTeamAsset } from "../../lib/assetSummary.js";
import { flattenTeams } from "../../lib/teamStats.js";
import ColorField from "../shared/ColorField.jsx";
import ZipLocationField from "../shared/ZipLocationField.jsx";
import AssetThumb from "../shared/AssetThumb.jsx";
import UploadAssetModal from "../shared/UploadAssetModal.jsx";
import ConfirmButton from "../shared/ConfirmButton.jsx";
import BrandingCard from "./BrandingCard.jsx";

export default function TeamEditorPage() {
  const { universe, view, setView, updateField, removeAt, moveTeam } = useUniverse();
  const { cIdx, dIdx, tIdx } = view.params;
  const [uploadOpen, setUploadOpen] = useState(false);

  const allTeams = useMemo(() => flattenTeams(universe), [universe]);
  const teamsByConference = useMemo(() => {
    const map = new Map();
    allTeams.forEach((r) => {
      const key = r.confName || "(unnamed conference)";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(r);
    });
    return map;
  }, [allTeams]);

  const conf = universe.conferences?.[cIdx];
  const div = conf?.divisions?.[dIdx];
  const team = div?.teams?.[tIdx];

  if (!team) {
    return (
      <div className="p-6">
        <p className="text-sm text-slate-400">This team could not be found — it may have been removed.</p>
        <button type="button" className="mt-2 text-sm text-cyan-400 hover:underline" onClick={() => setView("teams")}>
          ← Back to Teams
        </button>
      </div>
    );
  }

  const path = (key) => ["conferences", cIdx, "divisions", dIdx, "teams", tIdx, key];
  const match = matchTeamAsset(team.name);

  const rivalOptions = (div.teams || [])
    .map((t, idx) => ({ t, idx }))
    .filter(({ idx, t }) => idx !== tIdx && String(t?.abbreviation ?? "").trim())
    .map(({ t }) => ({ abbr: String(t.abbreviation).trim(), label: getTeamDisplayName(t) }))
    .sort((a, b) => a.label.localeCompare(b.label));
  const currentRival = String(team.rivalAbbreviation ?? "").trim();

  // Conference/division reassignment — the "custom conferences" realignment support, as an accessible dropdown move.
  function moveToDivision(targetCIdx, targetDIdx) {
    if (targetCIdx === cIdx && targetDIdx === dIdx) return;
    moveTeam(
      ["conferences", cIdx, "divisions", dIdx, "teams", tIdx],
      ["conferences", targetCIdx, "divisions", targetDIdx, "teams"],
      undefined
    );
    setView("team", { cIdx: targetCIdx, dIdx: targetDIdx, tIdx: (universe.conferences[targetCIdx].divisions[targetDIdx].teams || []).length });
  }

  return (
    <div id={`team-${cIdx}-${dIdx}-${tIdx}`} className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" className="text-xs text-cyan-400 hover:underline" onClick={() => setView("teams")}>
          ← Back to Teams
        </button>
        <label className="flex items-center gap-2 text-xs text-slate-400">
          Switch team
          <select
            className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-100"
            value={`${cIdx}-${dIdx}-${tIdx}`}
            onChange={(e) => {
              const [nc, nd, nt] = e.target.value.split("-").map(Number);
              setView("team", { cIdx: nc, dIdx: nd, tIdx: nt });
            }}
          >
            {[...teamsByConference.entries()].map(([confName, rows]) => (
              <optgroup key={confName} label={confName}>
                {rows.map((r) => (
                  <option key={`${r.cIdx}-${r.dIdx}-${r.tIdx}`} value={`${r.cIdx}-${r.dIdx}-${r.tIdx}`}>
                    {getTeamDisplayName(r.team)}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
      </div>

      <BrandingCard team={team} logoUrl={match.asset?.url} />

      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Asset (Mod File)</h3>
        </div>
        <AssetThumb
          match={match}
          size={48}
          onUseSuggestion={(asset) => updateField(path("name"), asset.baseName)}
          onUpload={() => setUploadOpen(true)}
        />
        {uploadOpen ? (
          <UploadAssetModal expectedFilename={match.expectedFilename} expectedPath={match.expectedPath} onClose={() => setUploadOpen(false)} />
        ) : null}
      </div>

      <div className="grid gap-4 rounded-lg border border-slate-800 bg-slate-900/60 p-4 sm:grid-cols-3">
        <h3 className="col-span-full text-xs font-semibold uppercase tracking-wide text-slate-400">Identity (JSON)</h3>
        <div className="space-y-1">
          <label className="block text-xs font-medium uppercase tracking-wide text-slate-400" htmlFor="t-abbr">Abbreviation</label>
          <input id="t-abbr" className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100" value={team.abbreviation ?? ""} onChange={(e) => updateField(path("abbreviation"), e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-medium uppercase tracking-wide text-slate-400" htmlFor="t-name">Team Name</label>
          <input id="t-name" className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100" value={team.name ?? ""} onChange={(e) => updateField(path("name"), e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-medium uppercase tracking-wide text-slate-400" htmlFor="t-mascot">Mascot</label>
          <input id="t-mascot" className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100" value={team.mascot ?? ""} onChange={(e) => updateField(path("mascot"), e.target.value)} />
        </div>
      </div>

      <div className="grid gap-4 rounded-lg border border-slate-800 bg-slate-900/60 p-4 sm:grid-cols-3">
        <h3 className="col-span-full text-xs font-semibold uppercase tracking-wide text-slate-400">Location &amp; Colors</h3>
        <ZipLocationField label="Zip Code" value={team.zipcode} onChange={(v) => updateField(path("zipcode"), v)} id="t-zip" />
        <ColorField label="Primary Color" value={team.primaryColor} onChange={(v) => updateField(path("primaryColor"), v)} id="t-primary" />
        <ColorField label="Secondary Color" value={team.secondaryColor} onChange={(v) => updateField(path("secondaryColor"), v)} id="t-secondary" />
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Attributes</h3>
        <div className="space-y-3">
          {ATTRIBUTE_FIELDS.map((f) => {
            const val = team.attributes?.[f.key];
            return (
              <div key={f.key} className="grid grid-cols-[160px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-slate-300" title={f.description}>
                  {f.label}
                </label>
                {f.type === "range" ? (
                  <div className="flex items-center gap-3">
                    <span className="w-8 rounded bg-slate-800 px-2 py-0.5 text-center text-sm font-semibold text-cyan-300">
                      {typeof val === "number" ? val : f.min}
                    </span>
                    <input
                      type="range"
                      min={f.min}
                      max={f.max}
                      value={typeof val === "number" ? val : f.min}
                      onChange={(e) => updateField(["conferences", cIdx, "divisions", dIdx, "teams", tIdx, "attributes", f.key], parseInt(e.target.value, 10))}
                      className="flex-1 accent-cyan-500"
                    />
                  </div>
                ) : (
                  <input
                    type="number"
                    className="w-40 rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-100"
                    value={typeof val === "number" ? val : 0}
                    onChange={(e) => updateField(["conferences", cIdx, "divisions", dIdx, "teams", tIdx, "attributes", f.key], parseInt(e.target.value, 10) || 0)}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 rounded-lg border border-slate-800 bg-slate-900/60 p-4 sm:grid-cols-3">
        <h3 className="col-span-full text-xs font-semibold uppercase tracking-wide text-slate-400">Program Identity &amp; Rival</h3>
        <div className="space-y-1">
          <label className="block text-xs font-medium uppercase tracking-wide text-slate-400" htmlFor="t-archetype">Archetype</label>
          <select id="t-archetype" className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100" value={team.archetype ?? ""} onChange={(e) => updateField(path("archetype"), e.target.value)}>
            <option value="" disabled>Select…</option>
            {ARCHETYPE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-medium uppercase tracking-wide text-slate-400" htmlFor="t-fanbase">Fanbase Type</label>
          <select id="t-fanbase" className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100" value={team.fanbaseType ?? ""} onChange={(e) => updateField(path("fanbaseType"), e.target.value)}>
            <option value="" disabled>Select…</option>
            {FANBASE_TYPE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-medium uppercase tracking-wide text-slate-400" htmlFor="t-rival">Rival (same division)</label>
          <select id="t-rival" className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100" value={currentRival} onChange={(e) => updateField(path("rivalAbbreviation"), e.target.value)}>
            {!rivalOptions.some((o) => o.abbr === currentRival) ? <option value="" disabled>Select a rival…</option> : null}
            {rivalOptions.map((o) => <option key={o.abbr} value={o.abbr}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Conference / Division (Realignment)
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-400">Conference</label>
            <select
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
              value={cIdx}
              onChange={(e) => {
                const targetC = parseInt(e.target.value, 10);
                moveToDivision(targetC, 0);
              }}
            >
              {(universe.conferences || []).map((c, idx) => (
                <option key={idx} value={idx}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-400">Division</label>
            <select
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
              value={dIdx}
              onChange={(e) => moveToDivision(cIdx, parseInt(e.target.value, 10))}
            >
              {(conf.divisions || []).map((d, idx) => (
                <option key={idx} value={idx}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-500">Moving a team keeps every field intact — only its position in the conference/division tree changes.</p>
      </div>

      <div className="flex justify-end border-t border-slate-800 pt-4">
        <ConfirmButton
          label="Delete Team"
          confirmLabel="Confirm Delete"
          onConfirm={() => {
            removeAt(["conferences", cIdx, "divisions", dIdx, "teams"], tIdx);
            setView("teams");
          }}
        />
      </div>
    </div>
  );
}
