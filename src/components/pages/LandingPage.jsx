import React, { useRef, useState } from "react";
import { useUniverse } from "../../context/UniverseContext.jsx";
import { makeBlankUniverse } from "../../lib/schema.js";
import { loadBaseRosterUniverse } from "../../lib/baseRoster.js";

export default function LandingPage() {
  const { importJson, startBlankUniverse, showToast } = useUniverse();
  const fileInputRef = useRef(null);
  const [loadingRoster, setLoadingRoster] = useState(false);

  function handleFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => importJson(String(reader.result ?? ""));
    reader.readAsText(file);
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-950 p-6">
      <div className="w-full max-w-xl rounded-xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <div className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">Football Coach: College Dynasty</div>
        <h1 className="mb-6 text-2xl font-bold text-slate-50">Custom Universe / Mod Maker</h1>

        <div
          className="mb-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-700 bg-slate-950/60 px-6 py-10 text-center transition-colors hover:border-cyan-500/50"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFile(e.dataTransfer.files?.[0]);
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
          }}
        >
          <span className="text-3xl" aria-hidden="true">
            📁
          </span>
          <div className="text-sm font-medium text-slate-200">Drop a universe JSON file here, or click to browse</div>
          <div className="text-xs text-slate-500">No data ever leaves your browser — there is no backend.</div>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-600">
          <div className="h-px flex-1 bg-slate-800" />
          or
          <div className="h-px flex-1 bg-slate-800" />
        </div>

        <button
          type="button"
          className="mt-4 w-full rounded-md border border-slate-700 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800"
          onClick={() => startBlankUniverse(makeBlankUniverse())}
        >
          Start a New Blank Universe
        </button>

        <button
          type="button"
          disabled={loadingRoster}
          className="mt-2 w-full rounded-md border border-cyan-500/40 bg-cyan-500/10 py-2.5 text-sm font-medium text-cyan-200 hover:bg-cyan-500/20 disabled:opacity-50"
          onClick={async () => {
            setLoadingRoster(true);
            try {
              const { universe: seeded, pool } = await loadBaseRosterUniverse();
              startBlankUniverse(seeded, pool);
            } catch {
              showToast("Could not load the base roster.", "error");
            } finally {
              setLoadingRoster(false);
            }
          }}
        >
          {loadingRoster ? "Loading…" : "Start from Base Roster (drag teams into your own conferences)"}
        </button>
        <p className="mt-1 text-center text-[11px] text-slate-600">
          Loads 10 real conferences with zero teams each, plus all 138 real teams in a pool — drag
          each one into a division on the Realignment Board to build your own alignment from scratch.
        </p>

        <div className="mt-6 flex items-center justify-between gap-2 text-xs">
          <a
            href="https://discord.gg/Bdsy9bwcqP"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-indigo-600/90 px-3 py-2 font-medium text-white hover:bg-indigo-500"
          >
            Official Discord
          </a>
          <a
            href="https://www.reddit.com/r/FootballCoach/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-orange-600/90 px-3 py-2 font-medium text-white hover:bg-orange-500"
          >
            r/FootballCoach
          </a>
        </div>
      </div>
    </div>
  );
}
