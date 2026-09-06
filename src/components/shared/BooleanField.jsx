import React from "react";

export default function BooleanField({ label, value, onChange, description, id }) {
  return (
    <label htmlFor={id} className="flex items-start gap-2 text-sm text-slate-300">
      <input
        id={id}
        type="checkbox"
        className="mt-0.5 h-3.5 w-3.5 accent-cyan-500"
        checked={!!value}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>
        <span className="font-medium text-slate-200">{label}</span>
        {description ? <span className="block text-xs text-slate-500">{description}</span> : null}
      </span>
    </label>
  );
}
