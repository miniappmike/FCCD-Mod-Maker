import React from "react";
import { useUniverse } from "../../context/UniverseContext.jsx";
import { LEAGUE_AWARD_SLOTS, makeDefaultNeutralSite } from "../../lib/schema.js";
import ZipLocationField from "../shared/ZipLocationField.jsx";
import BooleanField from "../shared/BooleanField.jsx";
import ConfirmButton from "../shared/ConfirmButton.jsx";

function AwardNamesEditor({ universe, updateField }) {
  const awards = universe.leagueAwardNames || {};
  const extraKeys = Object.keys(awards).filter((k) => !LEAGUE_AWARD_SLOTS.some((s) => s.key === k));
  const slots = [...LEAGUE_AWARD_SLOTS, ...extraKeys.map((k) => ({ key: k, label: k }))];

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">League Award Names</h3>
      <p className="mb-3 text-xs text-slate-500">Display name and abbreviation shown for each end-of-season award.</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {slots.map(({ key, label }) => {
          const entry = awards[key] || {};
          return (
            <div key={key} className="rounded-md border border-slate-700/60 bg-slate-950/60 p-2">
              <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-cyan-300">{label}</div>
              <div className="flex gap-2">
                <input
                  className="w-3/5 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100"
                  placeholder="Award name"
                  value={entry.name ?? ""}
                  onChange={(e) => updateField(["leagueAwardNames", key, "name"], e.target.value)}
                />
                <input
                  className="w-2/5 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100"
                  placeholder="Abbrev."
                  value={entry.abbreviation ?? ""}
                  onChange={(e) => updateField(["leagueAwardNames", key, "abbreviation"], e.target.value)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NeutralSitesEditor({ universe, updateField, insertAt, removeAt }) {
  const sites = universe.playoffNeutralSites || [];
  return (
    <div id="section-league-settings" className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Playoff Neutral Sites</h3>
          <p className="text-xs text-slate-500">Venues used for neutral-site playoff rounds.</p>
        </div>
        <button
          type="button"
          className="rounded-md bg-cyan-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-cyan-500"
          onClick={() => insertAt(["playoffNeutralSites"], sites.length, makeDefaultNeutralSite())}
        >
          + Add Site
        </button>
      </div>
      <div className="space-y-2">
        {sites.map((site, i) => (
          <div key={i} className="flex items-end gap-3 rounded-md border border-slate-700/60 bg-slate-950/60 p-2">
            <div className="w-48">
              <ZipLocationField value={site.zipcode} onChange={(v) => updateField(["playoffNeutralSites", i, "zipcode"], v)} id={`site-${i}-zip`} />
            </div>
            <BooleanField
              id={`site-${i}-indoors`}
              label="Indoors"
              value={site.indoors}
              onChange={(v) => updateField(["playoffNeutralSites", i, "indoors"], v)}
            />
            <ConfirmButton size="xs" label="Remove" onConfirm={() => removeAt(["playoffNeutralSites"], i)} />
          </div>
        ))}
        {sites.length === 0 ? <div className="py-4 text-center text-xs text-slate-500">No neutral sites yet.</div> : null}
      </div>
    </div>
  );
}

export default function LeagueSettingsPage() {
  const { universe, updateField, insertAt, removeAt } = useUniverse();

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-100">League Settings</h2>
        <p className="text-sm text-slate-500">Universe-wide settings that aren't tied to a specific team, conference, or bowl.</p>
      </div>

      <NeutralSitesEditor universe={universe} updateField={updateField} insertAt={insertAt} removeAt={removeAt} />
      <AwardNamesEditor universe={universe} updateField={updateField} />
    </div>
  );
}
