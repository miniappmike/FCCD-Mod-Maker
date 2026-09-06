import React, { useState } from "react";

// Two-click destructive-action confirm pattern, extracted so every delete button behaves consistently.
export default function ConfirmButton({ label = "Remove", confirmLabel = "Confirm", onConfirm, title, className = "", size = "sm" }) {
  const [armed, setArmed] = useState(false);

  const sizeCls = size === "xs" ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm";

  if (!armed) {
    return (
      <button
        type="button"
        className={`${sizeCls} rounded-md border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors ${className}`}
        title={title || label}
        onClick={() => {
          setArmed(true);
          window.setTimeout(() => setArmed(false), 5500);
        }}
      >
        {label}
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-1">
      <button
        type="button"
        className={`${sizeCls} rounded-md bg-rose-600 text-white hover:bg-rose-500 transition-colors`}
        title="Click again to confirm"
        onClick={() => {
          setArmed(false);
          onConfirm();
        }}
      >
        {confirmLabel}
      </button>
      <button
        type="button"
        className={`${sizeCls} rounded-md border border-slate-600 text-slate-300 hover:bg-slate-700/50`}
        onClick={() => setArmed(false)}
      >
        Cancel
      </button>
    </span>
  );
}
