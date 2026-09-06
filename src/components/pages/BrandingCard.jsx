import React from "react";

// A polished sports-identity preview card that updates live as the user edits the team.
export default function BrandingCard({ team, logoUrl }) {
  const primary = team?.primaryColor || "#1e293b";
  const secondary = team?.secondaryColor || "#f1f5f9";

  return (
    <div
      className="overflow-hidden rounded-xl border border-slate-800 shadow-lg"
      style={{ background: `linear-gradient(135deg, ${primary} 0%, ${primary}dd 60%, ${secondary}22 100%)` }}
    >
      <div className="flex items-center gap-4 p-5">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-white/90 p-2 shadow-inner">
          {logoUrl ? (
            <img src={logoUrl} alt="" className="h-full w-full object-contain" />
          ) : (
            <span className="text-3xl" aria-hidden="true">
              🏈
            </span>
          )}
        </div>
        <div className="min-w-0">
          <div className="truncate text-2xl font-extrabold uppercase tracking-tight text-white drop-shadow">
            {team?.name || "Team Name"}
          </div>
          <div className="truncate text-sm font-medium uppercase tracking-widest text-white/80">{team?.mascot || "Mascot"}</div>
          <div className="mt-2 inline-flex items-center gap-2">
            <span
              className="rounded px-2 py-0.5 font-mono text-xs font-bold"
              style={{ backgroundColor: secondary, color: primary }}
            >
              {team?.abbreviation || "ABR"}
            </span>
            <span className="h-3 w-3 rounded-full border border-white/40" style={{ backgroundColor: primary }} title="Primary" />
            <span className="h-3 w-3 rounded-full border border-white/40" style={{ backgroundColor: secondary }} title="Secondary" />
          </div>
        </div>
      </div>
    </div>
  );
}
