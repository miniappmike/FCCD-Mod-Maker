import React, { useMemo, useState } from "react";
import { useUniverse } from "../../context/UniverseContext.jsx";
import StatusPill from "../shared/StatusPill.jsx";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "matched", label: "Matched" },
  { key: "missing", label: "Missing" },
  { key: "suggested", label: "Suggested" },
  { key: "unused", label: "Unused" }
];

function CategorySummary({ label, summary }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-1 flex flex-wrap gap-1.5 text-xs">
        <StatusPill status="exact">{summary.exact + summary.normalized} matched</StatusPill>
        {summary.fuzzy > 0 ? <StatusPill status="fuzzy">{summary.fuzzy} fuzzy</StatusPill> : null}
        {summary.missing > 0 ? <StatusPill status="missing">{summary.missing} missing</StatusPill> : null}
      </div>
    </div>
  );
}

export default function AssetsPage() {
  const { assetAudit, setView, scrollToTarget } = useUniverse();
  const [category, setCategory] = useState("teams");
  const [filter, setFilter] = useState("all");

  const data = assetAudit[category];

  const entries = useMemo(() => {
    if (category === "playoffs") return [];
    return (data?.entries || []).filter((e) => {
      if (filter === "all") return true;
      if (filter === "matched") return e.match.status === "exact" || e.match.status === "normalized";
      if (filter === "missing") return e.match.status === "missing";
      if (filter === "suggested") return e.match.status === "fuzzy";
      return true;
    });
  }, [data, filter, category]);

  const unused = filter === "unused" || filter === "all" ? data?.unused || [] : [];

  function openEntry(entry) {
    if (entry.kind === "team") setView("team", entry.params);
    else if (entry.kind === "conference") {
      setView("conference", entry.params);
      window.setTimeout(() => scrollToTarget(`conf-${entry.params.cIdx}`), 60);
    } else if (entry.kind === "bowl") {
      setView("bowls");
      window.setTimeout(() => scrollToTarget(`bowl-${entry.params.bIdx}`), 60);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-100">Asset Manager</h2>
        <p className="text-sm text-slate-500">
          Compatibility between JSON entity names and files under <span className="font-mono text-slate-400">Images/</span>. Assets are
          filesystem mod files — nothing here is invented as a JSON property.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <CategorySummary label="Teams" summary={assetAudit.teams.summary} />
        <CategorySummary label="Conferences" summary={assetAudit.conferences.summary} />
        <CategorySummary label="Bowls" summary={assetAudit.bowls.summary} />
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Playoffs</div>
          <div className="mt-1 text-xs text-slate-400">
            <StatusPill status="exact">{assetAudit.playoffs.assets.length} available</StatusPill>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        {["teams", "conferences", "bowls", "playoffs"].map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize ${
              category === c ? "bg-cyan-500/15 text-cyan-300" : "text-slate-400 hover:bg-slate-800"
            }`}
          >
            {c}
          </button>
        ))}
        {category !== "playoffs" ? (
          <div className="ml-auto flex gap-1">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                  filter === f.key ? "bg-slate-700 text-slate-100" : "text-slate-500 hover:bg-slate-800"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {category === "playoffs" ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {assetAudit.playoffs.assets.map((a) => (
            <div key={a.path} className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-center">
              <img src={a.url} alt="" className="mx-auto mb-2 h-16 w-16 object-contain" />
              <div className="truncate text-xs text-slate-300">{a.filename}</div>
            </div>
          ))}
          <p className="col-span-full text-xs text-slate-500">
            Playoff imagery is a filesystem-only mod asset category — the custom universe format has no corresponding JSON field for
            playoff structure, so these are shown for reference rather than matched against any entity.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((e, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => openEntry(e)}
              className="flex w-full items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-left hover:border-cyan-500/40"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-700 bg-slate-800">
                {e.match.asset ? <img src={e.match.asset.url} alt="" className="h-full w-full object-contain" /> : <span aria-hidden="true">🖼</span>}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-slate-100">{e.entityLabel}</div>
                <div className="truncate text-xs text-slate-500">
                  {e.match.status === "missing"
                    ? `Expected ${e.match.expectedPath}`
                    : e.match.status === "fuzzy"
                    ? `Possible match: ${e.match.suggestions[0]?.filename}`
                    : e.match.asset?.filename}
                </div>
              </div>
              <StatusPill status={e.match.status}>
                {e.match.status === "exact" || e.match.status === "normalized" ? "Matched" : e.match.status === "fuzzy" ? "Suggested" : "Missing"}
              </StatusPill>
            </button>
          ))}
          {entries.length === 0 && filter !== "unused" ? (
            <div className="py-10 text-center text-sm text-slate-500">Nothing matches this filter.</div>
          ) : null}

          {unused.length > 0 ? (
            <div className="mt-4">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Unused assets ({unused.length}) — files in Images/ not referenced by any entity in this universe
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {unused.map((a) => (
                  <div key={a.path} className="flex items-center gap-2 rounded-md border border-slate-800 bg-slate-900/40 p-2">
                    <img src={a.url} alt="" className="h-8 w-8 object-contain" />
                    <span className="truncate text-xs text-slate-400">{a.filename}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
