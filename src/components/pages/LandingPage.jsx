import React, { useRef } from "react";
import { useUniverse } from "../../context/UniverseContext.jsx";
import { makeBlankUniverse } from "../../lib/schema.js";

export default function LandingPage() {
  const { importJson, startBlankUniverse } = useUniverse();
  const fileInputRef = useRef(null);

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
