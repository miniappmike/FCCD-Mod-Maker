import React from "react";
import { useUniverse } from "../../context/UniverseContext.jsx";
import RealignmentGrid from "./RealignmentGrid.jsx";

export default function RealignmentBoard() {
  const { setView } = useUniverse();

  return (
    <div className="flex h-full flex-col p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Realignment Board</h2>
          <p className="text-sm text-slate-500">
            Drag a team into any division to move it, or drag it onto the pool to unassign it. Nothing else about the team changes.
          </p>
        </div>
        <button type="button" className="text-xs text-cyan-400 hover:underline" onClick={() => setView("conferences")}>
          ← Back to Conferences
        </button>
      </div>

      <RealignmentGrid heightClassName="flex-1" onOpenTeam={(cIdx, dIdx, tIdx) => setView("team", { cIdx, dIdx, tIdx })} />
    </div>
  );
}
