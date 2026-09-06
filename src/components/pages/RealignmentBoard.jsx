import React, { useState } from "react";
import { useUniverse } from "../../context/UniverseContext.jsx";
import { getTeamDisplayName } from "../../lib/schema.js";

function TeamChip({ cIdx, dIdx, tIdx, team, onDragStart, onOpen }) {
  return (
    <button
      type="button"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("application/json", JSON.stringify({ cIdx, dIdx, tIdx }));
        onDragStart();
      }}
      onClick={() => onOpen(cIdx, dIdx, tIdx)}
      className="flex w-full cursor-grab items-center gap-1.5 truncate rounded border border-slate-700 bg-slate-800 px-2 py-1 text-left text-xs text-slate-200 hover:border-cyan-500/50 active:cursor-grabbing"
      title={`Drag to move ${getTeamDisplayName(team)}`}
    >
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: team?.primaryColor || "#64748b" }}
        aria-hidden="true"
      />
      <span className="truncate">{getTeamDisplayName(team)}</span>
    </button>
  );
}

export default function RealignmentBoard() {
  const { universe, setView, moveTeam } = useUniverse();
  const [dragging, setDragging] = useState(false);
  const [overKey, setOverKey] = useState(null);

  function handleDrop(e, targetCIdx, targetDIdx) {
    e.preventDefault();
    setOverKey(null);
    setDragging(false);
    let data;
    try {
      data = JSON.parse(e.dataTransfer.getData("application/json"));
    } catch {
      return;
    }
    if (!data) return;
    const { cIdx, dIdx, tIdx } = data;
    if (cIdx === targetCIdx && dIdx === targetDIdx) return;
    moveTeam(["conferences", cIdx, "divisions", dIdx, "teams", tIdx], ["conferences", targetCIdx, "divisions", targetDIdx, "teams"], undefined);
  }

  return (
    <div className="flex h-full flex-col p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Realignment Board</h2>
          <p className="text-sm text-slate-500">Drag a team into any division to move it. Nothing else about the team changes.</p>
        </div>
        <button type="button" className="text-xs text-cyan-400 hover:underline" onClick={() => setView("conferences")}>
          ← Back to Conferences
        </button>
      </div>

      <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
        {(universe.conferences || []).map((conf, cIdx) => (
          <div key={cIdx} className="flex w-64 shrink-0 flex-col rounded-lg border border-slate-800 bg-slate-900/60">
            <div className="border-b border-slate-800 px-3 py-2">
              <div className="truncate text-sm font-semibold text-slate-100">{conf.name || `Conference #${cIdx + 1}`}</div>
              <div className="text-xs text-slate-500">Prestige {conf.prestigeLevel ?? "—"}</div>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-2">
              {(conf.divisions || []).map((div, dIdx) => {
                const key = `${cIdx}-${dIdx}`;
                return (
                  <div
                    key={dIdx}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setOverKey(key);
                    }}
                    onDragLeave={() => setOverKey((k) => (k === key ? null : k))}
                    onDrop={(e) => handleDrop(e, cIdx, dIdx)}
                    className={`rounded-md border p-2 transition-colors ${
                      overKey === key ? "border-cyan-400 bg-cyan-500/10" : "border-slate-700/70 bg-slate-950/50"
                    } ${dragging ? "ring-1 ring-inset ring-slate-700" : ""}`}
                  >
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-400">{div.name || `Division #${dIdx + 1}`}</span>
                      <span className="text-[10px] text-slate-600">{(div.teams || []).length}</span>
                    </div>
                    <div className="space-y-1">
                      {(div.teams || []).map((team, tIdx) => (
                        <TeamChip
                          key={tIdx}
                          cIdx={cIdx}
                          dIdx={dIdx}
                          tIdx={tIdx}
                          team={team}
                          onDragStart={() => setDragging(true)}
                          onOpen={(c, d, t) => setView("team", { cIdx: c, dIdx: d, tIdx: t })}
                        />
                      ))}
                      {(div.teams || []).length === 0 ? (
                        <div className="rounded border border-dashed border-slate-700 py-3 text-center text-[10px] text-slate-600">
                          Drop here
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {(universe.conferences || []).length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-sm text-slate-500">Add conferences first to realign teams.</div>
        ) : null}
      </div>
    </div>
  );
}
