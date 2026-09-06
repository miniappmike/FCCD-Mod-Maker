import React from "react";

const isHex6 = (v) => /^#[0-9A-Fa-f]{6}$/.test(String(v ?? "").trim());
const normalizeHex = (v) => {
  const s = String(v ?? "").trim();
  if (!s) return "";
  return s.startsWith("#") ? s : `#${s}`;
};
const safeColorValue = (v) => (isHex6(v) ? v : "#000000");

export default function ColorField({ label, value, onChange, id }) {
  const invalid = value && !isHex6(normalizeHex(value));
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium uppercase tracking-wide text-slate-400" htmlFor={id}>
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          className="h-9 w-11 shrink-0 cursor-pointer rounded border border-slate-600 bg-slate-800 p-0.5"
          value={safeColorValue(value)}
          onChange={(e) => onChange(e.target.value)}
          title={label}
          aria-label={`${label} color picker`}
        />
        <input
          id={id}
          type="text"
          className={`w-full rounded-md border bg-slate-900 px-2 py-1.5 font-mono text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 ${
            invalid ? "border-rose-500" : "border-slate-700"
          }`}
          value={value ?? ""}
          onChange={(e) => onChange(normalizeHex(e.target.value))}
          placeholder="#1A2B3C"
        />
      </div>
      {invalid ? <div className="text-xs text-rose-400">Hex must be #RRGGBB (example: #0F172A).</div> : null}
    </div>
  );
}
