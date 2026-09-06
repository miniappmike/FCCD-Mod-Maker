import React from "react";
import { useUniverse } from "../../context/UniverseContext.jsx";

export default function ZipLocationField({ label = "Zip Code", value, onChange, id }) {
  const { zipInfoByZip } = useUniverse();
  const zip = String(value ?? "").trim();
  const valid = /^[0-9]{5}$/.test(zip);
  const info = valid ? zipInfoByZip[zip] : null;

  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium uppercase tracking-wide text-slate-400" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/60"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="5-digit ZIP"
        inputMode="numeric"
      />
      <div className="flex items-center gap-1 text-xs">
        {!zip ? null : !valid ? (
          <span className="text-slate-500">Enter a 5-digit ZIP.</span>
        ) : !info ? (
          <span className="text-slate-500">Looking up city/state…</span>
        ) : info.error ? (
          <span className="text-rose-400">⚠ City/state not found for {zip}.</span>
        ) : (
          <span className="flex items-center gap-1 text-slate-300">
            <span aria-hidden="true">📍</span> {info.city}, {info.state}
          </span>
        )}
      </div>
    </div>
  );
}
