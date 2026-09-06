import React from "react";

const STYLES = {
  exact: { icon: "✓", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  normalized: { icon: "✓", cls: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" },
  fuzzy: { icon: "⚠", cls: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  missing: { icon: "⚠", cls: "bg-rose-500/15 text-rose-400 border-rose-500/30" },
  success: { icon: "✓", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  warning: { icon: "⚠", cls: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  error: { icon: "✕", cls: "bg-rose-500/15 text-rose-400 border-rose-500/30" },
  neutral: { icon: "•", cls: "bg-slate-500/15 text-slate-400 border-slate-500/30" }
};

// Status is always paired with an icon + text label, never color alone, per accessibility requirements.
export default function StatusPill({ status, children, title }) {
  const s = STYLES[status] || STYLES.neutral;
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${s.cls}`}
    >
      <span aria-hidden="true">{s.icon}</span>
      <span>{children}</span>
    </span>
  );
}
