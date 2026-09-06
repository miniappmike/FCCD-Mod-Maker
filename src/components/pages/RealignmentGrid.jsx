import React, { useMemo, useState } from "react";
import { useUniverse } from "../../context/UniverseContext.jsx";
import { getTeamDisplayName } from "../../lib/schema.js";

function TeamChip({ team, dragPayload, onDragStart, onOpen }) {
  return (
    <button
      type="button"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("application/json", JSON.stringify(dragPayload));
        onDragStart();
      }}
      onClick={onOpen}
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

/**
 * The pool + conference columns, shared between the full-page Realignment
 * Board and the embedded step inside the Setup Wizard. The Team Pool column
 * is sticky (pinned to the left) so it stays reachable as a drag source no
 * matter how far right you scroll to reach a conference column.
 */
export default function RealignmentGrid({ heightClassName = "flex-1", onOpenTeam }) {
  const { universe, moveTeam, teamPool, movePoolTeamToDivision, moveDivisionTeamToPool } = useUniverse();
  const [dragging, setDragging] = useState(false);
  const [overKey, setOverKey] = useState(null);
  const [poolQuery, setPoolQuery] = useState("");

  const filteredPool = useMemo(() => {
    const indexed = teamPool.map((team, poolIdx) => ({ team, poolIdx }));
    const q = poolQuery.trim().toLowerCase();
    if (!q) return indexed;
    return indexed.filter(({ team }) => `${team?.name} ${team?.mascot} ${team?.abbreviation}`.toLowerCase().includes(q));
  }, [teamPool, poolQuery]);

  function readDragPayload(e) {
    try {
      return JSON.parse(e.dataTransfer.getData("application/json"));
    } catch {
      return null;
    }
  }

  function handleDropOnDivision(e, targetCIdx, targetDIdx) {
    e.preventDefault();
    setOverKey(null);
    setDragging(false);
    const data = readDragPayload(e);
    if (!data) return;

    if (data.source === "pool") {
      const team = teamPool[data.poolIdx];
      if (!team) return;
      movePoolTeamToDivision(team, data.poolIdx, ["conferences", targetCIdx, "divisions", targetDIdx, "teams"]);
      return;
    }

    const { cIdx, dIdx, tIdx } = data;
    if (cIdx === targetCIdx && dIdx === targetDIdx) return;
    moveTeam(["conferences", cIdx, "divisions", dIdx, "teams", tIdx], ["conferences", targetCIdx, "divisions", targetDIdx, "teams"], undefined);
  }

  function handleDropOnPool(e) {
    e.preventDefault();
    setOverKey(null);
    setDragging(false);
    const data = readDragPayload(e);
    if (!data || data.source === "pool") return;
    const { cIdx, dIdx, tIdx } = data;
    const team = universe.conferences?.[cIdx]?.divisions?.[dIdx]?.teams?.[tIdx];
    if (!team) return;
    moveDivisionTeamToPool(team, ["conferences", cIdx, "divisions", dIdx, "teams", tIdx]);
  }

  const showPool = teamPool.length > 0 || dragging;

  return (
    <div className={`flex ${heightClassName} gap-4 overflow-x-auto pb-4`}>
      {showPool ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setOverKey("pool");
          }}
          onDragLeave={() => setOverKey((k) => (k === "pool" ? null : k))}
          onDrop={handleDropOnPool}
          className={`sticky left-0 z-10 flex w-64 shrink-0 flex-col rounded-lg border shadow-[8px_0_16px_-8px_rgba(0,0,0,0.7)] transition-colors ${
            overKey === "pool" ? "border-cyan-400 bg-slate-950" : "border-amber-500/40 bg-slate-950"
          }`}
        >
          <div className="border-b border-slate-800 px-3 py-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-amber-300">Team Pool</span>
              <span className="text-xs text-slate-500">{teamPool.length}</span>
            </div>
            {teamPool.length > 6 ? (
              <input
                value={poolQuery}
                onChange={(e) => setPoolQuery(e.target.value)}
                placeholder="Search pool…"
                className="mt-1.5 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200"
              />
            ) : null}
          </div>
          <div className="flex-1 space-y-1 overflow-y-auto p-2">
            {filteredPool.map(({ team, poolIdx }) => (
              <TeamChip key={poolIdx} team={team} dragPayload={{ source: "pool", poolIdx }} onDragStart={() => setDragging(true)} />
            ))}
            {teamPool.length === 0 ? (
              <div className="rounded border border-dashed border-slate-700 py-3 text-center text-[10px] text-slate-600">
                Drag a team here to unassign it
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

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
                  onDrop={(e) => handleDropOnDivision(e, cIdx, dIdx)}
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
                        team={team}
                        dragPayload={{ source: "division", cIdx, dIdx, tIdx }}
                        onDragStart={() => setDragging(true)}
                        onOpen={onOpenTeam ? () => onOpenTeam(cIdx, dIdx, tIdx) : undefined}
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
  );
}
