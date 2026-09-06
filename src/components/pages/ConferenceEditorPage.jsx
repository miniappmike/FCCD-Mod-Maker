import React, { useState } from "react";
import { useUniverse } from "../../context/UniverseContext.jsx";
import { makeDefaultDivision, makeDefaultTeam, getTeamDisplayName } from "../../lib/schema.js";
import { matchConferenceAsset } from "../../lib/assetSummary.js";
import { flattenConferenceTeams, averagePrestige, formatAveragePrestige } from "../../lib/teamStats.js";
import { isValidConferenceStructure } from "../../lib/conferenceStructure.js";
import ZipLocationField from "../shared/ZipLocationField.jsx";
import AssetThumb from "../shared/AssetThumb.jsx";
import UploadAssetModal from "../shared/UploadAssetModal.jsx";
import ConfirmButton from "../shared/ConfirmButton.jsx";
import BooleanField from "../shared/BooleanField.jsx";
import StructureAssistant from "./StructureAssistant.jsx";

export default function ConferenceEditorPage() {
  const { universe, view, setView, updateField, removeAt, insertAt } = useUniverse();
  const { cIdx } = view.params;
  const conf = universe.conferences?.[cIdx];
  const [uploadOpen, setUploadOpen] = useState(false);

  if (!conf) {
    return (
      <div className="p-6">
        <p className="text-sm text-slate-400">This conference could not be found.</p>
        <button type="button" className="mt-2 text-sm text-cyan-400 hover:underline" onClick={() => setView("conferences")}>
          ← Back to Conferences
        </button>
      </div>
    );
  }

  const path = (key) => ["conferences", cIdx, key];
  const match = matchConferenceAsset(conf.name);
  const divisions = conf.divisions || [];
  const teamCounts = divisions.map((d) => (d.teams || []).length);
  const structureValid = isValidConferenceStructure(divisions);
  const totalTeams = teamCounts.reduce((a, b) => a + b, 0);
  const avgPrestige = averagePrestige(flattenConferenceTeams(conf));

  return (
    <div id={`conf-${cIdx}`} className="mx-auto max-w-4xl space-y-6 p-6">
      <button type="button" className="text-xs text-cyan-400 hover:underline" onClick={() => setView("conferences")}>
        ← Back to Conferences
      </button>

      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Asset (Mod File)</h3>
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
        <h3 className="col-span-full text-xs font-semibold uppercase tracking-wide text-slate-400">Conference (JSON)</h3>
        <div className="space-y-1">
          <label className="block text-xs font-medium uppercase tracking-wide text-slate-400" htmlFor="c-name">Conference Name</label>
          <input id="c-name" className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100" value={conf.name ?? ""} onChange={(e) => updateField(path("name"), e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-medium uppercase tracking-wide text-slate-400" htmlFor="c-prestige">Prestige Level (1-10, unique)</label>
          <input id="c-prestige" type="number" min={1} max={10} className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100" value={conf.prestigeLevel ?? 1} onChange={(e) => updateField(path("prestigeLevel"), parseInt(e.target.value, 10) || 1)} />
        </div>
        <ZipLocationField label="Championship Zip Code" value={conf.zipcode} onChange={(v) => updateField(path("zipcode"), v)} id="c-zip" />
        <div className="col-span-full flex flex-wrap gap-6 border-t border-slate-800 pt-3">
          <BooleanField
            id="c-ccg-indoors"
            label="CCG Played Indoors"
            value={conf.playCcgIndoors}
            onChange={(v) => updateField(path("playCcgIndoors"), v)}
          />
          <BooleanField
            id="c-ccg-home"
            label="CCG At Higher Seed's Home"
            description="Play the championship game at the higher seed's home stadium instead of a neutral site."
            value={conf.playCcgAsHomeGame}
            onChange={(v) => updateField(path("playCcgAsHomeGame"), v)}
          />
        </div>
      </div>

      <StructureAssistant conference={conf} onApply={(divisions) => updateField(path("divisions"), divisions)} />

      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Divisions {structureValid ? <span className="text-emerald-400">✓ valid structure</span> : <span className="text-rose-400">⚠ invalid structure (need 1×10, 2×[6/7/9], or 4×[4/5])</span>}
            <span className="ml-2 font-normal normal-case text-slate-500">
              {totalTeams} team{totalTeams === 1 ? "" : "s"} · Avg Team Prestige {formatAveragePrestige(avgPrestige)}
            </span>
          </h3>
          <button
            type="button"
            className="rounded-md border border-slate-700 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-800"
            onClick={() => insertAt(["conferences", cIdx, "divisions"], divisions.length, makeDefaultDivision())}
          >
            + Add Division
          </button>
        </div>

        <div className="space-y-4">
          {divisions.map((div, dIdx) => (
            <div id={`div-${cIdx}-${dIdx}`} key={dIdx} className="rounded-lg border border-slate-700/70 bg-slate-950/60 p-3">
              <div className="mb-2 flex items-center gap-2">
                <input
                  className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-slate-100"
                  value={div.name ?? ""}
                  onChange={(e) => updateField(["conferences", cIdx, "divisions", dIdx, "name"], e.target.value)}
                  placeholder="Division name"
                />
                <span className="text-xs text-slate-500">{(div.teams || []).length} teams</span>
                <button
                  type="button"
                  className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-300 hover:bg-slate-800"
                  onClick={() => insertAt(["conferences", cIdx, "divisions", dIdx, "teams"], (div.teams || []).length, makeDefaultTeam())}
                >
                  + Add Team
                </button>
                <ConfirmButton size="xs" label="Remove" onConfirm={() => removeAt(["conferences", cIdx, "divisions"], dIdx)} />
              </div>

              <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                {(div.teams || []).length === 0 ? (
                  <li className="text-xs italic text-slate-600">No teams yet.</li>
                ) : (
                  (div.teams || []).map((team, tIdx) => (
                    <li key={tIdx}>
                      <button
                        type="button"
                        className="w-full truncate rounded px-2 py-1 text-left text-xs text-slate-300 hover:bg-slate-800"
                        onClick={() => setView("team", { cIdx, dIdx, tIdx })}
                      >
                        {getTeamDisplayName(team)}
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          ))}
          {divisions.length === 0 ? <div className="text-sm text-slate-500">No divisions yet.</div> : null}
        </div>
      </div>

      <div className="flex justify-end border-t border-slate-800 pt-4">
        <ConfirmButton
          label="Delete Conference"
          confirmLabel="Confirm Delete"
          onConfirm={() => {
            removeAt(["conferences"], cIdx);
            setView("conferences");
          }}
        />
      </div>
    </div>
  );
}
