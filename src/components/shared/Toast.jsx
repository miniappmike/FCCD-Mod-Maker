import React, { useEffect } from "react";
import { useUniverse } from "../../context/UniverseContext.jsx";

const KIND_STYLES = {
  info: "border-slate-600 bg-slate-800 text-slate-100",
  success: "border-emerald-500/40 bg-emerald-950 text-emerald-200",
  error: "border-rose-500/40 bg-rose-950 text-rose-200"
};

export default function Toast() {
  const { toast, dismissToast } = useUniverse();

  useEffect(() => {
    if (!toast) return undefined;
    const t = window.setTimeout(dismissToast, 4500);
    return () => window.clearTimeout(t);
  }, [toast, dismissToast]);

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-16 right-4 z-50 max-w-sm rounded-lg border px-4 py-3 text-sm shadow-lg ${
        KIND_STYLES[toast.kind] || KIND_STYLES.info
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="flex-1">{toast.message}</span>
        <button type="button" onClick={dismissToast} className="text-slate-400 hover:text-slate-200" aria-label="Dismiss">
          ✕
        </button>
      </div>
    </div>
  );
}
