import React from "react";
import { useUniverse } from "../../context/UniverseContext.jsx";
import { isValidConferenceStructure } from "../../lib/conferenceStructure.js";

export default function DivisionsPage() {
  const { universe, setView } = useUniverse();
  const rows = [];
  (universe.conferences || []).forEach((conf, cIdx) => {
    const divisions = conf.divisions || [];
    const valid = isValidConferenceStructure(divisions);
    divisions.forEach((div, dIdx) => {
      const teamCount = (div.teams || []).length;
      rows.push({ cIdx, dIdx, confName: conf.name, divName: div.name, teamCount, valid });
    });
  });

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-100">Divisions</h2>
        <p className="text-sm text-slate-500">Every division across every conference, at a glance.</p>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-2">Conference</th>
              <th className="px-3 py-2">Division</th>
              <th className="px-3 py-2">Teams</th>
              <th className="px-3 py-2">Structure</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-900/40">
            {rows.map((r) => (
              <tr key={`${r.cIdx}-${r.dIdx}`} className="hover:bg-slate-800/40">
                <td className="px-3 py-2 text-slate-300">{r.confName}</td>
                <td className="px-3 py-2 text-slate-100">{r.divName}</td>
                <td className="px-3 py-2 text-slate-400">{r.teamCount}</td>
                <td className="px-3 py-2">
                  {r.valid ? <span className="text-emerald-400">✓ Valid</span> : <span className="text-rose-400">⚠ Check count</span>}
                </td>
                <td className="px-3 py-2 text-right">
                  <button
                    type="button"
                    className="text-xs text-cyan-400 hover:underline"
                    onClick={() => setView("conference", { cIdx: r.cIdx })}
                  >
                    Open →
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-slate-500">
                  No divisions yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
