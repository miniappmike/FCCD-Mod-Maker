import React from "react";
import { useUniverse } from "../context/UniverseContext.jsx";
import { countAssetWarnings } from "../lib/assetSummary.js";

const NAV_ITEMS = [
  { name: "overview", label: "Overview", icon: "◧" },
  { name: "teams", label: "Teams", icon: "🏈" },
  { name: "conferences", label: "Conferences", icon: "🏆" },
  { name: "realignment", label: "Realignment", icon: "⇄" },
  { name: "divisions", label: "Divisions", icon: "▤" },
  { name: "bowls", label: "Bowls", icon: "🎗" },
  { name: "rivalries", label: "Rivalries", icon: "⚔" },
  { name: "league-settings", label: "League Settings", icon: "⚙" },
  { name: "assets", label: "Assets", icon: "🖼" },
  { name: "validation", label: "Validation", icon: "✓" },
  { name: "json", label: "JSON", icon: "{ }" }
];

export default function Sidebar() {
  const { view, setView, validation, assetAudit, teamPool } = useUniverse();

  const assetWarnings = countAssetWarnings(assetAudit);

  return (
    <nav className="flex h-full w-56 shrink-0 flex-col border-r border-slate-800 bg-slate-950" aria-label="Primary">
      <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-4">
        <span className="text-lg font-bold tracking-tight text-cyan-400">FCC:D</span>
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Mod Maker</span>
      </div>

      <div className="p-2">
        <button
          type="button"
          onClick={() => setView("wizard")}
          aria-current={view.name === "wizard" ? "page" : undefined}
          className={`flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
            view.name === "wizard"
              ? "bg-cyan-500 text-slate-950"
              : "bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25"
          }`}
        >
          <span aria-hidden="true">✨</span> Setup Wizard
        </button>
      </div>

      <ul className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {NAV_ITEMS.map((item) => {
          const active = view.name === item.name || (item.name === "teams" && view.name === "team") || (item.name === "conferences" && view.name === "conference");
          let badge = null;
          if (item.name === "validation" && validation.length > 0) badge = validation.length;
          if (item.name === "assets" && assetWarnings > 0) badge = assetWarnings;
          if (item.name === "realignment" && teamPool.length > 0) badge = teamPool.length;

          return (
            <li key={item.name}>
              <button
                type="button"
                onClick={() => setView(item.name)}
                aria-current={active ? "page" : undefined}
                className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-cyan-500/10 text-cyan-300 ring-1 ring-inset ring-cyan-500/30"
                    : "text-slate-400 hover:bg-slate-800/70 hover:text-slate-100"
                }`}
              >
                <span className="w-4 text-center text-xs" aria-hidden="true">
                  {item.icon}
                </span>
                <span className="flex-1 text-left">{item.label}</span>
                {badge ? (
                  <span className="rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400">
                    {badge}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="border-t border-slate-800 p-3 text-[11px] leading-snug text-slate-600">
        Football Coach: College Dynasty
        <br />
        Custom Universe Editor
      </div>
    </nav>
  );
}
