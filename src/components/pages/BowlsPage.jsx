import React, { useState } from "react";
import { useUniverse } from "../../context/UniverseContext.jsx";
import { BOWL_KNOWN_KEYS, makeDefaultBowl } from "../../lib/schema.js";
import { matchBowlAsset } from "../../lib/assetSummary.js";
import ZipLocationField from "../shared/ZipLocationField.jsx";
import AdvancedFieldsEditor from "../shared/AdvancedFieldsEditor.jsx";
import AssetThumb from "../shared/AssetThumb.jsx";
import UploadAssetModal from "../shared/UploadAssetModal.jsx";
import ConfirmButton from "../shared/ConfirmButton.jsx";
import BooleanField from "../shared/BooleanField.jsx";

function toList(v) {
  if (typeof v === "string") return [v];
  if (Array.isArray(v)) return v.slice();
  return [];
}

function TieInEditor({ bowl, i, conferenceNames, updateField, deleteField }) {
  const tieInObj = bowl?.tieIn && typeof bowl.tieIn === "object" ? bowl.tieIn : null;
  const firstList = toList(tieInObj?.first);
  const secondList = toList(tieInObj?.second);
  const enabled = !!tieInObj;

  function writeTieIn(nextFirst, nextSecond) {
    const fRaw = nextFirst.map((x) => String(x ?? "").trim()).slice(0, 5);
    const sRaw = nextSecond.map((x) => String(x ?? "").trim()).slice(0, 5);
    const fNonEmpty = fRaw.filter(Boolean);
    const sNonEmpty = sRaw.filter(Boolean);

    if (fRaw.length === 0) {
      updateField(["bowlGames", i, "tieIn"], { first: "" });
      return;
    }

    const out = {};
    if (fRaw.length === 1 && fNonEmpty.length === 1) out.first = fNonEmpty[0];
    else out.first = fRaw;

    if (sNonEmpty.length === 1 && sRaw.length === 1) out.second = sNonEmpty[0];
    else if (sNonEmpty.length > 0 || sRaw.length > 1) out.second = sRaw;

    updateField(["bowlGames", i, "tieIn"], out);
  }

  return (
    <div className="mt-3 border-t border-slate-800 pt-3">
      <label className="flex items-center gap-2 text-sm text-slate-300">
        <input
          type="checkbox"
          className="h-3.5 w-3.5 accent-cyan-500"
          checked={enabled}
          onChange={(e) => {
            if (e.target.checked) updateField(["bowlGames", i, "tieIn"], { first: "" });
            else deleteField(["bowlGames", i, "tieIn"]);
          }}
        />
        Enable Bowl Tie-In (up to 5 conferences per side)
      </label>

      {enabled ? (
        <div className="mt-2 space-y-2">
          <div className="grid grid-cols-2 gap-2 text-[11px] uppercase tracking-wide text-slate-500">
            <div>First Conference (required)</div>
            <div>Second Conference (optional)</div>
          </div>
          {Array.from({ length: Math.max(firstList.length || 1, secondList.length || 1) }).map((_, idx) => {
            const firstVal = firstList[idx] ?? "";
            const secondVal = secondList[idx] ?? "";
            return (
              <div key={idx} className="grid grid-cols-2 gap-2">
                <select
                  className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-100"
                  value={firstVal}
                  onChange={(e) => {
                    const nextFirst = firstList.slice();
                    while (nextFirst.length < idx + 1) nextFirst.push("");
                    nextFirst[idx] = e.target.value;
                    writeTieIn(nextFirst, secondList);
                  }}
                >
                  <option value="" disabled>(select)</option>
                  {conferenceNames.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <select
                    className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-100"
                    value={secondVal}
                    onChange={(e) => {
                      const nextSecond = secondList.slice();
                      while (nextSecond.length < idx + 1) nextSecond.push("");
                      nextSecond[idx] = e.target.value;
                      writeTieIn(firstList.length ? firstList : [""], nextSecond);
                    }}
                  >
                    <option value="">(any conference)</option>
                    {conferenceNames.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={Math.max(firstList.length || 1, secondList.length || 1) <= 1}
                    className="shrink-0 rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-300 hover:bg-slate-800 disabled:opacity-40"
                    onClick={() => {
                      const nextFirst = firstList.slice();
                      const nextSecond = secondList.slice();
                      nextFirst.splice(idx, 1);
                      nextSecond.splice(idx, 1);
                      if (nextFirst.length === 0) writeTieIn([""], nextSecond);
                      else writeTieIn(nextFirst, nextSecond);
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
          <button
            type="button"
            disabled={Math.max(firstList.length || 1, secondList.length || 1) >= 5}
            className="rounded-md bg-cyan-600/90 px-2.5 py-1 text-xs font-medium text-white hover:bg-cyan-500 disabled:opacity-40"
            onClick={() => {
              const nextFirst = firstList.slice();
              const nextSecond = secondList.slice();
              nextFirst.push("");
              if (nextSecond.length < nextFirst.length) nextSecond.push("");
              writeTieIn(nextFirst, nextSecond);
            }}
          >
            + Add Additional Tie-In
          </button>
          <div className="text-xs text-slate-600">Leave "Second Conference" as "(any conference)" to guarantee only the first slot.</div>
        </div>
      ) : null}
    </div>
  );
}

export default function BowlsPage() {
  const { universe, conferenceNames, updateField, deleteField, removeAt, insertAt, moveItem, flashTargetId } = useUniverse();
  const bowls = universe.bowlGames || [];
  const [uploadForIdx, setUploadForIdx] = useState(null);

  return (
    <div id="section-bowls" className="mx-auto max-w-3xl space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Bowl Games</h2>
          <p className="text-sm text-slate-500">{bowls.length} bowls, ordered by importance</p>
        </div>
        <button
          type="button"
          className="rounded-md bg-cyan-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-cyan-500"
          onClick={() => insertAt(["bowlGames"], bowls.length, makeDefaultBowl())}
        >
          + Add Bowl
        </button>
      </div>

      <div className="space-y-3">
        {bowls.map((bowl, i) => {
          const match = matchBowlAsset(bowl.name);
          return (
            <div
              id={`bowl-${i}`}
              key={i}
              className={`rounded-lg border bg-slate-900/60 p-3 transition-shadow ${
                flashTargetId === `bowl-${i}` ? "ring-2 ring-cyan-500" : "border-slate-800"
              }`}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">#{i + 1}</span>
                <div className="flex items-center gap-1">
                  <button type="button" disabled={i === 0} className="rounded border border-slate-700 px-2 py-0.5 text-xs text-slate-300 hover:bg-slate-800 disabled:opacity-30" onClick={() => moveItem(["bowlGames"], i, i - 1)}>↑</button>
                  <button type="button" disabled={i === bowls.length - 1} className="rounded border border-slate-700 px-2 py-0.5 text-xs text-slate-300 hover:bg-slate-800 disabled:opacity-30" onClick={() => moveItem(["bowlGames"], i, i + 1)}>↓</button>
                  <ConfirmButton size="xs" label="Remove" onConfirm={() => removeAt(["bowlGames"], i)} />
                </div>
              </div>

              <AssetThumb
                match={match}
                size={36}
                onUseSuggestion={(asset) => updateField(["bowlGames", i, "name"], asset.baseName)}
                onUpload={() => setUploadForIdx(i)}
              />
              {uploadForIdx === i ? (
                <UploadAssetModal expectedFilename={match.expectedFilename} expectedPath={match.expectedPath} onClose={() => setUploadForIdx(null)} />
              ) : null}

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="block text-xs font-medium uppercase tracking-wide text-slate-400">Bowl Name</label>
                  <input
                    className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                    value={bowl.name ?? ""}
                    onChange={(e) => updateField(["bowlGames", i, "name"], e.target.value)}
                  />
                </div>
                <ZipLocationField value={bowl.zipcode} onChange={(v) => updateField(["bowlGames", i, "zipcode"], v)} />
              </div>

              <div className="mt-2">
                <BooleanField
                  id={`bowl-${i}-indoors`}
                  label="Indoors"
                  value={bowl.indoors}
                  onChange={(v) => updateField(["bowlGames", i, "indoors"], v)}
                />
              </div>

              <TieInEditor bowl={bowl} i={i} conferenceNames={conferenceNames} updateField={updateField} deleteField={deleteField} />

              <div className="mt-3">
                <AdvancedFieldsEditor
                  entity={bowl}
                  knownKeys={BOWL_KNOWN_KEYS}
                  onSet={(key, val) => updateField(["bowlGames", i, key], val)}
                  onDelete={(key) => deleteField(["bowlGames", i, key])}
                />
              </div>
            </div>
          );
        })}
        {bowls.length === 0 ? <div className="py-16 text-center text-sm text-slate-500">No bowl games yet.</div> : null}
      </div>
    </div>
  );
}
