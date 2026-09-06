import React from "react";
import StatusPill from "./StatusPill.jsx";

const STATUS_LABEL = {
  exact: "Logo Found",
  normalized: "Logo Found",
  fuzzy: "No Exact Match",
  missing: "Logo Missing"
};

/** Shows the matched image (if any) plus its compatibility status. Never substitutes a different logo silently. */
export default function AssetThumb({ match, size = 40, onUseSuggestion, onUpload }) {
  const dim = { width: size, height: size };
  return (
    <div className="flex items-center gap-2">
      <div
        className="flex shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-700 bg-slate-800"
        style={dim}
      >
        {match.asset ? (
          <img src={match.asset.url} alt="" className="h-full w-full object-contain" />
        ) : (
          <span className="text-slate-600" style={{ fontSize: size * 0.4 }} aria-hidden="true">
            🖼
          </span>
        )}
      </div>
      <div className="min-w-0">
        <StatusPill status={match.status}>{STATUS_LABEL[match.status]}</StatusPill>
        {match.status === "exact" || match.status === "normalized" ? (
          <div className="truncate text-xs text-slate-500">{match.asset.filename}</div>
        ) : match.status === "fuzzy" ? (
          <div className="mt-1 flex flex-wrap items-center gap-1 text-xs">
            <span className="text-slate-500">Possible match: "{match.suggestions[0].filename}"</span>
            {onUseSuggestion ? (
              <button
                type="button"
                className="rounded border border-cyan-500/40 px-1.5 py-0.5 text-cyan-300 hover:bg-cyan-500/10"
                onClick={() => onUseSuggestion(match.suggestions[0])}
              >
                Use Name
              </button>
            ) : null}
          </div>
        ) : (
          <div className="truncate text-xs text-slate-500">Expected {match.expectedPath}</div>
        )}
      </div>
      {onUpload && match.status !== "exact" ? (
        <button
          type="button"
          className="ml-auto shrink-0 rounded border border-slate-600 px-2 py-1 text-xs text-slate-300 hover:bg-slate-700/50"
          onClick={onUpload}
          title="Uploading assets requires adding the file to the repository's Images folder"
        >
          Upload Asset
        </button>
      ) : null}
    </div>
  );
}
