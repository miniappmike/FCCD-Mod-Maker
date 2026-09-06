import React, { useRef } from "react";
import { useUniverse } from "../context/UniverseContext.jsx";
import { downloadJsonFile, copyJsonToClipboard } from "../lib/exportUtils.js";

export default function BottomBar() {
  const { universe, importJson, markSaved, isDirty, validation, setView, showToast } = useUniverse();
  const fileInputRef = useRef(null);

  if (!universe) return null;

  const errorCount = validation.length;

  return (
    <div className="flex h-12 shrink-0 items-center gap-3 border-t border-slate-800 bg-slate-950 px-4 text-sm">
      <div className="flex min-w-0 items-center gap-2">
        <span className="truncate font-medium text-slate-200" title={universe.name}>
          {universe.name || "(unnamed universe)"}
        </span>
        {isDirty ? (
          <span className="flex items-center gap-1 text-xs text-amber-400">
            <span aria-hidden="true">●</span> Unsaved changes
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs text-emerald-400">
            <span aria-hidden="true">✓</span> Saved to current editor state
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={() => setView("validation")}
        className={`ml-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
          errorCount === 0 ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"
        }`}
      >
        <span aria-hidden="true">{errorCount === 0 ? "✓" : "⚠"}</span>
        {errorCount === 0 ? "Valid" : `${errorCount} issue${errorCount === 1 ? "" : "s"}`}
      </button>

      <div className="ml-auto flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => importJson(String(reader.result ?? ""));
            reader.readAsText(file);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          className="rounded-md border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800"
          onClick={() => fileInputRef.current?.click()}
        >
          Import JSON
        </button>
        <button
          type="button"
          className="rounded-md border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800"
          onClick={() => setView("validation")}
        >
          Validate
        </button>
        <button
          type="button"
          className="rounded-md border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800"
          onClick={async () => {
            await copyJsonToClipboard(universe);
            showToast("Copied JSON to clipboard.", "success");
          }}
        >
          Copy JSON
        </button>
        <button
          type="button"
          className="rounded-md bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500"
          onClick={() => {
            downloadJsonFile(universe);
            markSaved();
          }}
        >
          Export JSON
        </button>
      </div>
    </div>
  );
}
