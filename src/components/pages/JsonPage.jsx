import React, { useEffect, useMemo, useRef, useState } from "react";
import { useUniverse } from "../../context/UniverseContext.jsx";
import { safeJsonParse } from "../../lib/jsonUtils.js";

function highlightJson(text) {
  const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return escaped.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = "text-amber-300";
      if (/^"/.test(match)) {
        cls = /:$/.test(match) ? "text-sky-300" : "text-emerald-300";
      } else if (/true|false/.test(match)) {
        cls = "text-purple-300";
      } else if (/null/.test(match)) {
        cls = "text-rose-300";
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
}

export default function JsonPage() {
  const { universe, applyRawJson, showToast } = useUniverse();
  const [text, setText] = useState(() => JSON.stringify(universe, null, 2));
  const [search, setSearch] = useState("");
  const textareaRef = useRef(null);
  const highlightRef = useRef(null);
  const gutterRef = useRef(null);
  const applyTimer = useRef(null);
  const lastAppliedRef = useRef(text);

  // Re-sync from the visual editor whenever this page mounts.
  useEffect(() => {
    const fresh = JSON.stringify(universe, null, 2);
    setText(fresh);
    lastAppliedRef.current = fresh;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const parseResult = useMemo(() => safeJsonParse(text), [text]);

  // Debounced auto-apply back into the shared universe state once the text is valid JSON again.
  useEffect(() => {
    if (!parseResult.ok) return undefined;
    if (text === lastAppliedRef.current) return undefined;
    applyTimer.current = window.setTimeout(() => {
      applyRawJson(parseResult.value);
      lastAppliedRef.current = text;
    }, 700);
    return () => window.clearTimeout(applyTimer.current);
  }, [text, parseResult, applyRawJson]);

  const lines = text.split("\n");

  function syncScroll() {
    if (!textareaRef.current) return;
    const { scrollTop, scrollLeft } = textareaRef.current;
    if (highlightRef.current) {
      highlightRef.current.scrollTop = scrollTop;
      highlightRef.current.scrollLeft = scrollLeft;
    }
    if (gutterRef.current) gutterRef.current.scrollTop = scrollTop;
  }

  function handleFormat() {
    if (!parseResult.ok) {
      showToast("Can't format: JSON is currently invalid.", "error");
      return;
    }
    setText(JSON.stringify(parseResult.value, null, 2));
  }

  function jumpToNextMatch() {
    if (!search.trim() || !textareaRef.current) return;
    const el = textareaRef.current;
    const from = el.selectionEnd || 0;
    const lower = text.toLowerCase();
    const q = search.toLowerCase();
    let idx = lower.indexOf(q, from);
    if (idx === -1) idx = lower.indexOf(q, 0);
    if (idx === -1) return;
    el.focus();
    el.setSelectionRange(idx, idx + search.length);
    const upto = text.slice(0, idx).split("\n").length;
    const lineHeight = 20;
    el.scrollTop = Math.max(0, (upto - 5) * lineHeight);
    syncScroll();
  }

  return (
    <div className="flex h-full flex-col p-6">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h2 className="mr-auto text-lg font-semibold text-slate-100">Raw JSON Editor</h2>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && jumpToNextMatch()}
          placeholder="Search…"
          className="w-40 rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-slate-100"
        />
        <button type="button" onClick={jumpToNextMatch} className="rounded-md border border-slate-700 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800">
          Find Next
        </button>
        <button type="button" onClick={handleFormat} className="rounded-md border border-slate-700 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800">
          Format JSON
        </button>
        {parseResult.ok ? (
          <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-400">✓ Valid — synced</span>
        ) : (
          <span className="rounded-full bg-rose-500/15 px-2.5 py-1 text-xs font-medium text-rose-400">✕ Invalid — not applied</span>
        )}
      </div>

      {!parseResult.ok ? (
        <div className="mb-2 rounded-md border border-rose-500/30 bg-rose-500/[0.06] px-3 py-2 text-xs text-rose-300">
          {parseResult.error.readable}
        </div>
      ) : null}

      <div className="relative flex-1 overflow-hidden rounded-lg border border-slate-800 bg-slate-950 font-mono text-sm leading-5">
        <div className="flex h-full">
          <div
            ref={gutterRef}
            aria-hidden="true"
            className="select-none overflow-hidden bg-slate-900/60 py-2 pr-2 text-right text-slate-600"
            style={{ width: "3.25rem" }}
          >
            {lines.map((_, i) => (
              <div key={i} style={{ height: "1.25rem" }}>
                {i + 1}
              </div>
            ))}
          </div>
          <div className="relative flex-1 overflow-hidden">
            <pre
              ref={highlightRef}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 m-0 overflow-auto whitespace-pre p-2"
            >
              <code dangerouslySetInnerHTML={{ __html: highlightJson(text) }} />
            </pre>
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onScroll={syncScroll}
              spellCheck={false}
              className="absolute inset-0 h-full w-full resize-none whitespace-pre bg-transparent p-2 text-transparent caret-slate-100 outline-none"
              aria-label="Raw universe JSON"
            />
          </div>
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-600">
        Edits here sync back to the visual editor automatically once the JSON is valid. Unknown/unrecognized properties are always
        preserved exactly as written.
      </p>
    </div>
  );
}
