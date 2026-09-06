import React from "react";
import { useUniverse } from "../../context/UniverseContext.jsx";
import { VALIDATION_CATEGORIES, groupValidationByCategory } from "../../lib/validation.js";
import { countAssetWarnings } from "../../lib/assetSummary.js";
import StatusPill from "../shared/StatusPill.jsx";

export default function ValidationPage() {
  const { validation, assetAudit, scrollToTarget, setView } = useUniverse();
  const grouped = groupValidationByCategory(validation);

  const assetMissing =
    assetAudit.teams.summary.missing + assetAudit.conferences.summary.missing + assetAudit.bowls.summary.missing;
  const assetFuzzy = assetAudit.teams.summary.fuzzy + assetAudit.conferences.summary.fuzzy + assetAudit.bowls.summary.fuzzy;
  const assetIssues = countAssetWarnings(assetAudit);

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-100">Mod Status</h2>
        <p className="text-sm text-slate-500">
          Validation is advisory: you can always export. These are the known game rules from the format's hard limitations.
        </p>
      </div>

      <div className={`rounded-lg border p-4 ${validation.length === 0 ? "border-emerald-500/30 bg-emerald-500/[0.05]" : "border-amber-500/30 bg-amber-500/[0.05]"}`}>
        <div className="flex items-center gap-2 text-sm font-semibold">
          {validation.length === 0 ? (
            <span className="text-emerald-400">✓ Universe passes all known validation rules</span>
          ) : (
            <span className="text-amber-400">⚠ {validation.length} issue{validation.length === 1 ? "" : "s"} to review</span>
          )}
        </div>
      </div>

      <div className="grid gap-3">
        {VALIDATION_CATEGORIES.map((cat) => {
          const errs = grouped.get(cat.key) || [];
          return (
            <div key={cat.key} className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-200">{cat.label}</span>
                <StatusPill status={errs.length === 0 ? "success" : "warning"}>
                  {errs.length === 0 ? "OK" : `${errs.length}`}
                </StatusPill>
              </div>
              {errs.length > 0 ? (
                <ul className="mt-2 space-y-1">
                  {errs.map((e, i) => (
                    <li key={i}>
                      <button
                        type="button"
                        className="text-left text-xs text-amber-300 underline decoration-dotted hover:text-amber-200"
                        onClick={() => scrollToTarget(e.targetId)}
                      >
                        {e.message}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          );
        })}

        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-200">Assets</span>
            <StatusPill status={assetIssues === 0 ? "success" : "warning"}>
              {assetIssues === 0 ? "OK" : `${assetIssues}`}
            </StatusPill>
          </div>
          <div className="text-xs text-slate-500">
            {assetIssues === 0
              ? "All team, conference, and bowl logos matched."
              : `${assetMissing} missing logo(s), ${assetFuzzy} fuzzy suggestion(s) to review.`}
          </div>
          <button type="button" className="mt-2 text-xs text-cyan-400 hover:underline" onClick={() => setView("assets")}>
            View Problems →
          </button>
        </div>
      </div>
    </div>
  );
}
