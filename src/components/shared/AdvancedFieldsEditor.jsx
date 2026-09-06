import React, { useState } from "react";
import { getUnknownEntries } from "../../lib/jsonUtils.js";
import ConfirmButton from "./ConfirmButton.jsx";

function valueToEditString(v) {
  if (typeof v === "string") return v;
  return JSON.stringify(v ?? null, null, 2);
}

function parseEditString(raw, wasString) {
  const trimmed = raw.trim();
  if (wasString) {
    // Try JSON first (in case the user wants to turn a string into structured data), else keep as plain string.
    try {
      return JSON.parse(trimmed);
    } catch {
      return raw;
    }
  }
  try {
    return JSON.parse(trimmed);
  } catch {
    return raw;
  }
}

/**
 * Generic editor for JSON properties on an entity that the visual schema does
 * not model. Never drops data: unknown fields are preserved through
 * structuredClone-based updates elsewhere, this component just exposes them.
 */
export default function AdvancedFieldsEditor({ entity, knownKeys, onSet, onDelete, title = "Advanced / Other Fields" }) {
  const [newKey, setNewKey] = useState("");
  const [newVal, setNewVal] = useState("");
  const [error, setError] = useState("");

  if (!entity || typeof entity !== "object") return null;
  const unknown = getUnknownEntries(entity, knownKeys);

  return (
    <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.03] p-3">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-amber-400">{title}</span>
        <span className="text-xs text-slate-500">
          Fields present in the JSON that this visual editor doesn't model by name. Nothing here is ever deleted automatically.
        </span>
      </div>

      {unknown.length === 0 ? (
        <div className="text-xs text-slate-500">No unrecognized fields on this entity.</div>
      ) : (
        <div className="space-y-2">
          {unknown.map(([key, val]) => {
            const wasString = typeof val === "string";
            return (
              <div key={key} className="flex items-start gap-2 rounded-md border border-slate-700/60 bg-slate-900/60 p-2">
                <div className="w-32 shrink-0 truncate font-mono text-xs text-cyan-300" title={key}>
                  {key}
                </div>
                <textarea
                  className="min-h-[2rem] flex-1 resize-y rounded border border-slate-700 bg-slate-950 px-2 py-1 font-mono text-xs text-slate-100"
                  defaultValue={valueToEditString(val)}
                  onBlur={(e) => onSet(key, parseEditString(e.target.value, wasString))}
                />
                <ConfirmButton size="xs" label="Delete" confirmLabel="Confirm" onConfirm={() => onDelete(key)} />
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-slate-700/60 pt-2">
        <div>
          <label className="block text-[10px] uppercase text-slate-500">Field name</label>
          <input
            className="w-36 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="customField"
          />
        </div>
        <div className="flex-1">
          <label className="block text-[10px] uppercase text-slate-500">Value (JSON or text)</label>
          <input
            className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100"
            value={newVal}
            onChange={(e) => setNewVal(e.target.value)}
            placeholder='"value", 123, true, {"a":1}'
          />
        </div>
        <button
          type="button"
          className="rounded-md bg-cyan-600 px-3 py-1 text-xs font-medium text-white hover:bg-cyan-500 disabled:opacity-40"
          disabled={!newKey.trim() || knownKeys.has(newKey.trim())}
          onClick={() => {
            if (knownKeys.has(newKey.trim())) {
              setError("That field is already managed by the visual editor.");
              return;
            }
            setError("");
            onSet(newKey.trim(), parseEditString(newVal, true));
            setNewKey("");
            setNewVal("");
          }}
        >
          + Add Field
        </button>
      </div>
      {error ? <div className="mt-1 text-xs text-rose-400">{error}</div> : null}
    </div>
  );
}
